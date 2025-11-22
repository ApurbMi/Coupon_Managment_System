

# 1. Project Overview

This project is a backend service for managing discount coupons and returning the best coupon for a user.
The system evaluates coupons using user details, cart value, item categories, usage limits, and date validity.
The project is built using **Express.js** and **JSON file storage**.

**Endpoints include:**

* `/create-coupon` → for adding new coupons
* `/return-coupon` → for selecting the best coupon

---

# 2. Tech Stack

* **Language:** JavaScript (Node.js)
* **Framework:** Express.js
* **Storage:** JSON file
* **Libraries:** express, fs, path

---

# 3. Data Structures

### User Structure (request format)

```json
{
  "user": {
    "userId": "u123",
    "userTier": "NEW",
    "country": "IN",
    "lifetimeSpend": 1200,
    "ordersPlaced": 2
  },
  "cart": {
    "items": [
      { "productId": "p1", "category": "electronics", "unitPrice": 1500, "quantity": 1 },
      { "productId": "p2", "category": "fashion", "unitPrice": 500, "quantity": 2 }
    ]
  }
}
```

### Cart Structure (always inside userData)

```json
{
  "items": [
    {
      "productId": "p1",
      "category": "fashion",
      "unitPrice": 500,
      "quantity": 1
    }
  ]
}
```

### Modified Coupon Structure (output after processing)

```json
{
  "code": "WELCOME100",
  "endDate": "2025-12-31",
  "discount": 150
}
```

**Explanation:**

* `code` → coupon code
* `endDate` → expiry date
* `discount` → final calculated discount based on user cart (flat or percent)

**Sorting rules for best coupon:**

1. Higher discount
2. Earlier expiry date
3. Alphabetically smaller code

> The best coupon from the sorted list is sent in response.

---

# 4. How to Run

**Prerequisites:**

* Node.js 18+

**Setup:**

```bash
git clone https://github.com/ApurbMi/Coupon_Managment_System.git
cd Coupon_Managment_System
npm install
```

**Start server:**

```bash
npm start
```

Or using nodemon:

```bash
npx nodemon index
```

---

# 5. How to Run Tests (Optional)

If using Jest:

```bash
npm test
```

---

## 6. AI Usage Note

AI tools (ChatGPT) were used as a helper for the following:

* Generating 10 sample coupons for testing
* Generating user objects based on those coupons
* Understanding how sorting works under different conditions

**Prompts used:**

* "Generate 10 sample coupons for testing as per given Object structure"
* "Generate user data that matches the coupon eligibility"
* "Explain how sorting works when multiple conditions are applied"

---

## API Testing Guide

### 1. Create a Coupon

**POST Request**
**URL:** `https://coupon-managment-system-yuio.onrender.com/create-coupon`

**Body Format:**

```json
{
  "code": "TEST100",
  "description": "Flat 100 off",
  "discountType": "FLAT",
  "discountValue": 100,
  "maxDiscountAmount": 100,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "usageLimitPerUser": 2,
  "eligibility": {
    "allowedUserTiers": ["REGULAR", "GOLD"],
    "minLifetimeSpend": 0,
    "minOrdersPlaced": 0,
    "firstOrderOnly": false,
    "allowedCountries": ["IN"],
    "minCartValue": 0,
    "applicableCategories": [],
    "excludedCategories": [],
    "minItemsCount": 0
  }
}
```

---

### 2. Get the Best Coupon

**PUT Request**
**URL:** `https://coupon-managment-system-yuio.onrender.com/return-coupon`

**Body Format:**

```json
{
  "user": {
    "userId": "u123",
    "userTier": "NEW",
    "country": "IN",
    "lifetimeSpend": 1200,
    "ordersPlaced": 2
  },
  "cart": {
    "items": [
      { "productId": "p1", "category": "electronics", "unitPrice": 1500, "quantity": 1 },
      { "productId": "p2", "category": "fashion", "unitPrice": 500, "quantity": 2 }
    ]
  }
}
```

---

