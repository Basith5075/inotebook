const express = require('express');
const Note = require('../models/Notes');
var fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const {body, validationResult } = require('express-validator'); // Using express-validator for validations.

// Route 1 : Get All Notes : get "/api/note/fetchallnotes". Login Needed

router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    
    const notes = await Note.find({user:req.user.id});
    
    res.json(notes);
})

// Route 2 : Create a Note using : POST "/api/note/addnote". Login Needed
router.post('/addnote',fetchuser,[ 
    body('title','Enter a Title ').isLength({min:3}),
    body('description','Please Enter a valid description at least 5 char length').isLength({min:5})], async (req,res)=>{
  
    const {title,description,tag} = req.body;
    
    // If there are errors, return bad request and errors
     const errors = validationResult(req);
     if(!errors.isEmpty()){
         return res.status(400).json({errors:errors.array()});
     }
  
    const note = new Note(
        {title,description,tag,user:req.user.id}
    );
    const savedNote = await note.save();

    res.json(savedNote);

});

module.exports = router