const {user} = require('../Models/user');
const jwt = require('jsonwebtoken');
const secretKey = 'open296In657App27838'
module.exports.getAllUsers = async function getAllUsers(req, res) {
    try {
        const users = await user.find();
        res.send(users);  
    } 
    catch (error) {
        res.status(500).send('Internal server error');
    }
};

module.exports.getUserById = async function getUserById(req,res){
    try {
        let userID = req.params.id;
        const fetchUser = await user.findOne({user_id:userID});
        if (!fetchUser) return res.status(404).send('User not found');
        res.send(fetchUser);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
}
  

module.exports.createUser = async function createUser(req, res) {
    try {
        const { phone_number, priority } = req.body;

        const latestUser = await user.findOne({}, {}, { sort: { 'user_id': -1 } });
        const nextUserId = latestUser ? latestUser.user_id + 1 : 1;

        const newUser = await user.create({
            user_id: nextUserId,
            phone_number: phone_number,
            priority: priority
        });

        res.status(201).send(newUser);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
}

function valid(value){
    if(value.length!=10){return false;}
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(value);
}

module.exports.updateUser = async function updateUser(req, res) {
    try {
        let userID = req.params.id;
        if(!valid(req.body.phone_number)){
            return res.send('Please enter a valid phone number');
        }
        const updatedUser = await user.findOneAndUpdate({user_id:userID}, req.body, { new: true });
        if (!updatedUser) return res.status(404).json('User not found');
        res.send(updatedUser);
    } catch (error) {
        res.status(500).send('Internal server error');
    }
};

module.exports.deleteUser = async function deleteUser(req, res) {
    try {
        let userID = req.params.id;
        const User = await user.findOneAndDelete({user_id:userID});
        if (!User) return res.status(404).send('User not found');
        res.send(User);
      } catch (error) {
        res.status(500).send('Internal server error');
      }
};

module.exports.loginUser = async function loginUser(req, res) {
    try {
        const { phone_number, priority } = req.body;
        const existingUser = await user.findOne({ phone_number, priority });

        if (!existingUser) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: existingUser.user_id }, secretKey);
        res.cookie('token', token, { httpOnly: true }); // Store the token in a cookie
        res.json({ message: 'Logged in successfully', user_id: existingUser.user_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

