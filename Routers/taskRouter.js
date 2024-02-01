const express = require('express');
const taskRouter = express.Router();
const {getAllUserTasks, createTask, updateTask, deleteTask, extractUserFromToken} = require('../Controllers/taskController');
const app = express();

taskRouter
.route("/")
.get(extractUserFromToken, getAllUserTasks)
.post(extractUserFromToken, createTask)

taskRouter
.route("/:id")
.patch(updateTask)
.delete(deleteTask);

module.exports = taskRouter;
