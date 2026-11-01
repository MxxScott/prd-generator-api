# PRD Generator API 🚀

An AI-powered REST API built with **Express**, **TypeScript**, and **Google Gemini** that transforms raw client discovery inputs into structured, professional **Product Requirements Documents (PRDs)**.

---

## 🌟 Features

- **Structured AI Generation**: Employs Google Gemini with strict JSON schema definitions to return consistent, machine-readable PRD documents.
- **Strict TypeScript Architecture**: Type-safe development across models, controllers, and AI services using NodeNext ECMAScript modules.
- **RESTful Endpoints**: Clean, well-structured endpoints for health checks and automated PRD generation.
- **Configurable Tech Stack Recommendations**: Generates tailored executive summaries, detailed user personas, prioritized feature breakdowns, and recommended technology stacks.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Model**: [Google Gemini API (`@google/generative-ai`)](https://ai.google.dev/)
- **Dev Tooling**: [tsx](https://github.com/privatenumber/tsx) for instant hot-reloading

---

## 📋 Prerequisites

Before running the project, ensure you have:

- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn** / **pnpm**
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/prd-generator-api.git
cd prd-generator-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` file to create your `.env`:
```bash
cp .env.example .env
```

Open `.env` and provide your configuration:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000` with live reload enabled.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📡 API Reference

### Health Check

Verify the API status.

- **URL**: `/api/health`
- **Method**: `GET`
- **Success Response (200 OK)**:
```json
{
  "status": "API is running perfectly."
}
```

---

### Generate PRD

Generates a complete, structured PRD from discovery questions.

- **URL**: `/api/generate-prd`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

#### Request Body
| Field | Type | Description |
| :--- | :--- | :--- |
| `projectName` | `string` | The official name of the project |
| `clientName` | `string` | The name of the client or organization |
| `projectGoal` | `string` | The high-level vision and business goal |
| `targetAudience`| `string` | Primary audience and end-users |
| `coreFeaturesRequired` | `string[]` | Array of essential feature descriptions |

##### Example Request:
```json
{
  "projectName": "TaskMaster Pro",
  "clientName": "Acme Corp",
  "projectGoal": "Build a real-time collaborative task management tool for remote teams.",
  "targetAudience": "Product managers, software engineers, and remote teams.",
  "coreFeaturesRequired": [
    "Real-time task synchronization",
    "Kanban board and list views",
    "Role-based access control",
    "Automated email notifications"
  ]
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "PRD Generated Successfully",
  "data": {
    "title": "TaskMaster Pro - Product Requirements Document",
    "executiveSummary": "TaskMaster Pro is designed to eliminate workflow fragmentation for remote teams...",
    "userPersonas": [
      "Product Manager - Needs high-level project visibility and milestone tracking",
      "Software Engineer - Wants clean task boards and frictionless issue assignment"
    ],
    "features": [
      {
        "featureName": "Real-Time Collaboration",
        "description": "WebSocket-driven board updates without page refreshing.",
        "priority": "High"
      },
      {
        "featureName": "Automated Notifications",
        "description": "Digest emails and webhooks for status updates.",
        "priority": "Medium"
      }
    ],
    "techStackRecommendations": [
      "Frontend: React with Tailwind CSS",
      "Backend: Node.js / Express with WebSockets",
      "Database: PostgreSQL with Prisma ORM"
    ]
  }
}
```

---

## 📂 Project Structure

```text
prd-generator-api/
├── src/
│   ├── services/
│   │   └── ai.service.ts     # Gemini API integration & schema definitions
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces (ClientDiscoveryInput, PRDDocument)
│   └── server.ts             # Express application and route handlers
├── .env.example              # Sample environment template
├── .gitignore                # Ignored files (node_modules, .env, dist)
├── package.json              # Project dependencies & scripts
├── tsconfig.json             # TypeScript compiler settings
└── README.md                 # Project documentation
```

---

## 🗺️ Roadmap

- [ ] Connect MongoDB/Mongoose to save and retrieve generated PRDs
- [ ] Export PRD documents directly to Markdown (`.md`) and PDF
- [ ] Add user authentication (API Keys or JWT tokens)
- [ ] Frontend dashboard integration for client intake questionnaires

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
