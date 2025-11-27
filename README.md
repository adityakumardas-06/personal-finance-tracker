Personal Finance Tracker – Assignment Submission

This is my submission for the TechBridge assignment.
The project is a full-stack Personal Finance Tracker where users can log in, manage transactions, and understand their financial summary in a clean dashboard.

Below are the required submission details:


---

🔗 Submission Links

1️⃣ GitHub Repository

👉 https://github.com/adityakumardas-06/personal-finance-tracker

2️⃣ Live Deployed Link (Frontend – Vercel)

👉 https://personal-finance-tracker-kappa-taupe.vercel.app

> Note: Backend APIs run locally (Node.js + PostgreSQL).
UI is fully deployed, but database operations require backend to be running.




---

3️⃣ Login Credentials (Demo Users)

Role	Email	Password	Access

Admin	admin@example.com	Admin@123	Add / Edit / View all data
User	user@example.com	User@123	Add + View only own data
Read-Only	readonly@example.com	ReadOnly@123	Only view (no create actions)


These roles are implemented to demonstrate Authentication + Authorization + Role-Based Access Control (RBAC).


---

🧩 Project Overview

The Personal Finance Tracker helps users manage their income and expenses easily.
Primary focus areas for this assignment:

Login + Role-based dashboard

Add and view transactions

Total balance and category-wise data

Backend caching (Redis) to improve performance

Clean UI made with React (Vite)

Database operations using PostgreSQL

API development using Node.js + Express



---

🛠 Tech Stack

Frontend

React (Vite)

Context API (Auth state)

Simple and clean UI


Backend

Node.js + Express

PostgreSQL

JWT Authentication

Redis (Caching)

Role-Based Access


Deployment

Vercel for frontend

Backend tested locally



---

📂 Project Structure

personal-finance-tracker/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── db/
│   │   └── index.js
│   ├── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
│   ├── index.html
│   ├── package.json
│
└── README.md


---

⚙️ Setup Instructions (Local Environment)

Backend Setup

cd backend
npm install

Create .env:

PORT=5000
DATABASE_URL=postgres://<user>:<password>@localhost:5432/finance_db
JWT_SECRET=my_secret_key
REDIS_URL=redis://localhost:6379

Start backend:

npm run dev


---

Frontend Setup

cd frontend
npm install
npm run dev

Open:
http://localhost:5173


---

⚡ Performance Testing Summary

Request	Without Cache	With Cache

/transactions	~150–200 ms	~10–20 ms


This demonstrates Redis caching working correctly.


---

🧪 Test Scenarios Covered

✔ Valid + invalid login

✔ Admin access check

✔ Read-only access restrictions

✔ API rate test

✔ Cache hit/miss timing test


---

👨‍💻 Author

Aditya Kumar Das
Roll:220104006
Email:220104006@hbtu.ac.in
Final Year B.Tech CSE, HBTU Kanpur
TechBridge Assignment Submission
