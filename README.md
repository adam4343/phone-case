# 📱 Custom Phone Case Designer (Next.js + Express + Stripe)

**Live demo:** https://phone-case-psi.vercel.app

This is a **full-stack e-commerce platform** for creating personalized phone cases, built using **Next.js App Router** and fully powered by a custom **Express backend**. It includes custom design uploads, real-time case preview, Stripe payments, and user authentication.

⚠️ **Note:** The backend server may take up to **10 seconds** to respond on the first request due to cold start (hosted on a free-tier server). Please be patient during the initial load.

## 💎 My Second Best Project (first is the pizza, check it: https://next-pizza-black.vercel.app/) 

This is one of my **most challenging and comprehensive projects** — a fully functional e-commerce platform with payment processing, file uploads, custom product configuration, and complete order management. I've built both the **frontend and backend** from scratch and integrated every piece.

## ✨ Key Features

### 🔐 Authentication
* ✅ **Better Auth** integration with secure sessions
* 🔁 Protected routes and user dashboard
* 👤 User profile management

### 📱 Phone Case Configurator  
* All phone models loaded from **Express backend**
* Interactive design placement with drag & drop
* **Real-time preview** of custom phone case
* Support for multiple:
  * **Phone models** (iPhone, Samsung, etc.)
  * **Case materials** (Silicone, Hard, Tough)
  * **Finishes** and colors
* Live price updates based on configuration

### 📤 File Upload System
* **Uploadthing** integration for secure image uploads
* Image validation and processing
* Support for custom designs and photos

### 💳 Payment & Orders
* **Stripe** payment processing with webhooks
* Complete checkout flow

### 💬 UX Features
* Beautiful toast notifications
* Loading states and error handling
* **Responsive design** for all devices
* Smooth transitions and animations

## 🧰 Tech Stack

| Tool / Library | Purpose |
|---|---|
| **Next.js ** | App Router, SSR, Routing |
| **TypeScript** | Type-safe codebase |
| **Tailwind CSS** | Styling + design system |
| **Express.js** | Backend server & API |
| **SQLite** | Database with migrations |
| **Stripe** | Payment processing |
| **Uploadthing** | File upload handling |
| **Better Auth** | Authentication system |
| **Zustand** | Global state management |

## 🔁 Fully Connected to Express Backend

Every piece of data — phone models, configurations, orders, payments — is served and managed by a **custom-built Express + SQLite backend**.

### Backend features:
* Custom authentication with Better Auth
* REST API for products, orders, configurations
* Stripe webhook handling for payments
* File upload management
* SQLite database with proper relationships

---

# 📱 Phone Case Backend (Express + SQLite + Stripe)

This is the backend service for the full-stack phone case designer. It's built using **Express**, with **Better Auth integration**, **Stripe payment processing**, and features **order management**, **file handling**, and **SQLite database** integration.

## 🚀 Features

* ✅ **User Authentication**
  * **Better Auth** integration
  * Secure session management
* 📱 **Product Management**  
  * Phone models and case options
  * Configuration storage
* 📤 **File Handling**
  * **Uploadthing** integration
  * Image processing and validation
* 💳 **Payment Processing**
  * **Stripe** integration with webhooks
  * Order creation
* 📦 **Order Management**
  * Complete order lifecycle
  * Status tracking and updates
* 🧱 **Database**
  * Powered by **SQLite**
  * Proper relationships and migrations

## 🧰 Backend Tech Stack

| Technology | Description |
|---|---|
| **Express.js** | Backend server & routing |
| **SQLite** | Lightweight database |
| **Stripe** | Payment processing & webhooks |
| **Uploadthing** | File upload management |
| **Better Auth** | Authentication system |
| **Zod** | Request/response validation |

## 📊 Database Schema

* **Users** - Authentication and profiles
* **Configurations** - Custom phone case designs  
* **Orders** - Order tracking and payment status
* **Products** - Phone models and case options
