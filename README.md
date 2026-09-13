# 🚗 ParkEase – Smart Parking Spot Finder

ParkEase is an intelligent parking management system that helps users find and reserve parking spaces in real time.  
It reduces time spent searching for parking, minimizes traffic congestion, and improves overall parking efficiency.

---

## ✨ Features

- 🔍 Real-time parking slot availability  
- 📅 Online parking slot booking  
- 🧑‍💻 User dashboard for bookings & history  
- 🏢 Owner dashboard for parking management  
- ⚡ Fast and responsive UI
- 🤖 AI Chatbot available
- 🤖 AI-based insights (future scope)

---

## 🛠️ Tech Stack

**Frontend:** React.js  
**Backend:** Java, Spring Boot  
**AI:** Groq API (LLaMA models)
**Database:** MySQL  
**Tools:** Git, GitHub, Postman, VS Code  

---

## 🚀 How to Use

### 👤 As a User

1. Register / Login to the platform  
2. Open the **User Dashboard**  
3. Browse available parking locations (Mall, Hospital, etc.)  
4. View available slots in real-time  
5. Select a slot and click **"Book Now"**  
6. Confirm booking  
7. View booking details in dashboard
8. Ask queries in AI chatbot

✅ Result: You get a reserved parking slot without wasting time.

---

### 🏢 As a Parking Owner 

1. Login to the system  
2. Open the **Owner Dashboard**  
3. Add or manage parking slots  
4. Monitor slot availability (Available / Reserved)  
5. Track user bookings  
6. Update slot status dynamically  

✅ Result: Efficient parking management with full control.

---

## 🔄 Workflow (System Flow)

1. User searches for parking  
2. Frontend sends request to backend  
3. Backend fetches slot data from database  
4. Available slots are displayed to user  
5. User books a slot  
6. Booking is stored in database  
7. Slot status updates in real-time  

---

## ⚙️ Setup & Installation Guide

Follow the steps below to run the project locally.

---

## 🔽 1. Clone the Repository

git clone https://github.com/Rishi-codess/ParkEase.git
cd parkease


## 📦 2. Backend Setup (Spring Boot)
cd backend

Open the project in IntelliJ / Eclipse

Configure database in application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/parkease
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

Run the Spring Boot application

✅ Backend will run on:
http://localhost:8080

## 💾 3. Database Setup (MySQL)

Open MySQL Workbench

Create database:

CREATE DATABASE parkease;

Tables will be automatically created when backend runs

## ✅ 4.Setup AI Chatbot:

1. Create a .env file in backend folder
2. Add your Groq API key:

   GROQ_API_KEY=your_key_here

3. Run backend and frontend



## 🎨 5. Frontend Setup (React)
cd frontend
npm install
npm start

✅ Frontend will run on:
http://localhost:3000

## 🔗 6. Connect Frontend with Backend

Make sure the API base URL is:

http://localhost:8080/api

## ▶️ 7. Run the Application

Start Backend (Spring Boot)

Start Frontend (React)

Open browser → http://localhost:3000

## 🌍 Problem Solved

-  Time wasted in searching parking  
-  Traffic congestion inside parking areas  
-  Lack of real-time parking information  
-  Inefficient parking management  

---

## 🎯 Future Enhancements

- 📱 Mobile application (Android & iOS)  
- 📍 GPS navigation to parking slot  
- 💳 Online payment integration  
- 🤖 AI-based parking prediction  

---

## 👥 Team Members

- Rishi Gupta – Frontend & GitHub  
- Sakshi Shinde – Backend  
- Banu Priya B – Database & Backend  
- Krithiga Yogasri – Frontend  
- Priyanka Manjarekar – Frontend  
- Bhavitra S – Backend & Deployment  

---

## 🧠 AI Chatbot Overview

The chatbot is powered by an LLM API (Groq) and works as follows:

Frontend (React) → Backend (Spring Boot) → AI API → Backend APIs → Database

It converts user messages into structured actions and executes real backend operations.

---

## 🔑 How to Get Groq API Key

- Go to: https://console.groq.com/
- Sign up / login
- Generate API key
- Copy the key

---

## 📌 Important Notes
- .env file is not pushed to GitHub (for security)
- Each developer must create their own .env file
- Do not expose API keys publicly


## 📌 Conclusion

ParkEase provides a smart and scalable solution for modern parking problems.  
It improves user convenience, reduces congestion, and supports the vision of smart cities.

---
