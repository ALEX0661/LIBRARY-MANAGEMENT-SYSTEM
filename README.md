# Library Management System — Backend API

CS Elective 3 · Backend Development · Group 5 · BSCS 3A

A REST API backend for managing books, members, and book loans — built with Vanilla PHP 8, MySQL, session-based authentication, and AES-256-GCM encryption on sensitive fields.

---

## Tech Stack

- **Language:** PHP 8 (no frameworks)
- **Database:** MySQL / MariaDB
- **Authentication:** Custom session tokens (Bearer)
- **Encryption:** AES-256-GCM via `openssl_encrypt` / `openssl_decrypt`
- **Dependencies:** `vlucas/phpdotenv`, `phpmailer/phpmailer` (via Composer)

---

## Project Structure

```
library-backend/
├── config/
│   └── .env                  # Environment variables (DB, encryption key)
├── models/
│   ├── Auth.php              # Register, Login, Logout
│   ├── Books.php             # Book CRUD
│   ├── Loans.php             # Loan management
│   ├── Users.php             # Profile, Change password
│   ├── Reports.php           # Admin & report endpoints
│   └── Connection.php        # PDO database connection
├── functions.php             # AES helpers, session helpers, execQuery/execCmd
├── main.php                  # Router / entry point
├── composer.json
├── .htaccess                 # URL rewriting
├── library_management.sql    # Tables (tbl_users, tbl_books, tbl_loans, tbl_sessions)
├── library_service.sql       # Stored procedures (original)
└── patch.sql                 # All new/updated stored procedures — run this after the two above
```

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/library-backend.git
cd library-backend
```

### 2. Install dependencies

```bash
composer install
```

### 3. Set up the database

Import the SQL files **in this order** using phpMyAdmin or the MySQL CLI:

```bash
mysql -u root -p < library_management.sql
mysql -u root -p < library_service.sql
mysql -u root -p < patch.sql
```

### 4. Configure environment

Copy or edit `config/.env`:

```env
SERVER01=localhost
DBUSER=grp5
PASSWORD=your_db_password
DATABASE=library_service
CHARSET=utf8mb4
ENCRYPTION_KEY=6c69627261727932303236677270356b657961657332353667636d6b65793332
SESSION_LIFETIME=86400
```

> **ENCRYPTION_KEY** must be a 64-character hex string representing 32 bytes (256 bits).  
> Generate a new one with: `bin2hex(random_bytes(32))`

### 5. Configure your web server

Point your virtual host document root to the project folder. The `.htaccess` handles URL rewriting — make sure `mod_rewrite` is enabled (Apache) or equivalent is set up (Nginx).

---

## API Overview

**Base URL:** `http://localhost/library-backend/api`

All requests and responses use JSON. Include `Content-Type: application/json` on POST/PUT requests.

### Authentication

After login, include the session token in every protected request:

```
Authorization: Bearer sess_a1b2c3d4e5f6...
```

### Access Levels

| Level | Description |
|-------|-------------|
| `public` | No token required |
| `auth` | Any logged-in user |
| `admin` | Logged-in user with role `admin` |

### Endpoints

#### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/logout` | auth |

#### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users/profile` | auth |
| PUT | `/api/users/profile` | auth |
| PUT | `/api/users/change-password` | auth |

#### Books
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/books` | public |
| GET | `/api/books/{book_id}` | public |
| POST | `/api/books` | admin |
| PUT | `/api/books/{book_id}` | admin |
| DELETE | `/api/books/{book_id}` | admin |

#### Loans
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/loans` | auth |
| GET | `/api/loans/{loan_id}` | auth |
| GET | `/api/loans/user/{user_id}` | auth |
| PUT | `/api/loans/{loan_id}/return` | auth |

#### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/books` | admin |
| GET | `/api/admin/members` | admin |
| GET | `/api/admin/loans` | admin |
| PUT | `/api/admin/members/{user_id}/status` | admin |

#### Reports
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/reports/stats` | auth |
| GET | `/api/reports/recent-loans` | auth |
| GET | `/api/reports/all-loans` | auth |
| GET | `/api/reports/borrowed-books` | admin |
| GET | `/api/reports/overdue-books` | admin |

---

## Security

- **Passwords** are hashed using `password_hash()` with bcrypt (cost 12). Never encrypted.
- **phone** and **address** fields are encrypted with AES-256-GCM before storing and decrypted automatically in API responses.
- Each encryption generates a unique 12-byte IV. The ciphertext, IV, and auth tag are stored separately.
- The encryption key is loaded from `.env` via `hex2bin()` — never hardcoded in source files.
- Session tokens expire after 24 hours (configurable via `SESSION_LIFETIME` in `.env`).

---

## Default Admin Account

```
Email:    admin@library.com
Password: admin1234
Role:     admin
```

> Change this immediately after first login.

---

## Notes for Frontend / Integration

- `GET /api/books` supports `?search=` (title/author/ISBN) and `?category=` query params.
- `DELETE /api/books/{id}` is a **soft delete** — the book is hidden, not permanently removed.
- `PUT /api/admin/members/{id}/status` **toggles** active/inactive. Deactivating a member immediately prevents them from authenticating.
- Loan status values: `borrowed`, `returned`, `overdue`.
- Overdue loans are auto-marked by several endpoints before returning data — no manual cron job needed.
- Full API details with request/response examples are in `library-api-docs.docx`.

---

