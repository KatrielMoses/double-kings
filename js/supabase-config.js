// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://xpfnxpbshviqqukjrrub.supabase.co' // https://xxxxx.supabase.co
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZm54cGJzaHZpcXF1a2pycnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODI4OTUsImV4cCI6MjA2MzY1ODg5NX0.ptRfVP5hjrV6o5bKZ7HFeIY7jKPzxw6S0SlubYliHiQ' // eyJhbGc...

// Create Supabase client (using global supabase from CDN)
export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Auth helper functions
export const auth = {
    // Sign up with email and password
    async signUp(email, password, name) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name
                    }
                }
            })

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Sign up error:', error)
            return { success: false, error: error.message }
        }
    },

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Sign in error:', error)
            return { success: false, error: error.message }
        }
    },

    // Sign out
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Sign out error:', error)
            return { success: false, error: error.message }
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) throw error
            return user
        } catch (error) {
            console.error('Get user error:', error)
            return null
        }
    },

    // Listen to auth changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback)
    }
}

// Database helper functions
export const db = {
    // User profile functions
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Get user profile error:', error)
            return null
        }
    },

    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Update user profile error:', error)
            return { success: false, error: error.message }
        }
    },

    // Workout functions
    async saveWorkout(workoutData) {
        try {
            const { data, error } = await supabase
                .from('workouts')
                .insert([workoutData])
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Save workout error:', error)
            return { success: false, error: error.message }
        }
    },

    async getWorkouts(userId, limit = 50) {
        try {
            const { data, error } = await supabase
                .from('workouts')
                .select('*')
                .eq('user_id', userId)
                .order('workout_date', { ascending: false })
                .limit(limit)

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Get workouts error:', error)
            return []
        }
    },

    async deleteWorkout(workoutId) {
        try {
            const { error } = await supabase
                .from('workouts')
                .delete()
                .eq('id', workoutId)

            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Delete workout error:', error)
            return { success: false, error: error.message }
        }
    },

    // Goal functions
    async saveGoal(goalData) {
        try {
            const { data, error } = await supabase
                .from('goals')
                .insert([goalData])
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Save goal error:', error)
            return { success: false, error: error.message }
        }
    },

    async getGoals(userId) {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Get goals error:', error)
            return []
        }
    },

    async updateGoal(goalId, updates) {
        try {
            const { data, error } = await supabase
                .from('goals')
                .update(updates)
                .eq('id', goalId)
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Update goal error:', error)
            return { success: false, error: error.message }
        }
    },

    async deleteGoal(goalId) {
        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', goalId)

            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Delete goal error:', error)
            return { success: false, error: error.message }
        }
    },

    // Template functions
    async saveTemplate(templateData) {
        try {
            const { data, error } = await supabase
                .from('workout_templates')
                .insert([templateData])
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error('Save template error:', error)
            return { success: false, error: error.message }
        }
    },

    async getTemplates(userId) {
        try {
            const { data, error } = await supabase
                .from('workout_templates')
                .select('*')
                .or(`user_id.eq.${userId},is_public.eq.true`)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } catch (error) {
            console.error('Get templates error:', error)
            return []
        }
    }
} 