# 🏋️‍♂️ Double Kings Fitness Website

A modern, responsive fitness tracking website built with vanilla JavaScript and powered by Supabase for backend services.

## ✨ Features

- **🔐 Authentication**: Secure user registration and login with email verification
- **📝 Workout Logger**: Track exercises with sets, reps, and weights
- **📊 Progress Monitoring**: Visualize your strength gains over time with interactive charts
- **🎯 Goal Setting**: Set and track strength goals with progress projections
- **⚖️ Weight Units**: Supports both kg and lbs with kg as default
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🎨 Modern UI**: Beautiful mountain-themed background with smooth animations

## 🚀 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time)
- **Charts**: Chart.js for progress visualization
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Poppins, Inter)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/fitness-website.git
cd fitness-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql`
   - Update your credentials in `js/supabase-config.js`

4. Start the development server:
```bash
npm start
```

## 🌐 Live Demo

Visit the live website: [Your Deployed URL Here]

## 📱 Screenshots

### Home Page
![Home Page](https://via.placeholder.com/800x400?text=Home+Page+Screenshot)

### Workout Logger
![Workout Logger](https://via.placeholder.com/800x400?text=Workout+Logger+Screenshot)

### Progress Monitoring
![Progress Monitoring](https://via.placeholder.com/800x400?text=Progress+Monitoring+Screenshot)

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Navigate to the SQL Editor
3. Run the schema from `supabase-schema.sql`
4. Update `js/supabase-config.js` with your project credentials:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

### Authentication Settings

In your Supabase dashboard:
1. Go to Authentication → Settings
2. Add your site URL to "Site URL"
3. Configure email templates if needed

## 📊 Database Schema

The application uses the following main tables:
- `user_profiles` - User information and preferences
- `workouts` - Exercise logs with sets and weights
- `goals` - Strength goals and tracking
- `workout_templates` - Reusable workout templates

## 🎯 Usage

1. **Sign Up**: Create an account with email verification
2. **Choose Workout**: Select from preset templates or create custom workouts
3. **Log Exercises**: Record sets, reps, and weights for each exercise
4. **Track Progress**: Monitor your strength gains with interactive charts
5. **Set Goals**: Define targets and track your progress towards them

## 🌟 Key Features Explained

### Weight Unit System
- Default unit is kilograms (kg)
- Users can switch between kg and lbs
- Preferences are saved per user
- All displays update automatically

### Workout Templates
- Push/Pull/Legs split
- Upper/Lower split
- Full Body workouts
- Custom template creation

### Progress Tracking
- 1RM calculations using Brzycki formula
- Interactive charts with Chart.js
- Time-based filtering
- Goal projection lines

## 🚀 Deployment

### Option 1: Vercel (Recommended)
1. Push code to GitHub
2. Connect GitHub to Vercel
3. Deploy automatically

### Option 2: Netlify
1. Push code to GitHub
2. Connect to Netlify
3. Configure build settings

### Option 3: Manual Upload
1. Build the project
2. Upload files to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Supabase for providing excellent backend services
- Chart.js for beautiful chart components
- Font Awesome for the icon library
- Google Fonts for typography

## 📞 Support

If you have any questions or issues, please [open an issue](https://github.com/YOUR_USERNAME/fitness-website/issues) on GitHub.

---

**Made with ❤️ for fitness enthusiasts** 