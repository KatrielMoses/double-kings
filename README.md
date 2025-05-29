# 🏋️ Double Kings Fitness - Complete Workout Tracking Platform

A modern, responsive fitness tracking website built with **Supabase** backend for real-time data synchronization across devices. Track workouts, monitor progress, set goals, and build custom workout templates.

![Fitness Website Preview](https://via.placeholder.com/800x400/0ea5e9/white?text=Double+Kings+Fitness)

## ✨ Features

### 🔐 **Authentication & User Management**
- Secure user registration and login with Supabase Auth
- Automatic user profile creation with preferences
- Cross-device session synchronization

### 💪 **Workout Logger**
- **Pre-built Templates**: Push/Pull/Legs, Upper/Lower, Full Body splits
- **Custom Templates**: Create and save your own workout routines
- **Exercise Database**: 50+ exercises organized by muscle groups
- **Auto-fill History**: Previous weights and reps automatically loaded
- **Progress Tracking**: All workouts saved to cloud database
- **Drag & Drop**: Reorder exercises within workouts
- **Real-time Updates**: Changes sync instantly across devices

### 📊 **Progress Monitoring**
- **1RM Calculations**: Using Brzycki formula for strength tracking
- **Interactive Charts**: Visualize strength progress over time
- **Multiple Views**: Track by muscle group or compound exercises
- **Goal Integration**: See projected progress towards strength goals
- **Statistical Analysis**: Best lifts, progress rates, workout frequency

### 🎯 **Goal Setting**
- **SMART Goals**: Set specific, measurable strength targets
- **Quick Templates**: Pre-configured goals for major lifts
- **Progress Tracking**: Visual progress towards goal completion
- **Timeline Management**: Set and track goal deadlines
- **1RM Targets**: Calculate required progression rates

### ⚙️ **Customization**
- **Weight Units**: Choose between kg and lbs (defaults to kg)
- **Personal Templates**: Save and reuse custom workout routines
- **Exercise Modifications**: Add custom exercises to any workout
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🚀 Live Demo

**[Visit Double Kings Fitness →](https://your-deployment-url.vercel.app)**

### Test Credentials
```
Email: demo@doublekings.fitness
Password: DemoUser2024!
```

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox/Grid
- **JavaScript (ES6+)** - Interactive functionality and API integration
- **Chart.js** - Progress visualization and analytics
- **Font Awesome** - Icons and visual elements

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Secure user authentication and authorization
- **Row Level Security** - Data protection and user isolation

### Deployment
- **Vercel** - Fast global CDN deployment
- **GitHub** - Version control and continuous deployment

## 📊 Database Schema

### Tables
```sql
-- User profiles with preferences
user_profiles (
  id: UUID (FK to auth.users)
  email: TEXT
  name: TEXT
  preferred_weight_unit: TEXT DEFAULT 'kg'
  created_at: TIMESTAMP
)

-- Workout logs
workouts (
  id: UUID PRIMARY KEY
  user_id: UUID (FK to user_profiles)
  exercise_name: TEXT
  muscle_group: TEXT
  sets: JSONB
  weight_unit: TEXT
  workout_date: DATE
  created_at: TIMESTAMP
)

-- Strength goals
goals (
  id: UUID PRIMARY KEY
  user_id: UUID (FK to user_profiles)
  exercise_name: TEXT
  target_weight: NUMERIC
  target_reps: INTEGER
  target_1rm: NUMERIC
  current_1rm: NUMERIC
  weight_unit: TEXT
  deadline: DATE
  created_at: TIMESTAMP
)

-- Custom workout templates
workout_templates (
  id: UUID PRIMARY KEY
  user_id: UUID (FK to user_profiles)
  template_name: TEXT
  exercises: JSONB
  created_at: TIMESTAMP
)
```

## 🏃‍♂️ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/fitness-website.git
cd fitness-website
```

### 2. Set Up Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run the SQL schema (see `supabase-schema.sql`)
4. Get your project URL and API key

### 3. Configure Environment
Update `js/supabase-config.js`:
```javascript
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
```

### 4. Local Development
```bash
# Start local server
python -m http.server 8000

# Or use Node.js
npx http-server -p 8000

# Visit http://localhost:8000
```

### 5. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📱 Usage Guide

### Getting Started
1. **Sign Up**: Create account with email/password
2. **Set Preferences**: Choose weight unit (kg/lbs)
3. **Select Template**: Choose from pre-built workout splits
4. **Log Workouts**: Enter weights, reps, and sets
5. **Track Progress**: Monitor strength gains over time
6. **Set Goals**: Define targets and track achievement

### Workout Logging
- Select from Push/Pull/Legs, Upper/Lower, or Full Body templates
- Add custom exercises to any workout
- Previous weights/reps auto-fill for faster logging
- Drag and drop to reorder exercises
- All data syncs across devices

### Progress Tracking
- View strength progress using 1RM calculations
- Filter by muscle group or specific exercises
- Set time ranges for detailed analysis
- Goal projections show required progression

## 🔧 Configuration

### Weight Units
The system defaults to **kilograms (kg)** but users can switch to pounds (lbs). All calculations and conversions are handled automatically using the conversion rate: **1 kg = 2.20462 lbs**.

### Exercise Database
The app includes 50+ exercises organized by muscle groups:
- **Chest**: Bench Press, Incline Press, Dumbbell Flyes, etc.
- **Back**: Pull-ups, Rows, Deadlifts, etc.
- **Legs**: Squats, Lunges, Leg Press, etc.
- **Shoulders**: Military Press, Lateral Raises, etc.
- **Arms**: Bicep Curls, Tricep Extensions, etc.
- **Core**: Planks, Crunches, Russian Twists, etc.

### 1RM Calculations
Strength progress uses the **Brzycki Formula**:
```
1RM = Weight × (36 ÷ (37 - Reps))
```

## 🔒 Security Features

- **Row Level Security**: Users can only access their own data
- **Secure Authentication**: Supabase Auth with JWT tokens
- **Data Validation**: Input sanitization and type checking
- **HTTPS Only**: All communications encrypted
- **CORS Protection**: Restricted API access

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure and database
- **Vercel** - Hosting and deployment platform
- **Chart.js** - Data visualization library
- **Font Awesome** - Icon library
- **Brzycki Formula** - 1RM calculation methodology

---

**Built with 💪 by the Double Kings Fitness Team**

For support, feature requests, or contributions, please [open an issue](https://github.com/your-username/fitness-website/issues) or contact us at support@doublekings.fitness. 