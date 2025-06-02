// Export data from Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function exportSupabaseData() {
    try {
        console.log('🔄 Starting Supabase data export...');

        // Export users table
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*');

        if (usersError) throw usersError;
        fs.writeFileSync('./exports/users.json', JSON.stringify(users, null, 2));
        console.log(`✅ Exported ${users.length} users`);

        // Export workouts table
        const { data: workouts, error: workoutsError } = await supabase
            .from('workouts')
            .select('*');

        if (workoutsError) throw workoutsError;
        fs.writeFileSync('./exports/workouts.json', JSON.stringify(workouts, null, 2));
        console.log(`✅ Exported ${workouts.length} workouts`);

        // Export goals table
        const { data: goals, error: goalsError } = await supabase
            .from('goals')
            .select('*');

        if (goalsError) throw goalsError;
        fs.writeFileSync('./exports/goals.json', JSON.stringify(goals, null, 2));
        console.log(`✅ Exported ${goals.length} goals`);

        // Export exercises table
        const { data: exercises, error: exercisesError } = await supabase
            .from('exercises')
            .select('*');

        if (exercisesError) throw exercisesError;
        fs.writeFileSync('./exports/exercises.json', JSON.stringify(exercises, null, 2));
        console.log(`✅ Exported ${exercises.length} exercises`);

        console.log('🎉 Data export completed successfully!');

    } catch (error) {
        console.error('❌ Export failed:', error);
    }
}

// Create exports directory
if (!fs.existsSync('./exports')) {
    fs.mkdirSync('./exports');
}

exportSupabaseData(); 