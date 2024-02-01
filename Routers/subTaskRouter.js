const express = require('express');
const subTaskRouter = express.Router();
const {getAllUserSubTasks, createSubTask, updateSubTask, deleteSubTask} = require('../Controllers/subTaskController');
const {extractUserFromToken} = require('../Controllers/taskController');
//user options :

subTaskRouter
.route("/")
.get(extractUserFromToken, getAllUserSubTasks)
.post(createSubTask)

subTaskRouter
.route("/:id")
.patch(updateSubTask)
.delete(deleteSubTask);

module.exports = subTaskRouter;
