# 📚 StudyFlow

**StudyFlow** - A comprehensive study and lifestyle habit tracking platform that helps you optimize your daily routine through data-driven insights.

## 🎯 Features

- **Study Tracking**: Log study sessions with timer and manual entry
- **Habit Management**: Track daily habits and build consistency
- **Subject Organization**: Manage subjects with custom colors
- **Analytics Dashboard**: Visualize your progress with charts and statistics
- **Calendar View**: See your activity at a glance
- **Heatmap Visualization**: GitHub-style activity heatmap
- **Group Features**: Compare progress with peers (coming soon)
- **Personal Data Insights**: AI-powered recommendations for optimal routines

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Query (TanStack Query)
- **Authentication**: Supabase Auth
- **Charts**: Chart.js + React-Chartjs-2

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Supabase)
- **ORM**: SQLAlchemy
- **Authentication**: JWT tokens via Supabase

## 📦 Project Structure

```
studyflow/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # App router pages
│   │   ├── components/ # Reusable components
│   │   ├── contexts/  # React contexts
│   │   └── lib/       # Utilities and configurations
│   └── public/        # Static assets
├── backend/           # FastAPI backend
│   ├── main.py       # API entry point
│   ├── models.py     # Database models
│   ├── schemas.py    # Pydantic schemas
│   └── routers/      # API endpoints
└── docs/             # Documentation
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- PostgreSQL (or Supabase account)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Backend Setup

```bash
cd backend
python -m venv Env1
source Env1/bin/activate  # On Windows: Env1\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API will be available at [http://localhost:8000](http://localhost:8000)

API documentation at [http://localhost:8000/docs](http://localhost:8000/docs)

## 🌐 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://user:password@host:port/database
```

## 📱 Responsive Design

StudyFlow is fully responsive and optimized for:
- 📱 Mobile (320px - 640px)
- 📱 Tablet (640px - 1024px)
- 💻 Desktop (1024px+)

## 🎨 Key Features

### Study Timer
- Start/pause/stop timer
- Auto-save sessions over 1 minute
- Subject selection
- Real-time countdown display

### Habit Tracker
- Daily habit checklist
- Progress visualization
- Streak tracking
- Custom habit creation

### Analytics Dashboard
- Weekly study time chart
- Habit completion rate
- Subject distribution
- Activity heatmap

### Calendar Integration
- Month view with activity markers
- Year-round heatmap view
- Filter by activity type (study/habit)

## 🔐 Security

- JWT-based authentication via Supabase
- Row-level security (RLS) on database
- Protected API routes
- Secure password handling

## 🚀 Deployment

### Frontend (Vercel)
- Automatic deployment from GitHub
- Environment variables configured in Vercel dashboard

### Backend (Render.com)
- Docker deployment
- Auto-deploy on push
- Environment variables in Render dashboard

## 📊 API Endpoints

### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Login

### Study Sessions
- `GET /study-sessions` - Get all sessions
- `POST /study-sessions` - Create session
- `DELETE /study-sessions/{id}` - Delete session

### Habits
- `GET /habits` - Get all habits
- `POST /habits` - Create habit
- `POST /habits/{id}/log` - Log habit completion
- `DELETE /habits/{id}` - Delete habit

### Subjects
- `GET /subjects` - Get all subjects
- `POST /subjects` - Create subject
- `PUT /subjects/{id}` - Update subject
- `DELETE /subjects/{id}` - Delete subject

### Dashboard
- `GET /dashboard/summary` - Get dashboard statistics
- `GET /dashboard/weekly` - Get weekly data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**gamjamaster**
- GitHub: [@gamjamaster](https://github.com/gamjamaster)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI for the blazing-fast Python API
- Supabase for backend-as-a-service
- TailwindCSS for beautiful styling

---

**Built with ❤️ by gamjamaster**
