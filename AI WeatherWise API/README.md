# AI WeatherWise 🌤️🤖

AI WeatherWise is a modern RESTful backend platform built with **Node.js**, **Express.js**, **MongoDB**, **OpenWeatherMap API**, and **Google Gemini AI**. It allows users to register, log in, manage favorite weather locations, fetch real-time weather forecasts, and receive personalized natural-language weather summaries and activity/clothing recommendations powered by Google Gemini AI.

---

## 🌟 Features

* **Secure Authentication**: User registration, login, and password hashing using `bcryptjs`.
* **JWT Authorization**: Bearer token authentication protecting user profiles and favorite locations.
* **Favorite Locations Management**: Full CRUD (`CREATE`, `READ`, `UPDATE`, `DELETE`) for user favorite locations with strict ownership isolation.
* **Real-time Weather Integration**: Fetches current weather parameters (temperature, feels-like, humidity, pressure, wind speed, condition) from OpenWeatherMap API.
* **Weather Fallback Mode**: Graceful fallback data generation if the OpenWeatherMap API key is missing or external services fail.
* **Google Gemini AI Insights**:
  * **Natural Language Summaries**: AI-generated weather condition overview.
  * **Personalized Recommendations**: Context-aware suggestions for outdoor activities, clothing/gear, and health precautions (hydration, UV, rain protection).
* **Role-Based Admin Access**: Admin-only user management, user profile lookup, account deletion, and account suspension (`isActive`).
* **Centralized Error Handling**: Standardized JSON error response format without revealing internal stack traces.
* **Security & Validation**: Request input sanitization against NoSQL injection and basic XSS attacks.
* **Postman Collection**: Fully configured Postman collection with automatic token extraction.

---

## 📁 Project Structure

```text
tn skill project/
├── config/
│   └── database.js               # MongoDB Mongoose connection module
├── controllers/
│   ├── adminController.js        # Admin user management logic
│   ├── aiController.js           # AI summary and recommendation endpoints
│   ├── authController.js         # User registration and login logic
│   ├── locationController.js     # Favorite locations CRUD controller
│   ├── userController.js         # Current user profile management
│   └── weatherController.js      # Live weather and combined insight controllers
├── middleware/
│   ├── adminMiddleware.js        # Admin role authorization middleware
│   ├── authMiddleware.js         # JWT Bearer token authentication middleware
│   ├── errorMiddleware.js        # Global 404 & error response middleware
│   └── validationMiddleware.js   # Request body validation & sanitization
├── models/
│   ├── Location.js               # Mongoose schema for favorite locations
│   └── User.js                   # Mongoose schema for user accounts & password hashing
├── postman/
│   └── AI-WeatherWise.postman_collection.json  # Exported Postman Collection
├── routes/
│   ├── adminRoutes.js            # Admin-only endpoints (/api/admin)
│   ├── aiRoutes.js               # AI endpoints (/api/ai)
│   ├── authRoutes.js             # Auth endpoints (/api/auth)
│   ├── locationRoutes.js         # Location CRUD endpoints (/api/locations)
│   ├── userRoutes.br             # Profile endpoints (/api/users)
│   └── weatherRoutes.js          # Weather endpoints (/api/weather)
├── scripts/
│   └── createAdmin.js            # Seed script for creating admin user
├── services/
│   ├── geminiService.js          # Google Gemini AI SDK service & fallback
│   └── weatherService.js         # OpenWeatherMap API service & fallback
├── tests/
│   └── api.test.js               # Automated Jest & Supertest API suite
├── utils/
│   ├── generateToken.js          # JWT sign utility
│   └── sanitize.js               # NoSQL operator sanitization utility
├── .env                          # Local environment secrets (ignored by git)
├── .env.example                  # Template for environment configuration
├── .gitignore                    # Git ignore configuration
├── index.js                      # Main Express server entry point
├── package.json                  # Dependencies and npm scripts
└── README.md                     # Project documentation
```

---

## 🛠️ Prerequisites

* **Node.js**: v18.0.0 or higher
* **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017/ai_weatherwise` or MongoDB Atlas URI.
* **API Keys (Optional)**:
  * OpenWeatherMap API key (Free tier from [OpenWeatherMap](https://openweathermap.org/api))
  * Google Gemini API key (Free tier from [Google AI Studio](https://aistudio.google.com/))

*Note: The application includes full Fallback Mode and functions seamlessly even if third-party API keys are unconfigured.*

---

## 🚀 Installation & Setup

1. **Clone or Navigate to the Workspace Directory**:
   ```bash
   cd "c:\Users\priya\OneDrive\Attachments\OneDrive\Desktop\tn skill project"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/ai_weatherwise
   JWT_SECRET=super_secret_jwt_key_ai_weatherwise_2026

   OPENWEATHER_API_KEY=your_openweather_key_here
   GEMINI_API_KEY=your_gemini_key_here
   GEMINI_MODEL=gemini-2.5-flash

   ADMIN_NAME=System Admin
   ADMIN_EMAIL=admin@weatherwise.com
   ADMIN_PASSWORD=AdminPassword123!
   ```

4. **Seed Administrator Account**:
   ```bash
   npm run create-admin
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Or production start:
   ```bash
   npm start
   ```

6. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

---

## 🛰️ API Documentation

### 1. System Health
* **`GET /api/health`**: Returns system operational status and database connection state.

### 2. Authentication
* **`POST /api/auth/register`**: Register a new reader account.
  * *Body*: `{ "name": "Alex", "email": "alex@example.com", "password": "Password123!" }`
* **`POST /api/auth/login`**: Authenticate and receive JWT Bearer token.
  * *Body*: `{ "email": "alex@example.com", "password": "Password123!" }`

### 3. User Profile (Requires Authentication)
* **`GET /api/users/me`**: Get current authenticated user profile.
* **`PUT /api/users/me`**: Update name, email, or password.

### 4. Favorite Locations (Requires Authentication)
* **`POST /api/locations`**: Create a favorite location.
  * *Body*: `{ "city": "Chennai", "country": "India", "notes": "Hometown" }`
* **`GET /api/locations`**: List all favorite locations belonging to the authenticated user.
* **`GET /api/locations/:id`**: Get single location details by ID.
* **`PUT /api/locations/:id`**: Update location city, country, or notes.
* **`DELETE /api/locations/:id`**: Delete a location.

### 5. Weather & AI Insights
* **`GET /api/weather/:city`**: Retrieve real-time or fallback weather for a city.
* **`GET /api/weather/:city/insights`**: Retrieve combined weather data + Gemini AI summaries and activity recommendations.
* **`POST /api/ai/summary`**: Generate weather summary for provided city or weather object.
* **`POST /api/ai/recommendation`**: Generate activity, clothing, and advice recommendations.

### 6. Admin Management (Requires Admin Authorization)
* **`GET /api/admin/users`**: List all registered users.
* **`GET /api/admin/users/:id`**: Get user profile details by ID.
* **`PATCH /api/admin/users/:id/status`**: Suspend (`isActive: false`) or activate (`isActive: true`) user account.
* **`DELETE /api/admin/users/:id`**: Permanently delete user account.

---

## 📬 Postman Collection

Import `postman/AI-WeatherWise.postman_collection.json` into Postman or Thunder Client:
1. Open Postman -> Click **Import** -> Select `postman/AI-WeatherWise.postman_collection.json`.
2. The collection uses variables (`baseUrl`, `token`, `adminToken`, `locationId`, `userId`).
3. Running **01. Register User** or **02. Login User** automatically captures the returned JWT token into `{{token}}`.
4. Running **02b. Login Admin** sets `{{adminToken}}` for executing admin requests.

---

## 🎥 Demonstration Video Flow

### Video 1: API Testing Video
1. Open Postman with `AI-WeatherWise.postman_collection.json`.
2. Execute `GET /api/health` -> Show `200 OK` and `"status": "healthy"`.
3. Execute `POST /api/auth/register` -> Show `201 Created` and user creation.
4. Execute `POST /api/auth/login` -> Show `200 OK` and returned JWT token.
5. Execute `POST /api/locations` -> Show `201 Created` with favorite city.
6. Execute `GET /api/locations` -> Show user's list of favorite cities.
7. Execute `GET /api/weather/Chennai` -> Show weather data (live or fallback).
8. Execute `GET /api/weather/Chennai/insights` -> Show weather + Gemini AI summary and recommendations.
9. Call protected `/api/locations` without token -> Show `401 Unauthorized`.
10. Call `/api/admin/users` with reader token -> Show `403 Forbidden`.
11. Login as Admin and call `/api/admin/users` -> Show `200 OK` full user list.

### Video 2: Backend Architecture & Code Walkthrough
1. Show VS Code folder structure (`models`, `controllers`, `routes`, `services`, `middleware`).
2. Show `.env.example` configuration and `config/database.js` connection module.
3. Highlight `services/weatherService.js` (OpenWeatherMap API + Fallback mode).
4. Highlight `services/geminiService.js` (Google Gemini SDK + Fallback recommendations).
5. Highlight `middleware/authMiddleware.js` (JWT token verification) and `adminMiddleware.js` (Role authorization).
6. Show terminal running `npm test` passing all test suites.

---

## ⚙️ Troubleshooting

* **MongoDB Connection Failed**: Ensure MongoDB service is running locally (`mongod`) or update `MONGO_URI` in `.env`.
* **Missing OpenWeather API Key**: If `OPENWEATHER_API_KEY` is not provided, the app automatically switches to Fallback mode with realistic mock weather data (`"source": "fallback"`).
* **Missing Gemini API Key**: If `GEMINI_API_KEY` is missing or invalid, rule-based fallback summaries and activity/clothing suggestions are returned.
* **Port Already in Use**: Change `PORT=5000` in `.env` to another port such as `5001`.
