const express = require("express");
const user = express();
var User= require('../models/User');
const cors = require('cors');
user.use(cors());


const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');


user.use(bodyParser.urlencoded({extended:true}));
user.use(express.static(path.resolve(__dirname,'public')));

var storage = multer.diskStorage({
    destination:(req,res,cb)=>{
        cb(null,'./public/uploads')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})
var uploads = multer({storage:storage});

const userController = require('../controllers/userController');

user.post('/importUser',uploads.single('file'),userController.importUser);

user.get('/importUser', async (req, res) => {
    try {
        const users = await User.find({});
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

user.get('/:Id', async (req,res)=>{
    try{
        const Id = req.params.Id;
        const response= await User.find({EmployeeID : Id});
        console.log('response fetched');
        res.status(200).json(response);
    }catch(error){
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = user;