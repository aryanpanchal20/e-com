# REST API Specification

This document defines the RESTful API endpoints for the Mini E-Commerce platform, detailing URL routes, HTTP methods, authentication requirements, query parameters, request bodies, and standard responses.

---

## 1. Global API Conventions

### Base URL
```text
http://localhost:5000/api
```

### Headers
- **Content-Type:** `application/json` (Required for all `POST`, `PUT`, and `PATCH` requests)
- **Authorization:** `Bearer <JWT_TOKEN>` (Required for all protected customer and admin routes)

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Detailed error explanation",
  "errors": []
}
```

---

## 2. Authentication Endpoints

### 2.1 Register Customer
Create a new customer account.

- **Method:** `POST`
- **Route:** `/api/auth/register`
- **Access:** Public

#### Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Responses
- **201 Created:** Account registered successfully.
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "651a2b3c4d5e6f7a8b9c0d1e",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
  ```
- **400 Bad Request:** Missing fields, passwords mismatch, or email already registered.
  ```json
  {
    "success": false,
    "message": "Passwords do not match"
  }
  ```

---

### 2.2 Login User (Customer & Admin)
Authenticate an existing customer or admin.

- **Method:** `POST`
- **Route:** `/api/auth/login`
- **Access:** Public

#### Request Body
```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

#### Responses
- **200 OK:** Login verified.
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "651a2b3c4d5e6f7a8b9c0d1e",
      "name": "Store Admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
  ```
- **401 Unauthorized:** Invalid email or password.
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

---

## 3. Category Endpoints

### 3.1 Get All Categories
Retrieve all available categories for navigation and filtering.

- **Method:** `GET`
- **Route:** `/api/categories`
- **Access:** Public

#### Response (200 OK)
```json
{
  "success": true,
  "count": 3,
  "categories": [
    {
      "_id": "651a2c114d5e6f7a8b9c0d20",
      "name": "Electronics",
      "description": "Smartphones, laptops, and gadgets",
      "createdAt": "2026-10-01T10:00:00.000Z"
    },
    {
      "_id": "651a2c114d5e6f7a8b9c0d21",
      "name": "Fashion",
      "description": "Apparel, clothing, and accessories",
      "createdAt": "2026-10-01T10:05:00.000Z"
    }
  ]
}
```

---

### 3.2 Add Category
Create a new category.

- **Method:** `POST`
- **Route:** `/api/categories`
- **Access:** Private (Admin only)
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

#### Request Body
```json
{
  "name": "Shoes",
  "description": "Sneakers, running shoes, and formal footwear"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Category created successfully",
  "category": {
    "_id": "651a2c114d5e6f7a8b9c0d22",
    "name": "Shoes",
    "description": "Sneakers, running shoes, and formal footwear",
    "createdAt": "2026-10-02T12:00:00.000Z"
  }
}
```

---

### 3.3 Edit Category
Update category name and/or description.

- **Method:** `PUT`
- **Route:** `/api/categories/:id`
- **Access:** Private (Admin only)
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

#### Request Body
```json
{
  "name": "Footwear",
  "description": "All kinds of shoes and sandals"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Category updated successfully",
  "category": {
    "_id": "651a2c114d5e6f7a8b9c0d22",
    "name": "Footwear",
    "description": "All kinds of shoes and sandals"
  }
}
```

---

### 3.4 Delete Category
Remove an existing category.

- **Method:** `DELETE`
- **Route:** `/api/categories/:id`
- **Access:** Private (Admin only)
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 4. Product Endpoints

### 4.1 Get All Products (Filter & Search)
Retrieve catalog items with support for search and category filtering.

- **Method:** `GET`
- **Route:** `/api/products`
- **Access:** Public
- **Query Parameters:**
  - `category`: Category ObjectId or slug/name (optional)
  - `search`: Keyword string matched against product name or description (optional)

#### Example Request
```text
GET /api/products?category=651a2c114d5e6f7a8b9c0d20&search=phone
```

#### Response (200 OK)
```json
{
  "success": true,
  "count": 1,
  "products": [
    {
      "_id": "651a30004d5e6f7a8b9c0d30",
      "name": "Pro Smartphone X",
      "description": "128GB Storage, AMOLED Display, 5G Ready",
      "price": 699.99,
      "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
      "category": {
        "_id": "651a2c114d5e6f7a8b9c0d20",
        "name": "Electronics"
      },
      "stock": 15,
      "createdAt": "2026-10-02T11:00:00.000Z"
    }
  ]
}
```

---

### 4.2 Get Single Product
Fetch detailed product information.

- **Method:** `GET`
- **Route:** `/api/products/:id`
- **Access:** Public

#### Response (200 OK)
```json
{
  "success": true,
  "product": {
    "_id": "651a30004d5e6f7a8b9c0d30",
    "name": "Pro Smartphone X",
    "description": "128GB Storage, AMOLED Display, 5G Ready",
    "price": 699.99,
    "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    "category": {
      "_id": "651a2c114d5e6f7a8b9c0d20",
      "name": "Electronics"
    },
    "stock": 15
  }
}
```

---

### 4.3 Add Product
Create a new product item.

- **Method:** `POST`
- **Route:** `/api/products`
- **Access:** Private (Admin only)
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

#### Request Body
```json
{
  "name": "Pro Smartphone X",
  "description": "128GB Storage, AMOLED Display, 5G Ready",
  "price": 699.99,
  "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "category": "651a2c114d5e6f7a8b9c0d20",
  "stock": 15
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "651a30004d5e6f7a8b9c0d30",
    "name": "Pro Smartphone X",
    "price": 699.99,
    "stock": 15
  }
}
```

---

### 4.4 Edit Product
Update an existing product.

- **Method:** `PUT`
- **Route:** `/api/products/:id`
- **Access:** Private (Admin only)
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

#### Request Body
```json
{
  "name": "Pro Smartphone X 256GB",
  "description": "Updated model with larger storage",
  "price": 749.99,
  "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "category": "651a2c114d5e6f7a8b9c0d20",
  "stock": 20
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "_id": "651a30004d5e6f7a8b9c0d30",
    "name": "Pro Smartphone X 256GB",
    "price": 749.99,
    "stock": 20
  }
}
```

---

### 4.5 Delete Product
Remove a product from the database.

- **Method:** `DELETE`
- **Route:** `/api/products/:id`
- **Access:** Private (Admin only)
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 5. Order Endpoints

### 5.1 Place Order (Checkout)
Submits a customer order with Cash on Delivery (COD). Product prices are re-queried and validated from MongoDB on the server.

- **Method:** `POST`
- **Route:** `/api/orders`
- **Access:** Private (Customer / Authenticated User)
- **Headers:** `Authorization: Bearer <USER_TOKEN>`

#### Request Body
```json
{
  "products": [
    {
      "product": "651a30004d5e6f7a8b9c0d30",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "name": "Jane Doe",
    "phone": "9876543210",
    "address": "42 High Street, Suite 10",
    "city": "Metropolis",
    "pincode": "100001"
  }
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "651a45004d5e6f7a8b9c0d40",
    "user": "651a2b3c4d5e6f7a8b9c0d1e",
    "products": [
      {
        "product": "651a30004d5e6f7a8b9c0d30",
        "name": "Pro Smartphone X 256GB",
        "price": 749.99,
        "quantity": 2,
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
      }
    ],
    "totalAmount": 1499.98,
    "shippingAddress": {
      "name": "Jane Doe",
      "phone": "9876543210",
      "address": "42 High Street, Suite 10",
      "city": "Metropolis",
      "pincode": "100001"
    },
    "status": "Pending",
    "createdAt": "2026-10-02T12:30:00.000Z"
  }
}
```

---

### 5.2 Get My Orders
Retrieve all orders submitted by the logged-in customer.

- **Method:** `GET`
- **Route:** `/api/orders/my-orders`
- **Access:** Private (Customer)
- **Headers:** `Authorization: Bearer <USER_TOKEN>`

#### Response (200 OK)
```json
{
  "success": true,
  "count": 1,
  "orders": [
    {
      "_id": "651a45004d5e6f7a8b9c0d40",
      "totalAmount": 1499.98,
      "status": "Pending",
      "createdAt": "2026-10-02T12:30:00.000Z",
      "products": [
        {
          "name": "Pro Smartphone X 256GB",
          "quantity": 2,
          "price": 749.99,
          "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
        }
      ]
    }
  ]
}
```

---

### 5.3 Get All Orders (Admin)
Retrieve all orders placed across the store.

- **Method:** `GET`
- **Route:** `/api/admin/orders`
- **Access:** Private (Admin only)
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

#### Response (200 OK)
```json
{
  "success": true,
  "count": 1,
  "orders": [
    {
      "_id": "651a45004d5e6f7a8b9c0d40",
      "user": {
        "_id": "651a2b3c4d5e6f7a8b9c0d1e",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "totalAmount": 1499.98,
      "shippingAddress": {
        "name": "Jane Doe",
        "phone": "9876543210",
        "address": "42 High Street, Suite 10",
        "city": "Metropolis",
        "pincode": "100001"
      },
      "status": "Pending",
      "createdAt": "2026-10-02T12:30:00.000Z"
    }
  ]
}
```

---

### 5.4 Update Order Status (Admin)
Transition order lifecycle status.

- **Method:** `PATCH`
- **Route:** `/api/admin/orders/:id/status`
- **Access:** Private (Admin only)
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`

#### Allowed Status Values
- `Pending`
- `Confirmed`
- `Shipped`
- `Delivered`
- `Cancelled`

#### Request Body
```json
{
  "status": "Confirmed"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Order status updated to Confirmed",
  "order": {
    "_id": "651a45004d5e6f7a8b9c0d40",
    "status": "Confirmed",
    "updatedAt": "2026-10-02T12:35:00.000Z"
  }
}
```
