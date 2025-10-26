# NewsPulse: Personalized AI-Enhanced News Delivery System

## 1. Overview

NewsPulse is a comprehensive backend system designed to deliver personalized, AI-enhanced news summaries to users via their preferred communication channels (Telegram and Email).

The system features automated daily scheduling, content personalization based on user preferences (categories and time of day), and integration with the Google Gemini API to refine and enhance raw news articles before delivery.

### Key Features:

*   *Personalized Scheduling:* Users receive digests at their preferred time.
*   *Multi-Channel Delivery:* Supports Telegram and Email delivery methods.
*   *AI Content Enhancement:* Uses Gemini 1.5 Flash to generate catchy titles and descriptive summaries.
*   *Telegram Bot Interface:* Allows users to register and manage preferences directly through a conversational bot flow.

## 2. Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| *Backend* | Node.js, TypeScript, Express | Core API and business logic |
| *Database* | MongoDB (Mongoose) | Persistence for users, summaries, and schedules |
| *AI/Content* | Google Gemini API | Content enhancement and summarization |
| *News Source* | NewsAPI | External news data fetching |
| *Messaging* | node-telegram-bot-api, Nodemailer | Delivery services |
| *Scheduling* | node-cron | Automated daily fetching and minute-by-minute delivery checks |
| *Frontend* | React, TypeScript, Vite | User interface (currently boilerplate) |

## 3. Project Structure

| Path | Role |
| :--- | :--- |
| backend/src/controllers/ | Handles API request validation and response logic (e.g., telegramController.ts). |
| backend/src/models/ | Mongoose schemas for database entities (User, NewsSummary, NewsScheduler). |
| backend/src/routes/ | Express routing definitions (/api/users, /api/news, /api/telegram). |
| backend/src/services/ | Core business logic, external API integrations (Gemini, NewsAPI, Mail, Telegram). |
| backend/src/db.ts | MongoDB connection initialization. |
| backend/src/index.ts | Application entry point and server orchestration. |
| frontend/src/ | React components and frontend application logic. |

## 4. Key Components and Modules

| Module | Description |
| :--- | :--- |
| **schedulerService** | *Core Delivery Engine.* Runs every minute to check NewsScheduler for pending deliveries. It handles AI enhancement via geminiService and dispatches content via telegramService and mailService. |
| **newsService** | *Orchestration Layer.* Fetches news based on all user preferences, handles content deduplication, calculates precise send_time, and creates records in NewsScheduler. |
| **geminiService** | *AI Enhancement.* Dedicated service to call the Gemini API, taking raw title/summary and returning an enhanced, structured output. |
| **telegramRoutes** | *Bot Interaction.* Manages the multi-step conversational flow for user registration, category selection, and preference updates directly within the Telegram bot environment. |
| **telegramHelper** | Utility for escaping MarkdownV2 characters, ensuring message integrity before sending via Telegram. |
| **db.ts** | Initializes the Mongoose connection and handles critical startup failure logging. |

## 5. Setup

### Prerequisites

*   Node.js (v18+)
*   MongoDB instance (local or remote)

### Installation

1.  Clone the repository:
    bash
    git clone [repository-url]
    cd newspulse
    

2.  Install dependencies for the backend and frontend:
    bash
    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    

3.  Create a .env file in the backend/ directory based on the configuration section below.

## 6. Usage

### Running the Application

1.  Start the MongoDB service.
2.  Start the backend server (which also initializes all cron schedulers):
    bash
    cd backend
    npm start
    
3.  Start the frontend development server:
    bash
    cd frontend
    npm run dev
    

### API Quickstart

The backend API runs on port 5000 (default).

| Action | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| Register User | /api/users/register | POST | Creates a new user and initializes their news schedule. |
| Manual Fetch | /api/news/fetch | POST | Manually triggers the global news fetching and scheduling process (normally runs daily at 6:00 AM). |
| Test Telegram | /api/telegram/test | POST | Sends a specific news summary (summaryId) to a specific user (userId) for delivery testing. |

### Telegram Bot

The Telegram bot starts polling automatically when the backend runs. Users can interact with the bot using the /start command to initiate registration and preference management.

## 7. Configuration

Environment variables must be set in a .env file located in the backend/ directory.

| Name | Purpose | Required | Default |
| :--- | :--- | :--- | :--- |
| MONGO_URI | Connection string for the MongoDB database. | Yes | - |
| TELEGRAM_TOKEN | API token for the Telegram Bot. | Yes | - |
| GEMINI_API_KEY | API key for Google Gemini content enhancement. | Yes | - |
| EMAIL_USER | Email address used for sending newsletters (Nodemailer). | Yes | - |
| EMAIL_PASS | Application password or token for the sending email account. | Yes | - |
| PORT | Port for the Express server. | No | 5000 |

## 8. Data Model

The system relies on three core Mongoose models:

### User

Stores user authentication, preferences, and delivery configuration.

| Field | Type | Description |
| :--- | :--- | :--- |
| email | String (Unique) | User identifier. |
| telegram_id | String | Telegram chat ID for direct messaging. |
| category | Array of Strings | User's preferred news topics. |
| preferred_time_of_day | String (HH:MM) | Time for daily digest delivery (e.g., "09:00"). |
| delivery_method | Enum ('telegram', 'email', 'both') | Chosen delivery channel. |

### NewsSummary

Stores the content of a summarized news article.

| Field | Type | Description |
| :--- | :--- | :--- |
| summary_text | String | The core summarized content (AI-enhanced). |
| category | String | The topic category. |
| source_url | String | Link to the original article. |
| image_url | String (Optional) | Associated image for the article. |

### NewsScheduler

The queue for personalized, time-based delivery jobs.

| Field | Type | Description |
| :--- | :--- | :--- |
| user | ObjectId (Ref: User) | Recipient of the news. |
| summary | ObjectId (Ref: NewsSummary) | Content to be sent. |
| send_time | Date | Exact time the job should execute. |
| send_method | Array of Enums ('telegram', 'email') | Channel(s) for delivery. |
| status | Boolean | true if the job has been processed. |

## 9. Testing

### Manual Telegram Verification

You can manually test the Telegram integration using a dedicated script:

1.  Update backend/src/testTelegram.ts with your Telegram chatId.
2.  Run the script directly:
    bash
    cd backend
    ts-node src/testTelegram.ts
    

### API Testing

Use the dedicated test controller endpoint to verify delivery logic without waiting for the cron job:

bash
# Example using curl (replace IDs with actual database IDs)
curl -X POST http://localhost:5000/api/telegram/test \
-H "Content-Type: application/json" \
-d '{"userId": "60c72b1f9b1e8b001c8e4d1a", "summaryId": "60c72b1f9b1e8b001c8e4d1b"}'


## 10. Deployment

The backend is a standard Node.js/Express application.

*   *Containerization:* It is highly recommended to containerize the backend using Docker to manage dependencies and ensure the node-cron jobs run reliably.
*   *Database:* Requires a persistent, external MongoDB instance (e.g., MongoDB Atlas or a managed cloud service).
*   *Scalability:* The schedulerService runs every minute and is the most critical component. Ensure the host environment provides reliable uptime for the cron jobs.

## 11. Roadmap/Limitations

*   *Current Frontend:* The frontend is currently based on the boilerplate Vite/React template and requires development to implement user authentication and preference management UI.
*   *Email Template:* The email service dynamically generates HTML, but the template styling could be further refined for professional appearance.
*   *Error Handling:* While core services include error logging, comprehensive global error handling and monitoring (e.g., Sentry integration) are planned.
