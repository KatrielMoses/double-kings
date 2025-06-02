/**
 * FREE TIER STORAGE SERVICE
 * Uses browser localStorage for 100% FREE data storage
 * No AWS costs, works offline, perfect for personal fitness tracking
 */

class FreeStorageService {
    constructor() {
        this.storageKeys = {
            workouts: 'fitness_workouts',
            goals: 'fitness_goals',
            profile: 'fitness_profile',
            exercises: 'fitness_exercises',
            templates: 'fitness_templates'
        };
        this.initializeData();
    }

    // Initialize default data if not exists
    initializeData() {
        if (!this.getWorkouts()) {
            this.saveWorkouts([]);
        }
        if (!this.getGoals()) {
            this.saveGoals([]);
        }
        if (!this.getProfile()) {
            this.saveProfile({
                name: '',
                email: '',
                joinDate: new Date().toISOString(),
                preferences: {}
            });
        }
        if (!this.getExercises()) {
            this.saveExercises(this.getDefaultExercises());
        }
    }

    // Workout Management
    getWorkouts() {
        return this.getData(this.storageKeys.workouts) || [];
    }

    saveWorkouts(workouts) {
        this.saveData(this.storageKeys.workouts, workouts);
    }

    addWorkout(workout) {
        const workouts = this.getWorkouts();
        const newWorkout = {
            id: this.generateId(),
            ...workout,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        workouts.unshift(newWorkout); // Add to beginning
        this.saveWorkouts(workouts);
        return newWorkout;
    }

    updateWorkout(id, updates) {
        const workouts = this.getWorkouts();
        const index = workouts.findIndex(w => w.id === id);
        if (index !== -1) {
            workouts[index] = {
                ...workouts[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveWorkouts(workouts);
            return workouts[index];
        }
        return null;
    }

    deleteWorkout(id) {
        const workouts = this.getWorkouts();
        const filtered = workouts.filter(w => w.id !== id);
        this.saveWorkouts(filtered);
        return true;
    }

    // Goals Management
    getGoals() {
        return this.getData(this.storageKeys.goals) || [];
    }

    saveGoals(goals) {
        this.saveData(this.storageKeys.goals, goals);
    }

    addGoal(goal) {
        const goals = this.getGoals();
        const newGoal = {
            id: this.generateId(),
            ...goal,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: goal.status || 'active'
        };
        goals.unshift(newGoal);
        this.saveGoals(goals);
        return newGoal;
    }

    updateGoal(id, updates) {
        const goals = this.getGoals();
        const index = goals.findIndex(g => g.id === id);
        if (index !== -1) {
            goals[index] = {
                ...goals[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveGoals(goals);
            return goals[index];
        }
        return null;
    }

    deleteGoal(id) {
        const goals = this.getGoals();
        const filtered = goals.filter(g => g.id !== id);
        this.saveGoals(filtered);
        return true;
    }

    // Profile Management
    getProfile() {
        return this.getData(this.storageKeys.profile);
    }

    updateProfile(profileData) {
        const currentProfile = this.getProfile() || {};
        const updatedProfile = {
            ...currentProfile,
            ...profileData,
            updatedAt: new Date().toISOString()
        };
        this.saveData(this.storageKeys.profile, updatedProfile);
        return updatedProfile;
    }

    // Exercise Database
    getExercises() {
        return this.getData(this.storageKeys.exercises) || [];
    }

    saveExercises(exercises) {
        this.saveData(this.storageKeys.exercises, exercises);
    }

    addCustomExercise(exercise) {
        const exercises = this.getExercises();
        const newExercise = {
            id: this.generateId(),
            ...exercise,
            isCustom: true,
            createdAt: new Date().toISOString()
        };
        exercises.push(newExercise);
        this.saveExercises(exercises);
        return newExercise;
    }

    // Analytics & Statistics
    getWorkoutStats() {
        const workouts = this.getWorkouts();
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return {
            total: workouts.length,
            thisWeek: workouts.filter(w => new Date(w.createdAt) > oneWeekAgo).length,
            thisMonth: workouts.filter(w => new Date(w.createdAt) > oneMonthAgo).length,
            totalTime: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
            totalWeight: workouts.reduce((sum, w) => sum + (w.weight || 0) * (w.sets || 1) * (w.reps || 1), 0)
        };
    }

    getGoalProgress() {
        const goals = this.getGoals();
        return {
            total: goals.length,
            active: goals.filter(g => g.status === 'active').length,
            completed: goals.filter(g => g.status === 'completed').length,
            overdue: goals.filter(g => {
                if (g.targetDate && g.status === 'active') {
                    return new Date(g.targetDate) < new Date();
                }
                return false;
            }).length
        };
    }

    // Data Export/Import for Backup
    exportData() {
        const data = {
            workouts: this.getWorkouts(),
            goals: this.getGoals(),
            profile: this.getProfile(),
            exercises: this.getExercises(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.workouts) this.saveWorkouts(data.workouts);
            if (data.goals) this.saveGoals(data.goals);
            if (data.profile) this.saveData(this.storageKeys.profile, data.profile);
            if (data.exercises) this.saveExercises(data.exercises);
            return { success: true, message: 'Data imported successfully!' };
        } catch (error) {
            return { success: false, message: 'Invalid data format' };
        }
    }

    // Search and Filter
    searchWorkouts(query) {
        const workouts = this.getWorkouts();
        const lowerQuery = query.toLowerCase();
        return workouts.filter(w =>
            (w.exercise && w.exercise.toLowerCase().includes(lowerQuery)) ||
            (w.notes && w.notes.toLowerCase().includes(lowerQuery))
        );
    }

    getWorkoutsByDateRange(startDate, endDate) {
        const workouts = this.getWorkouts();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return workouts.filter(w => {
            const workoutDate = new Date(w.createdAt);
            return workoutDate >= start && workoutDate <= end;
        });
    }

    // Utility Methods
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            // Handle storage quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldData();
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                    return true;
                } catch (retryError) {
                    console.error('Still cannot save after cleanup:', retryError);
                }
            }
            return false;
        }
    }

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    cleanupOldData() {
        // Keep only last 1000 workouts and 100 goals if storage is full
        const workouts = this.getWorkouts();
        const goals = this.getGoals();

        if (workouts.length > 1000) {
            this.saveWorkouts(workouts.slice(0, 1000));
        }

        if (goals.length > 100) {
            this.saveGoals(goals.slice(0, 100));
        }
    }

    getDefaultExercises() {
        return [
            { id: 1, name: 'Push-ups', category: 'Chest', bodyPart: 'Upper Body' },
            { id: 2, name: 'Squats', category: 'Legs', bodyPart: 'Lower Body' },
            { id: 3, name: 'Pull-ups', category: 'Back', bodyPart: 'Upper Body' },
            { id: 4, name: 'Deadlifts', category: 'Back', bodyPart: 'Full Body' },
            { id: 5, name: 'Bench Press', category: 'Chest', bodyPart: 'Upper Body' },
            { id: 6, name: 'Lunges', category: 'Legs', bodyPart: 'Lower Body' },
            { id: 7, name: 'Plank', category: 'Core', bodyPart: 'Core' },
            { id: 8, name: 'Burpees', category: 'Cardio', bodyPart: 'Full Body' },
            { id: 9, name: 'Mountain Climbers', category: 'Cardio', bodyPart: 'Full Body' },
            { id: 10, name: 'Shoulder Press', category: 'Shoulders', bodyPart: 'Upper Body' }
        ];
    }

    // Storage Usage Info
    getStorageInfo() {
        const usage = new Blob([this.exportData()]).size;
        const usageKB = Math.round(usage / 1024);
        const maxStorage = 5 * 1024; // 5MB typical localStorage limit

        return {
            used: usage,
            usedKB: usageKB,
            maxKB: maxStorage,
            percentUsed: Math.round((usageKB / maxStorage) * 100)
        };
    }
}

// Initialize the free storage service
const freeStorage = new FreeStorageService();

// Global functions for easy access
window.FreeStorage = {
    // Workouts
    addWorkout: (workout) => freeStorage.addWorkout(workout),
    getWorkouts: () => freeStorage.getWorkouts(),
    updateWorkout: (id, updates) => freeStorage.updateWorkout(id, updates),
    deleteWorkout: (id) => freeStorage.deleteWorkout(id),

    // Goals
    addGoal: (goal) => freeStorage.addGoal(goal),
    getGoals: () => freeStorage.getGoals(),
    updateGoal: (id, updates) => freeStorage.updateGoal(id, updates),
    deleteGoal: (id) => freeStorage.deleteGoal(id),

    // Analytics
    getStats: () => freeStorage.getWorkoutStats(),
    getGoalProgress: () => freeStorage.getGoalProgress(),

    // Data Management
    exportData: () => freeStorage.exportData(),
    importData: (data) => freeStorage.importData(data),
    getStorageInfo: () => freeStorage.getStorageInfo()
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FreeStorageService;
} 