const {task} = require('../Models/task');
const subTask = require('../Models/subTask');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const secretKey = 'open296In657App27838';

module.exports.extractUserFromToken = function(req, res, next){
    const token = req.cookies.token;
  
    if (!token) {
      // If there's no token, the request is unauthorized
      return res.status(401).send('Access denied. No token provided.');
    }
  
    // Verify and decode the token
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        // If verification fails, the request is forbidden
        return res.status(403).send('Invalid token.');
      }
  
      // Attach the decoded payload to the request object for further use
      req.user = decoded;
      next(); // Proceed to the next middleware or route handler
    });
};

module.exports.getAllUserTasks = async function getAllUserTasks(req,res){
    try{
        const userID = req.user.userId;
        if (!userID) {
            res.status(401).send('Access Denied');
            return;
        }
        const {priority, due_date, page, limit, ...dateFilters} = req.query;
        const filter = {
            user_id : userID,
        };

        if(priority){
            filter.priority = priority;
        }

        if(due_date){
            filter.due_date = due_date;
        }

        // Generalized date filter
        Object.keys(dateFilters).forEach((key) => {
            filter[key] = dateFilters[key];
        });

        const options = {
            page : page || 1,
            limit : limit || 10,
        };

        const tasks = await task.find(filter)
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .exec();

        res.send(tasks);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
}

module.exports.priorityCalc = function(dueDate){
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const differenceInDays = Math.floor((dueDateObj - today) / (1000 * 60 * 60 * 24));
    if (differenceInDays === 0) {
      return 0;
    } else if (differenceInDays >= 1 && differenceInDays <= 2) {
      return 1;
    } else if (differenceInDays >= 3 && differenceInDays <= 4) {
      return 2;
    } else {
      return 3;
    }
}

const statusCalc = async (taskId) => {
    // Count the number of completed subtasks for the given task
    const completedSubTasksCount = await subTask.countDocuments({
        task_id: taskId,
        status: 1, // Assuming '1' indicates a completed subtask, adjust based on your schema
    });

    // Determine the status based on the count
    if (completedSubTasksCount === 0) {
        return 'TODO';
    } else if (completedSubTasksCount >= 1) {
        return 'IN_PROGRESS';
    } else {
        return 'DONE';
    }
};


module.exports.createTask = async function createTask(req, res) {
    try {
        const userID = req.user.userId;
        const { title, desc, due_date } = req.body;

        if (!title || !due_date || !desc || !userID) {
            return res.status(401).send('Mandatory fields have been left empty');
        }

        const latestTask = await task.findOne({}, {}, { sort: { 'task_id': -1 } });
        const nextTaskId = latestTask ? latestTask.task_id + 1 : 1;

        const newTask = {
            task_id: nextTaskId,
            title: title,
            desc: desc,
            due_date: due_date,
            priority: priorityCalc(due_date),
            user_id: userID,
        };

        await task.create(newTask);
        res.send(newTask);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
};


module.exports.updateTask = async function updateTask(req, res) {
    try {
      const taskId = req.params.id;
      const { due_date } = req.body;
      const updatedTask = await task.findOne({ task_id: taskId, deleted_at: null });
  
      if (!updatedTask) {
        return res.status(404).send('Task not found');
      }
  
      updatedTask.due_date = due_date;
      updatedTask.status = await statusCalc(taskId);
      updatedTask.priority = priorityCalc(due_date);
      updatedTask.updated_at = Date.now();
  
      const savedTask = await updatedTask.save();
      res.send(savedTask);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  };
  

module.exports.deleteTask = async function deleteTask(req,res){
    try {
        const taskId = req.params.id;

        // Check if the subtask has already been deleted
        const taskToDelete = await task.findOne({ task_id: taskId, deleted_at: null });

        if (!taskToDelete) {
            return res.status(404).send('Task not found');
        }

        // Mark the subtask as deleted
        taskToDelete.deleted_at = new Date();
        await taskToDelete.save();

        res.send(taskToDelete);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
}
