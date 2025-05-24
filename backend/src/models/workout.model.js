const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
    reps: {
        type: Number,
        required: true,
        min: 1
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    }
});

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    muscleGroup: {
        type: String,
        required: true
    },
    exercise: {
        type: String,
        required: true
    },
    weightUnit: {
        type: String,
        enum: ['kg', 'lbs'],
        required: true
    },
    sets: [setSchema],
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
workoutSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Workout', workoutSchema); 