# StudyFlow

A web app for students that brings tasks, events, notes, flashcards, mind maps and a focus timer into one place, with an AI assistant for when you get stuck.

Studying usually means bouncing between a to-do app, a notes app, a timer and a calendar. I built StudyFlow to put all of that in one place, so there's less to manage and more time to actually study.

Live demo: [study-flow-inky.vercel.app](https://study-flow-inky.vercel.app/)

<!--
Add a screenshot or two here, for example:
![StudyFlow dashboard](./screenshots/dashboard.png)
-->

### Features

- An AI assistant for doubts and explanations. Replies render as Markdown, code blocks included.
- A Pomodoro focus timer with custom session and break lengths, break reminders and focus tracking.
- A task board with drag and drop, priorities and status tracking.
- An event scheduler with a calendar view and email reminders for upcoming events and tasks.
- Flashcards for active recall.
- Mind maps for connecting ideas visually.
- Notes with Markdown support.
- A dark, minimal interface that tries to stay out of the way.

### Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React (Hooks, Context, Router), Bootstrap, MUI, custom CSS |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcrypt |
| AI | Groq, OpenRouter (DeepSeek models), Sarvam AI |
| Email and scheduling | node-cron, Nodemailer, Resend |
| Hosting | Vercel (frontend), Render (backend) |

### Running it locally

The repo has two folders: `client` (the React app) and `server` (the Express API). You'll need Node.js and a MongoDB connection, either a local install or a MongoDB Atlas URI.

Clone the repo:

```bash
git clone https://github.com/Adi-Marathe/StudyFlow.git
cd StudyFlow
```

Set up the backend:

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Keys for the other services (OpenRouter, Sarvam AI, Resend) go in the same file. Then start the server:

```bash
npm run dev
```

In a second terminal, from the project root, set up the frontend:

```bash
cd client
npm install
```

If you need to point it at a different API, create a `.env` file in `client/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Then start the app:

```bash
npm start
```

It runs at http://localhost:3000.

### How I built it

I designed the interface in Figma first, then built the React frontend and an Express and MongoDB backend with JWT auth. Features went in one at a time. The scheduler uses react-big-calendar, the task board uses react-beautiful-dnd, mind maps run on ReactFlow, and the Pomodoro timer is built from scratch. Reminders go out from a node-cron job through the email service. The AI assistant talks to Groq and OpenRouter through the backend, and the frontend renders its replies as Markdown.

### What I learned

- Keeping state manageable when tasks, timers and the calendar all live in one app.
- Working with AI APIs: writing better prompts, handling streamed responses and formatting replies as Markdown.
- How much animation, typography and dark mode affect how distracting an app feels.
- Fitting bigger libraries like ReactFlow and react-beautiful-dnd into an existing codebase.
- Scheduling jobs with node-cron and sending email reminders.

### What's next

- Better layouts on small screens, and a React Native app down the line.
- A forgot-password flow with email verification links.
- Real-time sharing of notes and tasks with Socket.io.
- AI-generated quizzes and flashcards from your own notes.
- A study analytics dashboard with focus hours and task streaks.

### Contributing

Issues and pull requests are welcome. Fork the repo, create a branch for your change and open a PR. For anything big, open an issue first so we can talk it through.

Built by [Aditya Marathe](https://github.com/Adi-Marathe).
