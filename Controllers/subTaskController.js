const subTask = require('../Models/subTask');
const mongoose = require('mongoose');

module.exports.getAllUserSubTasks = async function getAllUserSubTasks(req, res) {
  try {
    const userID = req.user.userId;

    if (!userID) {
      res.status(401).send('Access Denied');
      return;
    }

    const { task_id, page, limit, ...dateFilters } = req.query;

    const filter = {};

    if (task_id) {
      filter.task_id = task_id;
    }

    // Generalized date filter
    Object.keys(dateFilters).forEach((key) => {
      filter[key] = dateFilters[key];
    });

    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    };
    
    const tasks = await subTask
      .find(filter)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .exec();
    res.send(tasks);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
};


  

module.exports.createSubTask = async function createSubTask(req,res){
    try{
        const {task_id} = req.body;
        if(!task_id){
            return res.status(404).send('Task ID is required');
        }
        const latestSubTask = await subTask.findOne({}, {}, { sort: { 'subTask_id': -1 } });
        const nextSubTaskId = latestSubTask ? latestSubTask.subTask_id + 1 : 1;
        const newSubTask = {
            task_id : task_id,
            subTask_id : nextSubTaskId,
        } 
        const subtask = await subTask.create(newSubTask);
        res.send(subtask);
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal server error');
    }
}

module.exports.updateSubTask = async function updateSubTask(req, res) {
    try {
        const subTaskId = req.params.id;

        // Check if the subtask has already been deleted
        const subTaskToUpdate = await subTask.findOne({subTask_id: subTaskId, deleted_at:null});

        if (!subTaskToUpdate) {
            return res.status(404).send('SubTask not found');
        }
        if(req.body.status!=1 && req.body.status!=0){
            return res.status(401).send('Invalid status');
        }

        // Mark the subtask as deleted
        subTaskToUpdate.updated_at = new Date();
        subTaskToUpdate.status = req.body.status;
        await subTaskToUpdate.save();
        res.send(subTaskToUpdate);

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
};

module.exports.deleteSubTask = async function deleteSubTask(req, res) {
    try {
        const subTaskId = req.params.id;

        // Check if the subtask has already been deleted
        const subTaskToDelete = await subTask.findOne({ subTask_id: subTaskId, deleted_at: null });

        if (!subTaskToDelete) {
            return res.status(404).send('SubTask not found');
        }

        // Mark the subtask as deleted
        subTaskToDelete.deleted_at = new Date();
        await subTaskToDelete.save();

        res.send(subTaskToDelete);
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
};