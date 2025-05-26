// Workout split templates
export const workoutTemplates = {
    pushPullLegs: {
        name: 'Push/Pull/Legs',
        splits: {
            push: {
                name: 'Push Day',
                exercises: [
                    { muscleGroup: 'chest', exercise: 'Bench Press', defaultSets: 4, defaultReps: '8-12' },
                    { muscleGroup: 'chest', exercise: 'Incline Bench Press', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'shoulders', exercise: 'Military Press', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'shoulders', exercise: 'Lateral Raises', defaultSets: 3, defaultReps: '12-15' },
                    { muscleGroup: 'arms', exercise: 'Tricep Extensions', defaultSets: 3, defaultReps: '12-15' }
                ]
            },
            pull: {
                name: 'Pull Day',
                exercises: [
                    { muscleGroup: 'back', exercise: 'Pull-Ups', defaultSets: 4, defaultReps: '8-12' },
                    { muscleGroup: 'back', exercise: 'Barbell Rows', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'back', exercise: 'Lat Pulldowns', defaultSets: 3, defaultReps: '10-12' },
                    { muscleGroup: 'arms', exercise: 'Bicep Curls', defaultSets: 3, defaultReps: '12-15' },
                    { muscleGroup: 'arms', exercise: 'Hammer Curls', defaultSets: 3, defaultReps: '12-15' }
                ]
            },
            legs: {
                name: 'Legs Day',
                exercises: [
                    { muscleGroup: 'legs', exercise: 'Squats', defaultSets: 4, defaultReps: '8-12' },
                    { muscleGroup: 'legs', exercise: 'Deadlifts', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'legs', exercise: 'Leg Press', defaultSets: 3, defaultReps: '10-12' },
                    { muscleGroup: 'legs', exercise: 'Leg Extensions', defaultSets: 3, defaultReps: '12-15' },
                    { muscleGroup: 'legs', exercise: 'Leg Curls', defaultSets: 3, defaultReps: '12-15' }
                ]
            }
        }
    },
    upperLower: {
        name: 'Upper/Lower',
        splits: {
            upper: {
                name: 'Upper Body',
                exercises: [
                    { muscleGroup: 'chest', exercise: 'Bench Press', defaultSets: 4, defaultReps: '8-12' },
                    { muscleGroup: 'back', exercise: 'Pull-Ups', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'shoulders', exercise: 'Military Press', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'arms', exercise: 'Bicep Curls', defaultSets: 3, defaultReps: '12-15' },
                    { muscleGroup: 'arms', exercise: 'Tricep Extensions', defaultSets: 3, defaultReps: '12-15' }
                ]
            },
            lower: {
                name: 'Lower Body',
                exercises: [
                    { muscleGroup: 'legs', exercise: 'Squats', defaultSets: 4, defaultReps: '8-12' },
                    { muscleGroup: 'legs', exercise: 'Romanian Deadlifts', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'legs', exercise: 'Leg Press', defaultSets: 3, defaultReps: '10-12' },
                    { muscleGroup: 'legs', exercise: 'Calf Raises', defaultSets: 3, defaultReps: '15-20' },
                    { muscleGroup: 'core', exercise: 'Planks', defaultSets: 3, defaultReps: '30-60 sec' }
                ]
            }
        }
    },
    fullBody: {
        name: 'Full Body',
        splits: {
            fullBody: {
                name: 'Full Body Workout',
                exercises: [
                    { muscleGroup: 'chest', exercise: 'Bench Press', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'back', exercise: 'Pull-Ups', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'legs', exercise: 'Squats', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'shoulders', exercise: 'Military Press', defaultSets: 3, defaultReps: '8-12' },
                    { muscleGroup: 'core', exercise: 'Planks', defaultSets: 3, defaultReps: '30-60 sec' }
                ]
            }
        }
    }
};

// Function to load a template
export function loadWorkoutTemplate(splitType, day) {
    const template = workoutTemplates[splitType]?.splits[day];
    if (!template) return null;
    return template;
}

// Function to save custom template
export function saveCustomTemplate(name, exercises) {
    const customTemplates = JSON.parse(localStorage.getItem('customWorkoutTemplates') || '{}');
    customTemplates[name] = exercises;
    localStorage.setItem('customWorkoutTemplates', JSON.stringify(customTemplates));
}

// Function to get custom templates
export function getCustomTemplates() {
    return JSON.parse(localStorage.getItem('customWorkoutTemplates') || '{}');
}

// Function to load custom template
export function loadCustomTemplate(name) {
    const customTemplates = getCustomTemplates();
    return customTemplates[name] || null;
} 