const express = require("express");
const Project = require('../models/Project');
const auth = require("../middleware/auth"); // initialize express, project and authentication

const router = express.Router();

// posting the projects
router.post('/', auth, async (req, res) => {
    try {
        const {title, data} = req.body;
        const project = new Project({
            title,
            data,
            user: req.user.id,
        });
        await project.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ error: "Server error"});
    }
});

// getting the projects
router.get("/", auth, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.user.id}).sort({ createdAt: -1});
        res.json(projects);    
    } catch (err) {
        res.status(500).json({error: "server error"});
    }
});

// update project
router.put("/:id", auth, async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user: req.user.id});
        if (!project) return res.status(404).json({ error: "project not found"});

        project.title = req.body.title || project.title;
        project.data = req.body.data || project.data;
        await project.save();
        res.json(object);
    } catch (err) {
        res.status(500).json({ error: 'server error'});
    }
});

// delete project
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id});
        if (!project) return res.status(404).json({error: "project not found"});
        res.json({ message: 'project deleted!'});
    } catch (err) {
        res.status(500).json({ error: "server error"});
    }
});

module.exports = router;