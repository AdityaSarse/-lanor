# Élanor Backend API Documentation

Complete API Reference & Postman Testing Guide for Élanor Backend Services.

---

## 🌐 Base URL & Headers

- **Base URL**: `http://localhost:3000/api/v1`
- **Default Headers**:
  - `Content-Type`: `application/json`
- **Authentication**:
  - Pass JWT token in `Authorization` header: `Authorization: Bearer <ACCESS_TOKEN>`
  - Or via HTTP-only Cookie: `accessToken=<ACCESS_TOKEN>`

---

## ⚙️ Environment & API Credentials Setup

Ensure your `.env` file in the `Backend` directory contains the configured API credentials:

```env
# Server & Database Configuration
PORT=3000
MONGO_URI=mongodb+srv://backend:...@backend.tuklnl7.mongodb.net/Elanor

# JWT Authentication Secrets
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Razorpay Payment Gateway Test Credentials
RAZORPAY_KEY_ID=rzp_test_TISwATuqo2S0At
RAZORPAY_KEY_SECRET=c7oHgphQto521cKcCBlprJgW
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx

# ImageKit Configuration Credentials
IMAGEKIT_PUBLIC_KEY=public_L2VyoPvg/IplNjQpJnkpqcyEZf4=
IMAGEKIT_PRIVATE_KEY=private_M+UfKpP285XyLhPJY/OafFLSZ+0=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/dqjjdtley
```

## 🔑 Test Accounts & Admin Credentials

Use these sample credentials for Postman / API testing:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@elanor.com` | `Admin@12345!` | Full system access (Products, Uploads, Refunds, Notifications) |
| **Customer** | `aditya@example.com` | `Password123!` | Customer operations (Cart, Address, Orders, Checkout) |

### 🛠️ How to Create the Admin User in Database

You can create or update the Admin user in MongoDB using any of the methods below:

#### Method 1: Automated Script (Fastest)
Run the built-in seed script from the `Backend` directory:
```bash
npm run create-admin
```
*(This automatically connects to your MongoDB database configured in `.env`, hashes `Admin@12345!`, and creates/updates `admin@elanor.com` with `role: "admin"`)*

#### Method 2: Custom Admin Credentials
To create an admin with a custom email or password:
```bash
ADMIN_EMAIL="myadmin@elanor.com" ADMIN_PASSWORD="MySecurePassword123!" npm run create-admin
```

#### Method 3: Via API + Database GUI (MongoDB Atlas / Compass)
1. Send `POST /api/v1/auth/register` with `email: "admin@elanor.com"` and `password: "Admin@12345!"`.
2. Open **MongoDB Atlas** or **MongoDB Compass**, open the `users` collection in the `Elanor` database, find your user, and edit the `role` field from `"customer"` to `"admin"`.

---

## 🔐 1. Authentication Module (`/api/v1/auth`)

### Register User
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/auth/register`
- **Body**:
```json
{
  "firstName": "Aditya",
  "lastName": "Sarse",
  "email": "aditya@example.com",
  "password": "Password123!",
  "phone": "9876543210"
}
```
*(Required: `firstName`, `lastName`, `email`, `password`. Optional: `phone` - 10-digit Indian number)*

### Login Customer User
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/auth/login`
- **Body**:
```json
{
  "email": "aditya@example.com",
  "password": "Password123!"
}
```
*(Required: `email`, `password`)*

- **Response Example**:
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "65d123456789abcdef012344",
      "firstName": "Aditya",
      "lastName": "Sarse",
      "email": "aditya@example.com",
      "role": "customer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Login Admin User
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/auth/login`
- **Body**:
```json
{
  "email": "admin@elanor.com",
  "password": "Admin@12345!"
}
```
*(Required: `email`, `password`)*

- **Response Example**:
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "65d123456789abcdef012399",
      "firstName": "System",
      "lastName": "Admin",
      "email": "admin@elanor.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

---

## 🛍️ 2. Products Module (`/api/v1/products`)

### Get All Products
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/v1/products?page=1&limit=10&search=dress`

### Create Product (Admin)
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/products`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Body**:
```json
{
  "name": "Luxury Silk Evening Dress",
  "slug": "luxury-silk-evening-dress",
  "description": "Handcrafted 100% silk luxury evening gown designed for formal elegance.",
  "gender": "Women",
  "category": "65d123456789abcdef012345",
  "brand": "65d123456789abcdef012346",
  "price": 299.99,
  "discount": 10,
  "images": [
    {
      "url": "https://ik.imagekit.io/dqjjdtley/products/luxury-silk-dress.png",
      "alt": "Front view of luxury silk evening dress"
    }
  ],
  "variants": [
    {
      "color": {
        "name": "Emerald Green",
        "hex": "#004b23"
      },
      "sizes": [
        { "size": "M", "stock": 15 },
        { "size": "L", "stock": 10 }
      ]
    }
  ],
  "status": "active",
  "isPublished": true
}
```
*(Required: `name`, `slug`, `description`, `gender`, `category`, `brand`, `price`, `images` array with at least 1 image URL, `variants` array with `color.name` & `sizes` array)*

---

## 🛒 3. Cart Module (`/api/v1/cart`)

### Get User Cart
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/v1/cart`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`

### Add Item to Cart
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/cart`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Body**:
```json
{
  "product": "65d123456789abcdef012347",
  "size": "M",
  "color": {
    "name": "Emerald Green",
    "hex": "#004b23"
  },
  "quantity": 1
}
```
*(Required: `product` MongoId, `size`, `color.name`. Optional: `quantity`, `color.hex`)*

---

## 📍 4. Address Module (`/api/v1/address`)

### Get User Addresses
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/v1/address`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`

### Add Shipping Address
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/address`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Body**:
```json
{
  "fullName": "Aditya Sarse",
  "phone": "9876543210",
  "addressLine1": "123 High Street, Bandra",
  "addressLine2": "Apartment 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400050",
  "country": "India",
  "type": "Home",
  "isDefault": true
}
```
*(Required: `fullName`, `phone` (10-digit Indian number), `addressLine1`, `city`, `state`, `postalCode` (6 digits). Optional: `addressLine2`, `landmark`, `country`, `type`, `isDefault`)*

---

## 🎟️ 5. Coupons Module (`/api/v1/coupons`)

### Validate Coupon
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/coupons/validate`
- **Body**:
```json
{
  "code": "WELCOME20",
  "subtotal": 299.99
}
```
*(Required: `code`. Optional: `subtotal`)*

---

## 📦 6. Orders Module (`/api/v1/orders`)

### Place Order
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/orders`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Body**:
```json
{
  "addressId": "65d123456789abcdef012348",
  "paymentMethod": "Razorpay",
  "couponCode": "WELCOME20",
  "customerNote": "Please deliver between 10 AM - 4 PM."
}
```
*(Required: `addressId` MongoId, `paymentMethod` ["COD", "Razorpay"]. Optional: `couponCode`, `customerNote`)*

### Get My Orders
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/v1/orders?page=1&limit=10`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`

### Update Order Status (Admin)
- **Method**: `PATCH`
- **URL**: `http://localhost:3000/api/v1/orders/65d123456789abcdef012349/status`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Body**:
```json
{
  "status": "Shipped",
  "adminNote": "Handed over to FedEx logistics partner."
}
```
*(Required: `status` ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"]. Optional: `adminNote`)*

---

## 💳 7. Payments Module (`/api/v1/payments`)

### Create Payment Order (Razorpay)
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/payments/create`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Body**:
```json
{
  "orderId": "65d123456789abcdef012349"
}
```
*(Required: `orderId` MongoId)*

- **Response**:
```json
{
  "statusCode": 200,
  "data": {
    "key": "rzp_test_TISwATuqo2S0At",
    "amount": 27999,
    "currency": "INR",
    "razorpayOrderId": "order_N123456789",
    "orderNumber": "ORD-20260726-1001"
  },
  "message": "Razorpay payment order initialized successfully"
}
```

### Verify Payment (Checkout Callback)
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/payments/verify`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Body**:
```json
{
  "orderId": "65d123456789abcdef012349",
  "razorpayOrderId": "order_N123456789",
  "razorpayPaymentId": "pay_XYZ987654321",
  "razorpaySignature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```
*(Required: `orderId`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`)*

### Razorpay Webhook Event Handler (Public / Gateway Callback)
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/payments/webhook`
- **Headers**:
  - `x-razorpay-signature`: `<HMAC_SHA256_WEBHOOK_SIGNATURE>`
  - `Content-Type`: `application/json`
- **Body** (Raw JSON):
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_XYZ987654321",
        "order_id": "order_N123456789",
        "amount": 27999,
        "currency": "INR",
        "status": "captured"
      }
    }
  }
}
```

### Refund Payment (Admin)
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/payments/65d123456789abcdef012349/refund`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Body**:
```json
{
  "reason": "Customer cancellation / Defective item return"
}
```
*(Optional: `reason`)*

---

## 🔔 8. Notifications Module (`/api/v1/notifications`)

### Test Diagnostic Email (Admin)
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/notifications/test-email`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Body**:
```json
{
  "to": "customer@example.com"
}
```
*(Required: `to`)*

### Dispatch Notification (Admin / System)
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/notifications/send`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`

#### Example: Order Placed Notification
```json
{
  "to": "customer@example.com",
  "type": "ORDER_PLACED",
  "payload": {
    "user": { "name": "Aditya Sarse", "email": "customer@example.com" },
    "order": {
      "orderNumber": "ORD-20260726-1001",
      "totalAmount": 279.99,
      "shippingFee": 0,
      "discountAmount": 20,
      "paymentMethod": "Razorpay",
      "orderStatus": "Confirmed",
      "items": [
        {
          "product": { "name": "Luxury Silk Evening Dress" },
          "quantity": 1,
          "price": 299.99,
          "itemTotal": 299.99
        }
      ],
      "shippingAddress": {
        "fullName": "Aditya Sarse",
        "addressLine1": "123 High Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400050",
        "country": "India"
      }
    }
  }
}
```
*(Required: `type` ["WELCOME", "EMAIL_VERIFICATION", "PASSWORD_RESET", "ORDER_PLACED", "ORDER_CONFIRMED", "ORDER_SHIPPED", "ORDER_DELIVERED", "ORDER_CANCELLED", "PAYMENT_SUCCESS", "REFUND_PROCESSED"]. Optional: `to`, `payload`)*

---

## 🖼️ 9. Image Upload & Optimization Module (`/api/v1/upload`)

### Upload Single Image (Admin)
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/upload/single`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Body**: `form-data`
  - `image`: `<FILE_BINARY>` *(Required - JPEG/PNG/WEBP/AVIF/GIF)*
  - `folder`: `/products` *(Optional - defaults to `/products`)*
- **Response**:
```json
{
  "statusCode": 201,
  "data": {
    "fileId": "65d987654321fedcba098765",
    "url": "https://ik.imagekit.io/dqjjdtley/products/1722000000000-dress.png",
    "fileName": "1722000000000-dress.png",
    "thumbnailUrl": "https://ik.imagekit.io/dqjjdtley/products/tr:n-ik_ml_thumbnail/1722000000000-dress.png"
  },
  "message": "Image uploaded successfully"
}
```

### Upload Multiple Images (Admin)
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/upload/multiple`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
- **Body**: `form-data`
  - `images`: `<FILE_BINARY_1>`, `<FILE_BINARY_2>` *(Required - up to 10 files)*
  - `folder`: `/products` *(Optional)*

### Delete Image from ImageKit (Admin)
- **Method**: `DELETE`
- **URL**: `http://localhost:3000/api/v1/upload/65d987654321fedcba098765`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`

### Get Image Details (Admin)
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/v1/upload/details/65d987654321fedcba098765`
- **Headers**: `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`

### Generate Dynamic Transformed URL
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/upload/transform`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Body**:
```json
{
  "url": "https://ik.imagekit.io/dqjjdtley/products/1722000000000-dress.png",
  "width": 400,
  "height": 400,
  "quality": 80,
  "format": "webp",
  "crop": "maintain_ratio"
}
```
