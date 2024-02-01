const mongoose = require('mongoose');
const db_link = 'mongodb+srv://sarvaswa:YwvT2DHDFVaC3XbE@cluster0.zfwgewe.mongodb.net/OpenInApp?retryWrites=true&w=majority';
mongoose.connect(db_link)
.then(function(db){
    console.log('db connected')
})
.catch(function(err){
    console.log(err);
})

const taskSchema = mongoose.Schema({
    task_id: {
        type: Number,
        unique: true,
        required: true, 
    },
    title:{
        type:String,
        required:true,
        unique:true
    },
    desc:{
        type:String
    },
    due_date:{
        type:Date,
        required:true,
        default:Date.now
    },
    priority:{
        type:Number,
        default:5
    },
    status:{
        type:String,
        enum:['TODO','IN_PROGRESS','DONE'],
        default:'TODO'
    },
    user_id:{
        type: Number,
        ref: 'User',
        required : true
    },
    created_at: {
        type: Date,
        default: Date.now
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

module.exports.task = mongoose.model('task',taskSchema); 