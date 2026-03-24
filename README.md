#  College Invitation System

A full-stack, multi-channel event invitation management platform built for colleges and institutions. Manage students, guests, and professors — then send personalized invitations via **Email**, **SMS**, and **WhatsApp** — all from one place.

---

##  Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Pages & UI](#-pages--ui)
- [Environment Variables](#-environment-variables)
- [Installation & Setup](#-installation--setup)
- [Running Locally](#-running-locally)
- [Deployment (Vercel)](#-deployment-vercel)
- [Communication Channels](#-communication-channels)
- [Admin System](#-admin-system)
- [CSV Import](#-csv-import)
- [AI-Powered Features](#-ai-powered-features)
- [Flowcharts](#-flowcharts)
- [Contributing](#-contributing)

---

## Overview

The **College Invitation System** is a Next.js 16 web application designed to streamline the process of inviting attendees to college events (seminars, workshops, cultural programs, convocations, etc.).

The system supports **three types of recipients**:
- 🎓 **Students** — enrolled in courses at the college
- 🧑‍💼 **Guests** — external visitors (VIPs, industry professionals, alumni, media, sponsors)
- 👨‍🏫 **Professors** — academic faculty from various institutions

Admins can compose rich HTML invitations, select recipients, and dispatch them simultaneously over **Email (Gmail via Nodemailer)**, **SMS (Twilio / HttpSms)**, and **WhatsApp (Twilio)**. Every delivery is logged with full analytics.

---

##  Live Demo

> Deployed on **Vercel** with **Neon PostgreSQL** as the database.

---

##  Features

###  Recipient Management
- **Student Registration** — Register with name, email, course, year, and optional phone number
- **Guest Registration** — Register with name, email, organization, designation, phone, and category (guest / VIP / alumni / industry / media / sponsor / speaker)
- **Professor Registration** — Register with name, email, college, department, designation, phone, and area of expertise
- **CSV Bulk Import** — Upload a `.csv` file to batch-import guests (and students)
- **CRUD Operations** — Full create, read, update, delete for all recipient types via the admin panel
- **Search & Filter** — Search recipients by name, email, course, organization, etc.
- **Pagination** — Server-side paginated list views

###  Multi-Channel Messaging
| Channel | Provider | Status Tracking |
|---------|----------|-----------------|
| Email | Gmail (Nodemailer) |  sent / failed |
| SMS | Twilio |  sent / delivered / failed |
| SMS (alt) | HttpSms |  sent / failed |
| WhatsApp | Twilio |  sent / delivered / read / failed |

###  Invitation Composer
- Rich HTML invitation editor
- `{{name}}` personalization placeholder (auto-replaced with each recipient's name)
- Select recipients from students, guests, and/or professors
- Send to one or all categories simultaneously
- **AI-powered invitation generation** using Google Gemini API

###  Analytics & Logs
- Per-invitation analytics: total sent, delivered, opened, clicked, failed, pending
- Email logs with timestamps (sentAt, deliveredAt, openedAt, clickedAt)
- SMS logs with sentAt and deliveredAt timestamps
- WhatsApp logs with sentAt, deliveredAt, and readAt timestamps
- Delivery rate and open rate percentages
- Retry failed emails with a single click

### 🔐 Admin System
- Password-protected admin area
- JWT-style token stored in localStorage
- Admin-only routes protected by `AdminProtection` component
- Admin can view/manage all data; regular users can only self-register

###  Responsive UI
- Mobile-first, fully responsive design
- Sticky navigation with mobile hamburger menu
- Active-link highlighting in the navbar
- Gradient backgrounds, card hover animations, and scale transitions

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS v4** |
| Database ORM | **Prisma 6** |
| Database | **PostgreSQL** (Neon serverless) |
| Email Service | **Gmail (via Nodemailer)** |
| SMS Service | **Twilio** + **HttpSms** (fallback) |
| WhatsApp | **Twilio WhatsApp API** |
| AI | **Google Gemini API** (`@google/generative-ai`) |
| Icons | **Lucide React** + **React Icons** |
| Deployment | **Vercel** |
| Runtime | **Node.js 20+** |

---

## 📁 Project Structure

```
college-invitation-system/
│
├── prisma/
│   ├── schema.prisma             # Database models (Student, Guest, Professor, Invitation, EmailLog, SMSLog, WhatsAppLog)
│   └── migrations/               # Auto-generated Prisma migration files
│
├── public/
│   ├── sample_guests.csv         # Sample CSV template for bulk guest import
│   └── *.svg                     # Static icons/images
│
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Home page — Public registration forms (Student / Guest / Professor)
│   │   ├── layout.tsx            # Root layout with global font and metadata
│   │   ├── globals.css           # Global CSS reset and Tailwind base
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Admin dashboard with stats & quick actions
│   │   │
│   │   ├── students/
│   │   │   └── page.tsx          # Admin: list, add, edit, delete, import students
│   │   │
│   │   ├── guests/
│   │   │   └── page.tsx          # Admin: list, add, edit, delete, import guests
│   │   │
│   │   ├── professors/
│   │   │   └── page.tsx          # Admin: list, add, edit, delete professors
│   │   │
│   │   ├── compose/
│   │   │   └── page.tsx          # Admin: compose & send invitations (email/SMS/WhatsApp)
│   │   │
│   │   ├── invitations/
│   │   │   ├── page.tsx          # Admin: list all invitations with analytics
│   │   │   └── [id]/             # Dynamic route: single invitation detail & logs
│   │   │
│   │   ├── email-test/
│   │   │   └── page.tsx          # Admin: test email sending functionality
│   │   │
│   │   ├── test/
│   │   │   └── page.tsx          # Developer testing page
│   │   │
│   │   └── api/                  # REST API route handlers
│   │       ├── admin/            # Admin login & auth
│   │       ├── students/         # CRUD for students
│   │       ├── guests/           # CRUD for guests
│   │       ├── professors/       # CRUD for professors
│   │       ├── invitations/      # CRUD for invitations + logs
│   │       ├── send-bulk-email/          # Send email to all selected recipients
│   │       ├── send-bulk-email-enhanced/ # Enhanced bulk email with analytics tracking
│   │       ├── send-combo-bulk/          # Combined email + SMS + WhatsApp dispatch
│   │       ├── retry-failed-emails/      # Retry email sending for failed logs
│   │       ├── generate-invitation/      # AI-generated invitation content (Gemini)
│   │       ├── generate-sms/             # AI-generated SMS message content
│   │       ├── generate-whatsapp/        # AI-generated WhatsApp message content
│   │       ├── sms-templates/            # SMS message templates
│   │       ├── whatsapp-templates/       # WhatsApp message templates
│   │       ├── send-phone-sms/           # Send SMS via HttpSms provider
│   │       ├── send-whatsapp-web/        # Send WhatsApp messages via Twilio
│   │       ├── test-email/               # Test a single email send
│   │       └── test-phone-sms/           # Test a single SMS send
│   │
│   ├── components/
│   │   ├── Navigation.tsx        # Responsive sticky navbar with active-link states
│   │   ├── AdminProtection.tsx   # HOC to guard admin-only pages
│   │   └── icons/
│   │       └── AppIcons.tsx      # Centralized icon registry (Lucide React)
│   │
│   ├── hooks/
│   │   └── useAuth.ts            # Custom hook: admin login / logout / token management
│   │
│   └── lib/
│       ├── prisma.ts             # Prisma client singleton (dev + prod safe)
│       ├── email.ts              # Gmail Nodemailer helper: sendBulkEmails, sendTestEmail, sendSingleEmail
│       └── types.ts              # Shared TypeScript interfaces for all models & API responses
│
├── .env                          # Environment variables (never commit secrets!)
├── .gitignore                    # Git ignored files
├── next.config.ts                # Next.js config (ESLint/TS ignored in build, standalone output)
├── vercel.json                   # Vercel config (30s max function duration for API routes)
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS config
├── tsconfig.json                 # TypeScript compiler options
├── eslint.config.mjs             # ESLint configuration
├── flowchart.mermaid             # System flowchart (Mermaid format)
├── flowchart-raw.mmd             # Raw Mermaid source
└── package.json                  # Dependencies and npm scripts
```

---

##  Database Schema

The PostgreSQL database is managed via **Prisma ORM**. The schema lives in `prisma/schema.prisma`.

### Models

#### `Student`
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `name` | String | Full name |
| `email` | String | Unique |
| `course` | String | e.g., "Computer Science" |
| `year` | String | e.g., "2nd Year" |
| `phone` | String? | Optional |
| `createdAt` | DateTime | Auto-set |

#### `Guest`
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `name` | String | Full name |
| `email` | String | Unique |
| `organization` | String? | Company/institution |
| `designation` | String? | Job title |
| `phone` | String? | Optional |
| `category` | String | Default: "guest" (guest/vip/alumni/industry/media/sponsor/speaker) |
| `createdAt` | DateTime | Auto-set |

#### `Professor`
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `name` | String | Full name |
| `email` | String | Unique |
| `college` | String | Institution name |
| `department` | String | e.g., "Computer Science" |
| `designation` | String | Default: "Professor" |
| `phone` | String? | Optional |
| `expertise` | String? | Subject area |
| `createdAt` | DateTime | Auto-set |

#### `Invitation`
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `title` | String | Invitation title |
| `subject` | String | Email subject line |
| `content` | String (Text) | HTML body content |
| `createdAt` | DateTime | Auto-set |
| `sentCount` | Int | Total messages dispatched |
| `deliveredCount` | Int | Confirmed deliveries |
| `openedCount` | Int | Email open events |
| `clickedCount` | Int | Link click events |
| `failedCount` | Int | Failed deliveries |

#### `EmailLog`
Tracks every individual email sent.
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `studentId` | String? | FK → Student (nullable) |
| `guestId` | String? | FK → Guest (nullable) |
| `professorId` | String? | FK → Professor (nullable) |
| `invitationId` | String | FK → Invitation |
| `recipientType` | String | "student" / "guest" / "professor" |
| `status` | String | sent / delivered / opened / clicked / failed |
| `sentAt` | DateTime | When sent |
| `deliveredAt` | DateTime? | When delivered |
| `openedAt` | DateTime? | When email opened |
| `clickedAt` | DateTime? | When link clicked |
| `errorMessage` | String? | Error detail if failed |
| `messageId` | String? | Nodemailer message ID |

#### `SMSLog`
Tracks every individual SMS sent.
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `studentId` / `guestId` / `professorId` | String? | FK to recipient |
| `invitationId` | String | FK → Invitation |
| `recipientType` | String | "student" / "guest" / "professor" |
| `phoneNumber` | String | Actual number used |
| `status` | String | sent / delivered / failed / pending |
| `sentAt` | DateTime | When sent |
| `deliveredAt` | DateTime? | When delivered |
| `errorMessage` | String? | Error detail if failed |
| `messageId` | String? | Provider's message ID |

#### `WhatsAppLog`
Tracks every individual WhatsApp message sent.
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (cuid) | Primary key |
| `studentId` / `guestId` / `professorId` | String? | FK to recipient |
| `invitationId` | String | FK → Invitation |
| `recipientType` | String | "student" / "guest" / "professor" |
| `phoneNumber` | String | Actual WhatsApp number |
| `status` | String | sent / delivered / read / failed / pending |
| `sentAt` | DateTime | When sent |
| `deliveredAt` | DateTime? | When delivered |
| `readAt` | DateTime? | When message was read (WhatsApp read receipts) |
| `errorMessage` | String? | Error detail if failed |
| `messageId` | String? | Twilio message SID |

### Relationships
- `Student` / `Guest` / `Professor` ↔ `EmailLog` (1-to-many, cascade delete)
- `Student` / `Guest` / `Professor` ↔ `SMSLog` (1-to-many, cascade delete)
- `Student` / `Guest` / `Professor` ↔ `WhatsAppLog` (1-to-many, cascade delete)
- `Invitation` ↔ `EmailLog` / `SMSLog` / `WhatsAppLog` (1-to-many, cascade delete)

---

## 🔌 API Reference

All API routes are under `/api/` and return JSON.

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/admin/login` | Verify admin password, returns a token |

### Students
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/students` | List all students (supports search & pagination) |
| `POST` | `/api/students` | Create a new student |
| `PUT` | `/api/students/[id]` | Update a student |
| `DELETE` | `/api/students/[id]` | Delete a student |

### Guests
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/guests` | List all guests |
| `POST` | `/api/guests` | Create a new guest |
| `PUT` | `/api/guests/[id]` | Update a guest |
| `DELETE` | `/api/guests/[id]` | Delete a guest |

### Professors
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/professors` | List all professors |
| `POST` | `/api/professors` | Create a new professor |
| `PUT` | `/api/professors/[id]` | Update a professor |
| `DELETE` | `/api/professors/[id]` | Delete a professor |

### Invitations
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/invitations` | List all invitations with analytics |
| `POST` | `/api/invitations` | Create a new invitation record |
| `GET` | `/api/invitations/[id]` | Get a single invitation with full logs |
| `DELETE` | `/api/invitations/[id]` | Delete an invitation and its logs |

### Sending & Messaging
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/send-bulk-email` | Send email to selected recipients via Gmail SMTP |
| `POST` | `/api/send-bulk-email-enhanced` | Enhanced bulk email with analytics logging |
| `POST` | `/api/send-combo-bulk` | Send email + SMS + WhatsApp simultaneously |
| `POST` | `/api/retry-failed-emails` | Retry all failed emails for an invitation |
| `POST` | `/api/send-phone-sms` | Send SMS via HttpSms provider |
| `POST` | `/api/send-whatsapp-web` | Send WhatsApp message via Twilio |
| `POST` | `/api/test-email` | Send a single test email |
| `POST` | `/api/test-phone-sms` | Send a single test SMS |

### AI Generation
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/generate-invitation` | Generate HTML invitation content using Gemini AI |
| `POST` | `/api/generate-sms` | Generate SMS message text using Gemini AI |
| `POST` | `/api/generate-whatsapp` | Generate WhatsApp message using Gemini AI |

### Templates
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/sms-templates` | List pre-built SMS templates |
| `GET` | `/api/whatsapp-templates` | List pre-built WhatsApp templates |

---

## 🖥️ Pages & UI

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Self-registration portal for students, guests, and professors |
| `/dashboard` | Admin only | Overview stats (total students, invitations, emails sent) + quick-action links |
| `/students` | Admin only | Full CRUD table for students; CSV import; search & pagination |
| `/guests` | Admin only | Full CRUD table for guests; CSV import; category filter |
| `/professors` | Admin only | Full CRUD table for professors; search & pagination |
| `/compose` | Admin only | Multi-step invitation composer: write content → select recipients → choose channels → send |
| `/invitations` | Admin only | History of all invitations, with per-invitation analytics cards |
| `/invitations/[id]` | Admin only | Detailed logs for a single invitation (email, SMS, WhatsApp tabs) |
| `/email-test` | Admin only | Test email delivery functionality |

### Navigation Bar Items
1. **Home** (`/`) — Registration portal
2. **Dashboard** (`/dashboard`) — Admin overview
3. **Students** (`/students`)
4. **Guests** (`/guests`)
5. **Professors** (`/professors`)
6. **Compose** (`/compose`) — Create & send invitations
7. **Analytics** (`/invitations`) — Invitation history & tracking

---

## 🔑 Environment Variables

Create a `.env` file in the project root (never commit this file):

```env
# ── Database ──────────────────────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# ── Admin Auth ────────────────────────────────────────────────────
NEXTAUTH_SECRET="your-secret-key"
ADMIN_PASSWORD="your-admin-password"

# ── Gmail (Nodemailer) ───────────────────────────────────────────
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-digit-app-password"

# ── HttpSms (Alternative SMS) ────────────────────────────────────
HTTPSMS_API_KEY="uk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
HTTPSMS_PHONE_ID="+1234567890"

# ── Google Gemini AI ─────────────────────────────────────────────
GEMINI_API_KEY="AIzaxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

> **Security Note:** The `.env` file contains secret credentials. It is listed in `.gitignore`. Never push API keys to a public repository.

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** v20 or higher
- **npm** v9 or higher
- A **PostgreSQL** database (e.g., [Neon](https://neon.tech) free tier)
- A **Gmail** account with an App Password generated

- A **Google AI Studio** API key (for Gemini AI features)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/college-invitation-system.git
cd college-invitation-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and fill in all required values (see [Environment Variables](#-environment-variables) above).

### 4. Set Up the Database
Push the Prisma schema to your PostgreSQL database:
```bash
npx prisma db push
```

Or run migrations (if using migration history):
```bash
npx prisma migrate deploy
```

### 5. Generate the Prisma Client
```bash
npx prisma generate
```

### 6. (Optional) Open Prisma Studio
Browse your database visually:
```bash
npx prisma studio
```

---

##  Running Locally

Start the development server with Turbopack:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start dev server with Turbopack hot reload |
| Build | `npm run build` | Create optimized production build |
| Start (prod) | `npm start` | Start production server |
| Lint | `npm run lint` | Run ESLint checks |
| DB Push | `npx prisma db push` | Sync schema to database without migrations |
| DB Migrate | `npx prisma migrate dev` | Create & apply a new migration |
| Studio | `npx prisma studio` | Open Prisma's visual DB browser |

---

##  Deployment (Vercel)

The project is configured for one-click Vercel deployment.

### Steps
1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub.
3. Set all environment variables in the Vercel dashboard (Settings → Environment Variables).
4. Vercel will auto-detect Next.js and build the project.
5. Run `npx prisma db push` against your production database URL once.

### Vercel Config (`vercel.json`)
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```
All API route functions are given a **30-second** maximum execution duration (important for bulk sending operations that may take longer than the default 10s).

### Next.js Build Config (`next.config.ts`)
```ts
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone'
}
```
- `output: 'standalone'` — Produces a minimal standalone bundle for efficient Vercel deployment.
- `ignoreDuringBuilds` / `ignoreBuildErrors` — Bypass non-critical lint/type errors during CI builds.

---

##  Communication Channels

### Email (Gmail via Nodemailer)
- Uses the `nodemailer` npm package.
- Supports bulk email sending (iterates efficiently through recipients).
- HTML content with `{{name}}` placeholder auto-substituted per recipient.
- Plain-text version auto-generated by stripping HTML tags.
- The helper functions live in `src/lib/email.ts`:
  - `sendBulkEmails(emails, subject, content)` — Send to multiple recipients
  - `sendSingleEmail(to, subject, content, name)` — Send to one recipient
  - `sendTestEmail(to, name)` — Send a preconfigured test email

### SMS
- HttpSms is supported as a provider via its REST API.

### WhatsApp
- Generates WhatsApp Web links for manual sending via WhatsApp or WhatsApp Desktop.
- Opens `whatsapp://send` links to trigger message directly.

### AI Content Generation (Google Gemini)
- Uses `@google/generative-ai` package.
- `/api/generate-invitation` — Generates full HTML email invitation content.
- `/api/generate-sms` — Generates concise SMS text.
- `/api/generate-whatsapp` — Generates WhatsApp-formatted message text.

---

## 🔐 Admin System

### How It Works
1. The home page (`/`) shows an **Admin Login** button in the header.
2. Clicking it opens a password modal.
3. On submit, the frontend calls `POST /api/admin/login` with the password.
4. The API compares against the `ADMIN_PASSWORD` environment variable.
5. On success, a token is returned and stored in `localStorage` as `admin-token`.
6. The `useAuth` hook reads this token on every page load to determine admin state.
7. The `AdminProtection` component wraps all admin-only pages; if no token is found, the user is redirected.
8. Admins can log out via the **Logout** button in the header, which clears the `admin-token`.

### Admin-Only Routes
- `/dashboard`
- `/students`
- `/guests`
- `/professors`
- `/compose`
- `/invitations`
- `/invitations/[id]`
- `/email-test`

---

##  CSV Import

The system supports bulk import via `.csv` files for Guests (and Students).

### Guest CSV Format
```csv
name,email,organization,designation,phone,category
John Smith,john.smith@company.com,Tech Corp,CEO,1234567890,vip
Jane Doe,jane.doe@startup.com,StartupXYZ,CTO,0987654321,industry
Dr. Mike Johnson,mike@university.edu,State University,Professor,5551234567,alumni
Sarah Wilson,sarah@media.com,News Channel,Reporter,4449876543,media
```

A sample file is available at: `public/sample_guests.csv`

### Supported Guest Categories
`guest` | `vip` | `alumni` | `industry` | `media` | `sponsor` | `speaker`

---

## 🤖 AI-Powered Features

The system integrates **Google Gemini AI** to help admins quickly draft professional invitation content.

### How to Use
In the **Compose** page:
1. Click the **✨ Generate with AI** button.
2. Describe the event (e.g., "Annual Techfest 2025, Department of Computer Science, 15th March").
3. The AI generates a complete, professional HTML invitation.
4. Edit as needed, then send.

The same workflow applies to SMS and WhatsApp message drafting.

---

##  Flowcharts

The repository includes Mermaid-format flowcharts describing the system architecture and invitation dispatch flow:

- `flowchart.mermaid` — Primary system flowchart
- `flowchart-raw.mmd` — Raw source
- `flowchart.png` — Rendered PNG
- `flowchart.svg` — Rendered SVG
- `college-inivitation-flowchart _ Mermaid Chart-2025-09-25-203616.png` — Annotated export

---

##  Key TypeScript Types (`src/lib/types.ts`)

```ts
interface Student { id, name, email, phone?, course, year, createdAt }
interface Guest { id, name, email, phone?, organization, designation, createdAt }
interface Professor { id, name, email, phone?, college, department, createdAt }

interface Invitation {
  id, title, subject, content, createdAt, sentCount
  emailLogs: EmailLog[]
  smsLogs: SmsLog[]
  whatsappLogs: WhatsappLog[]
  analytics?: { totalSent, delivered, opened, clicked, failed, pending, deliveryRate, openRate }
}

interface EmailLog { id, status, sentAt, deliveredAt?, openedAt?, clickedAt?, errorMessage?, messageId?, student?, guest?, professor? }
interface SmsLog { id, status, sentAt, deliveredAt?, errorMessage?, messageId?, phoneNumber, student?, guest?, professor? }
interface WhatsappLog { id, status, sentAt, deliveredAt?, readAt?, errorMessage?, messageId?, phoneNumber, student?, guest?, professor? }

interface ApiResponse<T> { success: boolean, message: string, data?: T, error?: string }
interface InvitationFormData { title, subject, content, recipients: { students: string[], guests: string[], professors: string[] } }
interface MessageStatus { id, status: 'pending'|'sent'|'delivered'|'opened'|'clicked'|'failed', timestamp, error? }
```

---

##  Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^16.1.4 | React framework (App Router) |
| `react` | ^19.2.3 | UI library |
| `react-dom` | ^19.2.3 | DOM renderer |
| `@prisma/client` | ^6.16.2 | Database ORM client |
| `nodemailer` | ^6.9.0 | Email delivery |

| `@google/generative-ai` | ^0.24.1 | Gemini AI content generation |
| `lucide-react` | ^0.544.0 | Icon library |
| `react-icons` | ^5.5.0 | Additional icon sets |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| `prisma` | ^6.16.2 | ORM CLI & migrations |
| `typescript` | ^5.9.2 | Type safety |
| `@types/nodemailer` | ^6.4.17 | TypeScript types |
| `tailwindcss` | ^4 | Utility-first CSS |
| `@tailwindcss/postcss` | ^4 | PostCSS integration |
| `eslint` | ^9 | Linting |
| `eslint-config-next` | 15.5.3 | Next.js ESLint rules |

---

## 🔒 Security Notes

1. **Never commit `.env`** — It contains live API keys, database credentials, and the admin password. The `.gitignore` already excludes it.
2. **Admin password** is stored as a plain environment variable (`ADMIN_PASSWORD`). Consider hashing with bcrypt for production upgrades.
3. **JWT tokens** are stored in localStorage — suitable for low-security internal tools; upgrade to httpOnly cookies for higher-security scenarios.
4. **API routes** don't perform server-side auth checks on most endpoints — the admin protection is client-side only. Consider adding middleware for production hardening.

---

##  Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

---

##  License

This project is private and proprietary. All rights reserved.

---

## 🥇 Option 1 — Gmail + Nodemailer (FREE, Direct apni email se)

Sabse best tere case ke liye — **seedha apni Gmail se emails jaayengi!** [dev](https://dev.to/emmanuel_xs/how-to-send-emails-for-free-in-nextjs-using-gmail-and-nodemailer-4i6e)

### Setup karo:

**Step 1 — Gmail App Password banao**
1. [myaccount.google.com/security](https://myaccount.google.com/security) pe jaao
2. **2-Step Verification** enable karo (agar nahi hai toh)
3. Phir [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) pe jaao
4. App name likho: `college-invitation` → **Create** karo
5. **16 character password** milega → copy karo [weblianz](https://weblianz.com/blog/securely-send-emails-in-nextjs-with-gmail-smtp)

**Step 2 — Install Nodemailer**
```bash
npm install nodemailer
npm install @types/nodemailer
```

**Step 3 — `.env` mein add karo**
```env
GMAIL_USER="tumharagmail@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"   # 16 char wala
```

**Step 4 — `src/lib/email.ts` replace karo** [sendlayer](https://sendlayer.com/blog/how-to-send-emails-in-next-js-via-smtp-with-nodemailer/)
```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendBulkEmails(
  emails: { to: string; name: string }[],
  subject: string,
  htmlContent: string
) {
  const results = [];
  for (const recipient of emails) {
    const personalizedHtml = htmlContent.replace(/{{name}}/g, recipient.name);
    try {
      await transporter.sendMail({
        from: `"College Invitation" <${process.env.GMAIL_USER}>`,
        to: recipient.to,
        subject,
        html: personalizedHtml,
      });
      results.push({ email: recipient.to, status: "sent" });
    } catch (error) {
      results.push({ email: recipient.to, status: "failed", error });
    }
  }
  return results;
}

export async function sendSingleEmail(
  to: string, subject: string, html: string, name: string
) {
  const personalizedHtml = html.replace(/{{name}}/g, name);
  return transporter.sendMail({
    from: `"College Invitation" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: personalizedHtml,
  });
}
```

>  **Gmail free limit:** 500 emails/day — college project ke liye more than enough! [dev](https://dev.to/emmanuel_xs/how-to-send-emails-for-free-in-nextjs-using-gmail-and-nodemailer-4i6e)

***


*Built with ❤️ by Rohit Yadav*
