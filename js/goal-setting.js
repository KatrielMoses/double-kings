// Goal Setting Page
document.addEventListener('DOMContentLoaded', () => {
    // Authentication check
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userName = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!isLoggedIn) {
        // Redirect to home if not logged in
        alert('Please log in to access Goal Setting');
        window.location.href = 'index.html';
        return;
    }

    // Update user name
    if (userName && userData.name) {
        userName.textContent = userData.name;
    }

    // Add logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the link from navigating
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            window.location.href = 'index.html';
        });
    }

    // Initialize the goal setting functionality
    initGoalSetting();
});

function initGoalSetting() {
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
        btn.addEventListener('click', () => {
            const card = btn.closest('.template-card');

            // Add pulse animation to card
            card.style.animation = 'pulse 0.5s ease';

            setTimeout(() => {
                const exercise = card.dataset.exercise;
                const weight = card.dataset.weight ? parseInt(card.dataset.weight) : 0;
                const reps = card.dataset.reps ? parseInt(card.dataset.reps) : 5;

                // Find current 1RM for this exercise from workout data
                const current = getCurrentBestForExercise(exercise);

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
    goalForm.addEventListener('submit', (e) => {
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
            updateGoal(editingGoalId, exercise, target1RM, targetWeight, targetReps, current, unit, deadline, weeks, notes);
        } else {
            createGoal(exercise, target1RM, targetWeight, targetReps, current, unit, deadline, weeks, notes);
        }

        // Hide modal with animation
        closeModalWithAnimation();
    });

    // Function to create a new goal
    function createGoal(exercise, target1RM, targetWeight, targetReps, current, unit, deadline, weeks, notes) {
        // Generate unique ID
        const goalId = 'goal_' + Date.now();

        // Create goal object
        const goal = {
            id: goalId,
            exercise,
            target1RM,
            targetWeight,
            targetReps,
            current,
            unit,
            created: new Date(),
            deadline,
            weeks,
            notes,
            history: [{
                date: new Date(),
                value: current
            }]
        };

        // Save to localStorage
        const goals = getGoals();
        goals.push(goal);
        saveGoals(goals);

        // Add to UI
        renderGoal(goal);
        updateEmptyMessage();

        // Delay animation of progress bars
        setTimeout(animateProgressBars, 100);
    }

    // Function to update an existing goal
    function updateGoal(goalId, exercise, target1RM, targetWeight, targetReps, current, unit, deadline, weeks, notes) {
        // Get existing goals
        const goals = getGoals();

        // Find the goal to update
        const goalIndex = goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) return;

        const goal = goals[goalIndex];

        // Check if current value changed
        if (current !== goal.current) {
            // Add to history if value changed
            goal.history.push({
                date: new Date(),
                value: current
            });
        }

        // Update goal properties
        goal.exercise = exercise;
        goal.target1RM = target1RM;
        goal.targetWeight = targetWeight;
        goal.targetReps = targetReps;
        goal.current = current;
        goal.unit = unit;
        goal.deadline = deadline;
        goal.weeks = weeks;
        goal.notes = notes;

        // Save to localStorage
        saveGoals(goals);

        // Update UI
        clearGoalsGrid();
        renderAllGoals();

        // Delay animation of progress bars
        setTimeout(animateProgressBars, 100);
    }

    // Function to delete a goal
    function deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            // Get the goal element
            const goalElement = document.getElementById(goalId);

            // Add fade out animation
            if (goalElement) {
                goalElement.style.animation = 'fadeOut 0.5s ease forwards';

                // Wait for animation to complete before removing
                setTimeout(() => {
                    // Get existing goals
                    const goals = getGoals();

                    // Remove the goal
                    const updatedGoals = goals.filter(g => g.id !== goalId);

                    // Save to localStorage
                    saveGoals(updatedGoals);

                    // Update UI
                    clearGoalsGrid();
                    renderAllGoals();
                    updateEmptyMessage();

                    // Animate progress bars
                    setTimeout(animateProgressBars, 100);
                }, 500);
            } else {
                // If element not found, just proceed with deletion
                const goals = getGoals();
                const updatedGoals = goals.filter(g => g.id !== goalId);
                saveGoals(updatedGoals);
                clearGoalsGrid();
                renderAllGoals();
                updateEmptyMessage();
                setTimeout(animateProgressBars, 100);
            }
        }
    }

    // Function to edit a goal (open modal with goal data)
    function editGoal(goalId) {
        // Add highlight animation to the goal card
        const goalCard = document.getElementById(goalId);
        if (goalCard) {
            goalCard.classList.add('editing');
            setTimeout(() => goalCard.classList.remove('editing'), 1000);
        }

        // Get goal data
        const goals = getGoals();
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
    }

    // Function to render a single goal card
    function renderGoal(goal) {
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

        // Add event listeners for edit and delete buttons
        goalCard.querySelector('.btn-edit').addEventListener('click', () => {
            editGoal(goal.id);
        });

        goalCard.querySelector('.btn-delete').addEventListener('click', () => {
            deleteGoal(goal.id);
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

    // Get current best weight for an exercise from workout data
    function getCurrentBestForExercise(exercise) {
        try {
            // Get workouts from localStorage
            const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
            let maxOneRepMax = 0;

            // Loop through all workouts to find the exercise
            workouts.forEach(workoutHTML => {
                // Check if this workout is for the requested exercise
                if (workoutHTML.includes(`<strong>${exercise}</strong>`)) {
                    // Extract sets data
                    const setRegex = /Set \d+: (\d+) reps @ ([\d.]+) (lbs|kg)/g;
                    let match;

                    while ((match = setRegex.exec(workoutHTML)) !== null) {
                        const reps = parseInt(match[1], 10);
                        const weight = parseFloat(match[2]);
                        const unit = match[3];

                        // Skip if reps are beyond Brzycki formula range (37 or more)
                        if (reps >= 37) continue;

                        // Calculate 1RM using Brzycki formula: weight × (36 / (37 - reps))
                        const oneRepMax = weight * (36 / (37 - reps));

                        // Convert to lbs if needed
                        const oneRepMaxInLbs = unit === 'kg' ? oneRepMax * 2.20462 : oneRepMax;

                        if (oneRepMaxInLbs > maxOneRepMax) {
                            maxOneRepMax = oneRepMaxInLbs;
                        }
                    }
                }
            });

            return maxOneRepMax > 0 ? Math.round(maxOneRepMax) : 0;
        } catch (error) {
            console.error('Error finding current best 1RM:', error);
            return 0;
        }
    }

    // Get all goals from localStorage
    function getGoals() {
        return JSON.parse(localStorage.getItem('goals')) || [];
    }

    // Save goals to localStorage
    function saveGoals(goals) {
        localStorage.setItem('goals', JSON.stringify(goals));
    }

    // Render all goals
    function renderAllGoals() {
        const goals = getGoals();
        goals.forEach(goal => renderGoal(goal));
    }

    // Update empty message visibility
    function updateEmptyMessage() {
        const goals = getGoals();
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
    renderAllGoals();
    updateEmptyMessage();
    addAnimationCSS();
    addHoverEffects();

    // Animate progress bars after everything is rendered
    setTimeout(animateProgressBars, 500);
} 