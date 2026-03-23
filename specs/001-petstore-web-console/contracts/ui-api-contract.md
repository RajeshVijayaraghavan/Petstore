# UI-to-API Contract: Petstore Web Console

**Feature**: 001-petstore-web-console  
**Date**: 2026-03-22  
**Backend Contract**: https://petstore3.swagger.io/api/v3/openapi.json

> The Petstore Web Console is a front-end SPA that communicates with the Petstore REST API. This document maps each UI screen/action to its corresponding API endpoint, documenting the contract between the front-end and backend.

---

## Authentication Contract

| UI Action | Method | Endpoint | Request | Response | Notes |
|-----------|--------|----------|---------|----------|-------|
| Login | GET | `/user/login` | Query: `username`, `password` | `200`: session token string + `X-Rate-Limit`, `X-Expires-After` headers | Use PKCE flow in production; this endpoint is the spec's auth mechanism |
| Logout | GET | `/user/logout` | None | `200`: success | Clears client-side session |

**Session Management**:
- Store token in memory (Zustand auth store); never in localStorage
- Monitor `X-Expires-After` header; redirect to login on expiry
- Attach token as `api_key` header on all subsequent requests

---

## Pet Catalogue Screen

| UI Action | Method | Endpoint | Request | Response | Error Handling |
|-----------|--------|----------|---------|----------|----------------|
| Load pets by status | GET | `/pet/findByStatus` | Query: `status` (required, enum) | `200`: `Pet[]` | `400`: "Invalid filter selected" |
| Search pets by tags | GET | `/pet/findByTags` | Query: `tags` (string[]) | `200`: `Pet[]` | `400`: "Invalid tag value" |
| View pet detail | GET | `/pet/{petId}` | Path: `petId` (int64) | `200`: `Pet` | `400`: "Invalid ID"; `404`: "Pet not found" |

---

## Pet CRUD Operations

| UI Action | Method | Endpoint | Request Body | Response | Error Handling |
|-----------|--------|----------|-------------|----------|----------------|
| Create pet | POST | `/pet` | `Pet` (JSON) | `200`: created `Pet` | `400`: "Invalid input"; `422`: "Validation error" |
| Update pet | PUT | `/pet` | `Pet` (JSON, with `id`) | `200`: updated `Pet` | `400`: "Invalid ID"; `404`: "Pet not found"; `422`: "Validation error" |
| Update pet (form) | POST | `/pet/{petId}` | Query: `name`, `status` | `200`: updated `Pet` | `400`: "Invalid input" |
| Delete pet | DELETE | `/pet/{petId}` | Path: `petId`; Header: `api_key` (optional) | `200`: success | `400`: "Invalid pet value" |
| Upload pet image | POST | `/pet/{petId}/uploadImage` | Path: `petId`; Query: `additionalMetadata`; Body: binary image | `200`: `ApiResponse` | `400`: "No file uploaded"; `404`: "Pet not found" |

**Create/Update Flow**:
1. Client validates: name required, status in enum, photoUrls has at least one entry
2. Client submits JSON to POST/PUT `/pet`
3. On success: show confirmation, invalidate pet list cache (TanStack Query)
4. On error: map status codes to user-friendly messages

**Image Upload Flow**:
1. Client validates: file < 5 MB, image MIME type
2. POST binary to `/pet/{petId}/uploadImage`
3. On success: add returned URL to pet's photoUrls display

---

## Inventory Screen

| UI Action | Method | Endpoint | Request | Response | Error Handling |
|-----------|--------|----------|---------|----------|----------------|
| Load inventory | GET | `/store/inventory` | None | `200`: `Record<string, number>` (status → count) | Network error: show retry |

**Response Shape**: `{ "available": 42, "pending": 7, "sold": 15, ... }`

---

## Order Operations

| UI Action | Method | Endpoint | Request | Response | Error Handling |
|-----------|--------|----------|---------|----------|----------------|
| Place order | POST | `/store/order` | `Order` (JSON) | `200`: created `Order` | `400`: "Invalid input"; `422`: "Validation error" |
| Look up order | GET | `/store/order/{orderId}` | Path: `orderId` (int64) | `200`: `Order` | `400`: "Invalid ID"; `404`: "Order not found" |
| Cancel order | DELETE | `/store/order/{orderId}` | Path: `orderId` (int64) | `200`: success | `400`: "Invalid ID"; `404`: "Order not found" |

**Order Placement Flow**:
1. Client validates: quantity ≥ 1
2. Client constructs `{ petId, quantity, status: "placed" }` and POSTs
3. On success: display confirmation with order ID, status, shipDate
4. On error: map to user-friendly message

**Cancellation Rules**:
- Only enabled when `order.status === "placed"`
- Requires confirmation dialog before DELETE

---

## User Management Operations

| UI Action | Method | Endpoint | Request | Response | Error Handling |
|-----------|--------|----------|---------|----------|----------------|
| Look up user | GET | `/user/{username}` | Path: `username` (string) | `200`: `User` | `400`: "Invalid username"; `404`: "User not found" |
| Create user | POST | `/user` | `User` (JSON) | `200`: created `User` | Default error |
| Create users (batch) | POST | `/user/createWithList` | `User[]` (JSON) | `200`: `User` | Default error |
| Update user | PUT | `/user/{username}` | Path: `username`; Body: `User` (JSON) | `200`: success | `400`: "Bad request"; `404`: "User not found" |
| Delete user | DELETE | `/user/{username}` | Path: `username` (string) | `200`: success | `400`: "Invalid username"; `404`: "User not found" |

---

## Cross-Cutting Concerns

### Error Response Mapping

| HTTP Status | User-Facing Message |
|-------------|-------------------|
| 400 | "Something went wrong with your request. Please check your input and try again." |
| 404 | "The item you're looking for doesn't exist or has been removed." |
| 422 | "Please check the highlighted fields and correct any errors." |
| Network error | "Unable to connect to the server. Please check your connection and try again." |
| 5xx | "Something went wrong on our end. Please try again in a moment." |

### Request Headers (all authenticated requests)

| Header | Value | When |
|--------|-------|------|
| `Content-Type` | `application/json` | All POST/PUT requests |
| `api_key` | Session token | All authenticated requests |
| `Accept` | `application/json` | All requests |

### Cache Invalidation Strategy (TanStack Query)

| Mutation | Invalidate Query Keys |
|----------|----------------------|
| Create pet | `["pets", { status }]` |
| Update pet | `["pets", { status }]`, `["pet", petId]` |
| Delete pet | `["pets", { status }]`, `["pet", petId]` |
| Upload image | `["pet", petId]` |
| Place order | `["inventory"]` |
| Cancel order | `["order", orderId]`, `["inventory"]` |
| Create/update/delete user | `["user", username]` |
