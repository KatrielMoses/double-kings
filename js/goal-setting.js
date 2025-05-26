import { auth, db, supabase } from './supabase-config.js';

// Global variables
let currentUser = null;

// Goal Setting Page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication with Supabase
        currentUser = await auth.getCurrentUser();

        if (!currentUser) {
            alert('Please log in to access Goal Setting');
            window.location.href = 'index.html';
            return;
        }

        // Get user profile for preferences
        const userProfile = await db.getUserProfile(currentUser.id);
        const userName = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logoutBtn');

        // Update user name
        if (userName && userProfile?.name) {
            userName.textContent = userProfile.name;
        }

        // Add logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await auth.signOut();
                window.location.href = 'index.html';
            });
        }

        // Initialize the goal setting functionality
        await initGoalSetting(userProfile);

    } catch (error) {
        console.error('Error initializing goal setting:', error);
        alert('Please log in to access Goal Setting');
        window.location.href = 'index.html';
    }
});

async function initGoalSetting(userProfile) {
    // DOM Elements
    const addGoalBtn = document.getElementById('addGoalBtn');
    const goalModal = document.getElementById('goalModal');
    const closeModalBtn = goalModal.querySelector('.close');
    const goalForm = document.getElementById('goalForm');
    const exerciseSelect = document.getElementById('exerciseSelect');
    const customExerciseGroup = document.getElementById('customExerciseGroup');
    const customExercise = document.getElementById('customExercise');
    const goalWeight = document.getElementById('goalWeight');
    const goalReps = document.getElementById('goalReps');
    const goalWeightUnit = document.getElementById('goalWeightUnit');
    const currentWeight = document.getElementById('currentWeight');
    const weightUnit = document.getElementById('weightUnit');
    const current1RMOption = document.getElementById('current1RMOption');
    const currentRepsOption = document.getElementById('currentRepsOption');
    const current1RMInputGroup = document.getElementById('current1RMInputGroup');
    const currentRepsInputGroup = document.getElementById('currentRepsInputGroup');
    const currentBestWeight = document.getElementById('currentBestWeight');
    const currentBestReps = document.getElementById('currentBestReps');
    const currentWeightUnit = document.getElementById('currentWeightUnit');
    const timeFrameWeeks = document.getElementById('timeFrameWeeks');
    const goalNotes = document.getElementById('goalNotes');
    const goalsGrid = document.getElementById('goalsGrid');
    const emptyGoalsMessage = document.getElementById('emptyGoalsMessage');
    const templateBtns = document.querySelectorAll('.template-btn');

    // Variable to track if we're editing an existing goal
    let editingGoalId = null;

    // Add hover sound effect to buttons
    const addHoverEffects = () => {
        const buttons = document.querySelectorAll('.action-btn, .template-btn, .btn-icon, .submit-btn');

        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'scale(1.05)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    };

    // Toggle custom exercise input based on selection
    exerciseSelect.addEventListener('change', () => {
        if (exerciseSelect.value === 'custom') {
            customExerciseGroup.style.display = 'block';
            customExercise.setAttribute('required', true);
            // Add focus to custom exercise input
            setTimeout(() => customExercise.focus(), 100);
        } else {
            customExerciseGroup.style.display = 'none';
            customExercise.removeAttribute('required');
        }
    });

    // Toggle between 1RM and Weight×Reps input for current best
    current1RMOption.addEventListener('change', () => {
        if (current1RMOption.checked) {
            current1RMInputGroup.style.display = 'block';
            currentRepsInputGroup.style.display = 'none';
            currentWeight.setAttribute('required', true);
            currentBestWeight.removeAttribute('required');
            currentBestReps.removeAttribute('required');

            // Add focus animation
            currentWeight.classList.add('highlight-input');
            setTimeout(() => currentWeight.classList.remove('highlight-input'), 800);
        }
    });

    currentRepsOption.addEventListener('change', () => {
        if (currentRepsOption.checked) {
            current1RMInputGroup.style.display = 'none';
            currentRepsInputGroup.style.display = 'block';
            currentWeight.removeAttribute('required');
            currentBestWeight.setAttribute('required', true);
            currentBestReps.setAttribute('required', true);

            // Add focus animation
            currentBestWeight.classList.add('highlight-input');
            setTimeout(() => currentBestWeight.classList.remove('highlight-input'), 800);
        }
    });

    // Sync target reps to current best reps for convenience
    goalReps.addEventListener('change', () => {
        if (currentRepsOption.checked) {
            currentBestReps.value = goalReps.value;
            // Highlight the sync with a brief animation
            currentBestReps.classList.add('highlight-input');
            setTimeout(() => currentBestReps.classList.remove('highlight-input'), 800);
        }
    });

    // Update weight unit displays when goal weight unit changes
    goalWeightUnit.addEventListener('change', () => {
        weightUnit.textContent = goalWeightUnit.value;
        currentWeightUnit.textContent = goalWeightUnit.value;

        // Add subtle animations
        weightUnit.classList.add('highlight-text');
        currentWeightUnit.classList.add('highlight-text');
        setTimeout(() => {
            weightUnit.classList.remove('highlight-text');
            currentWeightUnit.classList.remove('highlight-text');
        }, 800);
    });

    // Open modal with animation when Add Goal button is clicked
    addGoalBtn.addEventListener('click', () => {
        // Reset form and set to create mode
        goalForm.reset();
        editingGoalId = null;
        exerciseSelect.value = '';
        customExerciseGroup.style.display = 'none';
        customExercise.removeAttribute('required');

        // Reset current best input groups
        current1RMOption.checked = true;
        current1RMInputGroup.style.display = 'block';
        currentRepsInputGroup.style.display = 'none';
        currentWeight.setAttribute('required', true);
        currentBestWeight.removeAttribute('required');
        currentBestReps.removeAttribute('required');

        // Set default values
        goalReps.value = 5;
        timeFrameWeeks.value = 12;

        // Update weight unit display
        weightUnit.textContent = goalWeightUnit.value;
        currentWeightUnit.textContent = goalWeightUnit.value;

        // Show modal with animation
        goalModal.style.display = 'block';
        goalModal.style.opacity = '0';
        setTimeout(() => {
            goalModal.style.opacity = '1';
        }, 10);

        // Focus on the first input after modal is visible
        setTimeout(() => exerciseSelect.focus(), 300);
    });

    // Close modal with animation
    const closeModalWithAnimation = () => {
        goalModal.style.opacity = '0';
        setTimeout(() => {
            goalModal.style.display = 'none';
        }, 300);
    };

    // Close modal when X is clicked
    closeModalBtn.addEventListener('click', closeModalWithAnimation);

    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === goalModal) {
            closeModalWithAnimation();
        }
    });

    // Handle template button clicks with animation
    templateBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.template-card');

            // Add pulse animation to card
            card.style.animation = 'pulse 0.5s ease';

            setTimeout(async () => {
                const exercise = card.dataset.exercise;
                const weight = card.dataset.weight ? parseInt(card.dataset.weight) : 0;
                const reps = card.dataset.reps ? parseInt(card.dataset.reps) : 5;

                // Find current 1RM for this exercise from workout data
                const current = await getCurrentBestForExercise(exercise);

                // Fill in the form
                goalForm.reset();
                exerciseSelect.value = exercise;

                goalWeight.value = weight || '';
                goalReps.value = reps || 5;

                // Reset current best input groups
                current1RMOption.checked = true;
                current1RMInputGroup.style.display = 'block';
                currentRepsInputGroup.style.display = 'none';

                goalWeightUnit.value = 'kg'; weightUnit.textContent = 'kg'; currentWeightUnit.textContent = 'kg';
                currentWeight.value = current;

                // Also fill in the current best reps field in case user switches to it
                currentBestReps.value = reps || 5;

                timeFrameWeeks.value = 12;

                // Show modal with animation
                goalModal.style.display = 'block';
                goalModal.style.opacity = '0';
                setTimeout(() => {
                    goalModal.style.opacity = '1';
                }, 10);

                // Remove animation class
                card.style.animation = '';

                // Focus on the weight input after modal is visible
                setTimeout(() => goalWeight.focus(), 300);
            }, 300);
        });
    });

    // Calculate 1RM from weight and reps
    function calculate1RM(weight, reps) {
        // Skip calculation if reps are beyond Brzycki formula range
        if (reps >= 37) return weight;

        // Calculate using Brzycki formula: weight × (36 / (37 - reps))
        return weight * (36 / (37 - reps));
    }

    // Handle form submission for creating/editing goals
    goalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const exercise = exerciseSelect.value === 'custom'
            ? customExercise.value
            : exerciseSelect.value;

        const targetWeight = parseFloat(goalWeight.value);
        const targetReps = parseInt(goalReps.value);

        // Calculate target 1RM from weight and reps
        const target1RM = calculate1RM(targetWeight, targetReps);

        // Get current best - either direct 1RM or calculated from weight/reps
        let current;
        if (current1RMOption.checked) {
            current = parseFloat(currentWeight.value);
        } else {
            const currentBestW = parseFloat(currentBestWeight.value);
            const currentBestR = parseInt(currentBestReps.value);
            current = calculate1RM(currentBestW, currentBestR);
        }

        const unit = goalWeightUnit.value;
        const weeks = parseInt(timeFrameWeeks.value);

        // Calculate deadline date (current date + weeks)
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + (weeks * 7)); // weeks * 7 days

        const notes = goalNotes.value;

        // Create or update goal
        if (editingGoalId) {
            await updateGoal(editingGoalId, exercise, target1RM, targetWeight, targetReps, current, unit, deadline, weeks, notes);
        } else {
            await createGoal(exercise, target1RM, targetWeight, targetReps, current, unit, deadline, weeks, notes);
        }

        // Hide modal with animation
        closeModalWithAnimation();
    });

    // Function to create a new goal
    async function createGoal(exercise, target1RM, targetWeight, targetReps, current, unit, deadline, weeks, notes) {
        try {
            // Create goal object for Supabase
            const goalData = {
                user_id: currentUser.id,
                exercise_name: exercise,
                target_1rm: target1RM,
                target_weight: targetWeight,
                target_reps: targetReps,
                current_1rm: current,
                weight_unit: unit,
                deadline: deadline.toISOString().split('T')[0], // Format as YYYY-MM-DD
                weeks,
                notes: notes || null,
                history: JSON.stringify([{
                    date: new Date().toISOString(),
                    value: current
                }])
            };

            // Save to Supabase
            const result = await db.saveGoal(goalData);

            if (result.success) {
                // Add to UI with the returned data
                const goal = {
                    id: result.data[0].id,
                    exercise: result.data[0].exercise_name,
                    target1RM: result.data[0].target_1rm,
                    targetWeight: result.data[0].target_weight,
                    targetReps: result.data[0].target_reps,
                    current: result.data[0].current_1rm,
                    unit: result.data[0].weight_unit,
                    created: new Date(result.data[0].created_at),
                    deadline: new Date(result.data[0].deadline),
                    weeks: result.data[0].weeks,
                    notes: result.data[0].notes,
                    history: JSON.parse(result.data[0].history || '[]')
                };

                await renderGoal(goal);
                await updateEmptyMessage();

                // Delay animation of progress bars
                setTimeout(animateProgressBars, 100);
            } else {
                alert('Error creating goal: ' + result.error);
            }
        } catch (error) {
            console.error('Error creating goal:', error);
            alert('Error creating goal. Please try again.');
        }
    }

    // Function to update an existing goal
    async function updateGoal(goalId, exercise, target1RM, targetWeight, targetReps, current, unit, deadline, weeks, notes) {
        try {
            // Get existing goal to check if current value changed
            const goals = await getGoals();
            const existingGoal = goals.find(g => g.id === goalId);

            if (!existingGoal) return;

            let history = existingGoal.history;

            // Check if current value changed
            if (current !== existingGoal.current) {
                // Add to history if value changed
                history.push({
                    date: new Date().toISOString(),
                    value: current
                });
            }

            // Update goal data
            const updates = {
                exercise_name: exercise,
                target_1rm: target1RM,
                target_weight: targetWeight,
                target_reps: targetReps,
                current_1rm: current,
                weight_unit: unit,
                deadline: deadline.toISOString().split('T')[0],
                weeks,
                notes: notes || null,
                history: JSON.stringify(history)
            };

            // Update in Supabase
            const result = await db.updateGoal(goalId, updates);

            if (result.success) {
                // Update UI
                clearGoalsGrid();
                await renderAllGoals();

                // Delay animation of progress bars
                setTimeout(animateProgressBars, 100);
            } else {
                alert('Error updating goal: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating goal:', error);
            alert('Error updating goal. Please try again.');
        }
    }

    // Function to delete a goal
    async function deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            try {
                // Get the goal element
                const goalElement = document.getElementById(goalId);

                // Add fade out animation
                if (goalElement) {
                    goalElement.style.animation = 'fadeOut 0.5s ease forwards';

                    // Wait for animation to complete before removing
                    setTimeout(async () => {
                        // Delete from Supabase
                        const result = await db.deleteGoal(goalId);

                        if (result.success) {
                            // Update UI
                            clearGoalsGrid();
                            await renderAllGoals();
                            updateEmptyMessage();

                            // Animate progress bars
                            setTimeout(animateProgressBars, 100);
                        } else {
                            alert('Error deleting goal: ' + result.error);
                            // Remove animation if deletion failed
                            goalElement.style.animation = '';
                        }
                    }, 500);
                } else {
                    // If element not found, just proceed with deletion
                    const result = await db.deleteGoal(goalId);
                    if (result.success) {
                        clearGoalsGrid();
                        await renderAllGoals();
                        updateEmptyMessage();
                        setTimeout(animateProgressBars, 100);
                    } else {
                        alert('Error deleting goal: ' + result.error);
                    }
                }
            } catch (error) {
                console.error('Error deleting goal:', error);
                alert('Error deleting goal. Please try again.');
            }
        }
    }

    // Function to edit a goal (open modal with goal data)
    async function editGoal(goalId) {
        try {
            // Add highlight animation to the goal card
            const goalCard = document.getElementById(goalId);
            if (goalCard) {
                goalCard.classList.add('editing');
                setTimeout(() => goalCard.classList.remove('editing'), 1000);
            }

            // Get goal data
            const goals = await getGoals();
            const goal = goals.find(g => g.id === goalId);
            if (!goal) return;

            // Set editing mode
            editingGoalId = goalId;

            // Fill form with goal data
            if (exerciseSelect.querySelector(`option[value="${goal.exercise}"]`)) {
                exerciseSelect.value = goal.exercise;
                customExerciseGroup.style.display = 'none';
                customExercise.removeAttribute('required');
            } else {
                exerciseSelect.value = 'custom';
                customExerciseGroup.style.display = 'block';
                customExercise.setAttribute('required', true);
                customExercise.value = goal.exercise;
            }

            // Set weights and reps
            goalWeight.value = goal.targetWeight || '';
            goalReps.value = goal.targetReps || 5;

            currentWeight.value = goal.current;
            goalWeightUnit.value = goal.unit;
            weightUnit.textContent = goal.unit;
            currentWeightUnit.textContent = goal.unit;

            // Set time frame
            timeFrameWeeks.value = goal.weeks || 12;

            goalNotes.value = goal.notes || '';

            // Show modal with animation
            goalModal.style.display = 'block';
            goalModal.style.opacity = '0';
            setTimeout(() => {
                goalModal.style.opacity = '1';
            }, 10);
        } catch (error) {
            console.error('Error editing goal:', error);
            alert('Error loading goal data. Please try again.');
        }
    }

    // Function to render a single goal card
    async function renderGoal(goal) {
        // Calculate progress percentage
        const progress = calculateProgress(goal);
        const progressPercentage = Math.min(Math.round(progress * 100), 100);

        // Create goal card element
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        goalCard.id = goal.id;

        // Get progress class based on percentage
        const progressClass = getProgressClass(progressPercentage);

        // Format deadline information
        const today = new Date();
        const deadline = new Date(goal.deadline);
        const totalDays = goal.weeks * 7;
        const daysLeft = Math.round((deadline - today) / (1000 * 60 * 60 * 24));
        const weeksLeft = Math.ceil(daysLeft / 7);

        let timeLeftStr = '';
        let timeClass = '';

        if (daysLeft > 0) {
            timeLeftStr = `<div class="deadline ${progressPercentage >= (100 * (1 - daysLeft / totalDays)) ? 'on-track' : ''}">
                <i class="fas ${progressPercentage >= (100 * (1 - daysLeft / totalDays)) ? 'fa-check-circle' : 'fa-clock'}"></i>
                <span>${weeksLeft} week${weeksLeft !== 1 ? 's' : ''} remaining (${daysLeft} days)</span>
            </div>`;
        } else if (daysLeft === 0) {
            timeLeftStr = `<div class="deadline">
                <i class="fas fa-exclamation-circle"></i>
                <span>Deadline is today!</span>
            </div>`;
        } else {
            timeLeftStr = `<div class="deadline">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Deadline passed ${Math.abs(daysLeft)} days ago</span>
            </div>`;
        }

        // Prepare notes HTML if notes exist
        const notesHtml = goal.notes
            ? `<div class="goal-notes">${goal.notes}</div>`
            : '';

        // Format the target display
        const targetDisplay = `
            <div class="goal-info">
                <span>Target:</span>
                <span>${goal.targetWeight} ${goal.unit} × ${goal.targetReps} reps</span>
            </div>
            <div class="goal-info">
                <span>Estimated 1RM:</span>
                <span>${Math.round(goal.target1RM)} ${goal.unit}</span>
            </div>
        `;

        // Set card HTML
        goalCard.innerHTML = `
            <div class="goal-header">
                <h3 class="goal-title">${goal.exercise}</h3>
                <div class="actions">
                    <button class="btn-icon btn-edit" title="Edit Goal">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" title="Delete Goal">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="goal-details">
                ${targetDisplay}
                
                <div class="goal-info">
                    <span>Current 1RM:</span>
                    <span>${goal.current} ${goal.unit}</span>
                </div>
                
                <div class="goal-info">
                    <span>Time Frame:</span>
                    <span>${goal.weeks} weeks</span>
                </div>
                
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span class="percentage">${progressPercentage}%</span>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress ${progressClass}" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="chart-container">
                    <canvas id="chart_${goal.id}"></canvas>
                </div>
                
                ${timeLeftStr}
                ${notesHtml}
            </div>
        `;

        // Add event listeners for action buttons
        goalCard.querySelector('.btn-edit').addEventListener('click', async () => {
            await editGoal(goal.id);
        });

        goalCard.querySelector('.btn-delete').addEventListener('click', async () => {
            await deleteGoal(goal.id);
        });

        // Add to grid
        goalsGrid.appendChild(goalCard);

        // Create chart
        createGoalChart(goal);
    }

    // Animate progress bars
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar .progress');
        progressBars.forEach(progressBar => {
            const width = progressBar.parentElement.parentElement.querySelector('.percentage').textContent;
            progressBar.style.width = width;
        });
    }

    // Create chart for goal
    function createGoalChart(goal) {
        const ctx = document.getElementById(`chart_${goal.id}`).getContext('2d');

        // Prepare data from goal history
        const labels = [];
        const data = [];

        // Sort history by date
        const sortedHistory = [...goal.history].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedHistory.forEach(entry => {
            const date = new Date(entry.date);
            labels.push(date.toLocaleDateString());
            data.push(entry.value);
        });

        // Add target as the last point with a different style
        labels.push('Target');
        data.push(goal.target1RM);

        // Create chart with animation
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Progress',
                    data: data,
                    backgroundColor: Array(data.length - 1).fill('#3498db').concat(['rgba(39, 174, 96, 0.2)']),
                    borderColor: Array(data.length - 1).fill('#3498db').concat(['#27ae60']),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value = context.raw;
                                return `${Math.round(value)} ${goal.unit}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ecf0f1'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#ecf0f1',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    // Calculate progress percentage (0-1)
    function calculateProgress(goal) {
        const start = goal.history[0].value;
        const current = goal.current;
        const target = goal.target1RM;

        // If already at or above target
        if (start >= target) return 1;

        // Calculate progress proportion
        return (current - start) / (target - start);
    }

    // Get progress class based on percentage
    function getProgressClass(percentage) {
        if (percentage < 25) return 'progress-0-25';
        if (percentage < 50) return 'progress-25-50';
        if (percentage < 75) return 'progress-50-75';
        if (percentage < 100) return 'progress-75-100';
        return 'progress-100';
    }

    // Get days between two dates
    function getDaysBetween(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return Math.round(Math.abs((endDate - startDate) / (1000 * 60 * 60 * 24)));
    }

    // Clear all goals from the grid
    function clearGoalsGrid() {
        // Remove all goals but keep the empty message
        Array.from(goalsGrid.children).forEach(child => {
            if (!child.id || child.id !== 'emptyGoalsMessage') {
                child.remove();
            }
        });
    }

    // Get current best weight for an exercise from Supabase workout data
    async function getCurrentBestForExercise(exercise) {
        try {
            // Get workouts from Supabase
            const workouts = await db.getWorkouts(currentUser.id);
            let maxOneRepMax = 0;

            // Loop through all workouts to find the exercise
            workouts.forEach(workout => {
                if (workout.exercise_name === exercise && workout.sets) {
                    workout.sets.forEach(set => {
                        const reps = parseInt(set.reps);
                        const weight = parseFloat(set.weight);
                        const unit = workout.weight_unit;

                        // Skip if reps are beyond Brzycki formula range (37 or more)
                        if (reps >= 37) return;

                        // Calculate 1RM using Brzycki formula: weight × (36 / (37 - reps))
                        const oneRepMax = weight * (36 / (37 - reps));

                        // Convert to kg for consistency
                        const oneRepMaxInKg = unit === 'lbs' ? oneRepMax / 2.20462 : oneRepMax;

                        if (oneRepMaxInKg > maxOneRepMax) {
                            maxOneRepMax = oneRepMaxInKg;
                        }
                    });
                }
            });

            return maxOneRepMax > 0 ? Math.round(maxOneRepMax) : 0;
        } catch (error) {
            console.error('Error finding current best 1RM:', error);
            return 0;
        }
    }

    // Get all goals from Supabase
    async function getGoals() {
        try {
            const goals = await db.getGoals(currentUser.id);

            // Convert Supabase format to local format
            return goals.map(goal => ({
                id: goal.id,
                exercise: goal.exercise_name,
                target1RM: goal.target_1rm,
                targetWeight: goal.target_weight,
                targetReps: goal.target_reps,
                current: goal.current_1rm,
                unit: goal.weight_unit,
                created: new Date(goal.created_at),
                deadline: new Date(goal.deadline),
                weeks: goal.weeks,
                notes: goal.notes,
                history: JSON.parse(goal.history || '[]')
            }));
        } catch (error) {
            console.error('Error getting goals:', error);
            return [];
        }
    }

    // Render all goals
    async function renderAllGoals() {
        const goals = await getGoals();
        goals.forEach(goal => renderGoal(goal));
    }

    // Update empty message visibility
    async function updateEmptyMessage() {
        const goals = await getGoals();
        if (goals.length === 0) {
            emptyGoalsMessage.style.display = 'block';
        } else {
            emptyGoalsMessage.style.display = 'none';
        }
    }

    // Add CSS for additional animations
    function addAnimationCSS() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(10px); }
            }
            
            .highlight-input {
                animation: pulse 0.8s ease;
                border-color: var(--secondary-color) !important;
            }
            
            .highlight-text {
                animation: pulse 0.8s ease;
                color: var(--secondary-color) !important;
            }
            
            .editing {
                animation: pulse 1s ease;
                border-color: var(--secondary-color) !important;
                box-shadow: 0 0 15px rgba(52, 152, 219, 0.5) !important;
            }
            
            .goal-card:hover .btn-icon {
                opacity: 1;
            }
            
            .btn-icon {
                opacity: 0.7;
                transition: opacity 0.3s ease, transform 0.3s ease, color 0.3s ease, background 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize
    await renderAllGoals();
    await updateEmptyMessage();
    addAnimationCSS();
    addHoverEffects();

    // Animate progress bars after everything is rendered
    setTimeout(animateProgressBars, 500);
} 