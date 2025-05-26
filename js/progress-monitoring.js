import { auth, db, supabase } from './supabase-config.js';

// Global variables
let currentUser = null;

// Progress Monitoring
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication with Supabase
        currentUser = await auth.getCurrentUser();

        if (!currentUser) {
            alert('Please log in to access Progress Monitoring');
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

        // Initialize the page after authentication is confirmed
        initializeProgressMonitoring(userProfile);

    } catch (error) {
        console.error('Error initializing progress monitoring:', error);
        alert('Please log in to access Progress Monitoring');
        window.location.href = 'index.html';
    }
});

// Initialize progress monitoring functionality
function initializeProgressMonitoring(userProfile) {
    // Style select dropdowns for Firefox compatibility
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach(select => {
        // Add event listener to apply correct styling when dropdown opens
        select.addEventListener('mousedown', function () {
            // Apply inline styles for Firefox
            if (navigator.userAgent.indexOf('Firefox') !== -1) {
                this.style.color = '#ecf0f1';
                Array.from(this.options).forEach(option => {
                    option.style.backgroundColor = '#2c3e50';
                    option.style.color = '#ecf0f1';
                });
            }
        });
    });

    // Get DOM elements
    const viewTypeSelect = document.getElementById('viewType');
    const muscleGroupFilter = document.getElementById('muscleGroupFilter');
    const compoundFilter = document.getElementById('compoundFilter');
    const compoundHint = document.getElementById('compoundHint');
    const muscleGroupSelect = document.getElementById('muscleGroup');
    const compoundExerciseSelect = document.getElementById('compoundExercise');
    const timeRangeSelect = document.getElementById('timeRange');
    const weightUnitSelect = document.getElementById('weightUnit');
    const graphContainer = document.querySelector('.graph-container');
    const noDataMessage = document.querySelector('.no-data-message');

    // Update the subtitle to explain the graph
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        subtitle.textContent = 'Track your strength progress over time using Brzycki formula for 1RM calculation.';
    }

    // Chart instance
    let progressChart = null;

    // Initialize with user's preferred weight unit
    if (userProfile?.preferred_weight_unit) {
        weightUnitSelect.value = userProfile.preferred_weight_unit;
    } else {
        // Set default to kg if no preference is stored
        weightUnitSelect.value = 'kg';
    }

    // Exercise mapping to muscle groups
    const exerciseToMuscleGroup = {
        'Bench Press': 'chest',
        'Incline Bench Press': 'chest',
        'Decline Bench Press': 'chest',
        'Dumbbell Flyes': 'chest',
        'Push-Ups': 'chest',
        'Cable Flyes': 'chest',
        'Pull-Ups': 'back',
        'Lat Pulldowns': 'back',
        'Barbell Rows': 'back',
        'Dumbbell Rows': 'back',
        'Deadlifts': 'back',
        'Face Pulls': 'back',
        'Squats': 'legs',
        'Leg Press': 'legs',
        'Lunges': 'legs',
        'Leg Extensions': 'legs',
        'Leg Curls': 'legs',
        'Military Press': 'shoulders',
        'Lateral Raises': 'shoulders',
        'Front Raises': 'shoulders',
        'Rear Delt Flyes': 'shoulders',
        'Arnold Press': 'shoulders',
        'Upright Rows': 'shoulders',
        'Bicep Curls': 'arms',
        'Tricep Extensions': 'arms',
        'Hammer Curls': 'arms',
        'Skull Crushers': 'arms',
        'Preacher Curls': 'arms',
        'Diamond Push-Ups': 'arms',
        'Crunches': 'core',
        'Planks': 'core',
        'Russian Twists': 'core',
        'Leg Raises': 'core',
        'Ab Wheel Rollouts': 'core',
        'Mountain Climbers': 'core'
    };

    // Define compound exercises
    const compoundExercises = [
        'Bench Press', 'Squats', 'Deadlifts', 'Military Press', 'Pull-Ups', 'Barbell Rows'
    ];

    // Initialize view based on initial selection
    if (viewTypeSelect.value === 'compound') {
        muscleGroupFilter.style.display = 'none';
        compoundFilter.style.display = 'flex';
        compoundHint.style.display = 'flex';
    } else {
        muscleGroupFilter.style.display = 'flex';
        compoundFilter.style.display = 'none';
        compoundHint.style.display = 'none';
    }

    // Toggle view filters
    viewTypeSelect.addEventListener('change', () => {
        if (viewTypeSelect.value === 'muscleGroup') {
            muscleGroupFilter.style.display = 'flex';
            compoundFilter.style.display = 'none';
            compoundHint.style.display = 'none';
        } else {
            muscleGroupFilter.style.display = 'none';
            compoundFilter.style.display = 'flex';
            compoundHint.style.display = 'flex';
            // Set to "All Compounds" by default when switching to compound view
            compoundExerciseSelect.value = 'all';
        }
        updateChart();
    });

    // Initialize event listeners for filter changes
    [muscleGroupSelect, compoundExerciseSelect, timeRangeSelect, weightUnitSelect].forEach(select => {
        select.addEventListener('change', updateChart);
    });

    // Calculate 1RM using Brzycki formula
    function calculateBrzycki1RM(weight, reps) {
        // Brzycki formula: 1RM = weight × (36 / (37 - reps))
        // Limit to 1-36 reps for formula validity
        if (reps <= 0) return 0;
        if (reps >= 37) reps = 36;

        return weight * (36 / (37 - reps));
    }

    // Load goals from Supabase
    async function loadGoals() {
        try {
            const goals = await db.getGoals(currentUser.id);
            const filteredGoals = {};

            goals.forEach(goal => {
                // Only include goals for exercises we're tracking
                if (exerciseToMuscleGroup[goal.exercise_name] || compoundExercises.includes(goal.exercise_name)) {
                    const selectedUnit = weightUnitSelect.value;

                    // Convert 1RM to selected unit if needed
                    let target1RM = goal.target_1rm;
                    if (goal.weight_unit !== selectedUnit) {
                        target1RM = goal.weight_unit === 'kg' ? target1RM * 2.20462 : target1RM / 2.20462;
                    }

                    // Convert deadline to Date object
                    const deadline = new Date(goal.deadline);

                    // Add to filtered goals
                    if (!filteredGoals[goal.exercise_name]) {
                        filteredGoals[goal.exercise_name] = [];
                    }

                    filteredGoals[goal.exercise_name].push({
                        targetWeight: goal.target_weight,
                        targetReps: goal.target_reps,
                        target1RM: target1RM,
                        deadline: deadline,
                        weeks: goal.weeks,
                        current1RM: goal.current_1rm,
                        created: new Date(goal.created_at)
                    });
                }
            });

            return filteredGoals;
        } catch (error) {
            console.error('Error loading goals:', error);
            return {};
        }
    }

    // Parse workout data from Supabase
    async function parseWorkoutData() {
        try {
            const workouts = await db.getWorkouts(currentUser.id);
            const parsedData = [];

            workouts.forEach(workout => {
                try {
                    // Parse the workout data from Supabase
                    const exercise = workout.exercise_name;
                    const muscleGroup = workout.muscle_group;
                    const date = new Date(workout.workout_date);
                    const sets = workout.sets; // This is already a JSON array
                    const unit = workout.weight_unit;

                    if (!sets || sets.length === 0) return;

                    // Convert sets to expected format
                    const formattedSets = sets.map((set, index) => ({
                        setNumber: index + 1,
                        reps: parseInt(set.reps),
                        weight: parseFloat(set.weight),
                        unit: unit
                    }));

                    // Add parsed workout to data
                    parsedData.push({
                        exercise,
                        muscleGroup,
                        date,
                        sets: formattedSets
                    });
                } catch (e) {
                    console.error("Error parsing workout:", e);
                }
            });

            return parsedData;
        } catch (error) {
            console.error('Error fetching workout data:', error);
            return [];
        }
    }

    // Filter workouts based on selected filters
    function filterWorkouts(workouts) {
        if (!workouts || workouts.length === 0) return [];

        const viewType = viewTypeSelect.value;
        const muscleGroup = muscleGroupSelect.value;
        const compoundExercise = compoundExerciseSelect.value;
        const timeRange = timeRangeSelect.value;

        // Filter by time
        const now = new Date();
        const filteredByTime = workouts.filter(workout => {
            const workoutDate = workout.date;

            switch (timeRange) {
                case '2weeks':
                    return (now - workoutDate) <= 14 * 24 * 60 * 60 * 1000;
                case '1month':
                    return (now - workoutDate) <= 30 * 24 * 60 * 60 * 1000;
                case '3months':
                    return (now - workoutDate) <= 90 * 24 * 60 * 60 * 1000;
                case '6months':
                    return (now - workoutDate) <= 180 * 24 * 60 * 60 * 1000;
                case '1year':
                    return (now - workoutDate) <= 365 * 24 * 60 * 60 * 1000;
                case 'all':
                default:
                    return true;
            }
        });

        // Filter by exercise type
        if (viewType === 'muscleGroup') {
            return filteredByTime.filter(workout =>
                workout.muscleGroup === muscleGroup ||
                exerciseToMuscleGroup[workout.exercise] === muscleGroup
            );
        } else {
            // For compound view
            if (compoundExercise === 'all') {
                // Show all compound exercises
                return filteredByTime.filter(workout =>
                    compoundExercises.includes(workout.exercise)
                );
            } else {
                // Show specific compound exercise
                return filteredByTime.filter(workout =>
                    workout.exercise === compoundExercise
                );
            }
        }
    }

    // Filter and prepare chart data
    async function prepareChartData(workouts) {
        const selectedUnit = weightUnitSelect.value;
        const dataset = {};
        const goals = await loadGoals();

        workouts.forEach(workout => {
            const { exercise, date, sets } = workout;

            if (!dataset[exercise]) {
                dataset[exercise] = [];
            }

            // Calculate the best 1RM for each workout session
            let maxOneRM = 0;
            sets.forEach(set => {
                let weight = set.weight;
                let unit = set.unit;

                // Convert weight to selected unit if needed
                if (unit !== selectedUnit) {
                    if (selectedUnit === 'kg' && unit === 'lbs') {
                        weight = weight / 2.20462;
                    } else if (selectedUnit === 'lbs' && unit === 'kg') {
                        weight = weight * 2.20462;
                    }
                }

                const oneRM = calculateBrzycki1RM(weight, set.reps);
                if (oneRM > maxOneRM) {
                    maxOneRM = oneRM;
                }
            });

            dataset[exercise].push({
                x: date.toISOString().split('T')[0],
                y: parseFloat(maxOneRM.toFixed(2))
            });
        });

        // Sort data points by date for each exercise
        Object.keys(dataset).forEach(exercise => {
            dataset[exercise].sort((a, b) => new Date(a.x) - new Date(b.x));
        });

        // Prepare Chart.js datasets
        const exercises = Object.keys(dataset);
        const colors = generateChartColors(exercises.length);
        const datasets = exercises.map((exercise, index) => ({
            label: exercise,
            data: dataset[exercise],
            borderColor: colors[index],
            backgroundColor: colors[index] + '20',
            fill: false,
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6
        }));

        // Add goal lines
        Object.keys(goals).forEach((exercise, index) => {
            if (goals[exercise] && goals[exercise].length > 0) {
                const goal = goals[exercise][0]; // Use first goal for now
                const goalData = [
                    { x: goal.created.toISOString().split('T')[0], y: goal.target1RM },
                    { x: goal.deadline.toISOString().split('T')[0], y: goal.target1RM }
                ];

                datasets.push({
                    label: `${exercise} Goal`,
                    data: goalData,
                    borderColor: colors[index % colors.length],
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 0
                });
            }
        });

        return {
            datasets: datasets
        };
    }

    // Generate chart colors
    function generateChartColors(count) {
        const baseColors = [
            '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
            '#1abc9c', '#e67e22', '#34495e', '#ff6b6b', '#4ecdc4',
            '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#fdcb6e'
        ];

        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    }

    // Create or update the chart
    function createChart(chartData) {
        const ctx = document.getElementById('progressChart').getContext('2d');
        const workoutData = chartData.workoutData;
        const goalData = chartData.goalData;

        const exercises = Object.keys(workoutData);
        const colors = generateChartColors(exercises.length);
        const isAllCompounds = viewTypeSelect.value === 'compound' && compoundExerciseSelect.value === 'all';

        // Create datasets for actual workout data
        const workoutDatasets = exercises.map((exercise, index) => ({
            label: exercise,
            data: workoutData[exercise],
            borderColor: colors[index],
            backgroundColor: colors[index] + '33', // Add transparency
            pointBackgroundColor: colors[index],
            pointRadius: isAllCompounds ? 4 : 5, // Smaller points for multiple compounds
            pointHoverRadius: isAllCompounds ? 6 : 7,
            fill: false,
            tension: 0.2,
            showLine: true, // Connect points with lines
            borderWidth: isAllCompounds ? 2 : 3, // Thinner lines for multiple compounds
            order: 1 // Ensure actual workout data is drawn first
        }));

        // Create goal datasets - one for each exercise with goals
        const goalDatasets = [];

        exercises.forEach((exercise, index) => {
            if (goalData[exercise] && goalData[exercise].length > 0) {
                // Sort goals by deadline
                const exerciseGoals = goalData[exercise].sort((a, b) => a.deadline - b.deadline);

                // For each goal, create a dataset
                exerciseGoals.forEach((goal, goalIndex) => {
                    // Get last workout data point for the exercise (most recent 1RM)
                    const latestWorkout = workoutData[exercise][workoutData[exercise].length - 1];

                    if (!latestWorkout) return; // Skip if no workout data

                    // Create dataset for the projected goal line
                    const goalLineData = [
                        // Start from the latest workout point
                        {
                            x: latestWorkout.x,
                            y: latestWorkout.y,
                            isGoal: false,
                            exerciseName: exercise
                        },
                        // End at the goal deadline with target 1RM
                        {
                            x: goal.deadline,
                            y: goal.target1RM,
                            isGoal: true,
                            reps: goal.targetReps,
                            weight: goal.targetWeight,
                            exerciseName: exercise,
                            weeks: goal.weeks
                        }
                    ];

                    // Add to goal datasets
                    goalDatasets.push({
                        label: `${exercise} Goal (${goal.weeks} weeks)`,
                        data: goalLineData,
                        borderColor: colors[index],
                        backgroundColor: 'transparent',
                        borderDash: [6, 6], // Dotted line
                        borderWidth: 2,
                        pointRadius: [0, 6], // Only show point at goal
                        pointBackgroundColor: colors[index],
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 8,
                        fill: false,
                        tension: 0,
                        showLine: true,
                        order: 2, // Draw goal lines on top
                        hidden: false // Make goal visible by default
                    });
                });
            }
        });

        // Combine all datasets
        const allDatasets = [...workoutDatasets, ...goalDatasets];

        // Destroy previous chart if it exists
        if (progressChart) {
            progressChart.destroy();
        }

        // Create new chart
        progressChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: allDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Time',
                            color: '#ecf0f1'
                        },
                        ticks: {
                            color: '#ecf0f1'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: `Estimated 1RM (${weightUnitSelect.value})`,
                            color: '#ecf0f1'
                        },
                        ticks: {
                            color: '#ecf0f1'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const point = context.raw;

                                // Handle goal point tooltips
                                if (point.isGoal === true) {
                                    const deadlineDate = new Date(point.x).toLocaleDateString();
                                    return `${point.exerciseName} Goal: ${point.y.toFixed(1)} ${weightUnitSelect.value} 1RM (${point.weight} × ${point.reps} reps) by ${deadlineDate}`;
                                }

                                // Handle regular workout point tooltips
                                if (point.isGoal === false) {
                                    return `Goal Projection: from current progress to target`;
                                }

                                // Handle regular workout data points
                                const date = new Date(point.x).toLocaleDateString();
                                return `${context.dataset.label}: 1RM = ${point.oneRepMax} ${weightUnitSelect.value} (${point.weight.toFixed(1)} × ${point.reps} reps) (${date})`;
                            }
                        }
                    },
                    legend: {
                        labels: {
                            color: '#ecf0f1',
                            // Show more visible legend for all compounds
                            boxWidth: isAllCompounds ? 30 : 20,
                            padding: isAllCompounds ? 15 : 10,
                            filter: function (item) {
                                // Hide duplicate goal entries in legend
                                if (item.text.includes('Goal Projection')) {
                                    return false;
                                }
                                return true;
                            }
                        },
                        // Position legend at bottom for multiple compounds to save space
                        position: isAllCompounds && exercises.length > 3 ? 'bottom' : 'top'
                    }
                },
                // Improve interaction when showing multiple compounds
                interaction: {
                    mode: isAllCompounds ? 'nearest' : 'point',
                    intersect: !isAllCompounds
                }
            }
        });
    }

    // Calculate and update stats
    function updateStats(workouts) {
        const strongestLiftElement = document.getElementById('strongestLift');
        const mostProgressElement = document.getElementById('mostProgress');
        const bestWorkoutElement = document.getElementById('bestWorkout');

        // Only calculate if we have workouts
        if (workouts.length === 0) {
            strongestLiftElement.textContent = '-';
            mostProgressElement.textContent = '-';
            bestWorkoutElement.textContent = '-';
            return;
        }

        // Calculate strongest lift (highest 1RM using Brzycki formula)
        let strongestLift = { exercise: '', weight: 0, reps: 0, oneRepMax: 0, unit: '' };

        workouts.forEach(workout => {
            workout.sets.forEach(set => {
                const oneRepMax = calculateBrzycki1RM(set.weight, set.reps);

                if (oneRepMax > strongestLift.oneRepMax) {
                    strongestLift = {
                        exercise: workout.exercise,
                        weight: set.weight,
                        reps: set.reps,
                        oneRepMax: oneRepMax,
                        unit: set.unit,
                        date: workout.date
                    };
                }
            });
        });

        // Calculate most progress
        const exerciseProgress = {};

        workouts.forEach(workout => {
            const { exercise } = workout;
            let maxOneRepMax = 0;
            let unit = '';

            workout.sets.forEach(set => {
                const oneRepMax = calculateBrzycki1RM(set.weight, set.reps);
                if (oneRepMax > maxOneRepMax) {
                    maxOneRepMax = oneRepMax;
                    unit = set.unit;
                }
            });

            if (!exerciseProgress[exercise]) {
                exerciseProgress[exercise] = {
                    first: { oneRepMax: maxOneRepMax, date: workout.date, unit: unit },
                    last: { oneRepMax: maxOneRepMax, date: workout.date, unit: unit }
                };
            } else {
                if (workout.date < exerciseProgress[exercise].first.date) {
                    exerciseProgress[exercise].first = {
                        oneRepMax: maxOneRepMax,
                        date: workout.date,
                        unit: unit
                    };
                }

                if (workout.date > exerciseProgress[exercise].last.date) {
                    exerciseProgress[exercise].last = {
                        oneRepMax: maxOneRepMax,
                        date: workout.date,
                        unit: unit
                    };
                }
            }
        });

        // Find exercise with most progress
        let mostProgressExercise = '';
        let mostProgressValue = 0;
        let mostProgressUnit = '';

        Object.keys(exerciseProgress).forEach(exercise => {
            const progress = exerciseProgress[exercise];

            // Skip if only one data point
            if (progress.first.date.getTime() === progress.last.date.getTime()) return;

            // Calculate 1RM difference (handle unit conversion if needed)
            let firstOneRM = progress.first.oneRepMax;
            let lastOneRM = progress.last.oneRepMax;

            if (progress.first.unit !== progress.last.unit) {
                if (progress.first.unit === 'kg') {
                    firstOneRM *= 2.20462;
                } else {
                    lastOneRM *= 2.20462;
                }
            }

            const difference = lastOneRM - firstOneRM;

            if (difference > mostProgressValue) {
                mostProgressValue = difference;
                mostProgressExercise = exercise;
                mostProgressUnit = progress.last.unit;
            }
        });

        // Find best workout (most total volume using 1RM)
        let bestWorkout = { date: null, totalOneRM: 0 };

        // Group workouts by date
        const workoutsByDate = {};

        workouts.forEach(workout => {
            const dateStr = workout.date.toDateString();

            if (!workoutsByDate[dateStr]) {
                workoutsByDate[dateStr] = [];
            }

            workoutsByDate[dateStr].push(workout);
        });

        // Calculate total 1RM for each date
        Object.keys(workoutsByDate).forEach(dateStr => {
            const dayWorkouts = workoutsByDate[dateStr];
            let totalOneRM = 0;

            dayWorkouts.forEach(workout => {
                workout.sets.forEach(set => {
                    totalOneRM += calculateBrzycki1RM(set.weight, set.reps);
                });
            });

            if (totalOneRM > bestWorkout.totalOneRM) {
                bestWorkout = {
                    date: new Date(dateStr),
                    totalOneRM: totalOneRM
                };
            }
        });

        // Update stats display
        if (strongestLift.exercise) {
            strongestLiftElement.textContent = `${strongestLift.exercise}: ${strongestLift.oneRepMax.toFixed(1)} ${strongestLift.unit} (1RM)`;
        }

        if (mostProgressExercise) {
            mostProgressElement.textContent = `${mostProgressExercise}: +${mostProgressValue.toFixed(1)} ${mostProgressUnit} (1RM)`;
        } else {
            mostProgressElement.textContent = 'Not enough data';
        }

        if (bestWorkout.date) {
            bestWorkoutElement.textContent = `${bestWorkout.date.toLocaleDateString()} (Total 1RM: ${Math.round(bestWorkout.totalOneRM)})`;
        }
    }

    // Update chart with current filter settings
    async function updateChart() {
        try {
            // Parse and filter workout data
            const allWorkouts = await parseWorkoutData();
            const filteredWorkouts = filterWorkouts(allWorkouts);

            if (filteredWorkouts.length === 0) {
                // Show no data message
                graphContainer.style.display = 'none';
                noDataMessage.style.display = 'flex';
                return;
            }

            // Show graph container and hide no data message
            graphContainer.style.display = 'block';
            noDataMessage.style.display = 'none';

            const chartData = await prepareChartData(filteredWorkouts);
            createChart(chartData);

            // Update stats
            updateStats(filteredWorkouts);
        } catch (error) {
            console.error('Error updating chart:', error);
            noDataMessage.style.display = 'flex';
            graphContainer.style.display = 'none';
        }
    }

    // Initial chart update
    updateChart();
} 