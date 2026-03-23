# Data Model: Petstore Web Console

**Feature**: 001-petstore-web-console  
**Date**: 2026-03-22  
**Source**: OpenAPI spec v1.0.27 + feature specification

> All entities below mirror the Petstore OpenAPI schema. The front-end does not own a database; it reads from and writes to the backend API. This document defines the **client-side data shapes** used throughout the console.

---

## Entity: Pet

The central entity representing an animal in the pet store.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | integer (int64) | Auto-generated | Unique identifier; assigned by backend on creation |
| name | string | Yes | Non-empty; displayed prominently on cards and detail view |
| category | Category | No | Classification (e.g., Dogs, Cats); selected from dropdown |
| photoUrls | string[] | Yes (at least one) | Array of image URLs; first URL used as thumbnail |
| tags | Tag[] | No | Zero or more labels for search/filter |
| status | enum: "available" \| "pending" \| "sold" | No | Defaults to "available"; drives catalogue filter tabs |

**State Transitions**:

```
available ──→ pending ──→ sold
    ↑             │
    └─────────────┘
    (any status can revert to available)
```

**Validation Rules**:
- `name` is required and must be non-empty
- `photoUrls` must contain at least one URL when creating via the API (can be an empty-string placeholder if no photo)
- `status` must be one of the three enum values
- Photo uploads are validated client-side: max 5 MB per image

---

## Entity: Category

A classification for pets.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | integer (int64) | Auto-generated | Unique identifier |
| name | string | No | Human-readable label (e.g., "Dogs", "Cats", "Birds") |

**Relationships**: One Category → many Pets (one-to-many)

---

## Entity: Tag

A label attached to pets for search/filter purposes.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | integer (int64) | Auto-generated | Unique identifier |
| name | string | No | Human-readable label (e.g., "vaccinated", "friendly") |

**Relationships**: Many Tags ↔ many Pets (many-to-many)

---

## Entity: Order

Represents a customer purchase of a pet.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | integer (int64) | Auto-generated | Unique identifier |
| petId | integer (int64) | Yes | References a Pet; displayed as pet name in UI |
| quantity | integer (int32) | Yes | Must be ≥ 1; validated client-side |
| shipDate | datetime (ISO 8601) | No | Estimated shipping date; display formatted |
| status | enum: "placed" \| "approved" \| "delivered" | No | Determines whether cancellation is allowed |
| complete | boolean | No | Indicates order fulfillment |

**State Transitions**:

```
placed ──→ approved ──→ delivered
                           │
                           └──→ complete: true
```

**Business Rules**:
- Only orders with status "placed" can be cancelled (deleted)
- Orders with status "approved" or "delivered" show the cancel button as disabled/hidden
- `quantity` must be ≥ 1 (validated client-side before submission)

---

## Entity: User

A store staff account for accessing the console.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | integer (int64) | Auto-generated | Unique identifier |
| username | string | Yes | Unique; used for login and lookup |
| firstName | string | No | Display name |
| lastName | string | No | Display name |
| email | string | No | Standard email format |
| password | string | Yes (on create) | Not displayed after creation; sent only on create/update |
| phone | string | No | Contact number |
| userStatus | integer (int32) | No | 0 = inactive, 1 = active; determines admin privileges |

**Business Rules**:
- `userStatus` distinguishes administrators (who can access the Users section) from regular staff
- Password is write-only: never returned in API responses after creation
- Username is the lookup key (not the numeric ID)

---

## Entity Relationship Diagram

```
┌────────────┐       ┌────────────┐
│  Category   │──1:N──│    Pet      │
│  - id       │       │  - id      │
│  - name     │       │  - name    │
└────────────┘       │  - status  │
                      │  - photoUrls│
┌────────────┐       │            │
│    Tag      │──M:N──│            │
│  - id       │       └─────┬──────┘
│  - name     │             │
└────────────┘        1:N (petId)
                            │
                      ┌─────┴──────┐
                      │   Order     │
                      │  - id       │
                      │  - petId    │
                      │  - quantity │
                      │  - status   │
                      │  - shipDate │
                      │  - complete │
                      └────────────┘

┌────────────┐
│    User     │  (independent; manages auth & admin)
│  - id       │
│  - username │
│  - email    │
│  - userStatus│
└────────────┘
```

---

## Client-Side Derived Types

These types do not exist in the API but are useful in the front-end:

| Type | Purpose | Shape |
|------|---------|-------|
| InventorySummary | Inventory dashboard display | `Record<string, number>` — maps status string to pet count |
| AuthSession | Current user session state | `{ username, token, expiresAt, isAdmin }` |
| PetFilter | Catalogue filter state | `{ status: PetStatus, tags?: string[] }` |
