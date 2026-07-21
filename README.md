<div align="center">
  <img src="https://raw.githubusercontent.com/Surekha2106/DebugMate-AI/main/frontend/assets/logo.png" alt="DebugMate AI Logo" width="150" height="150" onerror="this.src='https://img.icons8.com/color/150/000000/bot.png'"/>
  
  # 🤖 DebugMate AI
  
  **Your Intelligent Coding Assistant & Debugging Companion**
  
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
  [![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://java.com)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Gemini API](https://img.shields.io/badge/AI-Google_Gemini-blue?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
  [![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

  [Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [API Configuration](#api-configuration)
</div>

---

## 🌟 Overview

**DebugMate AI** is a state-of-the-art AI-powered debugging agent designed to streamline your development process. Leveraging the power of the Google Gemini API, DebugMate analyzes your code, identifies bugs, and suggests actionable fixes in real-time. Whether you're tracking down complex logic errors or fixing simple typos, DebugMate acts as your pair-programming partner.

With a robust Spring Boot backend, a sleek vanilla web interface, and secure JWT authentication, DebugMate AI is built for speed, security, and developer productivity.

## ✨ Features

- **🧠 Intelligent Debugging**: Powered by Google Gemini to provide deep code analysis and contextual bug fixes.
- **🔒 Secure Authentication**: Built-in JWT-based user authentication to keep your code and queries private.
- **📊 Developer Dashboard**: Keep track of your debugging history, view past fixes, and manage your profile.
- **⚡ Fast & Responsive UI**: A beautiful, custom-designed vanilla HTML/CSS/JS frontend interface.
- **🐳 Docker Ready**: Spin up the entire environment (API + PostgreSQL) with a single Docker Compose command.

## 🛠️ Tech Stack

### Backend
- **Java 21** & **Spring Boot 3.2**
- **Spring Security** with **JWT** for Authentication
- **Spring Data JPA** & **Hibernate**
- **PostgreSQL 15** for Database Management
- **Google Gemini API** integration for AI processing

### Frontend
- **HTML5**, **CSS3**, and **Vanilla JavaScript**
- Custom responsive UI tailored for a modern developer experience

### Infrastructure
- **Docker** & **Docker Compose**

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- Java 21 (if running backend manually)
- Node.js (optional, if needed for frontend asset serving)

### 1. Clone the repository

```bash
git clone https://github.com/Surekha2106/DebugMate-AI.git
cd DebugMate-AI
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and add your Google Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Note: The database configuration is already handled in the `docker-compose.yml` for local testing, or uses the Railway PostgreSQL URL as specified.)*

### 3. Run with Docker Compose

The easiest way to start DebugMate AI is using Docker. This will spin up both the PostgreSQL database and the Spring Boot API.

```bash
docker-compose up --build
```

The backend API will be available at `http://localhost:8080`.

### 4. Access the Frontend

Simply open the `index.html` file located in the `frontend` directory in your browser, or serve it using a local server:

```bash
# Using Python
python -m http.server 3000 --directory frontend

# Using Node.js (npx)
npx serve frontend
```

Navigate to the frontend application and log in or sign up to start debugging!

## 📂 Project Structure

```
DebugMate-AI/
├── backend/                  # Spring Boot API source code
│   ├── src/main/java/        # Java source code
│   ├── pom.xml               # Maven configuration
│   └── Dockerfile            # Backend Docker build file
├── frontend/                 # Client-side web application
│   ├── css/                  # Styling sheets
│   ├── js/                   # JavaScript logic (auth, api, ui)
│   ├── index.html            # Landing page
│   ├── dashboard.html        # Main application dashboard
│   ├── debug.html            # AI debugging interface
│   └── ...                   # Other views (login, history, settings)
├── docker-compose.yml        # Docker configuration for app + db
└── .env.example              # Example environment variables
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Surekha2106/DebugMate-AI/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

