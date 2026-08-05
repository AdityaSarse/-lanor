Élanor - Luxury Fashion E-Commerce Platform
<p align="center"> <img src="./Frontend/public/banner1.png" alt="Élanor Banner" width="100%" /> </p> <p align="center"> <strong>A Modern Full-Stack Luxury Fashion E-Commerce Platform</strong><br> Built using the MERN Stack with secure authentication, admin dashboard, product management, Razorpay payments, ImageKit integration, and a premium shopping experience. </p>
📖 Overview

Élanor is a production-ready luxury fashion e-commerce platform designed to deliver a seamless shopping experience for customers while providing administrators with a comprehensive management dashboard.

The platform enables users to browse fashion collections, manage their shopping cart and wishlist, securely complete purchases, and track orders. Administrators can efficiently manage products, categories, brands, customers, coupons, orders, payments, and analytics through a modern dashboard.

✨ Features
👤 Customer Features
User Registration & Login
JWT Authentication
Secure Password Encryption
Forgot & Reset Password
Profile Management
Address Management
Browse Products
Search Products
Category Filtering
Brand Filtering
Price Filtering
Wishlist
Shopping Cart
Coupon Support
Razorpay Payment Gateway
Order Tracking
Order History
Product Reviews & Ratings
Responsive Design
🛠 Admin Features
Secure Admin Login
Dashboard Analytics
Product Management
Category Management
Brand Management
Customer Management
Order Management
Coupon Management
Review Moderation
Inventory Management
Image Upload
Notifications
Sales Overview
🚀 Tech Stack
Frontend
React.js
Vite
React Router DOM
Axios
Tailwind CSS
Framer Motion
React Context API
Lucide React
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
Bcrypt
Multer
ImageKit SDK
Razorpay SDK
Nodemailer
Cookie Parser
CORS
Database
MongoDB Atlas
Cloud Services
ImageKit
Razorpay
Render
Vercel
📂 Project Structure
Elanor/
│
├── Backend/
│   ├── src/
│   │
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── app.js
│   └── server.js
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── App.jsx
│
└── README.md
🔐 Authentication

The application uses JWT-based authentication with access and refresh tokens.

Features include:

User Registration
User Login
Admin Login
Protected Routes
Role-Based Authorization
Persistent Authentication
Secure Logout
🛍 Product Management

Administrators can:

Add Products
Edit Products
Delete Products
Upload Images
Manage Variants
Manage Sizes
Manage Colors
Manage Stock
Set Discounts
Feature Products
📦 Order Management
Place Orders
Order History
Order Details
Payment Status
Order Status Updates
Cancel Orders
Track Deliveries
❤️ Wishlist

Customers can:

Add Products
Remove Products
Move to Cart
🛒 Shopping Cart
Add Products
Update Quantity
Remove Products
Apply Coupons
Dynamic Price Calculation
💳 Payment Gateway

Integrated with Razorpay.

Supports:

Secure Payments
Test Mode
Payment Verification
Order Creation
🖼 Image Management

Images are managed using ImageKit.

Features:

Product Image Upload
Optimized Image Delivery
Image Compression
CDN Support
📊 Admin Dashboard

Dashboard includes:

Revenue Overview
Orders
Customers
Products
Sales Analytics
Recent Orders
Inventory Status
📱 Responsive Design

Fully optimized for:

Desktop
Laptop
Tablet
Mobile
⚡ Performance Optimizations
Lazy Loading
Image Optimization
Optimized API Calls
Code Splitting
Responsive Images
Efficient State Management
🔧 Environment Variables
Backend (.env)
MONGO_URI=

PORT=3000

JWT_SECRET=

ACCESS_TOKEN_SECRET=

REFRESH_TOKEN_SECRET=

CORS_ORIGIN=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
Frontend (.env)
VITE_API_URL=
VITE_RAZORPAY_KEY_ID=
💻 Installation
Clone Repository
git clone https://github.com/your-username/Elanor.git

cd Elanor
Backend Setup
cd Backend

npm install

npm run dev
Frontend Setup
cd Frontend

npm install

npm run dev
🌐 Deployment
Frontend
Vercel
Backend
Render
Database
MongoDB Atlas
Images
ImageKit
📸 Screens
Landing Page
Product Listing
Product Details
Shopping Cart
Wishlist
Checkout
User Dashboard
Admin Dashboard
Product Management
Order Management
📌 Future Enhancements
AI Product Recommendations
Recently Viewed Products
Product Comparison
Email Notifications
Inventory Alerts
Multi-language Support
Multi-currency Support
Advanced Analytics
Seller Portal
Dark Mode
👨‍💻 Developer

Aditya Sarse

GitHub: https://github.com/AdityaSarse

📄 License

This project is developed for educational and portfolio purposes.

<p align="center"> ⭐ If you found this project helpful, consider giving it a star on GitHub! </p>
