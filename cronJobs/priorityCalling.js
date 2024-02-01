const cron = require('node-cron');
const twilio = require('twilio');
const {task} = require('../Models/task');

const accountSid = "AC9ac450547689349c150f8c1428e84f3e";
const authToken = '8d866ce64dabdb0b8b0837eb9140ebeb';
const twilioPhoneNumber = '+13613148144';

const client = new twilio(accountSid, authToken);

module.exports.getTasksToCall = async function getTasksToCall() {
  try {
    // Fetch tasks with due dates passed and ordered by priority
    const tasks = await task
      .find({ due_date: { $lt: new Date() } })
      .sort({ priority: 1 })
      .populate('user_id') // Assuming there's a user_id field in the task model
      .exec();

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

module.exports.callUser = async function callUser(userPhoneNumber) {
  try {
    // Use Twilio to make a call
    const call = await client.calls.create({
      url: 'http://demo.twilio.com/docs/voice.xml', // Replace with your TwiML URL
      to: userPhoneNumber,
      from: twilioPhoneNumber,
    });

    console.log(`Call initiated to ${userPhoneNumber}. Call SID: ${call.sid}`);
  } catch (error) {
    console.error('Error making call:', error);
    throw error;
  }
}

module.exports.initiateCalls = async function initiateCalls() {
  try {
    const tasksToCall = await getTasksToCall();

    for (const task of tasksToCall) {
      const { user_id } = task;
      const userPriority = user_id.priority; // Assuming there's a priority field in the user model

      // Call the user only if the previous user did not attend the call
      // (you might need additional logic to track call status)
      // For simplicity, it assumes all users with lower priority didn't attend
      const previousUserPriority = userPriority - 1;

      if (previousUserPriority < 0 || !tasksToCall.some((t) => t.user_id.priority === previousUserPriority)) {
        await callUser(user_id.phone_number);
        // Update task status or set a flag to track call initiation
      }
    }
  } catch (error) {
    console.error('Error initiating calls:', error);
  }
}

// Schedule the Cron job to run every day at a specific time (adjust the cron expression accordingly)
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
