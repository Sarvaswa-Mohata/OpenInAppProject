const mongoose = require('mongoose');
const db_link = 'mongodb+srv://sarvaswa:YwvT2DHDFVaC3XbE@cluster0.zfwgewe.mongodb.net/OpenInApp?retryWrites=true&w=majority';
mongoose.connect(db_link)
.then(function(db){
    console.log('db connected')
})
.catch(function(err){
    console.log(err);
})

function dateGenerator() {
    return new Date().toISOString().split('T')[0];
}

const subTaskSchema = mongoose.Schema({
    subTask_id: {
        type: Number,
        unique: true,
        required: true,
    },
    task_id: {
        type: Number,
        ref: 'Task',
        required: true,
    },
    status:{
        type:Number,
        enum: [0,1],
        default:0
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at : {
        type: Date,
        default: null
    },
    deleted_at: {
        type: Date,
        default: null
    }
});

const subTask = mongoose.model('subTask',subTaskSchema);
module.exports = subTask;