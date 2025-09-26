
<div align="center">

# 🎓 College Invitation System

### AI-Powered Multi-Channel Communication Platform for Educational Institutions

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<p align="center">
  <img src="https://img.shields.io/github/stars/rohityadav-alpha/college-invitation-system?style=social" alt="GitHub stars">
  <img src="https://img.shields.io/github/forks/rohityadav-alpha/college-invitation-system?style=social" alt="GitHub forks">
  <img src="https://img.shields.io/github/license/rohityadav-alpha/college-invitation-system" alt="License">
  <img src="https://img.shields.io/github/last-commit/rohityadav-alpha/college-invitation-system" alt="Last commit">
</p>

**🌟 [Live Demo](https://college-invitation-system.vercel.app)** • **📖 [Documentation](#-installation-guide)** • **🚀 [Quick Start](#-quick-start)**

</div>

---

## 🌟 Overview

A comprehensive **AI-powered invitation management system** designed specifically for educational institutions. Streamline your college communication with multi-channel messaging, recipient management, and intelligent content generation - all in one powerful platform.

### 🎯 Key Highlights
- **🤖 AI-Generated Content** - Smart email, WhatsApp & SMS templates
- **📊 Multi-Channel Campaigns** - Email + WhatsApp + SMS simultaneously
- **👥 Complete User Management** - Students, Guests & Professors
- **📱 Mobile-First Design** - Responsive across all devices
- **🚀 Production Ready** - Deployed on Vercel with enterprise-grade architecture

---

## ✨ Features

### 🤖 AI-Powered Content Generation
| Feature | Description |
|---------|-------------|
| **Smart Email Templates** | Context-aware HTML email generation with personalization |
| **WhatsApp Optimizer** | Message formatting with emoji optimization |
| **SMS Generator** | 160-character optimized content with dynamic variables |
| **Multi-Style Support** | Professional, Casual, Exciting, and Formal tones |
| **Variable Replacement** | Automatic `{{name}}`, `{{eventName}}` personalization |

### 📧 Multi-Channel Communication
| Channel | Features |
|---------|----------|
| **📧 Email** | Bulk campaigns, HTML templates, delivery tracking, real-time analytics |
| **📱 WhatsApp** | Auto-generated links, phone number formatting |
| **📲 SMS** | httpSMS integration, rate limiting, delivery status |
| **🚀 Combo Mode** | Send across all channels simultaneously |
| **📊 Analytics** | Open rates, click rates, delivery status, campaign performance |

### 👥 Comprehensive User Management
| Category | Management Features |
|----------|-------------------|
| **👨‍🎓 Students** | Course tracking, year management, CSV import/export |
| **👤 Guests** | Organization details, designation, category management |
| **👨‍🏫 Professors** | Department mapping, expertise tracking, college affiliation |
| **🔄 CRUD Operations** | Full Create, Read, Update, Delete functionality |
| **🔍 Advanced Search** | Filter by course, year, department, category |

### 📊 Advanced Features
- **📈 Analytics Dashboard** - Real-time campaign performance with MailerSend analytics
- **📱 Responsive Design** - Mobile-first approach
- **🔐 Admin Authentication** - Secure access control
- **🎨 Professional UI** - Clean, modern interface with icons
- **⚡ Performance Optimized** - Fast loading, efficient queries
- **📂 Bulk Operations** - CSV import/export, mass updates
- **🔄 Webhook Integration** - Real-time email event tracking

---

## 🛠️ Technology Stack

<div align="center">

| **Category** | **Technologies** |
|:---|:---|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, React Icons |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | PostgreSQL (Neon Serverless) |
| **AI Integration** | Google Gemini AI |
| **Email Service** | MailerSend |
| **SMS Service** | httpSMS |
| **Authentication** | Custom Admin System |
| **Deployment** | Vercel |
| **Development** | ESLint, Prettier, TypeScript |

</div>

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

```
✅ Node.js 18+ installed
✅ npm or yarn package manager
✅ Git for version control
✅ Basic knowledge of React/Next.js
```

### ⚡ One-Command Setup

```
# Clone and setup in one go
git clone https://github.com/rohityadav-alpha/college-invitation-system.git
cd college-invitation-system && npm install && cp .env.example .env.local
```

---

## 📋 Complete Installation Guide

### **Step 1: Repository Setup**

```
# Clone the repository
git clone https://github.com/rohityadav-alpha/college-invitation-system.git

# Navigate to project directory
cd college-invitation-system

# Install dependencies
npm install
# or
yarn install
```

### **Step 2: Environment Configuration**

Create your environment file:

```
# Copy environment template
cp .env.example .env.local
```

---

## 🔑 API Keys & Services Setup

### **1. 🗄️ Neon Database Setup (PostgreSQL)**

#### **Create Neon Database:**
1. **Visit:** [https://neon.tech](https://neon.tech)
2. **Sign Up:** Create account with GitHub/Google
3. **Create Project:**
   - Project Name: `College Invitation System`
   - Region: Choose nearest to your location
   - PostgreSQL Version: Latest stable
4. **Get Connection String:**
   - Go to Dashboard → Connection Details
   - Copy **Connection String**
   - Format: `postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/database?sslmode=require`

#### **Add to .env.local:**
```
DATABASE_URL="postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/database?sslmode=require"
```

---

### **2. 🤖 Google Gemini AI Setup**

#### **Get Gemini API Key:**
1. **Visit:** [https://ai.google.dev](https://ai.google.dev)
2. **Get API Key:**
   - Click "Get API Key in Google AI Studio"
   - Sign in with Google account
3. **Create New Project:**
   - Select existing project or create new
   - Enable Generative AI API
4. **Generate API Key:**
   - Go to "API Keys" section
   - Click "Create API Key"
   - Copy the key (starts with `AIza...`)

#### **Add to .env.local:**
```
GEMINI_API_KEY="AIzaSyC-your_actual_gemini_api_key_here"
```

---

### **3. 📧 MailerSend Email Setup**

#### **Create MailerSend Account:**
1. **Visit:** [https://mailersend.com](https://mailersend.com)
2. **Sign Up:** Free account (12,000 emails/month)
3. **Verify Email:** Confirm your email address
4. **Domain Verification:**
   - Go to Email Domains
   - Add your domain (or use their trial domain)
   - Complete DNS verification

#### **Get API Key:**
1. **Go to:** API Tokens section
2. **Create API Token:**
   - Name: `College Invitation System`
   - Scopes: Email Send (required)
   - Generate token
3. **Copy API Token** (starts with `mlsnd_`)

#### **Setup Sender Identity:**
1. **Go to:** Email Domains or use trial domain
2. **Get From Email:** Use format like `noreply@trial-xxx.mlsender.net`
3. **Or add custom domain** for professional emails

#### **Add to .env.local:**
```
MAILERSEND_API_KEY="mlsnd_your_actual_mailersend_api_key_here"
MAILERSEND_FROM_EMAIL="noreply@trial-xxx.mlsender.net"
```

**⚠️ Important:** For production, use your verified domain email.

---

### **4. 📱 httpSMS Setup (Optional)**

#### **Setup Android Phone SMS:**
1. **Download App:**
   - Install [httpSMS](https://play.google.com/store/apps/details?id=com.httpsms) from Play Store
   - Open app on your Android phone
2. **Create Account:**
   - Sign up with email/phone
   - Complete phone verification
3. **Get API Credentials:**
   - Go to Settings → API
   - Copy **API Key** (starts with `httpsms_`)
   - Note your **Phone ID** (format: `+919876543210`)

#### **Add to .env.local:**
```
HTTPSMS_API_KEY="httpsms_your_actual_api_key_here"
HTTPSMS_PHONE_ID="+919876543210"
```

**📱 Note:** Your phone must stay online for SMS sending to work.

---

### **5. 🔐 Admin Authentication Setup**

#### **Configure Admin Credentials:**

```
ADMIN_EMAIL="admin@yourcollege.edu"
ADMIN_PASSWORD="your_secure_password_123"
NEXTAUTH_SECRET="generate_random_32_char_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

#### **Generate Secure Secret:**
```
# Generate random secret
openssl rand -base64 32
# or visit: https://generate-secret.vercel.app/32
```

---

## 📝 Complete .env.local Template

```
# ===== DATABASE CONFIGURATION =====
DATABASE_URL="postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/database?sslmode=require"

# ===== AI CONFIGURATION =====
GEMINI_API_KEY="AIzaSyC-your_actual_gemini_api_key_here"

# ===== EMAIL CONFIGURATION (MailerSend) =====
MAILERSEND_API_KEY="mlsnd_your_actual_mailersend_api_key_here"
MAILERSEND_FROM_EMAIL="noreply@trial-xxx.mlsender.net"

# ===== SMS CONFIGURATION (Optional) =====
HTTPSMS_API_KEY="httpsms_your_api_key_here"
HTTPSMS_PHONE_ID="+919876543210"

# ===== AUTHENTICATION =====
ADMIN_EMAIL="admin@yourcollege.edu"
ADMIN_PASSWORD="your_secure_password"
NEXTAUTH_SECRET="your_random_32_character_secret_key"
NEXTAUTH_URL="http://localhost:3000"

# ===== ENVIRONMENT =====
NODE_ENV="development"
```

---

## 🗄️ Database Setup

### **Initialize Database:**

```
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### **Database Schema Overview:**

The system uses the following main entities:

```
-- Students Table
Student {
  id: String (Primary Key)
  name: String
  email: String (Unique)
  course: String
  year: String
  phone: String (Optional)
  createdAt: DateTime
}

-- Guests Table  
Guest {
  id: String (Primary Key)
  name: String
  email: String (Unique)
  organization: String
  designation: String
  category: String
  phone: String (Optional)
  createdAt: DateTime
}

-- Professors Table
Professor {
  id: String (Primary Key)
  name: String
  email: String (Unique)
  college: String
  department: String
  designation: String
  expertise: String (Optional)
  phone: String (Optional)
  createdAt: DateTime
}

-- Communication Tables
Invitation, EmailLog, SMSLog, WhatsAppLog
```

---

## 🚀 Development

### **Start Development Server:**

```
# Start development server
npm run dev
# or
yarn dev

# Server will be available at: http://localhost:3000
```

### **Available Scripts:**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npx prisma studio` | Open database GUI |
| `npx prisma generate` | Generate Prisma client |

---

## 📁 Project Structure

```
college-invitation-system/
├── 📁 src/
│   ├── 📁 app/                      # Next.js App Router
│   │   ├── 📁 api/                  # API Routes
│   │   │   ├── 📁 students/         # Student CRUD operations
│   │   │   ├── 📁 guests/           # Guest management
│   │   │   ├── 📁 professors/       # Professor management
│   │   │   ├── 📁 generate-*/       # AI content generation
│   │   │   ├── 📁 send-*/           # Communication APIs
│   │   │   ├── 📁 webhooks/         # MailerSend webhooks
│   │   │   └── 📁 admin/            # Authentication
│   │   ├── 📁 students/             # Student management pages
│   │   ├── 📁 guests/               # Guest management pages
│   │   ├── 📁 professors/           # Professor management pages
│   │   ├── 📁 compose/              # Message composer
│   │   ├── 📁 invitations/          # Invitation history
│   │   ├── 📁 dashboard/            # Admin dashboard
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Homepage
│   ├── 📁 components/               # Reusable components
│   │   ├── 📁 icons/                # Icon system
│   │   ├── AdminProtection.tsx      # Auth protection
│   │   └── Navigation.tsx           # Main navigation
│   ├── 📁 hooks/                    # Custom React hooks
│   └── 📁 lib/                      # Utility functions
│       ├── prisma.ts                # Database client
│       └── email.ts                 # MailerSend utilities
├── 📁 prisma/                       # Database schema
│   └── schema.prisma                # Prisma schema file
├── 📁 public/                       # Static assets
├── 📄 .env.example                  # Environment template
├── 📄 .env.local                    # Your environment (ignored by git)
├── 📄 next.config.ts                # Next.js configuration
├── 📄 tailwind.config.ts            # Tailwind configuration
├── 📄 package.json                  # Dependencies & scripts
└── 📄 README.md                     # This file
```

---

## 🔌 API Documentation

### **Authentication Endpoints**
```
POST /api/admin/login          # Admin login
```

### **User Management**
```
# Students
GET    /api/students           # Get all students
POST   /api/students           # Create student
PUT    /api/students?id=xxx    # Update student
DELETE /api/students?id=xxx    # Delete student
GET    /api/students/export    # Export to CSV
POST   /api/students/import    # Import from CSV

# Guests (same pattern)
GET    /api/guests             # Get all guests
POST   /api/guests             # Create guest
# ... and so on

# Professors (same pattern)
GET    /api/professors         # Get all professors
POST   /api/professors         # Create professor
# ... and so on
```

### **AI Content Generation**
```
POST /api/generate-invitation  # Generate email content
POST /api/generate-whatsapp   # Generate WhatsApp message
POST /api/generate-sms        # Generate SMS content
```

### **Communication**
```
POST /api/send-bulk-email-enhanced    # Send bulk emails via MailerSend
POST /api/send-whatsapp-web          # Generate WhatsApp links
POST /api/send-phone-sms             # Send SMS via phone
POST /api/send-combo-bulk            # Multi-channel campaign
```

### **Analytics & Webhooks**
```
GET  /api/invitations               # Get invitation history
POST /api/invitations               # Create invitation record
GET  /api/invitations/[id]          # Get specific invitation
POST /api/webhooks/mailersend       # MailerSend webhook handler
GET  /api/email-analytics           # Email analytics data
POST /api/sync-mailersend-analytics # Sync real-time analytics
```

---

## 🎯 Usage Examples

### **1. AI Email Generation**

```
const generateEmail = async () => {
  const response = await fetch('/api/generate-invitation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: 'Technical Workshop',
      eventName: 'React.js Masterclass',
      committeeName: 'Technical Committee', 
      venue: 'Main Auditorium',
      date: '2025-12-25',
      time: '10:00 AM',
      additionalInfo: 'Bring your laptops'
    })
  })
  
  const result = await response.json()
  console.log(result.content) // Generated HTML email
}
```

### **2. Multi-Channel Campaign with MailerSend**

```
const sendComboCampaign = async () => {
  const response = await fetch('/api/send-combo-bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Workshop Invitation',
      subject: 'Join Our React.js Workshop',
      content: '<h1>Join our React.js Workshop</h1><p>Date: Dec 25, 2025</p>',
      smsMessage: 'Workshop alert: React.js Masterclass on Dec 25',
      studentIds: ['student1', 'student2'],
      guestIds: ['guest1']
    })
  })
  
  const result = await response.json()
  console.log(`Campaign sent: ${result.emailResults.successCount} emails, ${result.smsResults.successCount} SMS`)
}
```

### **3. MailerSend Analytics Sync**

```
const syncEmailAnalytics = async () => {
  const response = await fetch('/api/sync-mailersend-analytics', {
    method: 'POST'
  })
  
  const result = await response.json()
  console.log(`Synced ${result.updated} email activities`)
}
```

---

## 🚀 Deployment

### **Deploy to Vercel (Recommended)**

#### **Step 1: Prepare for Deployment**

```
# Ensure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### **Step 2: Connect to Vercel**

1. **Visit:** [https://vercel.com](https://vercel.com)
2. **Import Project:** Connect your GitHub repository
3. **Configure:**
   - Project Name: `college-invitation-system`
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`

#### **Step 3: Environment Variables**

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=your_neon_database_url
GEMINI_API_KEY=your_gemini_api_key
MAILERSEND_API_KEY=your_mailersend_api_key
MAILERSEND_FROM_EMAIL=your_verified_email
HTTPSMS_API_KEY=your_httpsms_key
HTTPSMS_PHONE_ID=your_phone_number
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
NEXTAUTH_SECRET=your_32_char_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

#### **Step 4: Setup MailerSend Webhooks**

1. **In MailerSend Dashboard:**
   - Go to Webhooks section
   - Add webhook URL: `https://your-domain.vercel.app/api/webhooks/mailersend`
   - Select events: `sent`, `delivered`, `opened`, `clicked`, `bounced`, `spam_complaints`

#### **Step 5: Deploy**

- Click **Deploy**
- Wait for build completion
- Visit your live application!

---

## 🔧 Troubleshooting

### **Common Issues & Solutions:**

<details>
<summary><strong>Database Connection Issues</strong></summary>

```
# Verify DATABASE_URL format
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"

# Test connection
npx prisma db push

# Reset database if corrupted
npx prisma migrate reset
```
</details>

<details>
<summary><strong>MailerSend Email Issues</strong></summary>

```
# Verify API key format (should start with "mlsnd_")
# Check sender email is verified in MailerSend
# Ensure domain verification is complete
# Check webhook URL is accessible
# Test email sending in MailerSend dashboard
```
</details>

<details>
<summary><strong>Gemini AI Not Working</strong></summary>

```
# Verify API key format (should start with "AIza")
# Check Google AI Studio quotas
# Ensure billing is enabled for production usage
```
</details>

<details>
<summary><strong>Webhook Integration Issues</strong></summary>

```
# Ensure webhook URL is publicly accessible
# Check webhook signature verification
# Verify webhook events are selected in MailerSend
# Test webhook with MailerSend's webhook tester
```
</details>

---

## 📊 MailerSend Features

### **Email Analytics:**
- **Real-time Tracking:** Opens, clicks, bounces, spam complaints
- **Delivery Status:** Sent, delivered, failed tracking
- **Webhook Integration:** Automatic status updates
- **Advanced Analytics:** Click-through rates, open rates

### **Benefits over Traditional SMTP:**
- **Higher Deliverability:** 99%+ delivery rates
- **Real-time Analytics:** Instant email tracking
- **Professional Templates:** Built-in email templates
- **Domain Reputation:** Dedicated IP options
- **Webhook Support:** Real-time event notifications

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### **Development Workflow:**

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes with proper TypeScript types
4. **Test** thoroughly in development mode
5. **Commit** with clear message: `git commit -m 'Add amazing feature'`
6. **Push** to branch: `git push origin feature/amazing-feature`
7. **Create** Pull Request with detailed description

### **Code Standards:**

- ✅ Use TypeScript for all new code
- ✅ Follow existing code style and naming conventions
- ✅ Add JSDoc comments for complex functions
- ✅ Ensure responsive design for new UI components
- ✅ Test with different user roles and permissions
- ✅ Update documentation if adding new features

---

## 📄 License & Legal

### **MIT License**

```
MIT License

Copyright (c) 2025 Rohit Yadav

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👤 Author & Support

<div align="center">

### **Rohit Yadav**
*Full-Stack Developer | AI Enthusiast | Education Technology*

[![GitHub](https://img.shields.io/badge/GitHub-rohityadav--alpha-black?style=for-the-badge&logo=github)](https://github.com/rohityadav-alpha)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/rohit-yadav-dev)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=for-the-badge&logo=gmail)](mailto:rohityadav.dev@gmail.com)

</div>

### **Getting Help:**

- 🐛 **Bug Reports:** [Create an Issue](https://github.com/rohityadav-alpha/college-invitation-system/issues)
- 💡 **Feature Requests:** [Discussions](https://github.com/rohityadav-alpha/college-invitation-system/discussions)
- 📧 **Direct Support:** rohityadav.dev@gmail.com
- 📚 **Documentation:** This README + inline code comments

---

## 🙏 Acknowledgments

Special thanks to the incredible open-source community:

- 🚀 **Next.js Team** - For the amazing React framework
- 🤖 **Google AI** - For Gemini API and AI capabilities
- 🎨 **Tailwind CSS** - For the utility-first CSS framework
- 🗄️ **Prisma Team** - For the fantastic database toolkit
- 💙 **TypeScript** - For type-safe JavaScript development
- 📧 **MailerSend** - For reliable email delivery and analytics
- 📱 **httpSMS** - For SMS integration capabilities
- 🌟 **Open Source Community** - For continuous inspiration and support

### **Third-Party Services:**

- **Neon** - Serverless PostgreSQL database
- **Vercel** - Deployment and hosting platform
- **Google AI** - Gemini AI for content generation
- **MailerSend** - Email delivery and analytics service
- **httpSMS** - SMS gateway service

---

<div align="center">

## ⭐ Show Your Support

**If this project helped you or your institution, please consider giving it a ⭐!**

[![GitHub stars](https://img.shields.io/github/stars/rohityadav-alpha/college-invitation-system?style=social)](https://github.com/rohityadav-alpha/college-invitation-system/stargazers)

**Built with ❤️ for educational institutions worldwide**

---

### 🚀 Ready to Transform Your College Communication?

<p align="center">
  <a href="#-quick-start" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Get%20Started-Now-success?style=for-the-badge&logo=rocket" alt="Get Started">
  </a>
  <a href="https://college-invitation-system.vercel.app" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/View%20Live%20Demo-blue?style=for-the-badge&logo=vercel" alt="Live Demo">
  </a>
</p>

**Transform the way your institution communicates. Start today!**

</div>
