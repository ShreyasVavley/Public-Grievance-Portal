# 🏙️ Bengaluru Sahaya Portal

**Empowering Citizens. Verifying Action. Resolving Bengaluru.**

[🚀 View Live Site](https://bengaluru-sahaya-portal.vercel.app)
[⚙️ Backend API](https://public-grievance-portal.onrender.com/docs)

Bengaluru Sahaya is a modern, AI-powered civic grievance portal designed to streamline the reporting and resolution of urban issues like garbage accumulation, potholes, water leaks, and electricity faults. By leveraging computer vision and a brutalist design aesthetic, we ensure that every community report is verified, tracked, and resolved with transparency.

---

## 🚀 Key Features

- **🧠 AI Photo Verification**: Integrates YOLOv8 via FastAPI to automatically verify the authenticity and category of reported grievances from uploaded photos.
- **⚡ Brutalist UI/UX**: A bold, high-contrast interface built with Next.js and Tailwind CSS, designed for speed and clarity.
- **🤖 Maya AI Chatbot**: A friendly AI assistant to help citizens navigate the portal and file reports via natural language.
- **📱 Multilingual Support**: Fully localized in English and Kannada to reach every citizen of Bengaluru.
- **📋 Admin Dashboard**: A comprehensive command center for city officials to review AI-verified reports, dispatch teams, and track resolution timelines.
- **🚨 Civic Directory**: Quick access to essential contact numbers for BBMP, BWSSB, BESCOM, and Emergency services.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Heroicons](https://heroicons.com/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Motor Async Driver)
- **AI/ML**: [YOLOv8](https://ultralytics.com/) (Ultralytics)
- **Communication**: [Twilio](https://www.twilio.com/) (SMS OTP Verification)
- **Environment**: [Uvicorn](https://www.uvicorn.org/)

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Atlas Account

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root (see `.env.example`).
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment

For detailed deployment instructions on Vercel (Frontend), Render (Backend), and MongoDB Atlas, please refer to our **[Deployment Guide](.gemini/antigravity/brain/1abb323d-83f1-4de4-a2ec-0d995173124a/DEPLOYMENT.md)**.

---

## 🤝 Contribution

Bengaluru Sahaya is a community-driven project. We welcome contributions that help make our city cleaner and safer.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ for **Namma Bengaluru**.
