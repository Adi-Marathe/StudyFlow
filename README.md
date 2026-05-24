# 📌 StudyFlow — AI-Powered Productivity Platform

## 📖 Overview

StudyFlow is an all-in-one productivity platform designed specifically to help students manage their academic life smarter, stay focused, and study more effectively. By combining productivity tools, AI assistance, and collaborative learning into a single modern platform, StudyFlow eliminates the chaos of juggling multiple apps for assignments, exams, notes, and deadlines. It helps students study smarter, stay organized, and remain consistent without feeling overwhelmed.

## 💻 Technologies

**Frontend:**
- **React.js** (Hooks, Context, Router)
- **CSS Frameworks & UI Libraries:** Bootstrap, React-Bootstrap, Material-UI (MUI), MDB React UI Kit
- **Styling:** CSS3, Styled-components, Emotion
- **Drag & Drop & Flows:** React-Beautiful-DnD, ReactFlow
- **Icons & Animations:** FontAwesome, Lucide-React, Lottie-React, React-Confetti, AOS
- **Date & Time:** Moment.js, Day.js, React-Big-Calendar
- **Markdown:** React-Markdown, Remark-gfm, React-Syntax-Highlighter

**Backend:**
- **Node.js** & **Express.js**
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcrypt.js
- **Scheduling & Emails:** Node-cron, Nodemailer, Resend
- **AI Integration:** Groq SDK, OpenRouter API (DeepSeek Models), Sarvamai

**Tools & Deployment:**
- Git & GitHub
- Postman
- Vercel (Frontend Deployment)
- Render (Backend Deployment)
- Figma (UI/UX Prototyping)

## 🚀 Features

- **🤖 AI Assistant:** An intelligent chatbot integrated directly into the platform providing instant doubt solving, AI-powered explanations, and Markdown-formatted responses.
- **⏳ Pomodoro Focus Mode:** Built-in focus timer with custom study sessions, break reminders, and focus tracking.
- **✅ Task Management:** A modern task manager to organize study goals with priority workflow, drag-and-drop, and status tracking.
- **📅 Event Scheduler:** Smart scheduling system with email reminders and upcoming task notifications.
- **📚 Interactive Flashcards:** For active recall learning and revision.
- **🗺️ Mind Maps:** Visual learning system using ReactFlow to connect ideas and simplify concepts.
- **📝 Notes System:** A centralized place for study material with Markdown support.
- **🎨 Modern UI/UX:** Dark-mode aesthetics, smooth animations, responsive layouts, and minimal distractions.

## 🛠️ The Process (How I Built It)

1. **Ideation & UI/UX Design:** Identified the problem of students switching between too many apps. Used Figma to design a sleek, dark-mode, and distraction-free UI.
2. **Frontend Foundation:** Scaffolded the React application and implemented core styling using Bootstrap and custom CSS for the modern aesthetic.
3. **Backend & Database:** Set up the Node.js/Express server and connected it to MongoDB. Created models for Users, Tasks, Events, and Notes.
4. **Authentication:** Implemented secure user authentication using bcrypt for password hashing and JWT for session management.
5. **Feature Integration:**
   - Integrated `react-big-calendar` for the Event Scheduler.
   - Built the Pomodoro timer from scratch.
   - Used `react-beautiful-dnd` for the Task Management board.
   - Implemented Mind Maps using `reactflow`.
6. **AI Implementation:** Connected the backend to Groq API and OpenRouter to power the AI study assistant, handling context and Markdown responses.
7. **Refinement & Polish:** Added animations (AOS, Lottie), toast notifications, and ensured responsive design across devices.

## 🧠 What I Learned

- **State Management:** Handling complex states across different productivity modules (tasks, timers, calendar).
- **AI Integration:** Crafting effective prompts and managing AI API responses (handling streams, Markdown formatting) effectively in a full-stack environment.
- **UI/UX Principles:** How subtle animations, typography, and dark mode contribute to a better, less distracting user experience for students.
- **Third-Party Libraries:** Deepened my understanding of integrating complex libraries like ReactFlow and React-Beautiful-DnD seamlessly.
- **Cron Jobs & Emailing:** Automating tasks like sending reminders using `node-cron` and email services.

## 🔮 How It Could Be Improved

- **Responsive Design:** Optimize the layout further for mobile devices (Mobile App version in React Native is a future goal).
- **Forgot Password Feature:** Implement a secure password reset flow using email verification links.
- **Real-time Collaboration:** Allow students to share notes and tasks using WebSockets (Socket.io).
- **AI-Generated Content:** Automatically generate quizzes and flashcards from personal notes.
- **Study Analytics:** A dashboard visualizing study habits, focus hours, and task completion streaks.

## ⚙️ Running the Project (Local Development)

If you'd like to fork and run this project locally, follow these steps:

### Prerequisites
- Node.js installed
- MongoDB installed or a MongoDB Atlas URI

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/studyflow.git
   cd studyflow
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add your variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GROQ_API_KEY=your_groq_api_key
   # Add other required API keys (Resend, OpenRouter, etc.)
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory (if needed):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   Start the frontend React app:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## 🌐 Preview

Check out the live project here: [StudyFlow Live](https://study-flow-inky.vercel.app/)
