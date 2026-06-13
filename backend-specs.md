# Rasidi Tomyam POS — Backend API Reference

**Stack:** Laravel 13 · PHP 8.5 · PostgreSQL · Laravel Sanctum

---

## Base URL

```
/api
```

All requests and responses use `application/json`.

---

## Authentication

All endpoints (except `POST /auth/login` and `GET /receipts/{token}`) require a Bearer token.

```
Authorization: Bearer {token}
```

Obtain token via `POST /auth/login`. Tokens do not expire unless manually revoked.

---

## Roles & Permissions

| Permission | super_admin | manager | supervisor | cashier | server |
|---|:---:|:---:|:---:|:---:|:---:|
| view-menu | ✓ | ✓ | ✓ | ✓ | ✓ |
| create-menu | ✓ | ✓ | | | |
| update-menu | ✓ | ✓ | | | |
| delete-menu | ✓ | ✓ | | | |
| view-orders | ✓ | ✓ | ✓ | ✓ | |
| create-orders | ✓ | ✓ | | ✓ | ✓ |
| update-order-status | ✓ | ✓ | ✓ | ✓ | ✓ |
| sync-external-orders | ✓ | ✓ | | | |
| view-customers | ✓ | ✓ | ✓ | ✓ | |
| view-expenses | ✓ | ✓ | ✓ | | |
| create-expenses | ✓ | ✓ | ✓ | | |
| view-reports | ✓ | ✓ | ✓ | | |
| manage-tables | ✓ | ✓ | | | |

> Permission middleware is enforced on all protected routes. Unauthorized access returns `403 {"message": "User does not have the right permissions."}`

---

## Enums Reference

### Order Status
| Value | Description |
|---|---|
| `pending` | Order created, awaiting kitchen |
| `preparing` | Kitchen acknowledged |
| `served` | Food delivered to table |
| `paid` | Payment collected |
| `cancelled` | Order cancelled |

**Allowed transitions:**
```
pending → preparing → served → paid
pending → cancelled
preparing → cancelled
served → cancelled
```
Invalid transitions return `422`.

### Order Platform
| Value |
|---|
| `pos` |
| `customer_pwa` |
| `foodpanda` |
| `shopeefood` |

### Payment Method
| Value |
|---|
| `cash` |
| `card` |
| `online` |

### Menu Category
| Value |
|---|
| `food` |
| `drink` |

### Expense Type
| Value |
|---|
| `salary` |
| `inventory` |
| `utility` |
| `other` |

---

## Common Response Patterns

### Paginated list
```json
{
  "data": [...],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 3, "per_page": 50, "total": 120 }
}
```

### Validation error — `422`
```json
{
  "message": "The name field is required.",
  "errors": {
    "name": ["The name field is required."]
  }
}
```

### Not found — `404`
```json
{ "message": "No query results for model [App\\Models\\Order]." }
```

### Unauthenticated — `401`
```json
{ "message": "Unauthenticated." }
```

---

## Endpoints

---

### Auth

#### `POST /auth/login`

No auth required.

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response `200`**
```json
{
  "token": "1|abc123...",
  "user": {
    "id": 1,
    "name": "Nuha Ilya",
    "email": "nuhailya.dev@gmail.com",
    "phone": null,
    "roles": ["super_admin"],
    "created_at": "2026-06-13T00:00:00.000000Z"
  }
}
```

**Errors:** `422` invalid credentials.

---

#### `GET /auth/me`

Returns the currently authenticated user.

**Response `200`**
```json
{
  "id": 1,
  "name": "Nuha Ilya",
  "email": "nuhailya.dev@gmail.com",
  "phone": null,
  "roles": ["super_admin"],
  "created_at": "2026-06-13T00:00:00.000000Z"
}
```

---

### Menu

#### `GET /menu`

Returns all active (non-deleted) menu items.

**Query params**

| Param | Type | Description |
|---|---|---|
| `category` | `food` \| `drink` | Filter by category |
| `low_stock` | `1` | Return only items where `stock <= min_stock` |

**Response `200`**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Tomyam Campur",
      "description": "Kuah pekat, seafood dan ayam",
      "price": "12.00",
      "category": "food",
      "image_url": "https://cdn.example.com/tomyam.jpg",
      "stock": 50,
      "min_stock": 10,
      "is_low_stock": false,
      "created_at": "2026-06-13T00:00:00.000000Z",
      "updated_at": "2026-06-13T00:00:00.000000Z"
    }
  ]
}
```

---

#### `POST /menu`

**Request**
```json
{
  "name": "Tomyam Campur",
  "description": "Kuah pekat, seafood dan ayam",
  "price": 12.00,
  "category": "food",
  "image_url": "https://cdn.example.com/tomyam.jpg",
  "stock": 50,
  "min_stock": 10
}
```

| Field | Required | Rules |
|---|---|---|
| `name` | Yes | string, max 255 |
| `description` | No | string |
| `price` | Yes | numeric, min 0 |
| `category` | Yes | `food` or `drink` |
| `image_url` | No | valid URL, max 500 chars |
| `stock` | Yes | integer, min 0 |
| `min_stock` | Yes | integer, min 0 |

**Response `201`** — `MenuItemResource`

---

#### `PUT /menu/{id}`

Partial update — all fields optional (send only what changes).

**Request** — same fields as `POST /menu`, all optional.

**Response `200`** — `MenuItemResource`

---

#### `DELETE /menu/{id}`

Soft delete (item hidden from menu, historical order data preserved).

**Response `200`**
```json
{ "message": "Menu item deleted." }
```

---

### Orders

#### `GET /orders`

**Query params**

| Param | Type | Description |
|---|---|---|
| `status` | enum | Filter by order status |
| `platform` | enum | Filter by platform |
| `date` | `YYYY-MM-DD` | Filter by creation date |

Default: paginated 50/page, newest first.

**Response `200`** — paginated list of `OrderResource`

```json
{
  "data": [
    {
      "id": 1,
      "table_id": 3,
      "customer_id": null,
      "created_by": 1,
      "status": "pending",
      "platform": "pos",
      "total_amount": "24.00",
      "discount_amount": "0.00",
      "payment_method": null,
      "paid_at": null,
      "receipt_url": null,
      "whatsapp_url": null,
      "items": [
        {
          "id": 1,
          "menu_item_id": 1,
          "menu_item": { "...MenuItemResource" },
          "quantity": 2,
          "price_at_sale": "12.00",
          "subtotal": "24.00",
          "notes": null
        }
      ],
      "customer": null,
      "created_at": "2026-06-13T10:00:00.000000Z",
      "updated_at": "2026-06-13T10:00:00.000000Z"
    }
  ]
}
```

> `receipt_url` and `whatsapp_url` are only non-null when `status = paid` and a receipt token exists. `whatsapp_url` also requires the customer to have a phone number.

---

#### `POST /orders`

Creates a new order. Automatically deducts stock, logs inventory change, marks table as occupied.

**Request**
```json
{
  "table_id": 3,
  "customer_id": null,
  "platform": "pos",
  "discount_amount": 0,
  "payment_method": null,
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "notes": "Pedas lebih"
    }
  ]
}
```

| Field | Required | Rules |
|---|---|---|
| `table_id` | No | exists in `tables` |
| `customer_id` | No | exists in `customers` |
| `platform` | Yes | enum value |
| `discount_amount` | No | numeric, min 0 |
| `payment_method` | No | enum value |
| `items` | Yes | array, min 1 item |
| `items.*.menu_item_id` | Yes | exists in `menu_items` |
| `items.*.quantity` | Yes | integer, min 1 |
| `items.*.notes` | No | string |

> `total_amount` is computed server-side from item prices × quantities minus discount. Client total is ignored.

**Response `201`** — `OrderResource` with `items` and `customer` loaded.

---

#### `PATCH /orders/{id}/status`

Transitions order to the next status. Side effects are automatic:
- `→ paid`: generates `receipt_token`, sets `paid_at`, frees table
- `→ cancelled`: restores stock, logs inventory restock, frees table

**Request**
```json
{
  "status": "preparing",
  "payment_method": "cash"
}
```

| Field | Required | Rules |
|---|---|---|
| `status` | Yes | valid `OrderStatus` enum value |
| `payment_method` | No | required when transitioning to `paid` (best practice) |

**Response `200`** — updated `OrderResource`

**Error `422`** if transition not allowed:
```json
{ "message": "Cannot transition order from 'pending' to 'paid'." }
```

---

#### `POST /orders/sync-external`

Receives orders from external delivery platforms (Foodpanda, ShopeeFood).

**Request**
```json
{
  "platform": "foodpanda",
  "external_order_id": "FP-12345",
  "total_amount": 35.00,
  "customer_name": "Ahmad",
  "customer_phone": "0123456789",
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "price_at_sale": 12.00
    }
  ]
}
```

| Field | Required | Rules |
|---|---|---|
| `platform` | Yes | `foodpanda` or `shopeefood` |
| `external_order_id` | Yes | string |
| `total_amount` | Yes | numeric, min 0 |
| `customer_name` | No | string |
| `customer_phone` | No | string (creates/finds customer by phone) |
| `items.*.menu_item_id` | Yes | exists in `menu_items` |
| `items.*.quantity` | Yes | integer, min 1 |
| `items.*.price_at_sale` | Yes | numeric, min 0 (platform price, not our price) |

**Response `201`** — `OrderResource`

---

### Tables

#### `GET /tables`

Lists all tables ordered by number, with current active order loaded.

**Permission:** `manage-tables`

**Response `200`**
```json
{
  "data": [
    {
      "id": 1,
      "number": "T01",
      "status": "available",
      "current_order_id": null,
      "current_order": null,
      "qr_token": "01JXabc123...",
      "created_at": "2026-06-13T00:00:00.000000Z",
      "updated_at": "2026-06-13T00:00:00.000000Z"
    }
  ]
}
```

> `status` values: `available`, `occupied`, `reserved`

---

#### `POST /tables`

Creates a table and auto-generates a unique `qr_token`. FE uses the token to render a QR code.

**Permission:** `manage-tables`

**Request**
```json
{ "number": "T01" }
```

| Field | Required | Rules |
|---|---|---|
| `number` | Yes | string, max 10, unique |

**Response `201`** — `TableResource`

---

#### `DELETE /tables/{id}`

Hard deletes a table.

**Permission:** `manage-tables`

**Response `200`**
```json
{ "message": "Table deleted." }
```

---

#### `GET /tables/resolve/{token}`

**No auth required.** Customer PWA calls this after scanning the QR code to get the table state and any active order.

**Response `200`** — `TableResource` with `current_order` + full order items loaded.

**Response `404`** — token invalid.

---

### QR Code Flow

1. Staff creates table via `POST /tables` → receives `qr_token`
2. FE generates QR image from the token (e.g. using `react-qr-code`, `qrcode.js`)
3. Print and place QR on table
4. Customer scans → PWA calls `GET /tables/resolve/{token}`
5. Response `status = available` → allow new order (`POST /orders` with `table_id`)
6. Response `status = occupied` → load existing order for additions

---

### Receipts

#### `GET /receipts/{token}`

**No auth required.** Public endpoint for customers to view their receipt.

Token is generated when order status transitions to `paid`. Share via `whatsapp_url` from `OrderResource`.

**Response `200`** — `OrderResource` with full items and customer data.

**Response `404`** — token invalid or not yet paid.

---

### Customers

#### `GET /customers`

Paginated (50/page).

**Response `200`**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Ahmad",
      "email": null,
      "phone": "0123456789",
      "is_registered": false,
      "created_at": "2026-06-13T00:00:00.000000Z"
    }
  ]
}
```

---

#### `GET /customers/{id}/history`

Order history for a customer. Paginated (20/page), newest first.

**Response `200`** — paginated `OrderResource` list.

---

### Expenses

#### `GET /expenses`

**Query params**

| Param | Type | Description |
|---|---|---|
| `type` | enum | Filter by expense type |
| `from` | `YYYY-MM-DD` | Start date (inclusive) |
| `to` | `YYYY-MM-DD` | End date (inclusive) |

**Response `200`**
```json
{
  "data": [
    {
      "id": 1,
      "type": "inventory",
      "amount": "150.00",
      "description": "Beli bahan tomyam",
      "date": "2026-06-13",
      "receipt_url": null,
      "recorded_by": { "...UserResource" },
      "created_at": "2026-06-13T00:00:00.000000Z"
    }
  ]
}
```

---

#### `POST /expenses`

`recorded_by` is set automatically from the authenticated user.

**Request**
```json
{
  "type": "inventory",
  "amount": 150.00,
  "description": "Beli bahan tomyam",
  "date": "2026-06-13",
  "receipt_url": null
}
```

| Field | Required | Rules |
|---|---|---|
| `type` | Yes | enum value |
| `amount` | Yes | numeric, min 0.01 |
| `description` | Yes | string |
| `date` | Yes | valid date |
| `receipt_url` | No | valid URL, max 500 chars |

**Response `201`** — `ExpenseResource`

---

### Reports

#### `GET /reports/daily-sales`

**Query params**

| Param | Type | Default | Description |
|---|---|---|---|
| `date` | `YYYY-MM-DD` | Today | Sales date |

**Response `200`**
```json
{
  "date": "2026-06-13",
  "total_sales": "480.00",
  "total_orders": 12,
  "total_items_sold": 35,
  "top_items": [
    {
      "name": "Tomyam Campur",
      "total_qty": 18,
      "total_revenue": "216.00"
    }
  ]
}
```

---

#### `GET /reports/financials`

**Query params**

| Param | Type | Default | Description |
|---|---|---|---|
| `year` | integer | Current year | |
| `month` | integer | Current month | 1–12 |

**Response `200`**
```json
{
  "year": 2026,
  "month": 6,
  "total_sales": "9600.00",
  "total_expenses": "2400.00",
  "net_profit": "7200.00",
  "expenses_by_type": [
    { "type": "inventory", "total": "1200.00" },
    { "type": "salary", "total": "1200.00" }
  ]
}
```

---

## Receipt & WhatsApp Flow

When an order is marked as paid:
1. Server generates a unique `receipt_token` (ULID)
2. `OrderResource` response includes:
   - `receipt_url`: `GET /api/receipts/{token}` — shareable, no login required
   - `whatsapp_url`: pre-built `wa.me` link (only if customer has phone number)

**Staff flow:**
1. Tap "Paid" → PATCH status to `paid`
2. Response includes `whatsapp_url`
3. Staff taps link → WhatsApp opens with pre-filled message containing receipt URL
4. Send to customer — zero API cost

**`whatsapp_url` format:**
```
https://wa.me/60123456789?text=Resit%20anda%3A%20https%3A%2F%2F...
```
Phone digits only, no `+` prefix. Malaysian numbers: `0123456789` → `60123456789`.
