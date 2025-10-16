# 🏠 A–Z Household Services Application

### **Project Title:** A–Z Household Services  
**Course:** Modern Application Development II (MAD–2)  
**Author:** Priyanshu Yadav  
**Roll No:** 23f1000018  
**Email:** 23f1000018@ds.study.iitm.ac.in  
**Institute:** IIT Madras BS Program  

---

## 📘 Project Overview

**A–Z Household Services** is a full-stack web application designed to help users book household services — such as cleaning, plumbing, or electrical repair — from verified professionals.  
It provides separate dashboards for **Admins**, **Customers**, and **Professionals** to manage bookings, services, and feedback efficiently.

Think of it as a simplified version of platforms like **UrbanClap** or **JustDial**, where users can find, book, and rate professionals — all in one place.

---

## 🚀 Key Features

- 🔐 **Role-based Authentication** – Separate login for Admin, Customer, and Professional.  
- 🧰 **Service Management** – Admin can add, update, or remove available services.  
- 👷 **Professional Management** – Admin can manage professional listings and their availability.  
- 👥 **Customer Management** – Admin can monitor customers and their service requests.  
- 📅 **Booking & Cancellation** – Customers can book and cancel service requests easily.  
- ⭐ **Ratings & Reviews** – Customers can rate and review completed services.  
- 🔍 **Search Functionality** – Search by service name, professional name, location, or pincode.  
- ⏰ **Background Jobs** – Automated daily reminders and monthly reports using Celery.  
- 📊 **CSV Export** – Admin can export complete service request details in CSV format.  
- ⚡ **Caching** – Redis caching for faster response times.  
- 🎨 **Responsive UI** – Clean and user-friendly design using Bootstrap.

---

## 🏗️ Project Architecture

The project is divided into five main components:

1. **Backend Folder**  
   - Contains all RESTful APIs (Flask-based)  
   - Includes Celery configuration and scheduled tasks (for reminders and reports)

2. **Frontend Folder**  
   - Built with Vue.js  
   - Contains all components, routes (`app.js`), and styling (`style.css`)  
   - Uses Bootstrap for clean and responsive design

3. **Instance Folder**  
   - Stores the SQLite database (`instance/` directory)

4. **Uploads Folder**  
   - Stores PDF files uploaded by professionals

5. **Main Entry File: `main.py`**  
   - Initializes the Flask app  
   - Handles Celery beat schedules and configurations  

---

## 🧩 Database Design

### **Entities and Relationships**
- **Tables:** User, Customer, Professional, Service, ServiceRequest, Review  
- **Many-to-Many Relationship:**  
  Between **Professional** and **Service** (one professional can offer multiple services and vice versa)  
- A joint table is used to manage this relationship.

---

## ⚙️ Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | Vue.js |
| **Backend** | Flask (Python) |
| **Database** | SQLite |
| **Background Tasks** | Celery |
| **Caching** | Redis |
| **Authentication** | Flask-Security |
| **Styling** | Bootstrap |
| **Visualization** | Matplotlib (for admin reports) |

---

## 🔧 Setup and Installation

1. Clone the repository
git clone https://github.com/priyanshuyadav705/A-Z-Household-Services.git
cd A-Z-Household-Services
3. Create a Virtual Environment
bash
Copy code
python -m venv venv
source venv/bin/activate  # For macOS/Linux
venv\Scripts\activate     # For Windows
4. Install Dependencies
bash
Copy code
pip install -r requirements.txt
5. Run the Application
bash
Copy code
python main.py
💡 Make sure Redis is running before starting Celery for background jobs.

## 🧠 How to Use

Open the app in your browser at [http://localhost:5000/](http://localhost:5000/)

### Roles & Functionalities

**Customers can:**
- Search for services
- Book, cancel, and rate services

**Professionals can:**
- Accept or reject service requests
- Upload PDFs (proofs or reports)

**Admins can:**
- Manage users, services, and reports
- Export CSV data
- Monitor reminders and reports

---

## 🔁 Background Jobs (Celery)

- **Daily Reminder Job:** Sends automated reminders to professionals about upcoming services.  
- **Monthly Report Job:** Generates monthly summary reports for the admin.  
- **CSV Export:** Allows admins to download booking details in `.csv` format.  

These jobs run through **Celery Beat** with **Redis** as the broker.

---

## 💡 Challenges and Solutions

| Challenge | Solution |
|-----------|---------|
| Circular imports between Celery and Flask app | Split configuration into `celery.py`, `tasks.py`, and `main.py` |
| API communication errors between Flask and Vue | Used proper CORS handling and modularized API routes |
| Slow response for repeated queries | Implemented Redis caching |
| Data synchronization and task scheduling | Integrated Celery with periodic beat tasks |

---

## 🎥 Demo Video

🔗 [**Watch the demo on Google Drive**](https://drive.google.com/file/d/1QGXQeBoITN-B_qaPG-QnUjMMIj64p4gU/view?usp=sharing)

---

## 🧾 License

This project was created as part of the **IIT Madras BS – Modern Application Development II** course.  
It is for educational purposes and open for learning or extension.

---

## 🙌 Acknowledgements

- **IIT Madras BS Program** for the MAD–II course structure.  
- **Flask, Vue.js, Celery, and Redis communities** for their excellent documentation.  

**Developed by:**  
👨‍💻 Priyanshu Yadav  
📧 23f1000018@ds.study.iitm.ac.in
