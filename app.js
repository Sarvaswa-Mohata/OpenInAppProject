const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const { updateTaskPriorities } = require('./cronJobs/priorityUpdate');
const { initiateCalls } = require('./cronJobs/priorityCalling');
app.use(cookieParser())
//middleware func.
app.use(express.json());
const PORT = 3000;
app.listen(PORT);

const subTaskRouter = require('./Routers/subTaskRouter');
app.use('/subtask', subTaskRouter);
const taskRouter = require('./Routers/taskRouter');
app.use('/task', taskRouter);
const userRouter = require('./Routers/userRouter');
app.use('/user', userRouter);

//cron jobs :
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

// Schedule the Cron job to initiate calls based on priorities
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running Cron job to initiate calls based on priorities...');

        // Call your function to initiate calls
        await initiateCalls();

        console.log('Cron job completed.');
    } catch (error) {
        console.error('Cron job failed:', error);
    }
});