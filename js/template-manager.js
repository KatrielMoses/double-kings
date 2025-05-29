document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('templateEditorModal');
    const modalTitle = document.getElementById('modalTitle');
    const templateForm = document.getElementById('templateForm');
    const exercisesList = document.getElementById('exercisesList');
    const addExerciseBtn = document.getElementById('addExercise');
    const createTemplateBtn = document.getElementById('createTemplate');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const builtInTemplatesContainer = document.getElementById('builtInTemplates');
    const customTemplatesContainer = document.getElementById('customTemplates');

    let editingTemplate = null;

    // Initialize page
    function init() {
        loadBuiltInTemplates();
        loadCustomTemplates();
        setupEventListeners();
    }

    // Load built-in templates
    function loadBuiltInTemplates() {
        Object.entries(workoutTemplates).forEach(([key, template]) => {
            const templateContainer = document.createElement('div');
            templateContainer.className = 'template-container';

            // Create template header with name
            const templateHeader = document.createElement('div');
            templateHeader.className = 'built-in-template-header';
            templateHeader.innerHTML = `<h3>${template.name}</h3>`;
            templateContainer.appendChild(templateHeader);

            // Create tabs container
            const tabsContainer = document.createElement('div');
            tabsContainer.className = 'tabs-container';

            // Create tab buttons
            const tabButtons = document.createElement('div');
            tabButtons.className = 'tab-buttons';

            // Create tab content
            const tabContents = document.createElement('div');
            tabContents.className = 'tab-contents';

            // Track first tab to mark as active
            let isFirst = true;

            // Create a tab for each split day
            Object.entries(template.splits).forEach(([splitKey, split]) => {
                // Create tab button
                const tabButton = document.createElement('button');
                tabButton.className = `tab-button ${isFirst ? 'active' : ''}`;
                tabButton.textContent = split.name;
                tabButton.dataset.tab = `${key}-${splitKey}`;
                tabButtons.appendChild(tabButton);

                // Create tab content
                const tabContent = document.createElement('div');
                tabContent.className = `tab-content ${isFirst ? 'active' : ''}`;
                tabContent.id = `${key}-${splitKey}`;

                // Create exercise list
                const exercisesList = split.exercises.map(ex =>
                    `<li class="template-exercise">${ex.exercise} - ${ex.defaultSets} sets</li>`
                ).join('');

                // Add content to tab
                tabContent.innerHTML = `
                    <div class="template-card">
                        <div class="template-header">
                            <h3 class="template-name">${split.name}</h3>
                            <div class="template-actions">
                                <button class="template-btn clone-day" title="Clone & Edit This Day">
                                    <i class="fas fa-clone"></i> Clone Day
                                </button>
                                <button class="template-btn use-template" title="Use template">
                                    <i class="fas fa-play"></i> Use
                                </button>
                            </div>
                        </div>
                        <ul class="template-exercises">
                            ${exercisesList}
                        </ul>
                    </div>
                `;

                // Add event listeners for template actions
                tabContent.querySelector('.clone-day').addEventListener('click', () => {
                    cloneBuiltInDay(split.name, split.exercises);
                });

                tabContent.querySelector('.use-template').addEventListener('click', () => {
                    useTemplate(`${template.name} - ${split.name}`, split.exercises);
                });

                tabContents.appendChild(tabContent);

                if (isFirst) isFirst = false;
            });

            // Add tabs and content to container
            tabsContainer.appendChild(tabButtons);
            tabsContainer.appendChild(tabContents);
            templateContainer.appendChild(tabsContainer);

            // Add template to container
            builtInTemplatesContainer.appendChild(templateContainer);
        });

        // Add tab switching functionality
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;

                // Remove active class from all buttons and contents in the same container
                const tabsContainer = button.closest('.tabs-container');
                tabsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                tabsContainer.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // Load custom templates
    function loadCustomTemplates() {
        customTemplatesContainer.innerHTML = '';
        const customTemplates = getCustomTemplates();

        Object.entries(customTemplates).forEach(([name, template]) => {
            const card = createTemplateCard({
                name: name,
                exercises: template.exercises,
                isBuiltIn: false
            });
            customTemplatesContainer.appendChild(card);
        });
    }

    // Create template card
    function createTemplateCard({ name, exercises, isBuiltIn }) {
        const card = document.createElement('div');
        card.className = 'template-card';

        const exercisesList = exercises.map(ex =>
            `<li class="template-exercise">${ex.exercise} - ${ex.defaultSets} sets</li>`
        ).join('');

        card.innerHTML = `
            <div class="template-header">
                <h3 class="template-name">${name}</h3>
                <div class="template-actions">
                    ${isBuiltIn ? `
                        <button class="template-btn clone-template" title="Clone & Edit Template">
                            <i class="fas fa-clone"></i>
                        </button>
                    ` : `
                        <button class="template-btn edit-template" title="Edit template">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="template-btn delete-template" title="Delete template">
                            <i class="fas fa-trash"></i>
                        </button>
                    `}
                    <button class="template-btn use-template" title="Use template">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
            </div>
            <ul class="template-exercises">
                ${exercisesList}
            </ul>
        `;

        // Add event listeners for template actions
        if (isBuiltIn) {
            card.querySelector('.clone-template').addEventListener('click', () => {
                cloneBuiltInTemplate(name, exercises);
            });
        } else {
            card.querySelector('.edit-template').addEventListener('click', () => {
                editTemplate(name);
            });
            card.querySelector('.delete-template').addEventListener('click', () => {
                deleteTemplate(name);
            });
        }

        card.querySelector('.use-template').addEventListener('click', () => {
            useTemplate(name, exercises);
        });

        return card;
    }

    // Clone built-in template function
    function cloneBuiltInTemplate(templateName, exercises) {
        const newName = `${templateName} (Custom)`;
        openModal({
            name: newName,
            exercises: JSON.parse(JSON.stringify(exercises)) // Deep clone exercises
        });
    }

    // Clone individual day from built-in template
    function cloneBuiltInDay(dayName, exercises) {
        const newName = `${dayName} (Custom)`;
        openModal({
            name: newName,
            exercises: JSON.parse(JSON.stringify(exercises)) // Deep clone exercises
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        createTemplateBtn.addEventListener('click', () => openModal());
        closeModalBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        addExerciseBtn.addEventListener('click', addExerciseToForm);
        templateForm.addEventListener('submit', handleTemplateSubmit);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Open modal
    function openModal(template = null) {
        modalTitle.textContent = template ? 'Edit Template' : 'Create New Template';
        editingTemplate = template;

        if (template) {
            document.getElementById('templateName').value = template.name;
            exercisesList.innerHTML = '';
            template.exercises.forEach(exercise => {
                addExerciseToForm(null, exercise);
            });
        } else {
            templateForm.reset();
            exercisesList.innerHTML = '';
            addExerciseToForm(); // Add one empty exercise by default
        }

        modal.classList.add('active');
    }

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        editingTemplate = null;
        templateForm.reset();
        exercisesList.innerHTML = '';
    }

    // Add exercise to form
    function addExerciseToForm(e, exerciseData = null) {
        const exerciseNumber = exercisesList.children.length + 1;
        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-item';

        exerciseItem.innerHTML = `
            <div class="exercise-header">
                <span class="exercise-number">Exercise ${exerciseNumber}</span>
                <button type="button" class="remove-exercise" title="Remove exercise">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="exercise-grid">
                <div class="form-group">
                    <label for="muscleGroup_${exerciseNumber}">Muscle Group</label>
                    <select id="muscleGroup_${exerciseNumber}" required>
                        <option value="">Select Muscle Group</option>
                        ${Object.keys(exercises).map(group =>
            `<option value="${group}" ${exerciseData && exerciseData.muscleGroup === group ? 'selected' : ''}>
                                ${group.charAt(0).toUpperCase() + group.slice(1)}
                            </option>`
        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="exercise_${exerciseNumber}">Exercise</label>
                    <select id="exercise_${exerciseNumber}" required>
                        <option value="">Select Exercise</option>
                        ${exerciseData && exercises[exerciseData.muscleGroup] ?
                exercises[exerciseData.muscleGroup].map(ex =>
                    `<option value="${ex}" ${exerciseData.exercise === ex ? 'selected' : ''}>${ex}</option>`
                ).join('') : ''
            }
                    </select>
                </div>
                <div class="form-group">
                    <label for="sets_${exerciseNumber}">Sets</label>
                    <input type="number" id="sets_${exerciseNumber}" min="1" max="10" 
                           value="${exerciseData ? exerciseData.defaultSets : ''}" required>
                </div>
            </div>
        `;

        // Add muscle group change handler
        const muscleGroupSelect = exerciseItem.querySelector(`#muscleGroup_${exerciseNumber}`);
        const exerciseSelect = exerciseItem.querySelector(`#exercise_${exerciseNumber}`);

        muscleGroupSelect.addEventListener('change', () => {
            const selectedMuscleGroup = muscleGroupSelect.value;
            exerciseSelect.innerHTML = '<option value="">Select Exercise</option>';

            if (selectedMuscleGroup && exercises[selectedMuscleGroup]) {
                exercises[selectedMuscleGroup].forEach(ex => {
                    const option = document.createElement('option');
                    option.value = ex;
                    option.textContent = ex;
                    exerciseSelect.appendChild(option);
                });
            }
        });

        // Add remove exercise handler
        exerciseItem.querySelector('.remove-exercise').addEventListener('click', () => {
            exerciseItem.remove();
            updateExerciseNumbers();
        });

        exercisesList.appendChild(exerciseItem);
    }

    // Update exercise numbers after removal
    function updateExerciseNumbers() {
        exercisesList.querySelectorAll('.exercise-item').forEach((item, index) => {
            item.querySelector('.exercise-number').textContent = `Exercise ${index + 1}`;
        });
    }

    // Handle template form submission
    function handleTemplateSubmit(e) {
        e.preventDefault();

        const templateName = document.getElementById('templateName').value;
        const exercises = [];

        exercisesList.querySelectorAll('.exercise-item').forEach(item => {
            const muscleGroup = item.querySelector('select[id^="muscleGroup"]').value;
            const exercise = item.querySelector('select[id^="exercise"]').value;
            const sets = item.querySelector('input[id^="sets"]').value;

            exercises.push({
                muscleGroup,
                exercise,
                defaultSets: parseInt(sets),
                defaultReps: '8-12' // Default rep range
            });
        });

        if (exercises.length === 0) {
            alert('Please add at least one exercise to the template');
            return;
        }

        // Save template
        saveCustomTemplate(templateName, {
            name: templateName,
            exercises: exercises
        });

        // Refresh templates display
        loadCustomTemplates();
        closeModal();
    }

    // Edit template
    function editTemplate(templateName) {
        const template = loadCustomTemplate(templateName);
        if (template) {
            openModal({
                name: templateName,
                exercises: template.exercises
            });
        }
    }

    // Delete template
    function deleteTemplate(templateName) {
        if (confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
            const customTemplates = getCustomTemplates();
            delete customTemplates[templateName];
            localStorage.setItem('customWorkoutTemplates', JSON.stringify(customTemplates));
            loadCustomTemplates();
        }
    }

    // Use template
    function useTemplate(templateName, templateExercises) {
        // Store the selected template in session storage
        sessionStorage.setItem('selectedTemplate', JSON.stringify({
            name: templateName,
            exercises: templateExercises
        }));

        // Redirect to workout logger
        window.location.href = 'workout-logger.html';
    }

    // Initialize the page
    init();
}); 