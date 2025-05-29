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

// Function to save custom template split (multi-day template)
export function saveCustomTemplateSplit(templateName, splitData) {
    const customTemplates = JSON.parse(localStorage.getItem('customWorkoutTemplates') || '{}');
    customTemplates[templateName] = {
        name: splitData.name,
        splits: splitData.splits,
        isMultiDay: true,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('customWorkoutTemplates', JSON.stringify(customTemplates));
    console.log('Custom template split saved:', templateName);
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

// Function to delete custom template
export function deleteCustomTemplate(name) {
    const customTemplates = getCustomTemplates();
    delete customTemplates[name];
    localStorage.setItem('customWorkoutTemplates', JSON.stringify(customTemplates));
}

// Function to create default template structure for template builder
export function createDefaultTemplate(templateName) {
    const defaultDays = [];
    for (let i = 1; i <= 6; i++) {
        defaultDays.push({
            id: `day${i}`,
            name: `Day ${i}`,
            exercises: []
        });
    }

    return {
        name: templateName,
        splits: defaultDays.reduce((acc, day) => {
            acc[day.id] = {
                name: day.name,
                exercises: day.exercises
            };
            return acc;
        }, {}),
        isMultiDay: true
    };
}

// Function to validate template structure
export function validateTemplate(templateData) {
    if (!templateData.name || typeof templateData.name !== 'string') {
        return { valid: false, error: 'Template name is required' };
    }

    if (!templateData.splits || typeof templateData.splits !== 'object') {
        return { valid: false, error: 'Template must have splits' };
    }

    const splitKeys = Object.keys(templateData.splits);
    if (splitKeys.length === 0) {
        return { valid: false, error: 'Template must have at least one day' };
    }

    // Check if all days have valid names
    for (const splitKey of splitKeys) {
        const split = templateData.splits[splitKey];
        if (!split.name || typeof split.name !== 'string') {
            return { valid: false, error: `Day "${splitKey}" must have a valid name` };
        }
        if (!Array.isArray(split.exercises)) {
            return { valid: false, error: `Day "${split.name}" must have exercises array` };
        }
    }

    return { valid: true };
} 