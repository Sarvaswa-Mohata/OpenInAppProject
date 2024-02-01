const mongoose = require('mongoose');
//mongodb
const db_link='mongodb+srv://sarvaswa:YwvT2DHDFVaC3XbE@cluster0.zfwgewe.mongodb.net/OpenInApp?retryWrites=true&w=majority'
mongoose.connect(db_link)
.then(function(db){
    console.log('db connected');
})
.catch(function(err){
    console.log(err);
});

const userSchema = mongoose.Schema({
    user_id: {
        type:Number,
        required:true,
        unique: true,
    },
    phone_number:{
        type : String,
        required : true,
        minLength : 10,
        maxLength : 10, 
        validate : {
            validator : function(value){
                const phoneRegex = /^\d{10}$/;
                return phoneRegex.test(value);
            },
            message : 'Please enter a valid phone number',
        },
    },
    priority:{
        type : Number,
        required : true
    },
});

module.exports.user = mongoose.model('user', userSchema);