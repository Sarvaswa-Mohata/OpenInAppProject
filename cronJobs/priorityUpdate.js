const cron = require('node-cron');
const task = require('../Models/task');
const {priorityCalc} = require('../Controllers/taskController');

module.exports.updateTaskPriorities = async function updateTaskPriorities() {
    try {
        const tasks = await task.find();
        for (const task of tasks) {
            const newPriority = priorityCalc(task.due_date);
            // Update the task with the new priority
            await task.updateOne({ _id: task._id }, { $set: { priority: newPriority } });
        }
    } catch (error) {
        console.error('Error updating task priorities:', error);
        throw error;
    }
}

// Schedule the Cron job to run every day at a specific time (adjust the cron expression accordingly)
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running Cron job to update task priorities...');
        
        // Call your function to update task priorities
        await updateTaskPriorities();

        console.log('Cron job completed.');
    } catch (error) {
        console.error('Cron job failed:', error);
    }
});
