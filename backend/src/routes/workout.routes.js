const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Workout = require('../models/workout.model');

// Create a new workout
router.post('/', auth, async (req, res) => {
    try {
        const workout = new Workout({
            ...req.body,
            userId: req.user._id
        });
        await workout.save();
        res.status(201).json(workout);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user's workouts with pagination and filters
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, muscleGroup, startDate, endDate } = req.query;
        const query = { userId: req.user._id };

        if (muscleGroup) {
            query.muscleGroup = muscleGroup;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const workouts = await Workout.find(query)
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Workout.countDocuments(query);

        res.json({
            workouts,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get workout by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const workout = await Workout.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        res.json(workout);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update workout
router.patch('/:id', auth, async (req, res) => {
    try {
        const workout = await Workout.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        res.json(workout);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete workout
router.delete('/:id', auth, async (req, res) => {
    try {
        const workout = await Workout.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        res.json({ message: 'Workout deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 