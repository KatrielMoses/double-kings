import { workoutTemplates, loadWorkoutTemplate, saveCustomTemplate, getCustomTemplates, loadCustomTemplate } from './workout-templates.js';

// Global variables
let workoutList;

// Get the workout list element or create one if it doesn't exist
function getWorkoutList() {
    if (!workoutList) {
        workoutList = document.getElementById('workoutList');
    }
    return workoutList;
}

// Store exercise data with user history
function storeExerciseHistory(exerciseName, muscleGroup, sets) {
    try {
        // Get existing exercise history or create a new object
        const exerciseHistory = JSON.parse(localStorage.getItem('exerciseHistory')) || {};

        // Create entry for this exercise if it doesn't exist
        if (!exerciseHistory[exerciseName]) {
            exerciseHistory[exerciseName] = {
                muscleGroup: muscleGroup,
                history: []
            };
        }

        // Add new entry at the beginning of history array (most recent first)
        exerciseHistory[exerciseName].history.unshift({
            date: new Date().toISOString(),
            sets: sets
        });

        // Limit history to last 10 entries to prevent excessive storage
        if (exerciseHistory[exerciseName].history.length > 10) {
            exerciseHistory[exerciseName].history = exerciseHistory[exerciseName].history.slice(0, 10);
        }

        // Save updated history
        localStorage.setItem('exerciseHistory', JSON.stringify(exerciseHistory));
        console.log(`Stored history for ${exerciseName}`);
        return true;
    } catch (error) {
        console.error('Error storing exercise history:', error);
        return false;
    }
}

// Get last used values for an exercise
function getLastExerciseData(exerciseName) {
    try {
        const exerciseHistory = JSON.parse(localStorage.getItem('exerciseHistory')) || {};

        // Check if we have history for this exercise
        if (exerciseHistory[exerciseName] &&
            exerciseHistory[exerciseName].history &&
            exerciseHistory[exerciseName].history.length > 0) {

            // Return the most recent entry (first in the array)
            return exerciseHistory[exerciseName].history[0];
        }

        return null;
    } catch (error) {
        console.error('Error retrieving exercise history:', error);
        return null;
    }
}

// Initialize workout logger without authentication
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Workout Logger: Starting initialization...');

        // Set default user info for UI (using avatar instead of text now)

        // Set default weight unit preference
        const weightUnitSelect = document.getElementById('weightUnit');
        if (weightUnitSelect) {
            // Get preference from localStorage or set default to kg
            const savedWeightUnit = localStorage.getItem('preferredWeightUnit') || 'kg';
            weightUnitSelect.value = savedWeightUnit;
        }

        // Add logout/home functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        console.log('Workout Logger: Initializing workout logger...');
        // Continue with workout logger initialization
        initWorkoutLogger();

        // Load existing workouts from local storage
        await loadWorkouts();

        console.log('Workout Logger: Initialization complete');
    } catch (error) {
        console.error('Error initializing workout logger:', error);
        alert('Error loading workout logger. Please try refreshing the page.');
    }
});

// Exercise database organized by muscle groups - Move to global scope
const exercises = {
    chest: [
        'Bench Press',
        'Incline Bench Press',
        'Decline Bench Press',
        'Dumbbell Flyes',
        'Push-Ups',
        'Cable Flyes',
        'Dumbbell Bench Press',
        'Incline Dumbbell Press',
        'Chest Dips',
        'Pec Deck',
        'Cable Crossovers'
    ],
    back: [
        'Pull-Ups',
        'Lat Pulldowns',
        'Barbell Rows',
        'Dumbbell Rows',
        'Deadlifts',
        'Face Pulls',
        'T-Bar Rows',
        'Cable Rows',
        'Chin-Ups',
        'Wide Grip Pulldowns',
        'Reverse Flyes',
        'Shrugs'
    ],
    legs: [
        'Squats',
        'Deadlifts',
        'Leg Press',
        'Lunges',
        'Leg Extensions',
        'Leg Curls',
        'Romanian Deadlifts',
        'Bulgarian Split Squats',
        'Walking Lunges',
        'Goblet Squats',
        'Calf Raises',
        'Hip Thrusts',
        'Leg Curls (Lying)',
        'Leg Curls (Standing)',
        'Stiff Leg Deadlifts'
    ],
    shoulders: [
        'Military Press',
        'Lateral Raises',
        'Front Raises',
        'Rear Delt Flyes',
        'Arnold Press',
        'Upright Rows',
        'Dumbbell Shoulder Press',
        'Cable Lateral Raises',
        'Face Pulls',
        'Overhead Press',
        'Pike Push-Ups',
        'Reverse Pec Deck'
    ],
    arms: [
        'Bicep Curls',
        'Tricep Extensions',
        'Hammer Curls',
        'Skull Crushers',
        'Preacher Curls',
        'Diamond Push-Ups',
        'Tricep Dips',
        'Cable Curls',
        'Overhead Tricep Extension',
        '21s (Bicep Curls)',
        'Concentration Curls',
        'Close Grip Bench Press',
        'Cable Tricep Extensions'
    ],
    core: [
        'Crunches',
        'Planks',
        'Russian Twists',
        'Leg Raises',
        'Ab Wheel Rollouts',
        'Mountain Climbers',
        'Dead Bug',
        'Bicycle Crunches',
        'Side Planks',
        'Hanging Leg Raises',
        'V-Ups',
        'Wood Choppers'
    ]
};

// Function to switch between tabs - Move to global scope
function switchToTab(tabName) {
    console.log('Switching to tab:', tabName);
    // Update tab buttons
    document.querySelectorAll('.exercise-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTabBtn) {
        activeTabBtn.classList.add('active');
    }

    // Update tab content
    document.querySelectorAll('.exercise-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const activeTabContent = document.getElementById(`${tabName}ExercisesTab`);
    if (activeTabContent) {
        activeTabContent.classList.add('active');
    }
}

// Helper functions for default sets and reps - Move to global scope
function getDefaultSetsForMuscleGroup(muscleGroup) {
    const defaults = {
        chest: 4,
        back: 3,
        legs: 4,
        shoulders: 3,
        arms: 3,
        core: 3
    };
    return defaults[muscleGroup] || 3;
}

function getDefaultRepsForMuscleGroup(muscleGroup) {
    const defaults = {
        chest: '8-12',
        back: '8-12',
        legs: '8-12',
        shoulders: '10-15',
        arms: '12-15',
        core: '30-60 sec'
    };
    return defaults[muscleGroup] || '8-12';
}

// Function to populate popular exercises based on current context - Move to global scope
function populatePopularExercises() {
    console.log('Populating popular exercises...');
    const popularExercisesList = document.getElementById('popularExercisesList');
    const currentSplitDayTitle = document.getElementById('currentSplitDayTitle');

    if (!popularExercisesList) {
        console.error('Popular exercises list not found!');
        return;
    }

    // Clear existing exercises
    popularExercisesList.innerHTML = '';

    // Get current template context
    if (!window.currentTemplate) {
        console.log('No current template, showing general exercises');
        currentSplitDayTitle.textContent = 'General Popular Exercises';
        populateGeneralExercises();
        return;
    }

    // Update title based on current template
    currentSplitDayTitle.textContent = `Popular exercises for ${window.currentTemplate.name || 'your workout'}`;

    // Get muscle groups from current template
    const currentMuscleGroups = [...new Set(window.currentTemplate.exercises.map(ex => ex.muscleGroup))];

    // Create a curated list based on the muscle groups in the current template
    const recommendedExercises = [];

    currentMuscleGroups.forEach(muscleGroup => {
        if (exercises[muscleGroup]) {
            exercises[muscleGroup].forEach(exerciseName => {
                // Don't suggest exercises that are already in the template
                const alreadyExists = window.currentTemplate.exercises.some(ex => ex.exercise === exerciseName);
                if (!alreadyExists) {
                    recommendedExercises.push({
                        name: exerciseName,
                        muscleGroup: muscleGroup,
                        sets: getDefaultSetsForMuscleGroup(muscleGroup),
                        reps: getDefaultRepsForMuscleGroup(muscleGroup)
                    });
                }
            });
        }
    });

    // If no recommended exercises (all are already in template), show general popular ones
    if (recommendedExercises.length === 0) {
        console.log('No recommended exercises, showing general ones');
        populateGeneralExercises();
        return;
    }

    // Sort by muscle group to group similar exercises together
    recommendedExercises.sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup));

    // Create exercise cards
    recommendedExercises.forEach(exercise => {
        createPopularExerciseCard(exercise);
    });

    console.log(`Created ${recommendedExercises.length} exercise cards`);
}

// Function to populate general popular exercises when no specific context - Move to global scope
function populateGeneralExercises() {
    console.log('Populating general exercises...');
    const popularExercisesList = document.getElementById('popularExercisesList');

    const generalPopular = [
        { name: 'Bench Press', muscleGroup: 'chest', sets: 4, reps: '8-12' },
        { name: 'Squats', muscleGroup: 'legs', sets: 4, reps: '8-12' },
        { name: 'Deadlifts', muscleGroup: 'back', sets: 3, reps: '6-8' },
        { name: 'Pull-Ups', muscleGroup: 'back', sets: 3, reps: '8-12' },
        { name: 'Military Press', muscleGroup: 'shoulders', sets: 3, reps: '8-12' },
        { name: 'Bicep Curls', muscleGroup: 'arms', sets: 3, reps: '12-15' },
        { name: 'Tricep Extensions', muscleGroup: 'arms', sets: 3, reps: '12-15' },
        { name: 'Planks', muscleGroup: 'core', sets: 3, reps: '30-60 sec' }
    ];

    generalPopular.forEach(exercise => {
        createPopularExerciseCard(exercise);
    });
}

// Function to create a popular exercise card - Move to global scope
function createPopularExerciseCard(exercise) {
    const popularExercisesList = document.getElementById('popularExercisesList');

    const card = document.createElement('div');
    card.className = 'popular-exercise-card';
    card.innerHTML = `
        <div class="popular-exercise-name">${exercise.name}</div>
        <div class="popular-exercise-muscle">${exercise.muscleGroup}</div>
        <div class="popular-exercise-details">${exercise.sets} sets × ${exercise.reps}</div>
    `;

    // Add click handler to select this exercise
    card.addEventListener('click', () => {
        console.log('Exercise card clicked:', exercise.name);
        // Remove selection from other cards
        document.querySelectorAll('.popular-exercise-card').forEach(c => {
            c.classList.remove('selected');
        });

        // Select this card
        card.classList.add('selected');

        // Add the exercise to the workout
        addExerciseFromPopular(exercise);
    });

    popularExercisesList.appendChild(card);
}

// Function to add an exercise from the popular list - Move to global scope
function addExerciseFromPopular(exercise) {
    console.log('Adding exercise from popular:', exercise.name);

    if (!window.currentTemplate) {
        alert('Please load a workout template first!');
        return;
    }

    // Create new exercise object with unique ID
    const newExercise = {
        id: 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        muscleGroup: exercise.muscleGroup,
        exercise: exercise.name,
        defaultSets: exercise.sets,
        defaultReps: exercise.reps,
        isLogged: false
    };

    // Add to template
    window.currentTemplate.exercises.push(newExercise);

    // Add to list (this function should be available in the main scope)
    if (typeof createExerciseItem === 'function') {
        createExerciseItem(newExercise, window.currentTemplate.exercises.length - 1);
    }

    // Close modal
    const modal = document.getElementById('addExerciseModal');
    if (modal) {
        modal.classList.remove('active');
    }

    // Add notification
    const notification = document.createElement('div');
    notification.className = 'exercise-complete-notification';
    notification.innerHTML = `<i class="fas fa-plus-circle"></i> ${exercise.name} added to workout`;
    const container = document.getElementById('exerciseListContainer');
    if (container) {
        container.appendChild(notification);
    }

    // Remove notification after animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 2000);
}

// Format date for date input field (YYYY-MM-DD)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Load workouts function - moved to global scope
async function loadWorkouts() {
    try {
        const workouts = JSON.parse(localStorage.getItem('savedWorkouts')) || [];
        const wkList = getWorkoutList();

        if (!wkList) {
            console.log('Workout list element not found, skipping workout load');
            return false;
        }

        // Clear existing entries
        wkList.innerHTML = '';

        console.log(`Loading ${workouts.length} workouts from local storage`);

        workouts.forEach((workout, index) => {
            const workoutEntry = document.createElement('div');
            workoutEntry.className = 'workout-entry';
            workoutEntry.dataset.workoutIndex = index;

            // Format sets display
            const setsDisplay = workout.sets.map(set =>
                `${set.reps} reps @ ${set.weight} ${workout.weight_unit}`
            ).join(', ');

            workoutEntry.innerHTML = `
                <div class="workout-entry-details">
                    <strong>${workout.exercise_name}</strong> (${workout.muscle_group})
                    <br>Date: ${new Date(workout.workout_date).toLocaleDateString()}
                    <br>Sets: ${setsDisplay}
                </div>
                <div class="workout-entry-actions">
                    <button class="delete-btn" title="Delete entry">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Add delete functionality
            const deleteBtn = workoutEntry.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this workout?')) {
                    // Remove from local storage
                    const savedWorkouts = JSON.parse(localStorage.getItem('savedWorkouts')) || [];
                    savedWorkouts.splice(index, 1);
                    localStorage.setItem('savedWorkouts', JSON.stringify(savedWorkouts));

                    // Remove from UI
                    workoutEntry.remove();
                }
            });

            wkList.appendChild(workoutEntry);
        });

        console.log('Workouts loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading workouts:', error);
        return false;
    }
}

function initWorkoutLogger() {
    console.log('Initializing workout logger...');

    // Get DOM elements first (to avoid reference errors)
    const weightUnitSelect = document.getElementById('weightUnit');
    const workoutDateInput = document.getElementById('workoutDate');

    // Initialize logged exercises tracking - separate from template
    if (!window.loggedExercises) {
        window.loggedExercises = new Map(); // Use Map to store logged exercises by unique ID
    }

    // Set default date to today
    const today = new Date();
    const formattedToday = formatDateForInput(today);
    if (workoutDateInput) {
        workoutDateInput.value = formattedToday;
    }

    // Add Exercise Button - Move this to the top to ensure it gets attached
    const addExerciseBtn = document.getElementById('addExerciseBtn');
    console.log('Add exercise button found:', addExerciseBtn);

    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', () => {
            console.log('Add exercise button clicked!');

            if (!window.currentTemplate) {
                alert('Please load a workout template first!');
                return;
            }

            // Add a new empty exercise to the template
            addNewEmptyExercise();
        });
        console.log('Add exercise button event listener attached successfully');
    } else {
        console.error('Add exercise button not found!');
    }

    // Function to generate unique exercise ID
    function generateExerciseId() {
        return 'ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Function to add a new empty exercise row
    function addNewEmptyExercise() {
        console.log('Adding new empty exercise...');

        // Create a placeholder exercise object with unique ID
        const newExercise = {
            id: generateExerciseId(),
            muscleGroup: '',
            exercise: '',
            defaultSets: 3,
            defaultReps: '8-12',
            isNew: true, // Flag to indicate this is a new, editable exercise
            isLogged: false // Track if this exercise has been logged
        };

        // Add to template
        window.currentTemplate.exercises.push(newExercise);

        // Create the editable exercise item
        createEditableExerciseItem(newExercise, window.currentTemplate.exercises.length - 1);
    }

    // Function to create an editable exercise item with dropdowns
    function createEditableExerciseItem(exercise, index) {
        const exerciseList = document.getElementById('exerciseList');
        const listItem = document.createElement('li');
        listItem.className = 'exercise-item editable-exercise expanded';
        listItem.dataset.index = index;

        // Create the editable structure with dropdowns
        listItem.innerHTML = `
            <div class="exercise-header">
                <div class="exercise-info">
                    <div class="exercise-dropdowns">
                        <select class="muscle-group-select" data-index="${index}">
                            <option value="">Select Muscle Group</option>
                            <option value="chest">Chest</option>
                            <option value="back">Back</option>
                            <option value="legs">Legs</option>
                            <option value="shoulders">Shoulders</option>
                            <option value="arms">Arms</option>
                            <option value="core">Core</option>
                        </select>
                        <select class="exercise-select" data-index="${index}" disabled>
                            <option value="">Select Exercise</option>
                        </select>
                        <input type="text" class="custom-exercise-input" data-index="${index}" 
                               placeholder="Enter custom exercise name..." 
                               style="display: none;">
                    </div>
                </div>
                <div class="exercise-controls">
                    <button class="confirm-exercise-btn" data-index="${index}" disabled>
                        <i class="fas fa-check"></i> Confirm
                    </button>
                </div>
            </div>
            <div class="exercise-actions">
                <button class="exercise-action-btn delete-exercise" title="Remove exercise">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="exercise-logging">
                <div class="sets-header">
                    <div class="sets-title">Sets (${exercise.defaultSets})</div>
                    <div class="sets-controls">
                        <button class="set-count-control decrease-sets" title="Decrease sets">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="set-count-control increase-sets" title="Increase sets">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="sets-container">
                    <!-- Sets will be generated here -->
                </div>
                <button class="log-sets-btn">
                    <i class="fas fa-check"></i> Log Exercise
                </button>
            </div>
        `;

        // Generate initial sets
        const setsContainer = listItem.querySelector('.sets-container');
        generateSets(setsContainer, exercise.defaultSets);

        // Add muscle group change handler
        const muscleGroupSelect = listItem.querySelector('.muscle-group-select');
        const exerciseSelect = listItem.querySelector('.exercise-select');
        const customExerciseInput = listItem.querySelector('.custom-exercise-input');
        const confirmBtn = listItem.querySelector('.confirm-exercise-btn');

        muscleGroupSelect.addEventListener('change', () => {
            const selectedMuscleGroup = muscleGroupSelect.value;
            console.log('Muscle group selected:', selectedMuscleGroup);

            // Reset exercise dropdown and custom input
            exerciseSelect.innerHTML = '<option value="">Select Exercise</option>';
            customExerciseInput.style.display = 'none';
            customExerciseInput.value = '';
            exerciseSelect.disabled = !selectedMuscleGroup;

            // Add "Custom Exercise" option first
            if (selectedMuscleGroup) {
                const customOption = document.createElement('option');
                customOption.value = 'custom';
                customOption.textContent = '🎯 Custom Exercise';
                exerciseSelect.appendChild(customOption);

                // Add separator option (disabled)
                const separator = document.createElement('option');
                separator.disabled = true;
                separator.textContent = '─────────────────';
                exerciseSelect.appendChild(separator);
            }

            // Populate exercise dropdown based on muscle group
            if (selectedMuscleGroup && exercises[selectedMuscleGroup]) {
                exercises[selectedMuscleGroup].forEach(exerciseName => {
                    const option = document.createElement('option');
                    option.value = exerciseName;
                    option.textContent = exerciseName;
                    exerciseSelect.appendChild(option);
                });
                exerciseSelect.disabled = false;
            }

            // Update confirm button state
            updateConfirmButtonState();
        });

        exerciseSelect.addEventListener('change', () => {
            const selectedExercise = exerciseSelect.value;
            console.log('Exercise selected:', selectedExercise);

            if (selectedExercise === 'custom') {
                // Show custom input and hide dropdown selection text
                customExerciseInput.style.display = 'block';
                customExerciseInput.focus();
                console.log('Custom exercise selected - showing input field');
            } else {
                // Hide custom input
                customExerciseInput.style.display = 'none';
                customExerciseInput.value = '';
            }

            updateConfirmButtonState();
        });

        // Add custom exercise input handler
        customExerciseInput.addEventListener('input', () => {
            console.log('Custom exercise input changed:', customExerciseInput.value);
            updateConfirmButtonState();
        });

        // Handle Enter key in custom input
        customExerciseInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !confirmBtn.disabled) {
                confirmBtn.click();
            }
        });

        function updateConfirmButtonState() {
            let hasValues = false;

            if (muscleGroupSelect.value) {
                if (exerciseSelect.value === 'custom') {
                    // For custom exercise, check if custom input has text
                    hasValues = customExerciseInput.value.trim().length > 0;
                } else if (exerciseSelect.value) {
                    // For predefined exercise, just check if exercise is selected
                    hasValues = true;
                }
            }

            confirmBtn.disabled = !hasValues;
            if (hasValues) {
                confirmBtn.classList.add('enabled');
            } else {
                confirmBtn.classList.remove('enabled');
            }
        }

        // Confirm button handler
        confirmBtn.addEventListener('click', () => {
            const selectedMuscleGroup = muscleGroupSelect.value;
            let selectedExercise = exerciseSelect.value;

            // Handle custom exercise
            if (selectedExercise === 'custom') {
                const customExerciseName = customExerciseInput.value.trim();
                if (!customExerciseName) {
                    alert('Please enter a custom exercise name');
                    return;
                }
                selectedExercise = customExerciseName;
                console.log('Using custom exercise name:', selectedExercise);
            }

            if (!selectedMuscleGroup || !selectedExercise) {
                alert('Please select both muscle group and exercise');
                return;
            }

            // Update the exercise object
            window.currentTemplate.exercises[index] = {
                muscleGroup: selectedMuscleGroup,
                exercise: selectedExercise,
                defaultSets: exercise.defaultSets,
                defaultReps: exercise.defaultReps
            };

            // Replace this editable item with a regular exercise item
            listItem.remove();
            createExerciseItem(window.currentTemplate.exercises[index], index);

            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'exercise-complete-notification';
            notification.innerHTML = `<i class="fas fa-plus-circle"></i> ${selectedExercise} added to workout`;
            document.getElementById('exerciseListContainer').appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 2000);
        });

        // Add delete button functionality
        const deleteBtn = listItem.querySelector('.delete-exercise');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Remove this exercise?')) {
                // Remove from template
                window.currentTemplate.exercises.splice(index, 1);
                listItem.remove();

                // Update indices of remaining items
                updateExerciseIndices();
            }
        });

        // Sets controls
        const increaseBtn = listItem.querySelector('.increase-sets');
        const decreaseBtn = listItem.querySelector('.decrease-sets');
        const setsTitle = listItem.querySelector('.sets-title');
        let currentSets = exercise.defaultSets;

        increaseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentSets < 10) {
                currentSets++;
                setsTitle.textContent = `Sets (${currentSets})`;
                generateSets(setsContainer, currentSets);
                // Update the exercise object
                window.currentTemplate.exercises[index].defaultSets = currentSets;
            }
        });

        decreaseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentSets > 1) {
                currentSets--;
                setsTitle.textContent = `Sets (${currentSets})`;
                generateSets(setsContainer, currentSets);
                // Update the exercise object
                window.currentTemplate.exercises[index].defaultSets = currentSets;
            }
        });

        exerciseList.appendChild(listItem);

        // Focus on the muscle group dropdown
        setTimeout(() => {
            muscleGroupSelect.focus();
        }, 100);
    }

    // Function to update exercise indices after deletion
    function updateExerciseIndices() {
        const exerciseItems = document.querySelectorAll('.exercise-item');
        exerciseItems.forEach((item, index) => {
            item.dataset.index = index;
            // Update any data-index attributes in children
            item.querySelectorAll('[data-index]').forEach(element => {
                element.dataset.index = index;
            });
        });
    }

    // Exercise tab switching
    document.querySelectorAll('.exercise-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            console.log('Tab clicked:', tabName);
            switchToTab(tabName);
        });
    });

    // Check for selected template in session storage
    const selectedTemplate = JSON.parse(sessionStorage.getItem('selectedTemplate'));
    if (selectedTemplate) {
        // Clear the session storage to prevent reloading on page refresh
        sessionStorage.removeItem('selectedTemplate');

        // Load the template exercises
        setTimeout(() => {
            if (selectedTemplate.exercises && selectedTemplate.exercises.length > 0) {
                // Set the first exercise
                const firstExercise = selectedTemplate.exercises[0];
                document.getElementById('muscleGroup').value = firstExercise.muscleGroup;
                document.getElementById('muscleGroup').dispatchEvent(new Event('change'));

                setTimeout(() => {
                    document.getElementById('exercise').value = firstExercise.exercise;
                    document.getElementById('sets').value = firstExercise.defaultSets;

                    // Generate sets with default values
                    // generateSetsBtn.click(); // Commented out - old code

                    // Add remaining exercises
                    // selectedTemplate.exercises.slice(1).forEach(exercise => {
                    //     addExerciseToForm(exercise);
                    // }); // Commented out - old code
                }, 100);
            }
        }, 100);
    }

    // Template handling with new grid UI
    const splitSelectionStep = document.getElementById('splitSelectionStep');
    const daySelectionStep = document.getElementById('daySelectionStep');
    const splitCards = document.querySelectorAll('.split-card');
    const workoutDayGrid = document.getElementById('workoutDayGrid');
    const backToSplitsBtn = document.getElementById('backToSplits');
    const workoutSplitSelect = document.getElementById('workoutSplit');
    const workoutDaySelect = document.getElementById('workoutDay');
    const loadTemplateBtn = document.getElementById('loadTemplate');
    const saveAsTemplateBtn = document.getElementById('saveAsTemplate');

    // Track the currently selected split type
    let selectedSplitType = '';

    // Set initial date to today
    document.getElementById('workoutDate').valueAsDate = new Date();

    // Day icons mapping (customize as needed)
    const dayIcons = {
        push: 'fa-hand-rock',
        pull: 'fa-hand-paper',
        legs: 'fa-shoe-prints',
        upper: 'fa-chevron-up',
        lower: 'fa-chevron-down',
        fullBody: 'fa-user'
    };

    // Default icon if no specific mapping exists
    const defaultDayIcon = 'fa-dumbbell';

    // Handle split card selection (main workout splits)
    splitCards.forEach(card => {
        card.addEventListener('click', () => {
            const splitType = card.dataset.split;
            selectedSplitType = splitType; // Store the selected split type

            // Update hidden select for compatibility with existing code
            workoutSplitSelect.value = splitType;

            // Remove active class from all cards
            splitCards.forEach(c => c.classList.remove('active'));

            // Add active class to selected card
            card.classList.add('active');

            // Generate day cards based on selected split
            generateDayCards(splitType);
            splitSelectionStep.style.display = 'none';
            daySelectionStep.style.display = 'block';

            console.log('Split selected:', splitType);
        });
    });

    // Handle custom option buttons
    const customOptionBtns = document.querySelectorAll('.custom-option-btn');
    customOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const splitType = btn.dataset.split;
            selectedSplitType = splitType; // Store the selected split type

            // Update hidden select for compatibility with existing code
            workoutSplitSelect.value = splitType;

            // Remove active class from all buttons
            customOptionBtns.forEach(b => b.classList.remove('active'));

            // Add active class to selected button
            btn.classList.add('active');

            // Handle different split types
            if (splitType === 'createCustom') {
                // Show custom split creation step
                splitSelectionStep.style.display = 'none';
                document.getElementById('customSplitStep').style.display = 'block';
                initializeCustomSplit();
            } else if (splitType === 'custom') {
                // Generate day cards based on saved custom templates
                generateDayCards(splitType);
                splitSelectionStep.style.display = 'none';
                daySelectionStep.style.display = 'block';
            }

            console.log('Custom option selected:', splitType);
        });
    });

    // Back button to return to split selection
    backToSplitsBtn.addEventListener('click', () => {
        splitSelectionStep.style.display = 'block';
        daySelectionStep.style.display = 'none';

        // Hide template actions when going back
        const templateActionsAfterSelection = document.getElementById('templateActionsAfterSelection');
        if (templateActionsAfterSelection) {
            templateActionsAfterSelection.style.display = 'none';
        }

        // Don't clear the selected split when going back
        // Just clear the day selection
        workoutDaySelect.value = '';
    });

    // Back button from custom split creation
    const backToSplitsFromCustomBtn = document.getElementById('backToSplitsFromCustom');
    if (backToSplitsFromCustomBtn) {
        backToSplitsFromCustomBtn.addEventListener('click', () => {
            document.getElementById('customSplitStep').style.display = 'none';
            splitSelectionStep.style.display = 'block';
        });
    }

    // Back button from edit custom day
    const backToCustomSplitBtn = document.getElementById('backToCustomSplit');
    if (backToCustomSplitBtn) {
        backToCustomSplitBtn.addEventListener('click', () => {
            document.getElementById('editCustomDayStep').style.display = 'none';
            document.getElementById('customSplitStep').style.display = 'block';

            // Update the day name in the split
            const dayName = document.getElementById('customDayName').value.trim();
            if (dayName && currentEditingDayIndex !== null) {
                currentCustomSplit.days[currentEditingDayIndex].name = dayName;
                renderCustomDays();
            }
        });
    }

    // Add custom day button
    const addCustomDayBtn = document.getElementById('addCustomDay');
    if (addCustomDayBtn) {
        addCustomDayBtn.addEventListener('click', () => {
            const newDayNumber = currentCustomSplit.days.length + 1;
            const newDay = {
                name: `Day ${newDayNumber}`,
                exercises: []
            };

            currentCustomSplit.days.push(newDay);
            renderCustomDays();
        });
    }

    // Add exercise to day button
    const addExerciseToDayBtn = document.getElementById('addExerciseToDay');
    if (addExerciseToDayBtn) {
        addExerciseToDayBtn.addEventListener('click', () => {
            addExerciseToCustomDay();
        });
    }

    // Finish editing day button
    const finishEditingDayBtn = document.getElementById('finishEditingDay');
    if (finishEditingDayBtn) {
        finishEditingDayBtn.addEventListener('click', () => {
            // Update the day name
            const dayName = document.getElementById('customDayName').value.trim();
            if (dayName && currentEditingDayIndex !== null) {
                currentCustomSplit.days[currentEditingDayIndex].name = dayName;
            }

            // Go back to custom split overview
            document.getElementById('editCustomDayStep').style.display = 'none';
            document.getElementById('customSplitStep').style.display = 'block';
            renderCustomDays();
        });
    }

    // Save custom split button
    const saveCustomSplitBtn = document.getElementById('saveCustomSplit');
    if (saveCustomSplitBtn) {
        saveCustomSplitBtn.addEventListener('click', () => {
            const splitName = document.getElementById('customSplitName').value.trim();

            if (!splitName) {
                alert('Please enter a name for your split');
                return;
            }

            // Validate that at least one day has exercises
            const hasExercises = currentCustomSplit.days.some(day => day.exercises.length > 0);
            if (!hasExercises) {
                alert('Please add at least one exercise to one of your days');
                return;
            }

            // Save the custom split
            saveCustomSplitToStorage(splitName, currentCustomSplit);

            // Show success message and go back to splits
            alert(`Custom split "${splitName}" saved successfully!`);
            document.getElementById('customSplitStep').style.display = 'none';
            splitSelectionStep.style.display = 'block';
        });
    }

    // Save custom split to localStorage
    function saveCustomSplitToStorage(name, split) {
        try {
            const existingCustomSplits = JSON.parse(localStorage.getItem('customWorkoutSplits') || '{}');

            // Convert the split format to match the expected template structure
            const splitData = {
                name: name,
                type: 'custom',
                splits: {}
            };

            split.days.forEach((day, index) => {
                const dayKey = `day${index + 1}`;
                splitData.splits[dayKey] = {
                    name: day.name,
                    exercises: day.exercises
                };
            });

            existingCustomSplits[name] = splitData;
            localStorage.setItem('customWorkoutSplits', JSON.stringify(existingCustomSplits));

            console.log('Custom split saved:', name, splitData);
        } catch (error) {
            console.error('Error saving custom split:', error);
            alert('Error saving custom split. Please try again.');
        }
    }

    // Update generateDayCards to handle custom splits
    const originalGenerateDayCards = generateDayCards;
    generateDayCards = function (splitType) {
        workoutDayGrid.innerHTML = '';

        if (splitType === 'custom') {
            // Load saved custom splits
            const customSplits = JSON.parse(localStorage.getItem('customWorkoutSplits') || '{}');

            if (Object.keys(customSplits).length === 0) {
                workoutDayGrid.innerHTML = `
                    <div class="no-custom-splits">
                        <p>No custom splits saved yet.</p>
                        <button onclick="document.querySelector('[data-split=createCustom]').click()" class="secondary-btn">
                            <i class="fas fa-plus"></i> Create Your First Split
                        </button>
                    </div>
                `;
                return;
            }

            Object.entries(customSplits).forEach(([splitName, splitData]) => {
                createCustomSplitCard(splitName, splitData);
            });
        } else {
            // Use original function for built-in templates
            originalGenerateDayCards.call(this, splitType);
        }
    };

    // Create custom split selection card
    function createCustomSplitCard(splitName, splitData) {
        const splitCard = document.createElement('div');
        splitCard.className = 'day-card';
        splitCard.dataset.split = splitName;

        const dayCount = Object.keys(splitData.splits).length;

        splitCard.innerHTML = `
            <div class="day-icon">
                <i class="fas fa-star"></i>
            </div>
            <div class="day-name">${splitName}</div>
            <div class="day-details">${dayCount} days</div>
        `;

        // Add click event to select this custom split
        splitCard.addEventListener('click', () => {
            // Remove active class from all cards
            document.querySelectorAll('.day-card').forEach(card => {
                card.classList.remove('active');
            });

            // Add active class to selected card
            splitCard.classList.add('active');

            // Set the selected split and day
            selectedSplitType = 'custom';
            workoutDaySelect.value = splitName;

            console.log('Custom split selected:', splitName);
        });

        workoutDayGrid.appendChild(splitCard);
    }

    // Generate day cards based on selected split
    function generateDayCards(splitType) {
        workoutDayGrid.innerHTML = '';

        if (splitType === 'custom') {
            const customTemplates = getCustomTemplates();
            Object.keys(customTemplates).forEach(templateName => {
                createDayCard(templateName, templateName, 'fa-star');
            });
        } else if (splitType && workoutTemplates[splitType]) {
            Object.entries(workoutTemplates[splitType].splits).forEach(([dayKey, day]) => {
                // Determine icon based on day type
                let iconClass = defaultDayIcon;
                for (const [key, icon] of Object.entries(dayIcons)) {
                    if (dayKey.toLowerCase().includes(key.toLowerCase())) {
                        iconClass = icon;
                        break;
                    }
                }

                createDayCard(dayKey, day.name, iconClass);
            });
        }
    }

    // Create a day card element
    function createDayCard(dayKey, dayName, iconClass) {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.dataset.day = dayKey;

        dayCard.innerHTML = `
            <div class="day-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="day-name">${dayName}</div>
        `;

        // Add click event to select this day
        dayCard.addEventListener('click', () => {
            // Remove active class from all day cards
            document.querySelectorAll('.day-card').forEach(card => {
                card.classList.remove('active');
            });

            // Add active class to selected card
            dayCard.classList.add('active');

            // Update hidden select for compatibility with existing code
            workoutDaySelect.value = dayKey;

            // Show template actions after day selection
            const templateActionsAfterSelection = document.getElementById('templateActionsAfterSelection');
            if (templateActionsAfterSelection) {
                templateActionsAfterSelection.style.display = 'flex';
            }

            // Log the values to verify they're set correctly
            console.log('Selected split:', selectedSplitType);
            console.log('Selected day:', dayKey);
        });

        workoutDayGrid.appendChild(dayCard);
    }

    // Load template button handler
    loadTemplateBtn.addEventListener('click', () => {
        // Get selected split from the tracked variable
        const selectedSplit = selectedSplitType;

        // Get selected day directly from the active day card
        const activeDay = document.querySelector('.day-card.active');
        let selectedDay = workoutDaySelect.value;

        // If there's an active day card, use its data-day attribute
        if (activeDay) {
            selectedDay = activeDay.dataset.day || activeDay.dataset.split;
            // Update the hidden select for consistency
            workoutDaySelect.value = selectedDay;
        }

        console.log('When load clicked - Split:', selectedSplit, 'Day:', selectedDay);

        if (!selectedSplit || !selectedDay) {
            alert('Please select both a workout split and day');
            return;
        }

        let template;
        if (selectedSplit === 'custom') {
            // Check if we're selecting a custom split or a day within a custom split
            const activeCard = document.querySelector('.day-card.active');

            if (activeCard && activeCard.dataset.customSplit) {
                // We're selecting a day within a custom split
                const dayKey = activeCard.dataset.day;
                const customSplitName = activeCard.dataset.customSplit;

                const customSplits = JSON.parse(localStorage.getItem('customWorkoutSplits') || '{}');
                template = customSplits[customSplitName].splits[dayKey];

                if (!template) {
                    alert('Failed to load custom day template');
                    return;
                }
            } else {
                // We're selecting a custom split itself - need to show its days
                const customSplits = JSON.parse(localStorage.getItem('customWorkoutSplits') || '{}');
                const customSplit = customSplits[selectedDay];

                if (!customSplit) {
                    alert('Custom split not found');
                    return;
                }

                // Show the days within this custom split
                generateCustomSplitDayCards(selectedDay, customSplit);
                return; // Don't proceed to load template yet
            }
        } else {
            template = loadWorkoutTemplate(selectedSplit, selectedDay);
        }

        if (!template) {
            alert('Failed to load template');
            return;
        }

        // Hide template selection and show exercise list
        document.querySelector('.workout-templates').style.display = 'none';
        document.getElementById('exerciseListContainer').style.display = 'block';

        // Generate exercise list from template
        createExerciseList(template);
    });

    // Generate day cards for a specific custom split
    function generateCustomSplitDayCards(splitName, splitData) {
        workoutDayGrid.innerHTML = '';

        // Update the title
        const stepTitle = document.querySelector('#daySelectionStep .step-title');
        stepTitle.textContent = `Select Day - ${splitName}`;

        Object.entries(splitData.splits).forEach(([dayKey, day]) => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.dataset.day = dayKey;
            dayCard.dataset.customSplit = splitName;

            dayCard.innerHTML = `
                <div class="day-icon">
                    <i class="fas fa-calendar-day"></i>
                </div>
                <div class="day-name">${day.name}</div>
                <div class="day-details">${day.exercises.length} exercises</div>
            `;

            // Add click event to select this day
            dayCard.addEventListener('click', () => {
                // Remove active class from all day cards
                document.querySelectorAll('.day-card').forEach(card => {
                    card.classList.remove('active');
                });

                // Add active class to selected card
                dayCard.classList.add('active');

                // Update hidden select for compatibility
                workoutDaySelect.value = `${splitName}_${dayKey}`;

                // Show template actions after day selection
                const templateActionsAfterSelection = document.getElementById('templateActionsAfterSelection');
                if (templateActionsAfterSelection) {
                    templateActionsAfterSelection.style.display = 'flex';
                }
            });

            workoutDayGrid.appendChild(dayCard);
        });

        // Show the day selection step
        document.getElementById('daySelectionStep').style.display = 'block';
    }

    // Create and display the exercise list from template
    function createExerciseList(template) {
        const exerciseList = document.getElementById('exerciseList');
        exerciseList.innerHTML = '';

        // Store the template exercises for later use
        window.currentTemplate = template;
        window.completedExercises = new Set();

        // Ensure all exercises have unique IDs
        template.exercises.forEach(exercise => {
            if (!exercise.id) {
                exercise.id = generateExerciseId();
            }
            // Initialize isLogged flag if not present
            if (exercise.isLogged === undefined) {
                exercise.isLogged = false;
            }
        });

        // Create list items for each exercise
        template.exercises.forEach((exercise, index) => {
            createExerciseItem(exercise, index);
        });

        // Enable drag and drop for exercise list
        enableDragAndDrop();
    }

    // Create a single exercise item
    function createExerciseItem(exercise, index) {
        const exerciseList = document.getElementById('exerciseList');
        const listItem = document.createElement('li');

        // Ensure exercise has an ID
        if (!exercise.id) {
            exercise.id = generateExerciseId();
        }

        // Check if this exercise has been logged
        const isLogged = exercise.isLogged || window.loggedExercises.has(exercise.id);

        listItem.className = 'exercise-item';
        if (isLogged) {
            listItem.classList.add('completed');
            listItem.dataset.logged = 'true';
        }

        listItem.dataset.index = index;
        listItem.dataset.exerciseId = exercise.id;
        listItem.draggable = true;

        // Create the base structure without toggle button
        listItem.innerHTML = `
        <div class="exercise-header">
            <div class="exercise-info">
                <span class="exercise-name">${exercise.exercise}</span>
                <span class="muscle-group">${exercise.muscleGroup.charAt(0).toUpperCase() + exercise.muscleGroup.slice(1)}</span>
            </div>
            <div class="exercise-controls">
                <div class="exercise-status">
                    <span class="status-icon">
                        <i class="fas ${isLogged ? 'fa-check' : 'fa-circle'}"></i>
                    </span>
                </div>
            </div>
        </div>
            <div class="exercise-actions">
                <button class="exercise-action-btn delete-exercise" title="Remove exercise">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="exercise-logging">
                <div class="sets-header">
                    <div class="sets-title">Sets (${exercise.defaultSets})</div>
                    <div class="sets-controls">
                        <button class="set-count-control decrease-sets" title="Decrease sets">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="set-count-control increase-sets" title="Increase sets">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="sets-container">
                    <!-- Sets will be generated here -->
                </div>
                <button class="log-sets-btn" ${isLogged ? 'disabled' : ''}>
                    <i class="fas ${isLogged ? 'fa-check-circle' : 'fa-check'}"></i> ${isLogged ? 'Already Logged' : 'Log Exercise'}
                </button>
            </div>
        `;

        // Set the correct status icon styling if logged
        if (isLogged) {
            const statusIcon = listItem.querySelector('.status-icon');
            statusIcon.style.background = 'var(--accent-color)';
            statusIcon.style.color = 'white';

            // Add completed exercises to the set for consistency
            if (!window.completedExercises) {
                window.completedExercises = new Set();
            }
            window.completedExercises.add(exercise.id);
        }

        // Generate initial sets with auto-filled data from history
        const setsContainer = listItem.querySelector('.sets-container');

        // If exercise is logged, populate with saved data
        if (isLogged && window.loggedExercises.has(exercise.id)) {
            const loggedData = window.loggedExercises.get(exercise.id);
            generateSetsFromLoggedData(setsContainer, loggedData);
        } else {
            generateSets(setsContainer, exercise.defaultSets, exercise.exercise);
        }

        // Add click event to toggle exercise logging when clicking on the exercise (only if not logged)
        if (!isLogged) {
            listItem.querySelector('.exercise-header').addEventListener('click', (e) => {
                // Don't toggle if clicking on action buttons
                if (e.target.closest('.exercise-actions')) return;

                // Toggle expanded class
                listItem.classList.toggle('expanded');
            });
        }

        // Increase/decrease sets handlers (disable if logged)
        const increaseBtn = listItem.querySelector('.increase-sets');
        const decreaseBtn = listItem.querySelector('.decrease-sets');
        const setsTitle = listItem.querySelector('.sets-title');
        let currentSets = exercise.defaultSets;

        if (!isLogged) {
            increaseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentSets < 10) {
                    currentSets++;
                    setsTitle.textContent = `Sets (${currentSets})`;
                    generateSets(setsContainer, currentSets, exercise.exercise);
                }
            });

            decreaseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentSets > 1) {
                    currentSets--;
                    setsTitle.textContent = `Sets (${currentSets})`;
                    generateSets(setsContainer, currentSets, exercise.exercise);
                }
            });
        } else {
            // Disable controls for logged exercises
            increaseBtn.disabled = true;
            decreaseBtn.disabled = true;
            increaseBtn.style.opacity = '0.5';
            decreaseBtn.style.opacity = '0.5';
        }

        // Log sets button handler (only if not logged)
        const logSetsBtn = listItem.querySelector('.log-sets-btn');
        if (!isLogged) {
            logSetsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Log button clicked for exercise index:', index);

                // Make sure all required fields are filled
                const allInputsFilled = Array.from(listItem.querySelectorAll('input[name="reps"], input[name="weight"]'))
                    .every(input => input.value.trim() !== '');

                if (!allInputsFilled) {
                    alert('Please fill in all set values');
                    return;
                }

                // Call the log exercise function
                logExercise(listItem, index);
            });
        }

        // Add delete button functionality
        const deleteBtn = listItem.querySelector('.delete-exercise');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteExercise(index);
        });

        // Add drag event listeners
        listItem.addEventListener('dragstart', handleDragStart);
        listItem.addEventListener('dragend', handleDragEnd);

        exerciseList.appendChild(listItem);
        return listItem;
    }

    // Function to generate sets from logged data (read-only view)
    function generateSetsFromLoggedData(container, loggedData) {
        container.innerHTML = '';
        const weightUnit = loggedData.weightUnit;

        // Add info about when it was logged
        const loggedInfo = document.createElement('div');
        loggedInfo.className = 'history-info';
        loggedInfo.innerHTML = `
            <i class="fas fa-check-circle"></i> Logged on ${new Date(loggedData.timestamp).toLocaleDateString()}
        `;
        container.appendChild(loggedInfo);

        loggedData.sets.forEach((set, i) => {
            const setDiv = document.createElement('div');
            setDiv.className = 'set-input auto-filled';

            setDiv.innerHTML = `
                <div class="set-number">${i + 1}</div>
                <div class="set-input-field">
                    <label>Reps</label>
                    <input type="number" value="${set.reps}" readonly>
                </div>
                <div class="set-input-field">
                    <label>Weight (${weightUnit})</label>
                    <input type="number" value="${set.weight}" readonly>
                </div>
            `;

            container.appendChild(setDiv);
        });
    }

    // Generate sets for an exercise
    function generateSets(container, numSets, exerciseName = null) {
        container.innerHTML = '';
        const weightUnit = document.getElementById('weightUnit').value;
        const uniqueId = Date.now() + Math.floor(Math.random() * 1000);

        // Get previous exercise data if available
        let previousSetData = null;
        let historyDate = null;
        if (exerciseName) {
            const historyData = getLastExerciseData(exerciseName);
            if (historyData && historyData.sets && historyData.sets.length > 0) {
                previousSetData = historyData.sets;
                historyDate = new Date(historyData.date);
                console.log(`Found previous data for ${exerciseName}: ${previousSetData.length} sets`);
            }
        }

        // If we have history data, add a notification
        if (previousSetData && historyDate) {
            const historyInfo = document.createElement('div');
            historyInfo.className = 'history-info';
            historyInfo.innerHTML = `
                <i class="fas fa-history"></i> Auto-filled from ${historyDate.toLocaleDateString()}
            `;
            container.appendChild(historyInfo);
        }

        for (let i = 1; i <= numSets; i++) {
            const setDiv = document.createElement('div');
            setDiv.className = 'set-input';

            // Get previous values if available
            const prevReps = previousSetData && previousSetData[i - 1] ? previousSetData[i - 1].reps : '';
            const prevWeight = previousSetData && previousSetData[i - 1] ? previousSetData[i - 1].weight : '';

            // Add a class if values are auto-filled
            if (prevReps || prevWeight) {
                setDiv.classList.add('auto-filled');
            }

            setDiv.innerHTML = `
                <div class="set-number">${i}</div>
                <div class="set-input-field">
                    <label for="reps-${uniqueId}-${i}">Reps</label>
                    <input type="number" id="reps-${uniqueId}-${i}" name="reps" min="1" max="100" value="${prevReps}" required>
                </div>
                <div class="set-input-field">
                    <label for="weight-${uniqueId}-${i}">Weight (${weightUnit})</label>
                    <input type="number" id="weight-${uniqueId}-${i}" name="weight" min="0" step="${weightUnit === 'kg' ? 1 : 2.5}" value="${prevWeight}" required>
                </div>
            `;

            container.appendChild(setDiv);
        }

        // Add event listeners to first set inputs to copy values to other sets
        if (numSets > 1) {
            const firstSetReps = container.querySelector('input[name="reps"]');
            const firstSetWeight = container.querySelector('input[name="weight"]');

            const copyValuesToAllSets = () => {
                const repsValue = firstSetReps.value;
                const weightValue = firstSetWeight.value;

                if (repsValue && weightValue) {
                    const allRepsInputs = container.querySelectorAll('input[name="reps"]');
                    const allWeightInputs = container.querySelectorAll('input[name="weight"]');

                    // Start from the second input (index 1)
                    for (let i = 1; i < allRepsInputs.length; i++) {
                        allRepsInputs[i].value = repsValue;
                        allWeightInputs[i].value = weightValue;
                    }
                }
            };

            // Add input event listeners to first set inputs
            firstSetReps.addEventListener('input', copyValuesToAllSets);
            firstSetWeight.addEventListener('input', copyValuesToAllSets);

            // Add visual indication when other sets are modified
            const otherRepsInputs = Array.from(container.querySelectorAll('input[name="reps"]')).slice(1);
            const otherWeightInputs = Array.from(container.querySelectorAll('input[name="weight"]')).slice(1);

            const markAsModified = (input) => {
                input.style.borderColor = '#27ae60';
                input.style.backgroundColor = 'rgba(39, 174, 96, 0.1)';
            };

            [...otherRepsInputs, ...otherWeightInputs].forEach(input => {
                input.addEventListener('input', () => {
                    markAsModified(input);
                });
            });
        }
    }

    // Log exercise function
    async function logExercise(listItem, index) {
        try {
            const exercise = window.currentTemplate.exercises[index];
            const setsContainer = listItem.querySelector('.sets-container');
            const setInputs = setsContainer.querySelectorAll('.set-input');
            const weightUnit = document.getElementById('weightUnit').value;
            const workoutDate = document.getElementById('workoutDate').value;

            console.log(`Logging exercise: ${exercise.exercise} (${exercise.muscleGroup})`);
            console.log(`Found ${setInputs.length} sets to log`);

            // Collect all sets data
            const sets = [];
            let allSetsValid = true;

            setInputs.forEach((setInput, i) => {
                const repsInput = setInput.querySelector('input[name="reps"]');
                const weightInput = setInput.querySelector('input[name="weight"]');

                if (!repsInput || !weightInput || !repsInput.value || !weightInput.value) {
                    console.log(`Set ${i + 1} is missing data`);
                    allSetsValid = false;
                    return;
                }

                sets.push({
                    reps: parseInt(repsInput.value),
                    weight: parseFloat(weightInput.value)
                });
                console.log(`Set ${i + 1}: ${repsInput.value} reps @ ${weightInput.value} ${weightUnit}`);
            });

            if (!allSetsValid) {
                alert('Please fill in all set values');
                return;
            }

            // Save user preference for weight unit to localStorage
            localStorage.setItem('preferredWeightUnit', weightUnit);

            // Prepare exercise data for Supabase
            const exerciseData = {
                exercise: exercise.exercise,
                muscleGroup: exercise.muscleGroup,
                sets: sets,
                weightUnit: weightUnit,
                date: workoutDate
            };

            // Save to Supabase
            const saveSuccess = await saveWorkout(exerciseData);

            if (!saveSuccess) {
                return false;
            }

            // Store exercise history for future auto-fill (keep local for quick access)
            storeExerciseHistory(exercise.exercise, exercise.muscleGroup, sets);

            // Mark exercise as logged permanently using unique ID
            const exerciseId = exercise.id || generateExerciseId();
            if (!exercise.id) {
                // Add ID to exercise if it doesn't have one
                window.currentTemplate.exercises[index].id = exerciseId;
            }

            // Store logged exercise data permanently
            window.loggedExercises.set(exerciseId, {
                exercise: exercise.exercise,
                muscleGroup: exercise.muscleGroup,
                sets: sets,
                weightUnit: weightUnit,
                date: workoutDate,
                timestamp: new Date().toISOString(),
                isLogged: true
            });

            // Mark exercise as completed in template
            window.currentTemplate.exercises[index].isLogged = true;

            // Mark exercise as completed in UI
            if (!window.completedExercises) {
                window.completedExercises = new Set();
            }
            window.completedExercises.add(exerciseId); // Use ID instead of index

            // Update exercise to completed state
            listItem.classList.add('completed');
            listItem.dataset.logged = 'true';
            listItem.dataset.exerciseId = exerciseId;

            // Change the circle icon to a green checkmark
            const statusIcon = listItem.querySelector('.status-icon');
            statusIcon.innerHTML = '<i class="fas fa-check"></i>';
            statusIcon.style.background = 'var(--accent-color)';
            statusIcon.style.color = 'white';

            // Collapse the exercise
            listItem.classList.remove('expanded');

            // Add notification
            const notification = document.createElement('div');
            notification.className = 'exercise-complete-notification';
            notification.innerHTML = `<i class="fas fa-check-circle"></i> ${exercise.exercise} logged successfully!`;
            document.getElementById('exerciseListContainer').appendChild(notification);

            // Remove notification after animation
            setTimeout(() => {
                notification.remove();
            }, 2000);

            console.log('Exercise logged successfully with ID:', exerciseId);
            return true;
        } catch (error) {
            console.error('Error logging exercise:', error);
            alert('There was an error logging your exercise. Please try again.');
            return false;
        }
    }

    // Delete an exercise from the list
    function deleteExercise(index) {
        const exercise = window.currentTemplate.exercises[index];
        const isLogged = exercise.isLogged || (exercise.id && window.loggedExercises.has(exercise.id));

        let confirmMessage = 'Are you sure you want to remove this exercise?';
        if (isLogged) {
            confirmMessage = `This exercise has already been logged! Removing it from the template won't delete your logged workout data, but you won't see it in this session. Are you sure you want to continue?`;
        }

        if (confirm(confirmMessage)) {
            // Note: We don't delete from window.loggedExercises to preserve the user's data
            // The logged data remains in the database and in the loggedExercises Map

            // Remove from template
            window.currentTemplate.exercises.splice(index, 1);

            // Update the template order and rebuild list
            updateExerciseListAfterChange();

            // Add notification
            const notification = document.createElement('div');
            notification.className = 'exercise-complete-notification';
            notification.innerHTML = `<i class="fas fa-trash"></i> Exercise removed${isLogged ? ' (logged data preserved)' : ''}`;
            document.getElementById('exerciseListContainer').appendChild(notification);

            // Remove notification after animation
            setTimeout(() => {
                notification.remove();
            }, 2000);
        }
    }

    // Function to safely update exercise list after changes
    function updateExerciseListAfterChange() {
        const exerciseList = document.getElementById('exerciseList');
        exerciseList.innerHTML = '';

        // Rebuild the exercise list with preserved logged states
        window.currentTemplate.exercises.forEach((exercise, i) => {
            createExerciseItem(exercise, i);
        });

        // Re-enable drag and drop
        enableDragAndDrop();
    }

    // Enable drag and drop functionality
    function enableDragAndDrop() {
        const exerciseList = document.getElementById('exerciseList');

        // Add event listeners for drop targets
        exerciseList.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(exerciseList, e.clientY);
            const draggable = document.querySelector('.dragging');

            if (afterElement == null) {
                exerciseList.appendChild(draggable);
            } else {
                exerciseList.insertBefore(draggable, afterElement);
            }
        });
    }

    // Find the element after the current drag position
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.exercise-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Handle drag start
    function handleDragStart(e) {
        // Add a small delay to differentiate between clicks and drags
        if (this.dragTimeout) clearTimeout(this.dragTimeout);

        this.dragTimeout = setTimeout(() => {
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.dataset.index);
        }, 100);
    }

    // Handle drag end
    function handleDragEnd(e) {
        if (this.dragTimeout) clearTimeout(this.dragTimeout);
        this.classList.remove('dragging');

        // Update the template order
        updateTemplateOrder();
    }

    // Update the template order after drag and drop
    function updateTemplateOrder() {
        const exerciseItems = document.querySelectorAll('.exercise-item');
        const newExercises = [];

        exerciseItems.forEach((item, index) => {
            // Update the data-index attribute
            const oldIndex = parseInt(item.dataset.index);
            item.dataset.index = index;

            // Add to new array in correct order
            newExercises.push(window.currentTemplate.exercises[oldIndex]);
        });

        // Update the template
        window.currentTemplate.exercises = newExercises;
    }

    // Save workout to local storage
    async function saveWorkout(exerciseData) {
        try {
            const workoutData = {
                id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                exercise_name: exerciseData.exercise,
                muscle_group: exerciseData.muscleGroup,
                sets: exerciseData.sets,
                weight_unit: exerciseData.weightUnit || 'kg',
                workout_date: exerciseData.date || new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString()
            };

            // Get existing workouts from local storage
            const savedWorkouts = JSON.parse(localStorage.getItem('savedWorkouts')) || [];

            // Add new workout
            savedWorkouts.push(workoutData);

            // Save back to local storage
            localStorage.setItem('savedWorkouts', JSON.stringify(savedWorkouts));

            console.log('Workout saved successfully:', workoutData);

            // Refresh the workout history
            await loadWorkouts();
            return true;
        } catch (error) {
            console.error('Error saving workout:', error);
            alert('Error saving workout: ' + error.message);
            return false;
        }
    }

    // Custom Exercise Addition
    const addCustomExerciseBtn = document.getElementById('addCustomExerciseBtn');
    if (addCustomExerciseBtn) {
        addCustomExerciseBtn.addEventListener('click', () => {
            console.log('Custom exercise button clicked');
            const muscleGroup = document.getElementById('newExerciseMuscleGroup').value;
            const exerciseName = document.getElementById('customExerciseName').value.trim();
            const sets = document.getElementById('newExerciseSets').value;
            const reps = document.getElementById('newExerciseReps').value.trim();

            if (!muscleGroup || !exerciseName || !sets || !reps) {
                alert('Please fill in all fields');
                return;
            }

            if (!window.currentTemplate) {
                alert('Please load a workout template first!');
                return;
            }

            // Create new exercise object
            const newExercise = {
                muscleGroup: muscleGroup,
                exercise: exerciseName,
                defaultSets: parseInt(sets),
                defaultReps: reps
            };

            // Add to template
            window.currentTemplate.exercises.push(newExercise);

            // Add to list
            createExerciseItem(newExercise, window.currentTemplate.exercises.length - 1);

            // Close modal
            const modal = document.getElementById('addExerciseModal');
            if (modal) {
                modal.classList.remove('active');
            }

            // Add notification
            const notification = document.createElement('div');
            notification.className = 'exercise-complete-notification';
            notification.innerHTML = `<i class="fas fa-plus-circle"></i> ${exerciseName} added to workout`;
            const container = document.getElementById('exerciseListContainer');
            if (container) {
                container.appendChild(notification);
            }

            // Remove notification after animation
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 2000);
        });
    }

    // Weight unit preferences are now loaded from user profile during initialization

    // Sort workouts by date (newest first)
    function sortWorkoutsByDate() {
        try {
            const wkList = getWorkoutList();
            const workoutEntries = Array.from(wkList.querySelectorAll('.workout-entry'));

            console.log(`Sorting ${workoutEntries.length} workout entries by date`);

            workoutEntries.sort((a, b) => {
                const dateA = getDateFromEntry(a);
                const dateB = getDateFromEntry(b);
                return dateB - dateA; // Sort descending (newest first)
            });

            // Clear and re-append in sorted order
            wkList.innerHTML = '';
            workoutEntries.forEach(entry => {
                wkList.appendChild(entry);
            });

            console.log('Workouts sorted successfully');
            return true;
        } catch (error) {
            console.error('Error sorting workouts:', error);
            return false;
        }
    }

    // Extract date from workout entry
    function getDateFromEntry(entry) {
        const dateText = entry.querySelector('.workout-date').textContent;
        return new Date(dateText.split(' at ')[0]);
    }

    // Weight unit change handler - update all exercise inputs
    weightUnitSelect.addEventListener('change', () => {
        const weightUnit = weightUnitSelect.value;
        const step = weightUnit === 'kg' ? 1 : 2.5;

        // Save preference
        localStorage.setItem('preferredWeightUnit', weightUnit);

        // Update all weight labels
        document.querySelectorAll('.set-input-field label').forEach(label => {
            if (label.textContent.includes('Weight')) {
                label.textContent = `Weight (${weightUnit})`;
            }
        });

        // Update all weight inputs
        document.querySelectorAll('input[name="weight"]').forEach(input => {
            input.step = step;
        });
    });

    // Add Save Workout button handler
    document.getElementById('saveWorkoutBtn').addEventListener('click', () => {
        const completedExercisesCount = window.completedExercises.size;
        const totalExercises = window.currentTemplate.exercises.length;

        if (completedExercisesCount === 0) {
            alert('Please log at least one exercise before saving the workout');
            return;
        }

        // Show confirmation with completed count
        if (confirm(`Save workout? You've completed ${completedExercisesCount} of ${totalExercises} exercises.`)) {
            // Show success message
            const notification = document.createElement('div');
            notification.className = 'exercise-complete-notification';
            notification.innerHTML = `<i class="fas fa-check-circle"></i> Workout saved successfully!`;
            document.getElementById('exerciseListContainer').appendChild(notification);

            // Reset the exercise list
            setTimeout(() => {
                // Go back to template selection
                document.getElementById('exerciseListContainer').style.display = 'none';
                document.querySelector('.workout-templates').style.display = 'block';

                // Remove notification
                notification.remove();
            }, 2000);
        }
    });

    // Save as template button handler
    saveAsTemplateBtn.addEventListener('click', () => {
        const templateName = prompt('Enter a name for this template:');
        if (!templateName) return;

        if (window.currentTemplate && window.currentTemplate.exercises) {
            saveCustomTemplate(templateName, {
                name: templateName,
                exercises: window.currentTemplate.exercises
            });
            alert('Template saved successfully!');
        } else {
            alert('Please load a template first before saving');
        }
    });

    // Custom Split Management
    let currentCustomSplit = null;
    let currentEditingDayIndex = null;

    // Initialize custom split creation
    function initializeCustomSplit() {
        currentCustomSplit = {
            name: '',
            days: [
                { name: 'Day 1', exercises: [] },
                { name: 'Day 2', exercises: [] },
                { name: 'Day 3', exercises: [] }
            ]
        };

        // Clear the split name input
        document.getElementById('customSplitName').value = '';

        // Render the initial days
        renderCustomDays();
    }

    // Render custom days grid
    function renderCustomDays() {
        const daysGrid = document.getElementById('customDaysGrid');
        daysGrid.innerHTML = '';

        currentCustomSplit.days.forEach((day, index) => {
            const dayCard = createCustomDayCard(day, index);
            daysGrid.appendChild(dayCard);
        });
    }

    // Create a custom day card
    function createCustomDayCard(day, index) {
        const dayCard = document.createElement('div');
        dayCard.className = 'custom-day-card';
        dayCard.dataset.dayIndex = index;

        dayCard.innerHTML = `
            <button class="custom-day-delete" title="Delete day">
                <i class="fas fa-times"></i>
            </button>
            <div class="custom-day-icon">
                <i class="fas fa-calendar-day"></i>
            </div>
            <div class="custom-day-name">${day.name}</div>
            <div class="custom-day-exercises-count">${day.exercises.length} exercises</div>
        `;

        // Add click event to edit the day
        dayCard.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-day-delete')) {
                editCustomDay(index);
            }
        });

        // Add delete functionality
        const deleteBtn = dayCard.querySelector('.custom-day-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCustomDay(index);
        });

        return dayCard;
    }

    // Edit a custom day
    function editCustomDay(dayIndex) {
        currentEditingDayIndex = dayIndex;
        const day = currentCustomSplit.days[dayIndex];

        // Hide custom split step and show edit day step
        document.getElementById('customSplitStep').style.display = 'none';
        document.getElementById('editCustomDayStep').style.display = 'block';

        // Update the title and populate form
        document.getElementById('editDayTitle').textContent = `Edit ${day.name}`;
        document.getElementById('customDayName').value = day.name;

        // Render exercises for this day
        renderCustomDayExercises(day.exercises);
    }

    // Render exercises for custom day
    function renderCustomDayExercises(exercises) {
        const exerciseList = document.getElementById('customDayExerciseList');
        exerciseList.innerHTML = '';

        if (exercises.length === 0) {
            // Add initial empty exercise
            addExerciseToCustomDay();
        } else {
            exercises.forEach((exercise, index) => {
                const exerciseItem = createCustomDayExerciseItem(exercise, index);
                exerciseList.appendChild(exerciseItem);
            });
        }
    }

    // Create exercise item for custom day
    function createCustomDayExerciseItem(exercise, index) {
        const listItem = document.createElement('li');
        listItem.className = 'custom-day-exercise-item';
        listItem.dataset.index = index;

        listItem.innerHTML = `
            <div class="custom-day-exercise-info">
                <div class="custom-day-exercise-name">${exercise.exercise}</div>
                <div class="custom-day-exercise-details">${exercise.muscleGroup} • ${exercise.defaultSets} sets • ${exercise.defaultReps} reps</div>
            </div>
            <div class="custom-day-exercise-actions">
                <button class="custom-day-exercise-btn delete-btn" title="Delete exercise">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add delete functionality
        const deleteBtn = listItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteExerciseFromCustomDay(index);
        });

        return listItem;
    }

    // Add exercise to custom day
    function addExerciseToCustomDay() {
        const exerciseList = document.getElementById('customDayExerciseList');
        const newIndex = currentCustomSplit.days[currentEditingDayIndex].exercises.length;

        // Create a new empty exercise
        const newExercise = {
            id: generateExerciseId(),
            muscleGroup: '',
            exercise: '',
            defaultSets: 3,
            defaultReps: '8-12',
            isNew: true,
            isLogged: false
        };

        // Add to current day
        currentCustomSplit.days[currentEditingDayIndex].exercises.push(newExercise);

        // Create editable exercise item
        const exerciseItem = createEditableCustomDayExerciseItem(newExercise, newIndex);
        exerciseList.appendChild(exerciseItem);
    }

    // Create editable exercise item for custom day
    function createEditableCustomDayExerciseItem(exercise, index) {
        const listItem = document.createElement('li');
        listItem.className = 'custom-day-exercise-item editable-exercise';
        listItem.dataset.index = index;

        listItem.innerHTML = `
            <div class="exercise-dropdowns">
                <select class="muscle-group-select" data-index="${index}">
                    <option value="">Select Muscle Group</option>
                    <option value="chest">Chest</option>
                    <option value="back">Back</option>
                    <option value="legs">Legs</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="arms">Arms</option>
                    <option value="core">Core</option>
                </select>
                <select class="exercise-select" data-index="${index}" disabled>
                    <option value="">Select Exercise</option>
                </select>
                <input type="text" class="custom-exercise-input" data-index="${index}" 
                       placeholder="Enter custom exercise name..." 
                       style="display: none;">
                <button class="confirm-exercise-btn" data-index="${index}" disabled>
                    <i class="fas fa-check"></i> Confirm
                </button>
            </div>
            <div class="custom-day-exercise-actions">
                <button class="custom-day-exercise-btn delete-btn" title="Remove exercise">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add the same dropdown logic as in regular exercise creation
        setupCustomDayExerciseDropdowns(listItem, index);

        return listItem;
    }

    // Setup dropdowns for custom day exercise
    function setupCustomDayExerciseDropdowns(listItem, index) {
        const muscleGroupSelect = listItem.querySelector('.muscle-group-select');
        const exerciseSelect = listItem.querySelector('.exercise-select');
        const customExerciseInput = listItem.querySelector('.custom-exercise-input');
        const confirmBtn = listItem.querySelector('.confirm-exercise-btn');

        // Muscle group change handler
        muscleGroupSelect.addEventListener('change', () => {
            const selectedMuscleGroup = muscleGroupSelect.value;

            // Reset exercise dropdown
            exerciseSelect.innerHTML = '<option value="">Select Exercise</option>';
            customExerciseInput.style.display = 'none';
            customExerciseInput.value = '';
            exerciseSelect.disabled = !selectedMuscleGroup;

            // Add custom option
            if (selectedMuscleGroup) {
                const customOption = document.createElement('option');
                customOption.value = 'custom';
                customOption.textContent = '🎯 Custom Exercise';
                exerciseSelect.appendChild(customOption);

                const separator = document.createElement('option');
                separator.disabled = true;
                separator.textContent = '─────────────────';
                exerciseSelect.appendChild(separator);
            }

            // Populate exercise dropdown
            if (selectedMuscleGroup && exercises[selectedMuscleGroup]) {
                exercises[selectedMuscleGroup].forEach(exerciseName => {
                    const option = document.createElement('option');
                    option.value = exerciseName;
                    option.textContent = exerciseName;
                    exerciseSelect.appendChild(option);
                });
                exerciseSelect.disabled = false;
            }

            updateConfirmButtonState();
        });

        // Exercise change handler
        exerciseSelect.addEventListener('change', () => {
            const selectedExercise = exerciseSelect.value;

            if (selectedExercise === 'custom') {
                customExerciseInput.style.display = 'block';
                customExerciseInput.focus();
            } else {
                customExerciseInput.style.display = 'none';
                customExerciseInput.value = '';
            }

            updateConfirmButtonState();
        });

        // Custom exercise input handler
        customExerciseInput.addEventListener('input', updateConfirmButtonState);

        // Update confirm button state
        function updateConfirmButtonState() {
            let hasValues = false;

            if (muscleGroupSelect.value) {
                if (exerciseSelect.value === 'custom') {
                    hasValues = customExerciseInput.value.trim().length > 0;
                } else if (exerciseSelect.value) {
                    hasValues = true;
                }
            }

            confirmBtn.disabled = !hasValues;
            if (hasValues) {
                confirmBtn.classList.add('enabled');
            } else {
                confirmBtn.classList.remove('enabled');
            }
        }

        // Confirm button handler
        confirmBtn.addEventListener('click', () => {
            const selectedMuscleGroup = muscleGroupSelect.value;
            let selectedExercise = exerciseSelect.value;

            if (selectedExercise === 'custom') {
                selectedExercise = customExerciseInput.value.trim();
            }

            if (!selectedMuscleGroup || !selectedExercise) {
                alert('Please select both muscle group and exercise');
                return;
            }

            // Update the exercise in the current custom split
            currentCustomSplit.days[currentEditingDayIndex].exercises[index] = {
                id: generateExerciseId(),
                muscleGroup: selectedMuscleGroup,
                exercise: selectedExercise,
                defaultSets: 3,
                defaultReps: getDefaultRepsForMuscleGroup(selectedMuscleGroup),
                isLogged: false
            };

            // Re-render the exercises
            renderCustomDayExercises(currentCustomSplit.days[currentEditingDayIndex].exercises);
        });

        // Delete button handler
        const deleteBtn = listItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteExerciseFromCustomDay(index);
        });
    }

    // Delete exercise from custom day
    function deleteExerciseFromCustomDay(index) {
        if (confirm('Remove this exercise?')) {
            currentCustomSplit.days[currentEditingDayIndex].exercises.splice(index, 1);
            renderCustomDayExercises(currentCustomSplit.days[currentEditingDayIndex].exercises);
        }
    }

    // Delete custom day
    function deleteCustomDay(index) {
        if (currentCustomSplit.days.length <= 1) {
            alert('You must have at least one day in your split');
            return;
        }

        if (confirm(`Delete ${currentCustomSplit.days[index].name}?`)) {
            currentCustomSplit.days.splice(index, 1);
            renderCustomDays();
        }
    }
} 