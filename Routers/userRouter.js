const express = require('express');
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const secretKey = 'open296In657App27838'
const {getAllUsers,createUser,getUserById,updateUser,deleteUser,loginUser} = require('../Controllers/userController')
// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  if(req.path === '/login'){
    next();
    return;
  }
  
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Access denied. No token provided.');

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(403).send('Invalid token.');
    req.user = decoded;  // Assuming the user ID is in the decoded token
    next();
  });
};

userRouter
.route('/login')
.post(loginUser);

userRouter
.route('/')
.get(verifyToken, getAllUsers)
.post(createUser)

userRouter
.route('/:id')
.get(verifyToken, getUserById)
.patch(verifyToken, updateUser)
.delete(verifyToken, deleteUser)

module.exports = userRouter;
