# AI Ads — AI-Powered Advertisement Generator

## A Comprehensive Technical Report

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement & Motivation](#2-problem-statement--motivation)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Project Directory Structure](#5-project-directory-structure)
6. [Frontend — Detailed Breakdown](#6-frontend--detailed-breakdown)
   - 6.1 [Next.js App Router & Pages](#61-nextjs-app-router--pages)
   - 6.2 [React Components](#62-react-components)
   - 6.3 [State Management — Context API & useReducer](#63-state-management--context-api--usereducer)
   - 6.4 [Custom Hooks](#64-custom-hooks)
   - 6.5 [Frontend Service Layer](#65-frontend-service-layer)
   - 6.6 [Design System & Styling](#66-design-system--styling)
7. [Backend — Detailed Breakdown](#7-backend--detailed-breakdown)
   - 7.1 [Express Server Setup](#71-express-server-setup)
   - 7.2 [Database Layer — MongoDB & Mongoose](#72-database-layer--mongodb--mongoose)
   - 7.3 [API Routes & Endpoints](#73-api-routes--endpoints)
   - 7.4 [Middleware](#74-middleware)
   - 7.5 [Third-Party Integrations (Backend)](#75-third-party-integrations-backend)
8. [AI Ad Generation Pipeline](#8-ai-ad-generation-pipeline)
   - 8.1 [Next.js API Route — `/api/v1/generate-ad`](#81-nextjs-api-route--apiv1generate-ad)
   - 8.2 [AI Service Orchestrator](#82-ai-service-orchestrator)
   - 8.3 [Freepik AI Service](#83-freepik-ai-service)
   - 8.4 [Cloudinary Media Service](#84-cloudinary-media-service)
   - 8.5 [In-Memory Generation Repository](#85-in-memory-generation-repository)
   - 8.6 [Request Validation with Zod](#86-request-validation-with-zod)
9. [Authentication System](#9-authentication-system)
   - 9.1 [Email/Password Authentication](#91-emailpassword-authentication)
   - 9.2 [Google OAuth 2.0 Integration](#92-google-oauth-20-integration)
   - 9.3 [JWT Token Management](#93-jwt-token-management)
   - 9.4 [Frontend Auth Flow](#94-frontend-auth-flow)
10. [Payment System — PhonePe Integration](#10-payment-system--phonepe-integration)
11. [Community Feature](#11-community-feature)
12. [Credit System & Monetization Model](#12-credit-system--monetization-model)
13. [Security Measures](#13-security-measures)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Environment Variables Reference](#15-environment-variables-reference)
16. [Configuration Files Explained](#16-configuration-files-explained)
17. [Data Flow Diagrams](#17-data-flow-diagrams)
18. [Key Design Decisions & Rationale](#18-key-design-decisions--rationale)
19. [Future Enhancements](#19-future-enhancements)
20. [How to Run the Project Locally](#20-how-to-run-the-project-locally)
21. [Conclusion](#21-conclusion)

---

## 1. Project Overview

**AI Ads** is a full-stack SaaS (Software as a Service) web application that leverages Artificial Intelligence to generate professional advertisement images and videos. Users can upload a product photo, provide a description, select an ad style, and the platform automatically generates a polished, commercial-grade advertisement using AI-powered image generation.

The platform follows a **freemium monetization model** — new users receive 50 free credits, with each ad generation consuming one credit. Users can upgrade to a **Pro plan (₹999)** via PhonePe payment gateway for 400 credits and enhanced capabilities.

### Key Features

| Feature | Description |
|---------|-------------|
| **AI Ad Generation** | Generate image/video ads from product photos using Freepik AI |
| **Google OAuth + Email Auth** | Dual authentication with Google Sign-In and email/password |
| **Credit-Based System** | Freemium model with 50 free credits; Pro plan at ₹999 for 400 credits |
| **Community Gallery** | Social feed where users share and like AI-generated ads |
| **Payment Gateway** | PhonePe UPI integration for Pro plan upgrades |
| **Responsive Design** | Dark-themed, glassmorphic UI with Framer Motion animations |
| **Cloud Media Storage** | All media stored on Cloudinary CDN |

---

## 2. Problem Statement & Motivation

**Problem:** Small businesses, freelancers, and individual creators often cannot afford professional advertising agencies or graphic designers to create high-quality product advertisements. Traditional ad creation requires expensive software licenses, design expertise, and significant time investment.

**Solution:** AI Ads democratizes advertisement creation by providing an AI-powered platform where anyone can generate professional-grade product advertisements in seconds. Users simply upload a product photo, write a brief description, and select a visual style — the AI handles the rest.

**Target Audience:**
- Small business owners needing product ads for social media
- E-commerce sellers requiring product marketing visuals
- Social media marketers and content creators
- Freelance designers seeking rapid prototyping tools

---

## 3. System Architecture

The application follows a **decoupled, two-tier architecture** with a clear separation between the frontend and backend services:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                             │
│                    (Next.js on Vercel)                          │
│                                                                 │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│   │  Pages   │  │Components │  │ Context  │  │   Services   │  │
│   │ (App     │  │ (React    │  │ (Auth    │  │ (Axios HTTP  │  │
│   │  Router) │  │  TSX)     │  │  State)  │  │   Clients)   │  │
│   └────┬─────┘  └─────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│        │              │             │               │           │
│   ┌────┴──────────────┴─────────────┴───────────────┴───────┐   │
│   │            Next.js API Routes (/api/v1/...)             │   │
│   │        (AI Generation Pipeline — Server-Side)           │   │
│   └─────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │  HTTP/REST
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                         SERVER TIER                             │
│                   (Express.js on Render)                        │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│   │  Routes  │  │  Models  │  │Middleware │  │   Config     │   │
│   │ (Auth,   │  │ (User,   │  │ (JWT     │  │ (DB, OAuth,  │   │
│   │  User,   │  │  Post)   │  │  Auth)   │  │  Cloudinary) │   │
│   │  Payment,│  │          │  │          │  │              │   │
│   │  Comm.)  │  │          │  │          │  │              │   │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│        │             │             │               │            │
│   ┌────┴─────────────┴─────────────┴───────────────┴────────┐   │
│   │                    Express Server                       │   │
│   └─────────────────────────┬───────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
        ┌─────┴─────┐  ┌─────┴─────┐   ┌──────┴──────┐
        │ MongoDB   │  │Cloudinary │   │  Freepik    │
        │ Atlas     │  │  CDN      │   │  AI API     │
        │ (NoSQL DB)│  │ (Media)   │   │ (Img Gen)   │
        └───────────┘  └───────────┘   └─────────────┘
```

### Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Separate frontend/backend deployments** | Allows independent scaling; frontend on Vercel (edge CDN), backend on Render (Node runtime) |
| **Next.js API routes for AI pipeline** | Keeps AI generation on the same origin as the frontend, avoiding CORS; leverages Vercel's serverless functions |
| **Express backend for auth/data** | Full control over session management, OAuth callbacks, and database operations |
| **MongoDB Atlas** | Schema-flexible NoSQL database ideal for varying user/post data structures |
| **Cloudinary CDN** | Optimized media delivery with built-in transformations and global CDN |

---

## 4. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.1.0 | React meta-framework with App Router, SSR, and API routes |
| **React** | 19.0.0 | UI component library |
| **TypeScript** | 5.7.0 | Static type checking for JavaScript |
| **Tailwind CSS** | 3.4.0 | Utility-first CSS framework |
| **Framer Motion** | 11.15.0 | Declarative animation library for React |
| **Axios** | 1.13.5 | HTTP client for API communication |
| **Zod** | 4.3.6 | Schema validation for request payloads |
| **html2canvas** | 1.4.1 | Client-side screenshot/canvas capture |
| **uuid** | 13.0.0 | Universally unique identifier generation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 4.18.2 | Minimal Node.js web framework |
| **Mongoose** | 8.0.0 | MongoDB ODM (Object Document Mapper) |
| **Passport.js** | 0.7.0 | Authentication middleware |
| **passport-google-oauth20** | 2.0.0 | Google OAuth 2.0 strategy |
| **jsonwebtoken** | 9.0.2 | JWT creation and verification |
| **bcryptjs** | 2.4.3 | Password hashing with salt rounds |
| **Cloudinary SDK** | 2.9.0 | Cloud media upload and management |
| **Multer** | 2.0.2 | Multipart form-data parsing (file uploads) |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing middleware |
| **express-session** | 1.17.3 | Server-side session management for OAuth |
| **dotenv** | 16.3.1 | Environment variable loading |

### External Services

| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud-hosted NoSQL database |
| **Cloudinary** | Media storage, transformation, and CDN delivery |
| **Freepik AI API** | AI-powered text-to-image generation |
| **Google Cloud Console** | OAuth 2.0 credentials for Google Sign-In |
| **PhonePe Payment Gateway** | UPI-based payment processing for Pro upgrades |
| **Vercel** | Frontend deployment (Edge CDN + Serverless Functions) |
| **Render** | Backend deployment (Node.js web service) |

### Development Tools

| Tool | Purpose |
|------|---------|
| **nodemon** | Auto-restart Node.js server during development |
| **ESLint** | JavaScript/TypeScript code linting |
| **PostCSS + Autoprefixer** | CSS post-processing and vendor prefixing |

---

## 5. Project Directory Structure

```
AI_Ads/
│
├── .env                        # Root env vars (Freepik API key)
├── .env.example                # Template for root env vars
├── .env.local                  # Local overrides (Cloudinary credentials)
├── .gitignore                  # Git ignore rules
├── eslint.config.mjs           # ESLint flat config
├── next-env.d.ts               # Next.js TypeScript declarations
├── next.config.ts              # Next.js configuration
├── package.json                # Frontend dependencies & scripts
├── postcss.config.js           # PostCSS plugins (Tailwind, Autoprefixer)
├── render.yaml                 # Render.com deployment manifest
├── tailwind.config.ts          # Tailwind CSS customization
├── tsconfig.json               # TypeScript compiler options
├── vercel.json                 # Vercel deployment settings
│
├── public/                     # Static assets (favicon, images)
│
├── src/                        # ──── FRONTEND SOURCE CODE ────
│   │
│   ├── app/                    # Next.js App Router (pages)
│   │   ├── layout.tsx          #   Root layout (fonts, metadata, Navbar, Footer)
│   │   ├── page.tsx            #   Landing page (Hero, Features, CTA)
│   │   ├── providers.tsx       #   Client-side context providers wrapper
│   │   ├── globals.css         #   Global CSS variables & utility classes
│   │   │
│   │   ├── auth/
│   │   │   └── callback/       #   Google OAuth callback handler page
│   │   │
│   │   ├── signin/
│   │   │   └── page.tsx        #   Sign-in page (email + Google)
│   │   │
│   │   ├── signup/
│   │   │   └── page.tsx        #   Sign-up page (email + Google)
│   │   │
│   │   ├── generator/
│   │   │   └── page.tsx        #   ★ Core feature: AI Ad Generator page
│   │   │
│   │   ├── community/
│   │   │   └── page.tsx        #   Community gallery & social feed
│   │   │
│   │   ├── payment/
│   │   │   └── callback/       #   PhonePe payment callback handler
│   │   │
│   │   └── api/
│   │       └── v1/
│   │           └── generate-ad/
│   │               ├── route.ts        #   POST /api/v1/generate-ad
│   │               ├── [id]/           #   GET  /api/v1/generate-ad/:id
│   │               └── history/        #   GET  /api/v1/generate-ad/history
│   │
│   ├── components/             # Reusable React components
│   │   ├── Navbar.tsx          #   Navigation bar with auth state
│   │   ├── Footer.tsx          #   Site footer with links
│   │   ├── ProtectedRoute.tsx  #   Auth gate component (redirect if not logged in)
│   │   ├── hero/               #   Landing page hero section
│   │   │   ├── HeroCanvas.tsx  #     Animated gradient background
│   │   │   ├── HeroOverlay.tsx #     Hero text, CTA, and typing animation
│   │   │   ├── ParticleField.tsx#    Floating particle animation
│   │   │   └── GlassPanel.tsx  #     Glassmorphic decorative panels
│   │   ├── features/           #   Landing page features section
│   │   │   ├── FeaturesCanvas.tsx#   Scroll-driven feature cards
│   │   │   ├── FeaturesSection.tsx#  Feature list layout
│   │   │   └── FeatureCard.tsx #     Individual feature card
│   │   └── ui/                 #   Primitive UI components
│   │       ├── Button.tsx      #     Reusable button (primary/outline/ghost)
│   │       ├── GlassCard.tsx   #     Glassmorphic card wrapper
│   │       ├── Input.tsx       #     Styled form input
│   │       ├── Logo.tsx        #     SVG brand logo
│   │       └── SectionHeading.tsx#   Section heading with gradient text
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Global auth state via React Context + useReducer
│   │
│   ├── hooks/
│   │   └── useAuth.ts          # Custom hook to consume AuthContext
│   │
│   ├── services/               # API client functions (Axios-based)
│   │   ├── api.ts              #   Axios instance with interceptors
│   │   ├── auth.ts             #   Auth API calls (login, signup, getMe)
│   │   ├── community.ts       #   Community API calls (CRUD, likes)
│   │   ├── payment.ts         #   Payment API calls (initiate, verify)
│   │   └── user.ts            #   User API calls (profile, credits)
│   │
│   └── lib/                    # Server-side utilities (used in API routes)
│       ├── auth/
│       │   └── helpers.ts      #   Auth user extraction from request
│       ├── db/
│       │   └── generation-repository.ts  #  In-memory generation store
│       ├── middleware/
│       │   └── validate.ts     #   Zod schemas for request validation
│       ├── services/
│       │   ├── ai.service.ts   #   AI generation orchestrator
│       │   ├── freepik.service.ts  #  Freepik Text-to-Image API client
│       │   └── cloudinary.service.ts # Cloudinary upload/delete operations
│       └── types/
│           ├── generation.ts   #   TypeScript interfaces for generations
│           └── index.ts        #   Type re-exports
│
└── server/                     # ──── BACKEND SOURCE CODE ────
    ├── .env                    #   Server env vars
    ├── .env.example            #   Template for server env vars
    ├── .gitignore              #   Ignore node_modules, .env
    ├── package.json            #   Backend dependencies & scripts
    ├── server.js               #   ★ Express server entry point
    │
    ├── config/
    │   ├── db.js               #   MongoDB connection via Mongoose
    │   ├── passport.js         #   Google OAuth strategy configuration
    │   └── cloudinary.js       #   Cloudinary SDK configuration
    │
    ├── middleware/
    │   └── auth.js             #   JWT verification middleware
    │
    ├── models/
    │   ├── User.js             #   Mongoose User schema & methods
    │   └── Post.js             #   Mongoose Post schema (community)
    │
    └── routes/
        ├── auth.js             #   /api/auth/* (signup, login, Google OAuth)
        ├── user.js             #   /api/user/* (profile, credit deduction)
        ├── community.js        #   /api/community/* (posts CRUD, likes)
        └── payment.js          #   /api/payment/* (PhonePe initiation, verify, webhook)
```

---

## 6. Frontend — Detailed Breakdown

### 6.1 Next.js App Router & Pages

The frontend uses **Next.js 15 App Router** for file-system-based routing. Each directory under `src/app/` corresponds to a URL route.

#### Root Layout — `src/app/layout.tsx`

The root layout wraps every page with:
- **Google Fonts**: Inter (body text) and Playfair Display (headings) loaded via `next/font/google` for optimized font delivery
- **SEO Metadata**: Title, description, keywords, and Open Graph tags for social sharing
- **Global CSS**: Design tokens and utility classes
- **Providers**: Auth context wrapper for global state
- **Navbar + Footer**: Persistent site-wide navigation

#### Landing Page — `src/app/page.tsx`

The homepage is composed of three sections:
1. **Hero Section**: Animated gradient canvas (`HeroCanvas`), floating particles (`ParticleField`), glassmorphic panels (`GlassPanels`), and overlay text with CTA buttons (`HeroOverlay`)
2. **Features Section**: Scroll-driven 3D animated feature cards (`FeaturesCanvas`) showcasing platform capabilities
3. **CTA Section**: Final call-to-action with trust badges ("No credit card required", "5 free ads", "Cancel anytime")

#### Generator Page — `src/app/generator/page.tsx`

This is the **core feature** of the application. It is a **protected route** (requires authentication).

**Input Controls (Left Panel):**
- Brand Name (text input)
- Product Description (textarea — **required**)
- Product Photo upload (drag-and-drop — **required**)
- Model Photo upload (optional — for human model ads)
- Ad Style selector: Luxury, Bold, Minimal, Cinematic, Playful, Corporate
- Output Type toggle: Image Ad (~15s) or Video Ad (~2-3 min)
- Aspect Ratio: 16:9 (landscape) or 9:16 (portrait)
- Duration slider: 4-12 seconds

**Preview Panel (Right Panel):**
- Real-time status indicator (Waiting → Generating → Ready)
- Animated loading state with progress bar and elapsed timer
- Generated media preview (image or video player)
- Action buttons: Download, Share to Community, Generate New

**Share to Community Modal:**
- Pre-fills title with brand name and style
- Pre-fills description with product description
- Optional website/product link
- Uploads generated media to community gallery

#### Sign-In Page — `src/app/signin/page.tsx`

- Email + password login form
- Google OAuth sign-in button
- Link to sign-up page
- Error display for failed authentication

#### Sign-Up Page — `src/app/signup/page.tsx`

- Name, email, password registration form
- Password validation (minimum 6 characters)
- Google OAuth sign-up button
- Link to sign-in page

#### Community Page — `src/app/community/page.tsx`

- **Masonry grid** of community posts (3 columns on desktop, 2 on tablet, 1 on mobile)
- Each post card shows: image/video, title, description, author avatar, timestamp, like count
- **Create Post modal**: Upload image/video, add title, description, website link
- **Like toggle**: Heart icon with real-time count update
- **Delete confirmation modal**: Only visible on user's own posts
- **Skeleton loading**: Pulse animation placeholders while data loads
- **Empty state**: Friendly message with "Post Your Ad" CTA

#### OAuth Callback — `src/app/auth/callback/`

Handles the redirect from Google OAuth. Extracts the JWT token from URL query parameters and stores it in localStorage.

#### Payment Callback — `src/app/payment/callback/`

Handles the redirect from PhonePe after payment. Extracts transaction ID, calls the verification endpoint, and updates user role if successful.

---

### 6.2 React Components

#### Navbar (`src/components/Navbar.tsx`)

A **fixed-position** navigation header with:
- **Scroll-aware styling**: Transparent on top, glass-blur background when scrolled
- **Desktop navigation**: Features, Generator, Community, Pricing links
- **Authentication-aware CTAs**:
  - Logged out: "Sign In" + "Get Started" buttons
  - Logged in: Credits badge, Upgrade to Pro button (free users), User avatar, Sign Out
- **Mobile hamburger menu**: Animated three-line toggle with slide-down menu
- **Framer Motion**: Entry animation (slides in from top)

#### ProtectedRoute (`src/components/ProtectedRoute.tsx`)

A wrapper component that:
1. Shows a loading spinner while auth state initializes
2. Redirects to `/signin` if user is not authenticated
3. Renders children only when authenticated

#### Hero Components (`src/components/hero/`)

| Component | Description |
|-----------|-------------|
| `HeroCanvas.tsx` | Full-screen animated gradient background using CSS keyframes |
| `HeroOverlay.tsx` | Hero headline, subtitle, CTA buttons, and animated typing effect |
| `ParticleField.tsx` | Floating particle animation using randomized positions and opacity |
| `GlassPanel.tsx` | Decorative glassmorphic panels with gradient borders |

#### Feature Components (`src/components/features/`)

| Component | Description |
|-----------|-------------|
| `FeaturesCanvas.tsx` | Scroll-driven animated showcase of platform features |
| `FeaturesSection.tsx` | Grid layout for feature cards with staggered entry animations |
| `FeatureCard.tsx` | Individual card with icon, title, description, and hover effects |

#### UI Primitives (`src/components/ui/`)

| Component | Props | Description |
|-----------|-------|-------------|
| `Button.tsx` | `variant`, `size`, `fullWidth`, `disabled` | Three variants: primary (gradient), outline, ghost |
| `GlassCard.tsx` | `children`, `className` | Wrapper with glassmorphic background |
| `Input.tsx` | Standard input props + `label`, `error` | Styled form input with label and error display |
| `Logo.tsx` | `size` | SVG brand logo with gradient fill |
| `SectionHeading.tsx` | `title`, `subtitle` | Gradient text heading with subtitle |

---

### 6.3 State Management — Context API & useReducer

The application uses **React Context API** combined with **`useReducer`** for global authentication state management.

#### File: `src/context/AuthContext.tsx`

**State Shape:**
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: "free" | "pro";
    credits: number;
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
```

**Actions (Reducer Pattern):**

| Action | Trigger | Effect |
|--------|---------|--------|
| `AUTH_LOADING` | Login/signup initiated | Set `loading: true`, clear errors |
| `AUTH_SUCCESS` | Successful auth | Set user, token, `isAuthenticated: true` |
| `AUTH_ERROR` | Failed auth | Clear user, set error message |
| `LOGOUT` | User signs out | Reset to initial state |
| `UPDATE_USER` | Credit deduction, profile refresh | Partial update of user object |
| `CLEAR_ERROR` | User dismisses error | Clear error message |

**Context Value (Exposed Methods):**

| Method | Description |
|--------|-------------|
| `login(email, password)` | Calls auth API, stores JWT in localStorage |
| `signup(name, email, password)` | Creates account, stores JWT |
| `googleLogin()` | Redirects to Google OAuth URL |
| `logout()` | Removes JWT from localStorage, resets state |
| `refreshUser()` | Fetches latest user profile from server |
| `updateCredits(credits)` | Optimistically updates credit count in state |
| `clearError()` | Clears authentication error |

**Session Restoration:**
On app mount, the context checks for a stored JWT in localStorage. If found, it calls `GET /api/auth/me` to validate the token and restore the session. If the token is expired or invalid, it is removed and the user is logged out.

---

### 6.4 Custom Hooks

#### `useAuth()` — `src/hooks/useAuth.ts`

A convenience hook that consumes `AuthContext` and throws an error if used outside the `AuthProvider`:

```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

---

### 6.5 Frontend Service Layer

The service layer provides a clean API abstraction using **Axios** with centralized configuration.

#### Base API Client — `src/services/api.ts`

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});
```

**Request Interceptor**: Automatically attaches JWT token from localStorage to every request as `Authorization: Bearer <token>`.

**Response Interceptor**: Handles 401 responses globally by removing the stored token (session expired).

#### Auth Service — `src/services/auth.ts`

| Method | HTTP Request | Description |
|--------|-------------|-------------|
| `loginWithEmail(email, password)` | `POST /auth/login` | Email/password login |
| `signupWithEmail(name, email, password)` | `POST /auth/signup` | Create new account |
| `getGoogleOAuthUrl()` | — | Returns the Google OAuth initiation URL |
| `getMe()` | `GET /auth/me` | Fetch current user from JWT |

#### Community Service — `src/services/community.ts`

| Method | HTTP Request | Description |
|--------|-------------|-------------|
| `getPosts(page, limit)` | `GET /community` | Paginated feed of community posts |
| `getMyPosts()` | `GET /community/my` | Current user's posts |
| `createPost(formData)` | `POST /community` | Upload image + create post |
| `shareFromGenerator(payload)` | `POST /community/share` | Share AI-generated ad to community |
| `deletePost(postId)` | `DELETE /community/:id` | Delete own post |
| `toggleLike(postId)` | `POST /community/:id/like` | Toggle like on/off |

#### Payment Service — `src/services/payment.ts`

| Method | HTTP Request | Description |
|--------|-------------|-------------|
| `initiateUpgrade()` | `POST /payment/initiate` | Start PhonePe payment flow |
| `verifyPayment(txnId)` | `GET /payment/verify/:txnId` | Check payment status |

#### User Service — `src/services/user.ts`

| Method | HTTP Request | Description |
|--------|-------------|-------------|
| `getProfile()` | `GET /user/profile` | Fetch user profile |
| `deductCredits(amount)` | `POST /user/credits/deduct` | Deduct credits after generation |

---

### 6.6 Design System & Styling

#### Color Palette — CSS Custom Properties (`globals.css`)

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#0F0F14` | App background (near-black) |
| `--surface` | `#16161D` | Card/panel backgrounds |
| `--surface-light` | `#1E1E28` | Elevated surfaces, inputs |
| `--border` | `#2A2A36` | Subtle borders |
| `--accent-purple` | `#7C3AED` | Primary accent color |
| `--accent-indigo` | `#6366F1` | Secondary accent, gradients |
| `--accent-gold` | `#F59E0B` | Pro badges, credits |
| `--text-primary` | `#FFFFFF` | Main text |
| `--text-secondary` | `#A1A1AA` | Subtitles, descriptions |
| `--text-muted` | `#71717A` | Placeholders, timestamps |

#### Typography

- **Body Font**: Inter (Google Font) — clean sans-serif for readability
- **Display Font**: Playfair Display (Google Font) — elegant serif for headings

#### Utility Classes

| Class | Effect |
|-------|--------|
| `.glass` | Glassmorphic panel: semi-transparent background with 20px blur |
| `.glass-strong` | Stronger glassmorphism: 85% opacity with 40px blur |
| `.glow-purple` | Purple box-shadow glow effect |
| `.glow-gold` | Gold box-shadow glow effect |
| `.text-gradient` | White-to-gray gradient text (background-clip) |
| `.text-gradient-accent` | Purple-to-indigo-to-gold gradient text |
| `.gradient-border` | Pseudo-element gradient border around cards |

#### Custom Animations (Tailwind Config)

| Animation | Description |
|-----------|-------------|
| `glow-pulse` | Pulsing opacity (0.4 → 1 → 0.4) over 3 seconds |
| `float` | Vertical floating motion (±20px) over 6 seconds |
| `particle-rise` | Particles rising from bottom to top of viewport |
| `shimmer` | Horizontal shimmer effect for loading states |

---

## 7. Backend — Detailed Breakdown

### 7.1 Express Server Setup

**File: `server/server.js`**

The Express server is the centralized backend handling authentication, user management, payments, and community features.

**Boot Sequence:**
1. **DNS Configuration**: Sets Google DNS (`8.8.8.8`, `8.8.4.4`) to resolve MongoDB Atlas SRV records reliably
2. **Environment Loading**: `dotenv.config()` loads `.env` variables
3. **MongoDB Connection**: `connectDB()` establishes Mongoose connection
4. **Middleware Stack**:
   - **CORS**: Allows requests from `CLIENT_URL` and any `*.vercel.app` subdomain
   - **Body Parsing**: JSON and URL-encoded with 25MB limit (for base64 image payloads)
   - **Session**: Cookie-based sessions for Passport OAuth flow
   - **Passport**: Initialize and enable session serialization
5. **Route Registration**: Auth, User, Payment, Community routes under `/api/*`
6. **Health Check**: `GET /api/health` returns uptime and timestamp
7. **Global Error Handler**: Catches unhandled errors and returns 500

**CORS Configuration (Key Detail):**
```javascript
origin: (origin, callback) => {
  if (!origin) return callback(null, true);  // Allow non-browser requests
  if (allowedOrigins.some(
    (allowed) => origin === allowed || origin.endsWith(".vercel.app")
  )) {
    return callback(null, true);
  }
  callback(new Error("Not allowed by CORS"));
},
credentials: true,
```
This allows the frontend on any Vercel deployment URL while blocking unauthorized origins.

---

### 7.2 Database Layer — MongoDB & Mongoose

#### Connection — `server/config/db.js`

Simple async connection using the `MONGODB_URI` environment variable. On failure, the process exits with code 1 (crash-restart in production).

#### User Model — `server/models/User.js`

```javascript
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, select: false },  // Hidden by default in queries
  googleId:  { type: String, default: null },
  avatar:    { type: String, default: "" },
  role:      { type: String, enum: ["free", "pro"], default: "free" },
  credits:   { type: Number, default: 50 },
}, { timestamps: true });
```

**Key Features:**
| Feature | Implementation |
|---------|---------------|
| **Password hashing** | `pre("save")` hook uses bcrypt with 12 salt rounds |
| **Password comparison** | `comparePassword()` instance method uses `bcrypt.compare()` |
| **Selective field hiding** | `password` field has `select: false` — excluded from queries unless explicitly requested with `.select("+password")` |
| **Profile serialization** | `toProfile()` method returns a safe subset of user data (excludes password, googleId) |
| **Timestamps** | Auto-generated `createdAt` and `updatedAt` fields |

#### Post Model — `server/models/Post.js`

```javascript
const postSchema = new mongoose.Schema({
  user:           { type: ObjectId, ref: "User", required: true },
  title:          { type: String, required: true, maxlength: 100 },
  description:    { type: String, maxlength: 500, default: "" },
  imageUrl:       { type: String, required: true },
  cloudinaryId:   { type: String, required: true },
  mediaType:      { type: String, enum: ["image", "video"], default: "image" },
  link:           { type: String, default: "" },
  likes:          [{ type: ObjectId, ref: "User" }],
}, { timestamps: true });
```

**Key Features:**
| Feature | Implementation |
|---------|---------------|
| **User reference** | `ObjectId` with `ref: "User"` for Mongoose `populate()` |
| **Like system** | Array of user ObjectIds; enables "has user liked?" checks |
| **Virtual field** | `likeCount` virtual computes `likes.length` |
| **JSON virtuals** | `toJSON/toObject` configured to include virtuals |

---

### 7.3 API Routes & Endpoints

#### Authentication Routes — `server/routes/auth.js`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register with name, email, password |
| `POST` | `/api/auth/login` | ❌ | Login with email and password |
| `GET` | `/api/auth/me` | ✅ JWT | Get current user profile from token |
| `GET` | `/api/auth/google` | ❌ | Initiate Google OAuth flow |
| `GET` | `/api/auth/google/callback` | ❌ | Handle Google OAuth redirect |

**Signup Flow:**
1. Validate required fields (name, email, password)
2. Check password length ≥ 6 characters
3. Check for existing user with same email
4. Create user (password auto-hashed by pre-save hook)
5. Generate 30-day JWT token
6. Return token + user profile

**Login Flow:**
1. Find user by email (with `+password` select)
2. If user has no password (Google-only account), return appropriate error
3. Compare password using bcrypt
4. Generate and return JWT token

**Google OAuth Flow:**
1. Frontend redirects to `GET /api/auth/google`
2. Passport redirects to Google consent screen
3. Google redirects back to `/api/auth/google/callback`
4. Passport strategy checks: existing user by googleId → existing user by email → create new user
5. Generate JWT and redirect to `CLIENT_URL/auth/callback?token=<jwt>`

#### User Routes — `server/routes/user.js`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/user/profile` | ✅ | Get user profile |
| `POST` | `/api/user/credits/deduct` | ✅ | Deduct credits (default: 1) |

**Credit Deduction Logic:**
- Validates user exists and has sufficient credits
- Decrements credit count atomically
- Returns remaining credits

#### Community Routes — `server/routes/community.js`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/community` | ❌ | List all posts (paginated, public) |
| `POST` | `/api/community` | ✅ | Create post via file upload |
| `POST` | `/api/community/share` | ✅ | Share generated ad (base64 payload) |
| `GET` | `/api/community/my` | ✅ | Get current user's posts |
| `DELETE` | `/api/community/:id` | ✅ | Delete own post (+ Cloudinary cleanup) |
| `POST` | `/api/community/:id/like` | ✅ | Toggle like on a post |

**Post Creation Flow (File Upload):**
1. Multer parses multipart form-data (10MB limit, images/videos only)
2. File buffer uploaded to Cloudinary with auto-optimization
3. Post document created in MongoDB with Cloudinary URL and public ID
4. Post populated with user info and returned

**Share from Generator Flow (Base64):**
1. Receives base64-encoded image data from the generator page
2. Guards against payloads exceeding 25MB
3. Converts base64 to Buffer
4. Uploads to Cloudinary
5. Creates post document

**Like Toggle:**
- If user already liked: remove from likes array
- If not liked: push to likes array
- Returns new `liked` state and `likeCount`

**Delete Post:**
- Verifies post ownership (`post.user === req.user.id`)
- Deletes media from Cloudinary
- Removes post from MongoDB

#### Payment Routes — `server/routes/payment.js`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payment/initiate` | ✅ | Create PhonePe payment request |
| `GET` | `/api/payment/verify/:txnId` | ✅ | Verify payment status |
| `POST` | `/api/payment/webhook` | ❌ | PhonePe server-to-server callback |

*(Detailed payment flow in Section 10)*

---

### 7.4 Middleware

#### JWT Authentication — `server/middleware/auth.js`

Every protected route uses this middleware:

```javascript
const auth = async (req, res, next) => {
  // 1. Extract token from "Authorization: Bearer <token>" header
  // 2. Verify token using jwt.verify() with JWT_SECRET
  // 3. Find user by decoded userId
  // 4. Attach user to req.user
  // 5. Call next()
};
```

**Error Handling:**

| Error | Status | Message |
|-------|--------|---------|
| No token | 401 | "No token provided. Please log in." |
| Invalid token | 401 | "Invalid token. Please log in again." |
| Expired token | 401 | "Token expired. Please log in again." |
| User not found | 401 | "User not found. Please log in again." |

---

### 7.5 Third-Party Integrations (Backend)

#### Cloudinary — `server/config/cloudinary.js`

Configures the Cloudinary SDK using environment variables:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Used in community routes for media uploads with auto-optimization:
- Image transformations: 1200×1200 max, `crop: limit`, `quality: auto`, `fetch_format: auto`
- Organized in `ai-ads-community` folder

#### Passport.js — `server/config/passport.js`

Configures the **Google OAuth 2.0** strategy:
- **Serialization**: Stores user ID in session
- **Deserialization**: Finds user by ID from MongoDB
- **Strategy callback**: Checks googleId → email → creates new user
- **Graceful degradation**: If Google credentials are not configured, logs a warning instead of crashing

---

## 8. AI Ad Generation Pipeline

This is the most technically complex part of the application. The pipeline runs on **Next.js API routes** (serverless functions on Vercel).

### 8.1 Next.js API Route — `/api/v1/generate-ad`

**File: `src/app/api/v1/generate-ad/route.ts`**

**Request Flow:**
```
Client (FormData) → Next.js API Route → Zod Validation → AI Service
                                                           ↓
                                                   Freepik AI API
                                                           ↓
                                                   Cloudinary Upload
                                                           ↓
                                                   Response to Client
```

**Steps:**
1. **Authentication**: Extracts user from request (stub in development)
2. **Content-Type Detection**: Handles both `multipart/form-data` and `application/json`
3. **Field Extraction**: Parses productDescription, brandName, duration, style, aspectRatio
4. **Zod Validation**: Validates all fields against `generateAdSchema`
5. **File Processing**: Converts product/model photos from File objects to Buffers
6. **Size Enforcement**: Free plan limited to 10MB per file
7. **Generation Record**: Creates a tracking record in in-memory store
8. **AI Generation**: Calls `aiService.generateAdVideo()` with all parameters
9. **Status Update**: Marks generation as succeeded with media URLs
10. **Response**: Returns `{ success, videoUrl, cloudinaryPublicId, generationId }`

### 8.2 AI Service Orchestrator

**File: `src/lib/services/ai.service.ts`**

The `AIService` class orchestrates the full pipeline:

```
                    ┌──────────────────┐
                    │   AIService      │
                    │ generateAdVideo()│
                    └────────┬─────────┘
                             │
                ┌────────────┼─────────────┐
                │            │             │
        ┌───────┴──────┐ ┌──┴──────┐ ┌────┴─────────┐
        │Upload product│ │Upload   │ │Enhance prompt│
        │image to CDN  │ │model to │ │with style    │
        │              │ │CDN      │ │modifiers     │
        └───────┬──────┘ └──┬──────┘ └────┬─────────┘
                │           │             │
                └───────────┼─────────────┘
                            │
                    ┌───────┴────────┐
                    │Generate image  │
                    │via Freepik API │
                    └───────┬────────┘
                            │
                    ┌───────┴────────┐
                    │Upload result   │
                    │to Cloudinary   │
                    └───────┬────────┘
                            │
                    ┌───────┴────────┐
                    │Return URLs and │
                    │public ID       │
                    └────────────────┘
```

### 8.3 Freepik AI Service

**File: `src/lib/services/freepik.service.ts`**

**Prompt Enhancement:**
Constructs a highly descriptive prompt by combining:
- User's product description
- Brand name
- Style-specific modifiers (see table below)
- Universal quality modifiers: "highly detailed, beautiful, commercial advertisement photography, 8k resolution"

**Style Modifiers:**

| Style | Prompt Modifier |
|-------|----------------|
| Cinematic | "cinematic lighting, film grain, dramatic shadows, professional color grading, 4k quality" |
| Minimal | "clean minimalist design, white space, elegant typography, modern aesthetic" |
| Bold | "vibrant colors, high contrast, dynamic composition, energetic motion, impactful visuals" |
| Corporate | "professional business look, clean structured layout, trustworthy blue tones, polished" |
| Playful | "colorful fun animation style, whimsical youthful energy, bright warm palette" |
| Luxury | "golden accents, rich textures, elegant premium feel, sophisticated dark background, refined" |

**API Call:**
```
POST https://api.freepik.com/v1/ai/text-to-image
Headers: { "x-freepik-api-key": <API_KEY> }
Body:    { "prompt": <enhanced_prompt> }
```

Returns a base64-encoded image which is decoded into a Buffer.

### 8.4 Cloudinary Media Service

**File: `src/lib/services/cloudinary.service.ts`**

Provides four operations:

| Function | Description |
|----------|-------------|
| `uploadVideo(buffer)` | Upload video with MP4 format, auto-thumbnail generation |
| `uploadImage(buffer)` | Upload image with 1280×1280 limit, quality optimization |
| `uploadThumbnail(buffer)` | Upload 1280×720 thumbnail image |
| `deleteMedia(publicId)` | Delete media by public ID with cache invalidation |

**Lazy Configuration**: SDK is configured on first use, not at import time, ensuring environment variables are available at runtime.

### 8.5 In-Memory Generation Repository

**File: `src/lib/db/generation-repository.ts`**

Uses the **Repository Pattern** with an interface (`IGenerationRepository`) and an in-memory Map-based implementation for development:

| Method | Description |
|--------|-------------|
| `create(generation)` | Store a new generation record |
| `findById(id)` | Retrieve by generation ID |
| `findByUserId(userId, page, pageSize)` | Paginated user history |
| `updateStatus(id, update)` | Update status, progress, URLs |
| `delete(id)` | Remove generation record |

The `setGenerationRepository()` function allows swapping in a production database-backed implementation.

### 8.6 Request Validation with Zod

**File: `src/lib/middleware/validate.ts`**

```typescript
const generateAdSchema = z.object({
  prompt:      z.string().min(3).max(500),
  brandName:   z.string().max(100).optional().default(""),
  duration:    z.number().min(4).max(12),
  style:       z.enum(["cinematic", "minimal", "bold", "corporate", "playful", "luxury"]),
  aspectRatio: z.enum(["9:16", "16:9"]).default("16:9"),
});
```

---

## 9. Authentication System

The application implements a **dual authentication system**: Email/Password + Google OAuth 2.0.

### 9.1 Email/Password Authentication

**Registration (Signup):**
```
Client → POST /api/auth/signup { name, email, password }
       → Validate fields
       → Check email uniqueness
       → Create User (password auto-hashed via pre-save hook, 12 bcrypt rounds)
       → Generate JWT (30-day expiry)
       → Return { token, user }
```

**Login:**
```
Client → POST /api/auth/login { email, password }
       → Find user by email (with +password)
       → If no password (Google-only): return error
       → bcrypt.compare(password, hash)
       → Generate JWT
       → Return { token, user }
```

### 9.2 Google OAuth 2.0 Integration

**Flow:**
```
1. User clicks "Sign In with Google"
2. Frontend redirects to: GET /api/auth/google
3. Passport redirects to: accounts.google.com/o/oauth2 (consent screen)
4. User grants permission
5. Google redirects to: GET /api/auth/google/callback?code=...
6. Passport exchanges code for access token
7. Passport strategy:
   a. Find user by googleId → return existing user
   b. Find user by email → link Google account to existing user
   c. Create new user with Google profile data
8. Generate JWT token
9. Redirect to: CLIENT_URL/auth/callback?token=<jwt>
10. Frontend extracts token from URL, stores in localStorage
```

### 9.3 JWT Token Management

| Parameter | Value |
|-----------|-------|
| **Algorithm** | HS256 (default) |
| **Secret** | `JWT_SECRET` environment variable |
| **Expiry** | 30 days |
| **Payload** | `{ userId: <MongoDB ObjectId> }` |
| **Transport** | `Authorization: Bearer <token>` header |
| **Storage** | Browser `localStorage` |

### 9.4 Frontend Auth Flow

```
App Mount
    │
    ├── Check localStorage for token
    │     │
    │     ├── No token → dispatch LOGOUT → show Sign In
    │     │
    │     └── Token found → GET /api/auth/me
    │           │
    │           ├── 200 OK → dispatch AUTH_SUCCESS
    │           │
    │           └── 401 Error → remove token → dispatch LOGOUT
    │
    ├── Login/Signup → API call → store token → dispatch AUTH_SUCCESS
    │
    └── Logout → remove token → dispatch LOGOUT
```

---

## 10. Payment System — PhonePe Integration

The application integrates **PhonePe Payment Gateway** for Pro plan upgrades (₹999).

### Payment Flow

```
┌───────────────────────────────────────────────────────────────┐
│ 1. User clicks "Upgrade to Pro"                              │
│    → POST /api/payment/initiate                              │
│                                                               │
│ 2. Server creates PhonePe payment request:                    │
│    - merchantTransactionId: TXN_{userId}_{timestamp}         │
│    - amount: 99900 (paisa = ₹999)                            │
│    - redirectUrl: CLIENT_URL/payment/callback?txnId=...      │
│    - callbackUrl: SERVER_URL/api/payment/webhook             │
│                                                               │
│ 3. Server computes SHA256 checksum:                           │
│    sha256(base64Payload + "/pg/v1/pay" + SALT_KEY) + "###" + │
│    SALT_INDEX                                                │
│                                                               │
│ 4. Server sends to PhonePe API → receives redirect URL       │
│    → Returns { redirectUrl, transactionId } to client        │
│                                                               │
│ 5. User is redirected to PhonePe payment page                │
│    → Completes UPI payment                                    │
│                                                               │
│ 6. PhonePe redirects to CLIENT_URL/payment/callback          │
│    → Frontend calls GET /api/payment/verify/:txnId           │
│    → Server checks PhonePe status API                        │
│    → If PAYMENT_SUCCESS: upgrade user to Pro (400 credits)   │
│                                                               │
│ 7. PhonePe also calls POST /api/payment/webhook              │
│    (Server-to-server, independent of redirect)               │
│    → Verifies webhook signature                               │
│    → If PAYMENT_SUCCESS: upgrade user to Pro                 │
└───────────────────────────────────────────────────────────────┘
```

### Checksum Verification

PhonePe uses SHA256-based checksum for request/response integrity:

```javascript
// Request checksum
sha256(base64Payload + endpoint + SALT_KEY) + "###" + SALT_INDEX

// Webhook verification
sha256(encodedResponse + SALT_KEY) === receivedHash
```

### User Upgrade Logic

```javascript
async function upgradeUserFromTransaction(transactionId) {
  // Transaction ID format: TXN_{userId}_{timestamp}
  const userId = transactionId.split("_")[1];
  const user = await User.findById(userId);
  if (user && user.role !== "pro") {
    user.role = "pro";
    user.credits = 400;
    await user.save();
  }
}
```

---

## 11. Community Feature

The Community is a **social gallery** where authenticated users can share their AI-generated advertisements and interact with others' creations.

### Features

| Feature | Description |
|---------|-------------|
| **Public Feed** | Anyone can browse the gallery (no auth required) |
| **Post Creation** | Authenticated users can upload images/videos with title, description, link |
| **Share from Generator** | One-click sharing of generated ads from the generator page |
| **Like System** | Toggle-based like with real-time count updates |
| **Post Deletion** | Users can only delete their own posts (with Cloudinary cleanup) |
| **Pagination** | Server-side pagination (20 posts per page default) |
| **Media Support** | Both images and videos with type badges |

### Data Flow (Create Post)

```
1. User fills form: title, description, link, image file
2. Client creates FormData with all fields
3. POST /api/community (multipart/form-data)
4. Multer parses file into memory buffer (10MB max)
5. Buffer uploaded to Cloudinary (auto-optimized)
6. Post document created in MongoDB
7. Post populated with user data
8. Response returned to client
9. UI optimistically prepends new post to feed
```

---

## 12. Credit System & Monetization Model

### Free Tier

| Parameter | Value |
|-----------|-------|
| Initial credits | 50 |
| Cost per generation | 1 credit |
| Max file size | 10 MB |
| Max generations/day | 5 |
| Max duration | 4 seconds |
| Max resolution | 1024×576 |

### Pro Tier (₹999)

| Parameter | Value |
|-----------|-------|
| Credits | 400 |
| Cost per generation | 1 credit |
| Max file size | Unlimited |
| Max generations/day | 50 |
| Max duration | 5 seconds |
| Max resolution | 1920×1080 |

### Credit Deduction Flow

```
1. User clicks "Generate"
2. Frontend checks hasCredits (user.credits > 0)
3. API processes generation
4. On success: POST /api/user/credits/deduct { amount: 1 }
5. Server decrements credits atomically
6. Frontend updates credit count optimistically
7. Navbar credit badge reflects new count
```

---

## 13. Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| **Password Storage** | Bcrypt hashing | 12 salt rounds via `pre("save")` hook |
| **Password Hiding** | Field exclusion | `select: false` on password field |
| **Authentication** | JWT Bearer tokens | 30-day expiry, HS256 algorithm |
| **Authorization** | Route-level middleware | `auth.js` middleware on protected routes |
| **Post Ownership** | Server-side check | `post.user.toString() !== req.user.id` before delete |
| **Input Validation** | Zod schemas | Server-side validation of all generation parameters |
| **File Validation** | Multer fileFilter | Only image/video MIME types accepted |
| **File Size Limits** | Multer + custom | 10MB for Multer, 25MB for base64 payloads |
| **CORS** | Whitelist | Only `CLIENT_URL` and `*.vercel.app` domains allowed |
| **Payment Security** | SHA256 checksum | PhonePe request/webhook signature verification |
| **XSS Prevention** | React auto-escaping | JSX automatically escapes user-provided strings |
| **Error Masking** | Production mode | Detailed errors only in development; generic in production |
| **Token Cleanup** | Interceptor | Auto-remove expired tokens on 401 response |

---

## 14. Deployment Architecture

```
                    ┌────────────────┐
                    │   DNS / CDN    │
                    │   (Vercel Edge)│
                    └───────┬────────┘
                            │
            ┌───────────────┼───────────────┐
            │                               │
    ┌───────┴────────┐            ┌─────────┴──────────┐
    │    VERCEL       │            │      RENDER        │
    │  (Frontend +    │   REST     │    (Backend API)   │
    │   AI API Routes)│◄──────────►│                    │
    │                 │            │   Express.js       │
    │  Next.js SSR    │            │   Node.js runtime  │
    │  Serverless Fn  │            │                    │
    └───────┬─────────┘            └────────┬───────────┘
            │                               │
            │                    ┌──────────┼──────────┐
            │                    │          │          │
     ┌──────┴───────┐    ┌──────┴──┐ ┌─────┴───┐ ┌───┴────┐
     │   Freepik    │    │MongoDB  │ │Cloudinary│ │PhonePe │
     │   AI API     │    │ Atlas   │ │  CDN     │ │Gateway │
     └──────────────┘    └─────────┘ └─────────┘ └────────┘
```

### Vercel Configuration — `vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Render Configuration — `render.yaml`

Declares a Node.js web service with:
- **Root directory**: `server/`
- **Build command**: `npm install`
- **Start command**: `node server.js`
- **Port**: 10000
- **Environment variables**: All secrets synced separately (not committed)

---

## 15. Environment Variables Reference

### Frontend (`.env.local`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `FREEPIK_API_KEY` | Freepik AI API key | `FPSX...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123...` |

### Backend (`server/.env`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | Random 256-bit string |
| `SESSION_SECRET` | Express session secret | Random string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `CLIENT_URL` | Frontend URL | `http://localhost:3000` |
| `SERVER_URL` | Backend URL (for webhooks) | `http://localhost:5000` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `abc123...` |
| `PHONEPE_MERCHANT_ID` | PhonePe merchant ID | `MERCHANT123` |
| `PHONEPE_SALT_KEY` | PhonePe checksum salt | `key123...` |
| `PHONEPE_SALT_INDEX` | PhonePe salt index | `1` |
| `PHONEPE_API_URL` | PhonePe API endpoint | `https://api.phonepe.com/apis/hermes` |

---

## 16. Configuration Files Explained

| File | Purpose |
|------|---------|
| `package.json` (root) | Frontend dependencies, scripts (`dev`, `build`, `start`, `lint`) |
| `package.json` (server) | Backend dependencies, scripts (`start`, `dev`) |
| `next.config.ts` | Next.js config; `images.unoptimized: true` for static export compatibility |
| `tailwind.config.ts` | Custom colors, fonts, animations, gradients extending Tailwind |
| `tsconfig.json` | TypeScript compiler options with `@/` path alias for `src/` |
| `postcss.config.js` | PostCSS plugins: Tailwind CSS + Autoprefixer |
| `eslint.config.mjs` | ESLint flat config with Next.js + TypeScript rules |
| `vercel.json` | Vercel deployment settings (framework, build commands) |
| `render.yaml` | Render deployment manifest (service type, env vars, commands) |
| `.gitignore` | Excludes `node_modules/`, `.env`, `.next/`, `out/` from version control |

---

## 17. Data Flow Diagrams

### 17.1 User Registration Flow

```
User fills signup form
        │
        ▼
POST /api/auth/signup
        │
        ├── Validate fields
        ├── Check email uniqueness
        ├── Create User document
        │     └── pre("save") → bcrypt.hash(password, 12)
        ├── Generate JWT (30-day)
        │
        ▼
Return { token, user } → Store token in localStorage
                        → dispatch AUTH_SUCCESS
                        → Redirect to /generator
```

### 17.2 Ad Generation Flow

```
User fills form + uploads product photo
        │
        ▼
POST /api/v1/generate-ad (FormData)
        │
        ├── Authenticate user
        ├── Parse FormData fields
        ├── Validate with Zod schema
        ├── Convert File to Buffer
        │
        ├── Upload product photo to Cloudinary → productImageUrl
        ├── Upload model photo to Cloudinary → modelImageUrl (optional)
        │
        ├── Enhance prompt with style modifiers
        │     e.g., "Brand: Nike. White sneakers, golden accents,
        │      rich textures, elegant premium feel, 8k resolution"
        │
        ├── POST https://api.freepik.com/v1/ai/text-to-image
        │     └── Returns base64 image
        │
        ├── Upload generated image to Cloudinary → videoUrl
        │
        ├── Update generation record → status: "succeeded"
        │
        ▼
Return { success, videoUrl, cloudinaryPublicId, generationId }
        │
        ▼
Frontend displays generated ad in preview panel
        │
        ├── POST /api/user/credits/deduct (1 credit)
        └── Update credit badge in Navbar
```

### 17.3 Community Share Flow

```
User clicks "Share to Community" on generated ad
        │
        ▼
Frontend opens share modal
User enters title, description, link
        │
        ▼
POST /api/community/share
{
  title, description, link,
  videoUrl: "https://res.cloudinary.com/...",
  cloudinaryPublicId: "adwork/images/abc123",
  mediaType: "image"
}
        │
        ▼
Server downloads image from videoUrl → Buffer
Upload to Cloudinary (community folder)
Create Post document in MongoDB
        │
        ▼
Return post with populated user data
Frontend shows success → closes modal
```

---

## 18. Key Design Decisions & Rationale

| Decision | Why |
|----------|-----|
| **Next.js App Router** | File-based routing, built-in SSR/SSG, API routes for serverless AI pipeline |
| **Separate Express Backend** | OAuth callbacks require persistent sessions; Next.js API routes are stateless |
| **Context + useReducer over Redux** | Simpler for single-concern auth state; no need for global store complexity |
| **Axios over fetch** | Interceptors for automatic token attachment and 401 handling |
| **Cloudinary for media** | Automatic format optimization, CDN delivery, transformation pipeline |
| **In-Memory Generation Repository** | Fast development iteration; easily swappable with MongoDB/PostgreSQL via interface |
| **Zod for validation** | TypeScript-first schema validation with excellent error messages |
| **Freepik AI over direct Stable Diffusion** | Managed API eliminates GPU infrastructure costs; reliable uptime |
| **PhonePe over Stripe** | India-focused SaaS; PhonePe supports UPI which has 80%+ market share in India |
| **Dark theme with glassmorphism** | Premium SaaS aesthetic; reduces eye strain for creative workflows |
| **Framer Motion over CSS animations** | Declarative API, spring physics, gesture support, `AnimatePresence` for exit animations |
| **JWT in localStorage** | Simpler than httpOnly cookies for a SPA; acceptable trade-off for this use case |
| **Base64 upload for shared ads** | Avoids re-downloading from Cloudinary URL; direct buffer-to-upload pipeline |
| **Google DNS (8.8.8.8)** | Some ISPs block MongoDB Atlas SRV record lookups; Google DNS resolves reliably |

---

## 19. Future Enhancements

| Enhancement | Description |
|-------------|-------------|
| **Video Ad Generation** | Integrate Freepik or Runway video APIs for actual video output |
| **Prompt History** | Persist generation history in MongoDB (currently in-memory) |
| **User Dashboard** | Analytics on credits used, ads generated, community engagement |
| **Template Library** | Pre-built ad templates for common industries |
| **A/B Testing** | Generate multiple variants and compare performance |
| **Team Collaboration** | Multi-user workspaces for agencies |
| **API Access** | Public API for programmatic ad generation |
| **Watermark Removal** | Pro feature to remove "AI Ads" watermark |
| **Comments on Community Posts** | Social engagement beyond likes |
| **Notification System** | Email/push notifications for likes and comments |
| **Rate Limiting** | Redis-based rate limiting per user/IP |
| **Production Database for Generations** | Replace InMemoryRepository with MongoDB-backed repository |

---

## 20. How to Run the Project Locally

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account (free tier works)
- **Cloudinary** account (free tier works)
- **Freepik API** key
- *(Optional)* Google Cloud Console project for OAuth
- *(Optional)* PhonePe Merchant account

### Step 1: Clone the Repository

```bash
git clone https://github.com/Jatin-L1/FSE-Project.git
cd FSE-Project
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### Step 4: Configure Environment Variables

**Frontend** — Create `.env.local` in root:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
FREEPIK_API_KEY=your_freepik_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Backend** — Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-ads
JWT_SECRET=your_random_secret_here
SESSION_SECRET=another_random_secret
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 5: Start the Backend

```bash
cd server
npm run dev
```
Expected output:
```
🚀 AI Ads Server running on http://localhost:5000
📡 API: http://localhost:5000/api
🔐 Google OAuth: http://localhost:5000/api/auth/google
✅ MongoDB Connected: cluster.mongodb.net
```

### Step 6: Start the Frontend

```bash
# In a new terminal, from the project root
npm run dev
```
Expected output:
```
▲ Next.js 15.1.0
- Local: http://localhost:3000
```

### Step 7: Open the Application

Navigate to `http://localhost:3000` in your browser.

---

## 21. Conclusion

**AI Ads** is a production-grade, full-stack SaaS application that demonstrates modern web development practices across the entire stack:

- **Frontend**: React 19 with Next.js 15 App Router, TypeScript, Tailwind CSS, Framer Motion, Context API state management, and a service-oriented architecture
- **Backend**: Express.js REST API with Mongoose ODM, Passport.js authentication (Email + Google OAuth), JWT authorization, and PhonePe payment integration
- **AI Pipeline**: Freepik Text-to-Image API orchestrated through a Next.js serverless function with Cloudinary CDN for media delivery
- **DevOps**: Split deployment on Vercel (frontend) and Render (backend) with a declarative deployment manifest

The application solves a real-world problem — making professional advertisement creation accessible to everyone — while showcasing full-stack engineering skills including API design, authentication, payment processing, cloud media management, and premium UI/UX design.

---

*This document was generated as a comprehensive technical reference for the AI Ads project. Last updated: May 2026.*
