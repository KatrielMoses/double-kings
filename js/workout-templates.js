import { auth, db } from './supabase-config.js';

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

// Function to save custom template - Updated to use Supabase
export async function saveCustomTemplate(name, exercises) {
    try {
        const currentUser = await auth.getCurrentUser();
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        const templateData = {
            user_id: currentUser.id,
            template_name: name,
            exercises: exercises
        };

        const result = await db.saveWorkoutTemplate(templateData);
        if (!result.success) {
            throw new Error(result.error);
        }

        console.log('Custom template saved to Supabase');
        return result;
    } catch (error) {
        console.error('Error saving custom template:', error);
        throw error;
    }
}

// Function to get custom templates - Updated to use Supabase
export async function getCustomTemplates() {
    try {
        const currentUser = await auth.getCurrentUser();
        if (!currentUser) {
            return {};
        }

        const templates = await db.getWorkoutTemplates(currentUser.id);
        const templatesObject = {};

        templates.forEach(template => {
            templatesObject[template.template_name] = template.exercises;
        });

        return templatesObject;
    } catch (error) {
        console.error('Error getting custom templates:', error);
        return {};
    }
}

// Function to load custom template - Updated to use Supabase
export async function loadCustomTemplate(name) {
    try {
        const customTemplates = await getCustomTemplates();
        return customTemplates[name] || null;
    } catch (error) {
        console.error('Error loading custom template:', error);
        return null;
    }
} 