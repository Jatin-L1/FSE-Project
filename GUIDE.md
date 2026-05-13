# 🎯 AI Ads Project - Complete Interview Preparation Guide

> **Your Ultimate Resource to Confidently Explain Every Aspect of This Project**

---

## 📋 Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Technology Stack Deep Dive](#2-technology-stack-deep-dive)
3. [Folder Structure Explained](#3-folder-structure-explained)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Design](#6-database-design)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [AI/LLM Integration](#8-aillm-integration)
9. [API Design & Flow](#9-api-design--flow)
10. [State Management](#10-state-management)
11. [Security Considerations](#11-security-considerations)
12. [Performance Optimizations](#12-performance-optimizations)
13. [Error Handling](#13-error-handling)
14. [Deployment Strategy](#14-deployment-strategy)
15. [Design Patterns Used](#15-design-patterns-used)
16. [Scalability Concepts](#16-scalability-concepts)
17. [Interview Questions by Module](#17-interview-questions-by-module)
18. [Real-World Analogies](#18-real-world-analogies)
19. [Common Pitfalls & How to Avoid Them](#19-common-pitfalls--how-to-avoid-them)
20. [Practice Interview Scenarios](#20-practice-interview-scenarios)

---

## 1. Project Overview & Architecture

### 🎬 What is AI Ads?

**Elevator Pitch (30 seconds):**
"AI Ads is a full-stack SaaS platform that generates professional video advertisements using AI. Users upload product images, select a style, and our system uses Google's Gemini AI and Freepik API to create cinematic ads in seconds. It's built with Next.js 15, Express, MongoDB, and integrates Cloudinary for media storage."

### 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  Next.js 15 (React 19) + TypeScript + Tailwind CSS         │
│  - Server Components & Client Components                     │
│  - App Router (File-based routing)                          │
│  - Framer Motion (Animations)                               │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/HTTPS (REST API)
                  │ JWT Token in Authorization Header
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│  Next.js API Routes (/api/v1/*)                             │
│  - Request Validation (Zod)                                  │
│  - Authentication Middleware                                 │
│  - File Upload Handling (FormData)                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND SERVER LAYER                       │
│  Express.js + Node.js                                        │
│  - RESTful API Endpoints                                     │
│  - JWT Authentication                                        │
│  - Passport.js (Google OAuth)                               │
│  - CORS Configuration                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┼─────────┬─────────────┐
        ▼         ▼         ▼             ▼
    ┌──────┐ ┌────────┐ ┌─────────┐ ┌──────────┐
    │MongoDB│ │Cloudinary│ │Freepik │ │Google AI │
    │Database│ │(Media)  │ │API     │ │(Gemini)  │
    └──────┘ └────────┘ └─────────┘ └──────────┘
```

### 🎯 Core Features

1. **User Authentication**
   - Email/Password signup & login
   - Google OAuth 2.0 integration
   - JWT-based session management

2. **AI Ad Generation**
   - Product image upload
   - Style selection (luxury, bold, minimal, etc.)
   - AI-powered prompt enhancement
   - Video/Image generation via Freepik API
   - Cloudinary storage integration

3. **Community Sharing**
   - Public feed of generated ads
   - Like/Unlike functionality
   - User profiles with avatars

4. **Credit System**
   - Free tier: 50 credits
   - Pro tier: Unlimited (payment integration ready)
   - Credit deduction per generation

### 📊 Architecture Pattern

**Pattern Used:** Layered Architecture (N-Tier)

```
Presentation Layer (Frontend)
        ↓
API Layer (Next.js API Routes)
        ↓
Business Logic Layer (Services)
        ↓
Data Access Layer (Repositories)
        ↓
Database Layer (MongoDB)
```

**Why This Pattern?**
- **Separation of Concerns:** Each layer has a specific responsibility
- **Maintainability:** Easy to modify one layer without affecting others
- **Testability:** Can test each layer independently
- **Scalability:** Can scale layers independently

**Alternatives Considered:**
- **Microservices:** Too complex for MVP, would require service mesh, API gateway
- **Monolithic:** Harder to scale, but simpler deployment
- **Serverless:** Considered but cold starts would affect UX

---

## 2. Technology Stack Deep Dive

### Frontend Stack

#### **Next.js 15** (React Framework)

**What is it?**
Next.js is a React framework that provides server-side rendering, static site generation, and API routes out of the box.

**Why Next.js?**
1. **Server-Side Rendering (SSR):** Better SEO, faster initial page load
2. **App Router:** Modern file-based routing with layouts
3. **API Routes:** Backend endpoints in the same codebase
4. **Image Optimization:** Automatic image optimization
5. **TypeScript Support:** Built-in TypeScript configuration

**How it's used in our project:**
```typescript
// File: src/app/page.tsx
// This is a Server Component by default
export default function HomePage() {
  return <HeroSection />; // Rendered on server
}

// File: src/app/generator/page.tsx
"use client"; // This makes it a Client Component
export default function GeneratorPage() {
  const [state, setState] = useState(); // Can use hooks
}
```

**Interview Answer:**
"We chose Next.js 15 because it provides both server and client rendering capabilities. The App Router allows us to create layouts that persist across pages, reducing re-renders. The built-in API routes let us handle backend logic without a separate server for simple operations. Plus, React 19 brings concurrent features that improve user experience during AI generation."

**Alternatives:**
- **Create React App:** No SSR, no built-in routing
- **Vite + React:** Faster dev server but no SSR
- **Remix:** Similar to Next.js but different data loading patterns

---

#### **React 19** (UI Library)

**What is it?**
React is a JavaScript library for building user interfaces using components.

**Key Concepts Used:**

1. **Hooks:**
```typescript
// useState - Manage component state
const [videoUrl, setVideoUrl] = useState<string | null>(null);

// useEffect - Side effects (API calls, subscriptions)
useEffect(() => {
  loadPosts();
}, []);

// useContext - Access global state
const { user, login, logout } = useAuth();

// useCallback - Memoize functions
const handleGenerate = useCallback(async () => {
  // ...
}, [dependencies]);

// useRef - Access DOM elements
const videoRef = useRef<HTMLVideoElement>(null);
```

2. **Component Composition:**
```typescript
// Reusable Button component
<Button variant="primary" size="lg" onClick={handleClick}>
  Generate Ad
</Button>
```

3. **Conditional Rendering:**
```typescript
{isGenerating ? (
  <LoadingSpinner />
) : (
  <GenerateButton />
)}
```

**Interview Answer:**
"React's component-based architecture allows us to build reusable UI pieces. We use hooks for state management and side effects. The virtual DOM ensures efficient updates - when a user generates an ad, only the result section re-renders, not the entire page."

---

#### **TypeScript** (Type Safety)

**What is it?**
TypeScript is JavaScript with static type checking.

**Why TypeScript?**
1. **Catch errors at compile time:** Before code runs
2. **Better IDE support:** Autocomplete, refactoring
3. **Self-documenting code:** Types serve as documentation
4. **Safer refactoring:** Compiler catches breaking changes

**Examples from our project:**
```typescript
// Type-safe API response
interface GenerationResult {
  success: boolean;
  videoUrl: string;
  generationId: string;
}

// Type-safe function parameters
async function generateAd(
  prompt: string,
  duration: number,
  style: string
): Promise<GenerationResult> {
  // TypeScript ensures we return the correct shape
}

// Type-safe props
interface ButtonProps {
  variant: "primary" | "outline";
  size: "sm" | "md" | "lg";
  onClick: () => void;
  children: React.ReactNode;
}
```

**Interview Answer:**
"TypeScript prevents runtime errors by catching type mismatches during development. For example, if an API changes its response structure, TypeScript immediately shows errors in all files using that API. This is crucial in a team environment."

---

#### **Tailwind CSS** (Styling)

**What is it?**
Utility-first CSS framework with pre-built classes.

**Why Tailwind?**
1. **No CSS file switching:** Write styles in JSX
2. **Consistent design system:** Pre-defined spacing, colors
3. **Responsive design:** Built-in breakpoints
4. **Smaller bundle:** Purges unused styles

**Example:**
```tsx
<button className="
  px-8 py-4 
  bg-gradient-to-r from-accent-purple to-accent-indigo 
  text-white font-medium rounded-xl 
  hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] 
  transition-all duration-300
">
  Generate Ad
</button>
```

**Interview Answer:**
"Tailwind eliminates context switching between files. The utility classes are self-explanatory - `px-8` means padding-x of 2rem. The JIT compiler ensures we only ship CSS that's actually used, keeping our bundle small."

**Alternatives:**
- **CSS Modules:** More verbose, separate files
- **Styled Components:** Runtime overhead
- **Plain CSS:** Harder to maintain, no purging

---

#### **Framer Motion** (Animations)

**What is it?**
Production-ready animation library for React.

**Why Framer Motion?**
1. **Declarative animations:** Easy to read and maintain
2. **Gesture support:** Drag, hover, tap
3. **Layout animations:** Automatic FLIP animations
4. **Exit animations:** AnimatePresence for unmounting

**Example:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  <VideoResult />
</motion.div>
```

**Interview Answer:**
"Framer Motion provides smooth, performant animations that enhance UX. When a user generates an ad, the result fades in smoothly. The AnimatePresence component handles exit animations when modals close, making the app feel polished."

---

### Backend Stack

#### **Express.js** (Web Framework)

**What is it?**
Minimal and flexible Node.js web application framework.

**Why Express?**
1. **Lightweight:** Minimal overhead
2. **Middleware ecosystem:** Tons of plugins
3. **Flexible routing:** Easy to organize endpoints
4. **Industry standard:** Most Node.js jobs use it

**Architecture:**
```javascript
// server/server.js
const express = require('express');
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS
app.use(passport.initialize()); // Auth

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/community', communityRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});
```

**Interview Answer:**
"Express provides a thin layer over Node.js HTTP module. The middleware pattern allows us to chain operations - first CORS, then JSON parsing, then authentication, then route handlers. This makes the code modular and testable."

---

#### **MongoDB + Mongoose** (Database)

**What is it?**
MongoDB is a NoSQL document database. Mongoose is an ODM (Object-Document Mapper).

**Why MongoDB?**
1. **Flexible schema:** Easy to iterate on data models
2. **JSON-like documents:** Natural fit for JavaScript
3. **Horizontal scaling:** Sharding support
4. **Rich queries:** Aggregation pipeline

**Schema Design:**
```javascript
// server/models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false }, // Hidden by default
  googleId: String,
  role: { type: String, enum: ['free', 'pro'], default: 'free' },
  credits: { type: Number, default: 50 }
}, { timestamps: true }); // Adds createdAt, updatedAt

// Middleware: Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Methods: Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

**Interview Answer:**
"We use MongoDB because our data model is evolving. A user might have different fields based on their plan. Mongoose provides schema validation and middleware hooks - we hash passwords automatically before saving. The `select: false` on password ensures it's never accidentally sent to the client."

**SQL vs NoSQL Decision:**
- **Chose NoSQL because:**
  - Flexible schema (adding features doesn't require migrations)
  - Fast reads (community feed)
  - Easy to scale horizontally
  
- **Would use SQL if:**
  - Complex joins were needed
  - ACID transactions were critical
  - Data had strict relationships

---

#### **JWT (JSON Web Tokens)** (Authentication)

**What is it?**
Stateless authentication tokens containing encoded JSON data.

**Structure:**
```
header.payload.signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWY...
```

**How it works:**
```javascript
// Generate token (server/routes/auth.js)
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // Payload
    process.env.JWT_SECRET, // Secret key
    { expiresIn: '30d' } // Expiration
  );
};

// Verify token (server/middleware/auth.js)
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.userId);
  next();
};
```

**Interview Answer:**
"JWT is stateless - the server doesn't store sessions. When a user logs in, we generate a token containing their user ID. The client stores it in localStorage and sends it with every request. The server verifies the signature to ensure it wasn't tampered with. This scales better than session-based auth because we don't need a session store."

**Alternatives:**
- **Session-based auth:** Requires session store (Redis), doesn't scale horizontally easily
- **OAuth only:** Requires internet connection, third-party dependency

---

#### **Passport.js** (OAuth)

**What is it?**
Authentication middleware for Node.js with 500+ strategies.

**Google OAuth Flow:**
```javascript
// server/config/passport.js
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  // Find or create user
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      avatar: profile.photos[0]?.value
    });
  }
  done(null, user);
}));
```

**Flow:**
```
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. User approves
4. Google redirects to /api/auth/google/callback
5. Passport exchanges code for user profile
6. We find/create user in database
7. Generate JWT token
8. Redirect to frontend with token
```

**Interview Answer:**
"Passport abstracts OAuth complexity. Google OAuth is more secure than password-based auth - users don't share passwords with us. We use the 'authorization code' flow, which is more secure than implicit flow. The callback URL must be whitelisted in Google Console to prevent attacks."

---

### Third-Party Services

#### **Cloudinary** (Media Storage)

**What is it?**
Cloud-based image and video management service.

**Why Cloudinary?**
1. **CDN delivery:** Fast global access
2. **Automatic optimization:** WebP conversion, lazy loading
3. **Transformations:** Resize, crop, format conversion on-the-fly
4. **Video processing:** Thumbnail generation

**Implementation:**
```typescript
// src/lib/services/cloudinary.service.ts
export async function uploadImage(
  imageBuffer: Buffer,
  options: { folder?: string } = {}
): Promise<{ imageUrl: string; publicId: string }> {
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: options.folder || 'adwork/images',
        transformation: [
          { width: 1280, height: 1280, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(imageBuffer);
  });
  
  return {
    imageUrl: result.secure_url,
    publicId: result.public_id
  };
}
```

**Interview Answer:**
"Cloudinary handles media storage and delivery. When a user uploads a product image, we stream it to Cloudinary which returns a CDN URL. The transformation API automatically optimizes images - a 5MB upload becomes a 200KB WebP. This reduces bandwidth and improves load times."

**Alternatives:**
- **AWS S3 + CloudFront:** More control but more setup
- **Local storage:** Doesn't scale, no CDN
- **Firebase Storage:** Good but vendor lock-in

---

#### **Freepik API** (AI Image Generation)

**What is it?**
API for generating images from text prompts.

**Why Freepik?**
1. **Text-to-image:** Generate product ads from descriptions
2. **Style control:** Different artistic styles
3. **Commercial license:** Can use generated images commercially
4. **Fast generation:** ~15-30 seconds

**Implementation:**
```typescript
// src/lib/services/freepik.service.ts
export async function generateMedia(
  prompt: string,
  aspectRatio: string = "16:9",
  productImageBuffer?: Buffer
): Promise<Buffer> {
  const response = await fetch("https://api.freepik.com/v1/ai/text-to-image", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "x-freepik-api-key": process.env.FREEPIK_API_KEY
    },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();
  return Buffer.from(data.data[0].base64, "base64");
}
```

**Interview Answer:**
"Freepik's text-to-image API generates professional product images. We enhance the user's prompt with style modifiers - if they select 'luxury', we append 'golden accents, elegant premium feel, sophisticated dark background'. The API returns base64-encoded images which we convert to buffers and upload to Cloudinary."

---

#### **Google Gemini AI** (Prompt Enhancement)

**What is it?**
Google's multimodal AI model for text and image understanding.

**Why Gemini?**
1. **Prompt enhancement:** Makes user prompts more detailed
2. **Multimodal:** Can analyze product images
3. **Fast inference:** Sub-second responses
4. **Free tier:** Generous quota

**Usage:**
```typescript
// Enhance user prompt
const enhancedPrompt = await enhancePrompt(
  "white sneakers",
  "luxury",
  6,
  "Nike"
);
// Result: "Nike brand white sneakers with golden accents, 
// elegant premium feel, sophisticated dark background, 
// cinematic lighting, 4k quality"
```

**Interview Answer:**
"Users often provide vague prompts like 'shoe ad'. Gemini enhances these into detailed descriptions that produce better results. It's like having a professional copywriter in the pipeline. We could use GPT-4, but Gemini is free and fast enough for our use case."

---

## 3. Folder Structure Explained

### Frontend Structure (`src/`)

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (wraps all pages)
│   ├── page.tsx                 # Home page (/)
│   ├── providers.tsx            # Context providers wrapper
│   ├── globals.css              # Global styles
│   │
│   ├── api/                     # API routes (backend endpoints)
│   │   └── v1/
│   │       └── generate-ad/
│   │           ├── route.ts     # POST /api/v1/generate-ad
│   │           ├── history/
│   │           │   └── route.ts # GET /api/v1/generate-ad/history
│   │           └── [id]/
│   │               └── route.ts # GET /api/v1/generate-ad/:id
│   │
│   ├── generator/
│   │   └── page.tsx             # Ad generator page
│   ├── community/
│   │   └── page.tsx             # Community feed
│   ├── signin/
│   │   └── page.tsx             # Login page
│   ├── signup/
│   │   └── page.tsx             # Registration page
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx         # OAuth callback handler
│   └── payment/
│       └── callback/
│           └── page.tsx         # Payment callback
│
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── GlassCard.tsx
│   │   └── Logo.tsx
│   ├── hero/                    # Landing page components
│   │   ├── HeroCanvas.tsx
│   │   ├── HeroOverlay.tsx
│   │   └── ParticleField.tsx
│   ├── features/
│   │   ├── FeaturesSection.tsx
│   │   └── FeatureCard.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ProtectedRoute.tsx       # Auth guard component
│
├── context/                      # React Context (global state)
│   └── AuthContext.tsx          # User authentication state
│
├── hooks/                        # Custom React hooks
│   └── useAuth.ts               # Hook to access auth context
│
├── services/                     # API client services
│   ├── api.ts                   # Axios instance with interceptors
│   ├── auth.ts                  # Auth API calls
│   ├── user.ts                  # User API calls
│   ├── community.ts             # Community API calls
│   └── payment.ts               # Payment API calls
│
└── lib/                          # Utility functions & services
    ├── auth/
    │   └── helpers.ts           # Auth helper functions
    ├── db/
    │   └── generation-repository.ts  # Data access layer
    ├── middleware/
    │   └── validate.ts          # Zod validation schemas
    ├── services/
    │   ├── ai.service.ts        # AI orchestration service
    │   ├── freepik.service.ts   # Freepik API wrapper
    │   └── cloudinary.service.ts # Cloudinary API wrapper
    └── types/
        ├── generation.ts        # TypeScript types
        └── index.ts
```

**Why this structure?**

1. **App Router (`app/`):** Next.js 13+ convention
   - File-based routing
   - Layouts persist across pages
   - API routes colocated with pages

2. **Components (`components/`):** Organized by feature
   - `ui/`: Generic, reusable components
   - `hero/`, `features/`: Page-specific components
   - Promotes reusability

3. **Services (`services/`):** API communication layer
   - Separates API logic from components
   - Easy to mock for testing
   - Single source of truth for endpoints

4. **Context (`context/`):** Global state
   - Auth state accessible anywhere
   - Avoids prop drilling

5. **Lib (`lib/`):** Business logic
   - Services: External API wrappers
   - Middleware: Validation, auth helpers
   - Types: Shared TypeScript definitions

**Interview Answer:**
"The folder structure follows Next.js conventions with clear separation of concerns. Components are presentational, services handle API calls, and lib contains business logic. This makes the codebase easy to navigate - if you need to change how we call Freepik API, you know to look in `lib/services/freepik.service.ts`."

---

### Backend Structure (`server/`)

```
server/
├── server.js                    # Entry point
├── package.json                 # Dependencies
├── .env                         # Environment variables
│
├── config/                      # Configuration files
│   ├── db.js                   # MongoDB connection
│   ├── passport.js             # Passport strategies
│   └── cloudinary.js           # Cloudinary config
│
├── models/                      # Mongoose schemas
│   ├── User.js                 # User model
│   └── Post.js                 # Community post model
│
├── routes/                      # Express routes
│   ├── auth.js                 # /api/auth/*
│   ├── user.js                 # /api/user/*
│   ├── community.js            # /api/community/*
│   └── payment.js              # /api/payment/*
│
└── middleware/                  # Custom middleware
    └── auth.js                 # JWT verification
```

**Why this structure?**

1. **MVC-like pattern:**
   - Models: Data structure
   - Routes: URL handlers
   - (Controllers would go in `controllers/` if we had them)

2. **Config separation:**
   - Database, auth, services in separate files
   - Easy to swap implementations

3. **Middleware:**
   - Reusable auth logic
   - Can add logging, rate limiting, etc.

**Interview Answer:**
"The backend follows a layered architecture. Routes handle HTTP requests, models define data structure, middleware handles cross-cutting concerns like authentication. This separation makes it easy to test - we can test the auth middleware independently of routes."

---


## 4. Frontend Architecture

### Component Hierarchy

```
App (layout.tsx)
├── Providers (AuthContext)
│   ├── Navbar
│   │   ├── Logo
│   │   ├── Navigation Links
│   │   └── User Menu
│   │
│   ├── Page Content
│   │   ├── Home (/)
│   │   │   ├── HeroCanvas (3D background)
│   │   │   ├── ParticleField
│   │   │   ├── HeroOverlay
│   │   │   └── FeaturesSection
│   │   │
│   │   ├── Generator (/generator)
│   │   │   ├── ProtectedRoute
│   │   │   ├── Form Controls
│   │   │   │   ├── Input (Brand Name)
│   │   │   │   ├── Textarea (Description)
│   │   │   │   ├── File Upload
│   │   │   │   ├── Style Selector
│   │   │   │   └── Button (Generate)
│   │   │   └── Result Display
│   │   │       ├── Video Player
│   │   │       └── Share Modal
│   │   │
│   │   ├── Community (/community)
│   │   │   ├── Post Grid
│   │   │   │   └── GlassCard (each post)
│   │   │   └── Create Post Modal
│   │   │
│   │   └── Auth Pages
│   │       ├── SignIn (/signin)
│   │       └── SignUp (/signup)
│   │
│   └── Footer
```

### Data Flow Pattern

**Unidirectional Data Flow (React Philosophy)**

```
User Action → Event Handler → State Update → Re-render
```

**Example: Generating an Ad**

```typescript
// 1. User clicks "Generate" button
<Button onClick={handleGenerate}>Generate</Button>

// 2. Event handler updates state
const handleGenerate = async () => {
  setIsGenerating(true); // UI shows loading
  
  try {
    // 3. API call
    const result = await fetch('/api/v1/generate-ad', {
      method: 'POST',
      body: formData
    });
    
    // 4. Update state with result
    setGenerationResult(result);
    
    // 5. Update global state (credits)
    updateCredits(user.credits - 1);
    
  } catch (error) {
    setGenError(error.message);
  } finally {
    setIsGenerating(false); // UI hides loading
  }
};

// 6. React re-renders with new state
{generationResult && (
  <VideoPlayer src={generationResult.videoUrl} />
)}
```

### Client vs Server Components

**Next.js 13+ introduces two types of components:**

#### Server Components (Default)
```typescript
// src/app/page.tsx
// No "use client" directive = Server Component

export default function HomePage() {
  // Runs on server
  // Can access database directly
  // Cannot use useState, useEffect, event handlers
  
  return <HeroSection />;
}
```

**Benefits:**
- Smaller JavaScript bundle (code stays on server)
- Direct database access
- Better SEO (fully rendered HTML)

#### Client Components
```typescript
// src/app/generator/page.tsx
"use client"; // Explicitly mark as client component

export default function GeneratorPage() {
  const [state, setState] = useState(); // ✅ Can use hooks
  
  const handleClick = () => {}; // ✅ Can use event handlers
  
  return <Button onClick={handleClick} />;
}
```

**When to use Client Components:**
- Need interactivity (clicks, forms)
- Need browser APIs (localStorage, window)
- Need React hooks (useState, useEffect)

**Our Strategy:**
- Landing page: Server Component (static content)
- Generator page: Client Component (interactive form)
- Auth pages: Client Component (form handling)

**Interview Answer:**
"We use Server Components for static content like the landing page. This reduces JavaScript sent to the browser. Interactive pages like the generator are Client Components because they need state and event handlers. This hybrid approach gives us the best of both worlds - fast initial load and rich interactivity."

---

### State Management Strategy

#### Local State (useState)
```typescript
// Component-specific state
const [brandName, setBrandName] = useState("");
const [isGenerating, setIsGenerating] = useState(false);
```

**When to use:**
- State only needed in one component
- Form inputs
- UI state (modals, dropdowns)

#### Global State (Context API)
```typescript
// src/context/AuthContext.tsx
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Usage in any component
const { user, login, logout } = useAuth();
```

**When to use:**
- State needed across multiple components
- User authentication
- Theme, language settings

**Why not Redux?**
- Context API is sufficient for our needs
- Redux adds complexity (actions, reducers, middleware)
- Our state is simple (just user auth)

**When would we use Redux?**
- Complex state with many actions
- Time-travel debugging needed
- Middleware for logging, analytics

**Interview Answer:**
"We use Context API for global state because our requirements are simple - just user authentication. Context API is built into React, so no extra dependencies. If we needed complex state management with undo/redo or optimistic updates, we'd consider Redux Toolkit or Zustand."

---

### Form Handling

**Controlled Components Pattern:**

```typescript
// State holds the source of truth
const [email, setEmail] = useState("");

// Input is controlled by state
<input 
  value={email} 
  onChange={(e) => setEmail(e.target.value)} 
/>

// Form submission
const handleSubmit = (e) => {
  e.preventDefault(); // Prevent page reload
  login(email, password);
};
```

**File Upload Handling:**

```typescript
const [productPhoto, setProductPhoto] = useState<File | null>(null);
const [preview, setPreview] = useState<string | null>(null);

const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    setError("File too large");
    return;
  }
  
  setProductPhoto(file);
  setPreview(URL.createObjectURL(file)); // Show preview
};

// Send to API
const formData = new FormData();
formData.append('productPhoto', productPhoto);
formData.append('brandName', brandName);

await fetch('/api/v1/generate-ad', {
  method: 'POST',
  body: formData // Don't set Content-Type, browser sets it
});
```

**Interview Answer:**
"We use controlled components where React state is the single source of truth. For file uploads, we use FormData API which handles multipart/form-data encoding. We validate file size on the client before uploading to save bandwidth. The preview uses createObjectURL to show the image without uploading it first."

---

### Routing & Navigation

**File-based Routing (Next.js App Router):**

```
src/app/
├── page.tsx              → /
├── generator/
│   └── page.tsx          → /generator
├── community/
│   └── page.tsx          → /community
├── signin/
│   └── page.tsx          → /signin
└── api/
    └── v1/
        └── generate-ad/
            └── route.ts  → /api/v1/generate-ad
```

**Navigation:**

```typescript
// Programmatic navigation
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/generator'); // Navigate to generator

// Link component (prefetches on hover)
import Link from 'next/link';

<Link href="/generator">Create Ad</Link>
```

**Protected Routes:**

```typescript
// src/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/signin'); // Redirect to login
    }
  }, [isAuthenticated, loading]);
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;
  
  return <>{children}</>;
}

// Usage
<ProtectedRoute>
  <GeneratorPage />
</ProtectedRoute>
```

**Interview Answer:**
"Next.js uses file-based routing - the folder structure defines the URLs. The App Router supports layouts that persist across pages, reducing re-renders. We protect routes by checking authentication in a wrapper component. If the user isn't logged in, we redirect to the signin page."

---

### Performance Optimizations

#### 1. Code Splitting
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false // Don't render on server
});
```

#### 2. Image Optimization
```typescript
import Image from 'next/image';

<Image 
  src="/product.jpg"
  width={500}
  height={500}
  alt="Product"
  loading="lazy" // Lazy load
  placeholder="blur" // Show blur while loading
/>
```

#### 3. Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks to prevent re-renders
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = React.memo(ExpensiveComponent);
```

#### 4. Debouncing
```typescript
// Debounce search input
const [searchTerm, setSearchTerm] = useState("");

const debouncedSearch = useMemo(
  () => debounce((term) => {
    searchAPI(term);
  }, 500),
  []
);

const handleSearch = (e) => {
  setSearchTerm(e.target.value);
  debouncedSearch(e.target.value);
};
```

**Interview Answer:**
"We optimize performance through code splitting - heavy components load only when needed. Next.js Image component automatically optimizes images and lazy loads them. We use useMemo for expensive calculations and useCallback to prevent unnecessary re-renders. For search inputs, we debounce API calls to avoid overwhelming the server."

---

## 5. Backend Architecture

### Express Server Structure

```javascript
// server/server.js
const express = require('express');
const app = express();

// ─── 1. Configuration ─────────────────────────────────
require('dotenv').config(); // Load environment variables
connectDB(); // Connect to MongoDB

// ─── 2. Middleware (runs on every request) ────────────
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(session({ secret: process.env.SESSION_SECRET }));
app.use(passport.initialize());
app.use(passport.session());

// ─── 3. Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/payment', paymentRoutes);

// ─── 4. Error Handling ────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── 5. Start Server ──────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Middleware Execution Order

```
Request
  ↓
1. CORS middleware (allow cross-origin requests)
  ↓
2. express.json() (parse JSON body)
  ↓
3. express.urlencoded() (parse form data)
  ↓
4. session middleware (manage sessions)
  ↓
5. passport.initialize() (setup auth)
  ↓
6. Route handler (e.g., authRoutes)
  ↓
7. Custom middleware (e.g., auth check)
  ↓
8. Controller function
  ↓
9. Error middleware (if error occurs)
  ↓
Response
```

**Interview Answer:**
"Middleware in Express runs in the order it's defined. CORS runs first to allow cross-origin requests. Then we parse the request body. Session and passport middleware handle authentication. Finally, route-specific middleware runs. If any middleware throws an error, it's caught by the error handler at the end."

---

### RESTful API Design

**REST Principles Applied:**

1. **Resource-based URLs:**
```javascript
// ✅ Good (noun-based)
GET    /api/users          // Get all users
GET    /api/users/:id      // Get one user
POST   /api/users          // Create user
PUT    /api/users/:id      // Update user
DELETE /api/users/:id      // Delete user

// ❌ Bad (verb-based)
GET    /api/getUsers
POST   /api/createUser
```

2. **HTTP Methods:**
```javascript
// GET - Retrieve data (idempotent, safe)
router.get('/posts', async (req, res) => {
  const posts = await Post.find();
  res.json({ posts });
});

// POST - Create new resource
router.post('/posts', auth, async (req, res) => {
  const post = await Post.create(req.body);
  res.status(201).json(post);
});

// DELETE - Remove resource (idempotent)
router.delete('/posts/:id', auth, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
```

3. **Status Codes:**
```javascript
200 OK              // Success
201 Created         // Resource created
400 Bad Request     // Invalid input
401 Unauthorized    // Not authenticated
403 Forbidden       // Authenticated but not allowed
404 Not Found       // Resource doesn't exist
500 Server Error    // Server crashed
```

4. **Consistent Response Format:**
```javascript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Interview Answer:**
"Our API follows REST principles - resources are nouns, HTTP methods indicate actions. We use proper status codes: 201 for creation, 401 for auth errors, 404 for not found. Responses have a consistent structure with success/error fields. This makes the API predictable and easy to consume."

---

### Authentication Middleware

```javascript
// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // 4. Attach user to request
    req.user = user;
    
    // 5. Continue to next middleware/route
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Auth error' });
  }
};

module.exports = auth;
```

**Usage:**
```javascript
// Protect a route
router.get('/profile', auth, async (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});
```

**Interview Answer:**
"The auth middleware extracts the JWT from the Authorization header, verifies its signature, and fetches the user from the database. If valid, it attaches the user to the request object so route handlers can access it. If invalid, it returns 401 Unauthorized. This middleware runs before any protected route."

---

### Error Handling Strategy

#### 1. Try-Catch Blocks
```javascript
router.post('/signup', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ user });
  } catch (error) {
    // Handle specific errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    // Generic error
    res.status(500).json({ message: 'Server error' });
  }
});
```

#### 2. Global Error Handler
```javascript
// server/server.js
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({ message });
});
```

#### 3. Async Error Wrapper
```javascript
// Utility to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
router.get('/posts', asyncHandler(async (req, res) => {
  const posts = await Post.find(); // If this throws, it's caught
  res.json({ posts });
}));
```

**Interview Answer:**
"We use try-catch blocks in route handlers to catch errors. Specific errors like duplicate keys get custom messages. Unhandled errors are caught by a global error handler that logs them and returns a generic message. In production, we don't expose error details to prevent information leakage."

---

### Database Operations

#### CRUD Operations with Mongoose

```javascript
// CREATE
const user = await User.create({
  name: 'John',
  email: 'john@example.com',
  password: 'hashed_password'
});

// READ
const users = await User.find(); // All users
const user = await User.findById(id); // One user
const user = await User.findOne({ email: 'john@example.com' });

// UPDATE
const user = await User.findByIdAndUpdate(
  id,
  { credits: 100 },
  { new: true } // Return updated document
);

// DELETE
await User.findByIdAndDelete(id);
```

#### Query Optimization

```javascript
// ❌ Bad: N+1 query problem
const posts = await Post.find();
for (const post of posts) {
  post.user = await User.findById(post.user); // N queries
}

// ✅ Good: Use populate
const posts = await Post.find()
  .populate('user', 'name avatar email') // 1 query
  .sort({ createdAt: -1 })
  .limit(20);
```

#### Indexing

```javascript
// server/models/User.js
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, // Creates index
    index: true 
  }
});

// Compound index
userSchema.index({ email: 1, role: 1 });
```

**Interview Answer:**
"We use Mongoose for database operations. The `populate` method prevents N+1 queries by joining related documents in one query. We create indexes on frequently queried fields like email. The `unique` constraint on email prevents duplicates and creates an index automatically."

---

### File Upload Handling

```javascript
// server/routes/community.js
const multer = require('multer');

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept
    } else {
      cb(new Error('Only images allowed'), false); // Reject
    }
  }
});

// Route with file upload
router.post('/', auth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image required' });
  }
  
  // Upload to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer);
  
  // Save to database
  const post = await Post.create({
    user: req.user.id,
    title: req.body.title,
    imageUrl: result.secure_url
  });
  
  res.status(201).json(post);
});
```

**Interview Answer:**
"We use Multer middleware to handle file uploads. It stores files in memory as buffers, which we then upload to Cloudinary. We validate file type and size to prevent abuse. The `single('image')` method expects one file with the field name 'image'. For multiple files, we'd use `array('images', 5)`."

---


## 6. Database Design

### MongoDB Schema Design

#### User Schema

```javascript
// server/models/User.js
const userSchema = new mongoose.Schema({
  // Basic Info
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email validation
  },
  
  // Authentication
  password: { 
    type: String,
    select: false, // Don't return in queries by default
    minlength: 6
  },
  googleId: { 
    type: String,
    default: null 
  },
  
  // Profile
  avatar: { 
    type: String,
    default: '' 
  },
  
  // Subscription
  role: { 
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  credits: { 
    type: Number,
    default: 50,
    min: 0
  }
}, { 
  timestamps: true // Adds createdAt, updatedAt
});

// Indexes
userSchema.index({ email: 1 }); // Fast email lookups
userSchema.index({ googleId: 1 }); // Fast OAuth lookups

// Virtual fields (computed, not stored)
userSchema.virtual('isPro').get(function() {
  return this.role === 'pro';
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    credits: this.credits,
    avatar: this.avatar
  };
};

// Middleware hooks
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
```

**Design Decisions:**

1. **`select: false` on password:**
   - Prevents accidental password leaks
   - Must explicitly request: `User.findOne().select('+password')`

2. **`timestamps: true`:**
   - Automatically adds `createdAt` and `updatedAt`
   - Useful for sorting, auditing

3. **Virtual fields:**
   - Computed properties not stored in DB
   - Saves storage space

4. **Pre-save hook:**
   - Automatically hashes passwords
   - Runs before every save operation

**Interview Answer:**
"The User schema uses Mongoose features for security and convenience. The password field has `select: false` so it's never accidentally sent to the client. We use a pre-save hook to automatically hash passwords - developers can't forget to hash. Timestamps are added automatically for auditing. Virtual fields like `isPro` are computed on-the-fly."

---

#### Post Schema (Community)

```javascript
// server/models/Post.js
const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  link: {
    type: String,
    trim: true,
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true 
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Ensure virtuals are included in JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Indexes
postSchema.index({ user: 1, createdAt: -1 }); // User's posts sorted by date
postSchema.index({ createdAt: -1 }); // All posts sorted by date

module.exports = mongoose.model('Post', postSchema);
```

**Design Decisions:**

1. **References vs Embedding:**
   - User is referenced (ObjectId) not embedded
   - Why? User data can change (name, avatar)
   - If embedded, we'd have stale data

2. **Likes as array:**
   - Simple for small numbers
   - For millions of likes, use separate collection

3. **Virtual likeCount:**
   - Computed from array length
   - Alternative: Store count and update on like/unlike

**Interview Answer:**
"We reference the User model instead of embedding because user data can change. If we embedded, we'd have to update all posts when a user changes their name. The likes array works for moderate scale. For millions of likes, we'd move to a separate Likes collection with compound indexes."

---

### SQL vs NoSQL Decision

**Why MongoDB (NoSQL)?**

| Requirement | MongoDB | SQL |
|-------------|---------|-----|
| Flexible schema | ✅ Easy to add fields | ❌ Requires migrations |
| Horizontal scaling | ✅ Built-in sharding | ⚠️ Complex |
| JSON-like data | ✅ Native | ❌ Need ORM |
| Complex joins | ⚠️ Limited | ✅ Powerful |
| ACID transactions | ⚠️ Limited | ✅ Full support |
| Development speed | ✅ Fast iteration | ⚠️ Slower |

**When we'd use SQL:**
- Banking app (need ACID transactions)
- Complex reporting (many joins)
- Strict data integrity requirements

**Interview Answer:**
"We chose MongoDB because our schema is evolving - we're adding features frequently. MongoDB's flexible schema lets us add fields without migrations. The JSON-like documents map naturally to JavaScript objects. For a banking app, I'd use PostgreSQL for ACID transactions and data integrity."

---

### Database Queries & Optimization

#### Query Examples

```javascript
// Find all posts with user info
const posts = await Post.find()
  .populate('user', 'name avatar email') // Join with User
  .sort({ createdAt: -1 }) // Newest first
  .limit(20) // Pagination
  .skip(page * 20);

// Find user's posts
const myPosts = await Post.find({ user: userId })
  .sort({ createdAt: -1 });

// Toggle like
const post = await Post.findById(postId);
const alreadyLiked = post.likes.includes(userId);

if (alreadyLiked) {
  post.likes = post.likes.filter(id => id.toString() !== userId);
} else {
  post.likes.push(userId);
}

await post.save();
```

#### Query Optimization Techniques

1. **Indexing:**
```javascript
// Create index
userSchema.index({ email: 1 }); // Ascending
postSchema.index({ createdAt: -1 }); // Descending

// Compound index
postSchema.index({ user: 1, createdAt: -1 });

// Check if index is used
db.posts.find({ user: userId }).explain('executionStats');
```

2. **Projection (Select specific fields):**
```javascript
// ❌ Bad: Fetch all fields
const users = await User.find();

// ✅ Good: Fetch only needed fields
const users = await User.find().select('name email avatar');
```

3. **Lean Queries (Skip Mongoose overhead):**
```javascript
// ❌ Returns Mongoose document (heavy)
const posts = await Post.find();

// ✅ Returns plain JavaScript object (light)
const posts = await Post.find().lean();
```

4. **Aggregation Pipeline:**
```javascript
// Complex query: Get users with post count
const usersWithPostCount = await User.aggregate([
  {
    $lookup: {
      from: 'posts',
      localField: '_id',
      foreignField: 'user',
      as: 'posts'
    }
  },
  {
    $addFields: {
      postCount: { $size: '$posts' }
    }
  },
  {
    $project: {
      name: 1,
      email: 1,
      postCount: 1
    }
  }
]);
```

**Interview Answer:**
"We optimize queries through indexing - the email field has an index for fast lookups. We use projection to fetch only needed fields, reducing bandwidth. For read-heavy operations, we use `.lean()` to skip Mongoose overhead. The aggregation pipeline handles complex queries like counting related documents."

---

### Data Consistency & Integrity

#### Validation

```javascript
// Schema-level validation
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  age: {
    type: Number,
    min: [18, 'Must be at least 18'],
    max: [120, 'Invalid age']
  }
});
```

#### Transactions (MongoDB 4.0+)

```javascript
// For operations that must succeed or fail together
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Deduct credits
  await User.findByIdAndUpdate(
    userId,
    { $inc: { credits: -1 } },
    { session }
  );
  
  // Create generation record
  await Generation.create([{
    user: userId,
    prompt: 'Product ad'
  }], { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Interview Answer:**
"Mongoose provides schema-level validation - we validate email format and age range before saving. For operations that must succeed or fail together, we use transactions. For example, when generating an ad, we deduct credits and create a generation record in one transaction. If either fails, both are rolled back."

---

## 7. Authentication & Authorization

### Authentication Flow

#### 1. Email/Password Signup

```
User submits form
    ↓
Frontend: POST /api/auth/signup
    ↓
Backend: Validate input
    ↓
Check if email exists
    ↓
Hash password (bcrypt)
    ↓
Create user in MongoDB
    ↓
Generate JWT token
    ↓
Return { token, user }
    ↓
Frontend: Store token in localStorage
    ↓
Frontend: Update AuthContext
    ↓
User is logged in
```

**Code:**
```javascript
// server/routes/auth.js
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password too short' });
    }
    
    // Check if exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Create user (password hashed by pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'free',
      credits: 50
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      token,
      user: user.toProfile()
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

---

#### 2. Email/Password Login

```
User submits credentials
    ↓
Frontend: POST /api/auth/login
    ↓
Backend: Find user by email
    ↓
Compare password hash
    ↓
If valid: Generate JWT
    ↓
Return { token, user }
    ↓
Frontend: Store token
    ↓
User is logged in
```

**Code:**
```javascript
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user (include password field)
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if Google user
    if (!user.password) {
      return res.status(401).json({ 
        message: 'Please sign in with Google' 
      });
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: user.toProfile()
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

---

#### 3. Google OAuth Flow

```
User clicks "Sign in with Google"
    ↓
Frontend: Redirect to /api/auth/google
    ↓
Backend: Redirect to Google consent screen
    ↓
User approves
    ↓
Google redirects to /api/auth/google/callback
    ↓
Backend: Exchange code for user profile
    ↓
Find or create user in database
    ↓
Generate JWT token
    ↓
Redirect to frontend with token
    ↓
Frontend: Extract token from URL
    ↓
Store token in localStorage
    ↓
User is logged in
```

**Code:**
```javascript
// server/config/passport.js
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if email exists (link accounts)
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      user.googleId = profile.id;
      user.avatar = profile.photos[0]?.value;
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    user = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      avatar: profile.photos[0]?.value,
      role: 'free',
      credits: 50
    });
    
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/signin' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);
```

**Frontend callback handler:**
```typescript
// src/app/auth/callback/page.tsx
"use client";

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuth();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      // Fetch user profile
      authService.getMe().then(user => {
        // Update context
        login(user, token);
        router.push('/generator');
      });
    } else {
      router.push('/signin?error=auth_failed');
    }
  }, []);
  
  return <LoadingSpinner />;
}
```

**Interview Answer:**
"Google OAuth uses the authorization code flow. The user approves on Google's site, then Google redirects back with a code. We exchange the code for the user's profile. If the user exists, we log them in. If not, we create an account. We link accounts if the email matches. Finally, we generate a JWT and redirect to the frontend with the token in the URL."

---

### JWT (JSON Web Tokens)

#### Structure

```
header.payload.signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← Header (algorithm, type)
.
eyJ1c2VySWQiOiI2NWY4YTNiMjFjNDU2Nzg5MGFiY2RlZjEiLCJpYXQiOjE3MTA4NjQwMDAsImV4cCI6MTcxMzQ1NjAwMH0  ← Payload (data)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature (verification)
```

**Decoded:**
```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "userId": "65f8a3b21c456789abcdef1",
  "iat": 1710864000,  // Issued at
  "exp": 1713456000   // Expires at
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

#### Security Considerations

1. **Secret Key:**
```javascript
// ❌ Bad: Weak secret
const token = jwt.sign(payload, 'secret123');

// ✅ Good: Strong random secret
const token = jwt.sign(payload, process.env.JWT_SECRET);
// JWT_SECRET=a8f5f167f44f4964e6c998dee827110c (32+ chars)
```

2. **Expiration:**
```javascript
// Short-lived token
const token = jwt.sign(payload, secret, { expiresIn: '15m' });

// Long-lived token (our approach)
const token = jwt.sign(payload, secret, { expiresIn: '30d' });
```

3. **Storage:**
```typescript
// ❌ Bad: Cookie without httpOnly (XSS vulnerable)
document.cookie = `token=${token}`;

// ⚠️ OK: localStorage (XSS vulnerable but convenient)
localStorage.setItem('token', token);

// ✅ Best: httpOnly cookie (XSS safe)
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

**Our Choice: localStorage**
- **Pros:** Easy to access, works with CORS
- **Cons:** Vulnerable to XSS attacks
- **Mitigation:** Sanitize user input, use CSP headers

**Interview Answer:**
"JWT contains three parts: header (algorithm), payload (data), and signature (verification). The signature ensures the token wasn't tampered with. We store tokens in localStorage for convenience, though httpOnly cookies are more secure against XSS. The token expires after 30 days, forcing re-authentication. We use a strong random secret from environment variables."

---

### Authorization (Role-Based Access Control)

```javascript
// Middleware to check user role
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

// Usage
router.delete('/posts/:id', auth, requireRole('admin'), async (req, res) => {
  // Only admins can delete any post
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Check ownership
router.delete('/posts/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (post.user.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  await post.deleteOne();
  res.json({ message: 'Deleted' });
});
```

**Interview Answer:**
"Authorization checks what a user can do. We have role-based access (free vs pro) and ownership-based access. For example, users can only delete their own posts. We check `post.user === req.user.id` before allowing deletion. For admin actions, we'd add a `requireRole('admin')` middleware."

---


## 8. AI/LLM Integration

### AI Service Architecture

```
User Request
    ↓
Next.js API Route (/api/v1/generate-ad)
    ↓
AIService.generateAdVideo()
    ↓
┌─────────────┬──────────────┬─────────────┐
│             │              │             │
▼             ▼              ▼             ▼
Upload        Enhance        Generate      Upload
Product       Prompt         Media         Result
Image         (Gemini)       (Freepik)     (Cloudinary)
│             │              │             │
└─────────────┴──────────────┴─────────────┘
    ↓
Return video URL to frontend
```

### Service Layer Pattern

```typescript
// src/lib/services/ai.service.ts
export class AIService {
  async generateAdVideo(
    prompt: string,
    duration: number,
    style: string,
    brandName: string = "",
    aspectRatio: string = "16:9",
    productImageBuffer?: Buffer,
    modelImageBuffer?: Buffer
  ): Promise<AdVideoResult> {
    
    // Step 1: Upload product image to Cloudinary
    let productImageUrl: string | null = null;
    if (productImageBuffer) {
      const uploaded = await uploadImage(productImageBuffer, {
        folder: "adwork/product-images"
      });
      productImageUrl = uploaded.imageUrl;
    }
    
    // Step 2: Upload model image (if provided)
    let modelImageUrl: string | null = null;
    if (modelImageBuffer) {
      const uploaded = await uploadImage(modelImageBuffer, {
        folder: "adwork/model-images"
      });
      modelImageUrl = uploaded.imageUrl;
    }
    
    // Step 3: Enhance prompt with AI
    const enhancedPrompt = await enhancePrompt(
      prompt,
      style,
      duration,
      brandName,
      productImageBuffer,
      modelImageBuffer
    );
    
    // Step 4: Generate media with Freepik
    const mediaBuffer = await generateMedia(
      enhancedPrompt,
      aspectRatio,
      productImageBuffer
    );
    
    // Step 5: Upload result to Cloudinary
    const uploaded = await uploadImage(mediaBuffer);
    
    return {
      videoUrl: uploaded.imageUrl,
      thumbnailUrl: uploaded.imageUrl,
      cloudinaryPublicId: uploaded.publicId,
      productImageUrl,
      modelImageUrl
    };
  }
}

export const aiService = new AIService();
```

**Design Pattern: Service Layer**

**Why?**
- **Separation of Concerns:** API routes don't know about Freepik/Cloudinary
- **Reusability:** Can call from multiple routes
- **Testability:** Easy to mock external services
- **Maintainability:** Change AI provider without touching routes

**Interview Answer:**
"The AIService orchestrates the entire generation pipeline. It's a service layer that abstracts external APIs. The API route just calls `aiService.generateAdVideo()` without knowing about Freepik or Cloudinary. This makes it easy to swap AI providers - we just change the service implementation."

---

### Prompt Engineering

```typescript
// src/lib/services/freepik.service.ts
const STYLE_PROMPTS: Record<string, string> = {
  cinematic: "cinematic lighting, film grain, dramatic shadows, professional color grading, 4k quality",
  minimal: "clean minimalist design, white space, elegant typography, modern aesthetic",
  bold: "vibrant colors, high contrast, dynamic composition, energetic motion, impactful visuals",
  corporate: "professional business look, clean structured layout, trustworthy blue tones, polished",
  playful: "colorful fun animation style, whimsical youthful energy, bright warm palette",
  luxury: "golden accents, rich textures, elegant premium feel, sophisticated dark background, refined"
};

export async function enhancePrompt(
  prompt: string,
  style: string,
  duration: number,
  brandName?: string,
  productImageBuffer?: Buffer,
  modelImageBuffer?: Buffer
): Promise<string> {
  const styleModifier = STYLE_PROMPTS[style] || "";
  const brandLine = brandName ? `Brand: ${brandName}. ` : "";
  
  // Construct detailed prompt
  return `${brandLine}${prompt}, ${styleModifier}, highly detailed, beautiful, commercial advertisement photography, 8k resolution`;
}
```

**Prompt Engineering Techniques:**

1. **Style Modifiers:**
   - Add descriptive adjectives
   - Specify lighting, colors, mood
   - Include quality indicators (4k, 8k)

2. **Structured Format:**
   ```
   [Brand] + [Product Description] + [Style] + [Quality]
   Nike + white sneakers + luxury style + 8k resolution
   ```

3. **Negative Prompts (if supported):**
   ```
   Avoid: blurry, low quality, distorted, watermark
   ```

**Interview Answer:**
"We use prompt engineering to get better results. Each style has predefined modifiers - 'luxury' adds 'golden accents, elegant premium feel'. We structure prompts as: brand + description + style + quality. This gives consistent, high-quality outputs. If we used GPT-4, we'd add few-shot examples to guide the model."

---

### Freepik API Integration

```typescript
// src/lib/services/freepik.service.ts
export async function generateMedia(
  prompt: string,
  aspectRatio: string = "16:9",
  productImageBuffer?: Buffer
): Promise<Buffer> {
  const apiKey = process.env.FREEPIK_API_KEY;
  
  // Convert aspect ratio to dimensions
  let w = 1280, h = 720;
  if (aspectRatio === "9:16") {
    w = 720;
    h = 1280;
  }
  
  // Call Freepik API
  const response = await fetch("https://api.freepik.com/v1/ai/text-to-image", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "x-freepik-api-key": apiKey
    },
    body: JSON.stringify({ prompt })
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Freepik generation failed: ${errText}`);
  }
  
  const data = await response.json();
  
  // Validate response
  if (!data?.data?.[0]?.base64) {
    throw new Error("Freepik returned unexpected format");
  }
  
  // Convert base64 to buffer
  return Buffer.from(data.data[0].base64, "base64");
}
```

**Error Handling:**

```typescript
try {
  const mediaBuffer = await generateMedia(prompt, aspectRatio);
} catch (error) {
  if (error.message.includes('rate limit')) {
    throw new Error('Too many requests. Please try again later.');
  }
  if (error.message.includes('invalid prompt')) {
    throw new Error('Invalid prompt. Please rephrase.');
  }
  throw new Error('AI generation failed. Please try again.');
}
```

**Interview Answer:**
"We wrap the Freepik API in a service function. It handles authentication, request formatting, and response parsing. We convert the base64 response to a Buffer for Cloudinary upload. Error handling catches rate limits and invalid prompts, returning user-friendly messages. This abstraction makes it easy to switch to a different AI provider."

---

### Cloudinary Integration

```typescript
// src/lib/services/cloudinary.service.ts
import { v2 as cloudinary } from "cloudinary";

// Lazy configuration
function ensureConfigured(): void {
  if (configured) return;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  
  configured = true;
}

export async function uploadImage(
  imageBuffer: Buffer,
  options: { folder?: string; publicId?: string } = {}
): Promise<{ imageUrl: string; publicId: string }> {
  ensureConfigured();
  
  const folder = options.folder || "adwork/images";
  
  // Upload using stream
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder,
        public_id: options.publicId,
        format: 'jpg',
        transformation: [
          { width: 1280, height: 1280, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    uploadStream.end(imageBuffer);
  });
  
  return {
    imageUrl: result.secure_url,
    publicId: result.public_id
  };
}
```

**Cloudinary Features Used:**

1. **Automatic Optimization:**
   ```javascript
   transformation: [
     { quality: 'auto:good' }, // Automatic quality
     { fetch_format: 'auto' }  // WebP for supported browsers
   ]
   ```

2. **Responsive Images:**
   ```javascript
   { width: 1280, height: 1280, crop: 'limit' } // Max dimensions
   ```

3. **CDN Delivery:**
   - Images served from global CDN
   - Automatic caching
   - Fast delivery worldwide

**Interview Answer:**
"Cloudinary handles media storage and optimization. We upload buffers using streams for memory efficiency. The transformation API automatically optimizes images - converts to WebP, adjusts quality, resizes. The CDN ensures fast delivery globally. We store the public_id to delete images later if needed."

---

### Generation Repository Pattern

```typescript
// src/lib/db/generation-repository.ts
export interface Generation {
  id: string;
  userId: string;
  prompt: string;
  brandName: string;
  duration: number;
  style: string;
  aspectRatio: string;
  status: 'processing' | 'succeeded' | 'failed';
  progress: number;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  productImageUrl: string | null;
  modelImageUrl: string | null;
  cloudinaryPublicId: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

class GenerationRepository {
  private generations: Map<string, Generation> = new Map();
  
  async create(generation: Generation): Promise<void> {
    this.generations.set(generation.id, generation);
  }
  
  async findById(id: string): Promise<Generation | null> {
    return this.generations.get(id) || null;
  }
  
  async findByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 12
  ): Promise<{ generations: Generation[]; total: number }> {
    const userGens = Array.from(this.generations.values())
      .filter(g => g.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      generations: userGens.slice(start, end),
      total: userGens.length
    };
  }
  
  async updateStatus(
    id: string,
    update: Partial<Generation>
  ): Promise<void> {
    const gen = this.generations.get(id);
    if (gen) {
      Object.assign(gen, update, { updatedAt: new Date() });
    }
  }
}

export const getGenerationRepository = () => new GenerationRepository();
```

**Repository Pattern Benefits:**

1. **Abstraction:** API routes don't know about storage implementation
2. **Testability:** Easy to mock for tests
3. **Flexibility:** Can switch from in-memory to MongoDB without changing routes

**Interview Answer:**
"The repository pattern abstracts data access. The API route calls `repo.create()` without knowing if it's stored in memory, MongoDB, or PostgreSQL. This makes testing easy - we can use an in-memory repository for tests. In production, we'd implement a MongoDB repository with the same interface."

---

## 9. API Design & Flow

### API Versioning

```
/api/v1/generate-ad
/api/v1/generate-ad/history
/api/v1/generate-ad/:id
```

**Why Version APIs?**
- **Backward Compatibility:** Old clients keep working
- **Gradual Migration:** Users upgrade at their own pace
- **Breaking Changes:** Can introduce v2 without breaking v1

**Interview Answer:**
"We version our APIs with `/v1/` prefix. This allows us to introduce breaking changes in v2 while keeping v1 running. For example, if we change the response format, old mobile apps using v1 won't break. We'd deprecate v1 after giving users time to migrate."

---

### Request/Response Flow

#### Generate Ad Endpoint

**Request:**
```http
POST /api/v1/generate-ad
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

------WebKitFormBoundary
Content-Disposition: form-data; name="productPhoto"; filename="shoe.jpg"
Content-Type: image/jpeg

[binary data]
------WebKitFormBoundary
Content-Disposition: form-data; name="brandName"

Nike
------WebKitFormBoundary
Content-Disposition: form-data; name="productDescription"

White sneakers with gold accents
------WebKitFormBoundary
Content-Disposition: form-data; name="style"

luxury
------WebKitFormBoundary
Content-Disposition: form-data; name="aspectRatio"

9:16
------WebKitFormBoundary
Content-Disposition: form-data; name="duration"

6
------WebKitFormBoundary--
```

**Response (Success):**
```json
{
  "success": true,
  "videoUrl": "https://res.cloudinary.com/demo/video/upload/v1234567890/adwork/videos/abc123.mp4",
  "generationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Insufficient credits. Upgrade to Pro for unlimited generations."
}
```

---

### Input Validation with Zod

```typescript
// src/lib/middleware/validate.ts
import { z } from 'zod';

export const generateAdSchema = z.object({
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(500, 'Prompt must be less than 500 characters'),
  brandName: z.string()
    .max(50, 'Brand name too long')
    .optional(),
  duration: z.number()
    .int()
    .min(4, 'Duration must be at least 4 seconds')
    .max(12, 'Duration must be at most 12 seconds'),
  style: z.enum(['luxury', 'bold', 'minimal', 'cinematic', 'playful', 'corporate']),
  aspectRatio: z.enum(['16:9', '9:16'])
});

export function extractZodError(error: z.ZodError): string {
  return error.errors.map(e => e.message).join(', ');
}

// Usage in API route
const parsed = generateAdSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json(
    { success: false, error: extractZodError(parsed.error) },
    { status: 400 }
  );
}
```

**Why Zod?**
- **Type Safety:** Infers TypeScript types from schema
- **Runtime Validation:** Catches invalid data at runtime
- **Clear Errors:** Descriptive error messages

**Interview Answer:**
"We use Zod for input validation. It provides both compile-time types and runtime validation. The schema defines constraints - prompt length, valid styles, duration range. If validation fails, we return a 400 error with a clear message. This prevents invalid data from reaching the AI service."

---

### Rate Limiting

```typescript
// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(userId: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    // Reset window
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + windowMs
    });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false; // Rate limited
  }
  
  userLimit.count++;
  return true;
}

// Usage in API route
if (!rateLimit(user.id, 10, 60000)) { // 10 requests per minute
  return NextResponse.json(
    { success: false, error: 'Rate limit exceeded. Try again later.' },
    { status: 429 }
  );
}
```

**Production Rate Limiting:**
```typescript
// Using Redis
import Redis from 'ioredis';
const redis = new Redis();

async function rateLimit(userId: string): Promise<boolean> {
  const key = `ratelimit:${userId}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60); // 60 seconds
  }
  
  return count <= 10; // 10 requests per minute
}
```

**Interview Answer:**
"Rate limiting prevents abuse. We track requests per user in a time window. If they exceed the limit, we return 429 Too Many Requests. For production, we'd use Redis instead of in-memory storage so rate limits work across multiple servers. We'd also implement exponential backoff for repeated violations."

---

### CORS Configuration

```javascript
// server/server.js
const allowedOrigins = process.env.CLIENT_URL.split(',');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**CORS Explained:**

```
Browser                    Backend
   │                          │
   ├─ OPTIONS /api/auth ────→ │ (Preflight request)
   │                          │
   │ ←─ Allow: GET, POST ──── │ (CORS headers)
   │                          │
   ├─ POST /api/auth ────────→ │ (Actual request)
   │                          │
   │ ←─ Response ──────────── │
```

**Interview Answer:**
"CORS prevents malicious sites from making requests to our API. We whitelist our frontend domain in the `origin` option. The `credentials: true` allows cookies to be sent. For preflight requests (OPTIONS), the browser checks if the actual request is allowed. We allow common methods and headers."

---


## 10. State Management

### Context API Architecture

```typescript
// src/context/AuthContext.tsx
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, loading: true, error: null };
      
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
      
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };
      
    case 'LOGOUT':
      return { ...initialState, loading: false };
      
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    default:
      return state;
  }
}
```

**Reducer Pattern Benefits:**

1. **Predictable State Updates:** All state changes go through reducer
2. **Easier Debugging:** Can log every action
3. **Time-Travel Debugging:** Can replay actions
4. **Testability:** Pure function, easy to test

**Interview Answer:**
"We use useReducer for complex state logic. The reducer is a pure function that takes current state and an action, returns new state. This makes state updates predictable - you can't accidentally mutate state. All auth operations (login, logout, update) dispatch actions. This pattern scales better than multiple useState calls."

---

### Context Provider Pattern

```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'LOGOUT' });
        return;
      }
      
      try {
        const user = await authService.getMe();
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
      } catch {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
      }
    };
    
    restoreSession();
  }, []);
  
  // Actions
  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const data = await authService.loginWithEmail(email, password);
      localStorage.setItem('token', data.token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: data.user, token: data.token }
      });
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      throw err;
    }
  }, []);
  
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  }, []);
  
  const updateCredits = useCallback((credits: number) => {
    dispatch({ type: 'UPDATE_USER', payload: { credits } });
  }, []);
  
  const value = {
    ...state,
    login,
    logout,
    updateCredits
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Key Concepts:**

1. **useCallback:** Memoizes functions to prevent re-renders
2. **Session Restoration:** Checks localStorage on mount
3. **Error Handling:** Catches and dispatches errors
4. **Optimistic Updates:** Updates credits immediately

**Interview Answer:**
"The AuthProvider wraps the app and provides auth state to all components. On mount, it checks localStorage for a token and restores the session. Actions like login and logout are memoized with useCallback to prevent unnecessary re-renders. When credits are deducted, we update the context immediately for instant UI feedback."

---

### Custom Hook Pattern

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

// Usage in components
function GeneratorPage() {
  const { user, updateCredits } = useAuth();
  
  const handleGenerate = async () => {
    // Generate ad
    await generateAd();
    
    // Update credits
    updateCredits(user.credits - 1);
  };
  
  return (
    <div>
      <p>Credits: {user.credits}</p>
      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
}
```

**Benefits:**

1. **Type Safety:** TypeScript knows context is not null
2. **Better Error Messages:** Clear error if used outside provider
3. **Cleaner Code:** No need to check for null

**Interview Answer:**
"The useAuth hook wraps useContext and adds error handling. If you try to use it outside AuthProvider, you get a clear error message. This is better than checking for null in every component. It also provides better TypeScript inference - the IDE knows all available methods."

---

### State Update Patterns

#### Optimistic Updates

```typescript
const handleLike = async (postId: string) => {
  // 1. Update UI immediately (optimistic)
  setPosts(prev => prev.map(post => 
    post._id === postId
      ? { ...post, likes: [...post.likes, user.id], likeCount: post.likeCount + 1 }
      : post
  ));
  
  try {
    // 2. Send request to server
    await communityService.toggleLike(postId);
  } catch (error) {
    // 3. Revert on error
    setPosts(prev => prev.map(post => 
      post._id === postId
        ? { ...post, likes: post.likes.filter(id => id !== user.id), likeCount: post.likeCount - 1 }
        : post
    ));
  }
};
```

**Interview Answer:**
"Optimistic updates improve perceived performance. We update the UI immediately, then send the request. If it fails, we revert. This makes the app feel instant. For critical operations like payments, we'd wait for server confirmation before updating UI."

---

#### Debouncing

```typescript
import { useCallback, useRef } from 'react';

function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}

// Usage
const debouncedSearch = useDebounce((term: string) => {
  searchAPI(term);
}, 500);

<input onChange={(e) => debouncedSearch(e.target.value)} />
```

**Interview Answer:**
"Debouncing delays function execution until the user stops typing. Without it, we'd make an API call on every keystroke. With 500ms debounce, we wait until the user pauses. This reduces server load and improves performance."

---

## 11. Security Considerations

### Input Sanitization

```typescript
// Prevent XSS attacks
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);

// Prevent SQL injection (using Mongoose)
// ❌ Bad: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Good: Parameterized queries (Mongoose does this automatically)
const user = await User.findOne({ email });
```

**Interview Answer:**
"We sanitize user input to prevent XSS attacks. DOMPurify removes malicious scripts from HTML. Mongoose automatically escapes queries, preventing SQL injection. We never concatenate user input into queries. For file uploads, we validate MIME types and file sizes."

---

### Password Security

```javascript
// server/models/User.js
const bcrypt = require('bcryptjs');

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12); // 12 rounds
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

**Bcrypt Explained:**

```
Password: "mypassword123"
    ↓
Salt: Random string (e.g., "$2a$12$KIXxKj...")
    ↓
Hash: bcrypt(password + salt) = "$2a$12$KIXxKj...hashed_value"
    ↓
Stored in database
```

**Why Bcrypt?**
1. **Slow by design:** Takes ~100ms to hash (prevents brute force)
2. **Salted:** Each password has unique salt (prevents rainbow tables)
3. **Adaptive:** Can increase rounds as computers get faster

**Interview Answer:**
"We use bcrypt with 12 rounds to hash passwords. Bcrypt is intentionally slow to prevent brute force attacks. Each password gets a unique salt, so identical passwords have different hashes. We never store plain text passwords. The pre-save hook automatically hashes passwords before saving."

---

### JWT Security

```typescript
// Token generation
const token = jwt.sign(
  { userId: user._id }, // Payload (don't include sensitive data)
  process.env.JWT_SECRET, // Strong secret (32+ chars)
  { 
    expiresIn: '30d', // Expiration
    algorithm: 'HS256' // Algorithm
  }
);

// Token verification
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Token is valid
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    // Token expired
  }
  if (error.name === 'JsonWebTokenError') {
    // Invalid token
  }
}
```

**Security Best Practices:**

1. **Strong Secret:**
   ```bash
   # Generate strong secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Short Expiration:**
   - Access token: 15 minutes
   - Refresh token: 30 days
   - Our approach: 30 days (trade-off for UX)

3. **HTTPS Only:**
   - Tokens sent over HTTPS
   - Prevents man-in-the-middle attacks

**Interview Answer:**
"JWT tokens are signed with a strong secret to prevent tampering. We set an expiration to limit damage if a token is stolen. In production, we'd use short-lived access tokens (15 min) and long-lived refresh tokens (30 days). Tokens are sent over HTTPS to prevent interception."

---

### HTTPS & SSL/TLS

```
Client                          Server
  │                               │
  ├─ ClientHello ───────────────→ │
  │                               │
  │ ←─ ServerHello ───────────────┤
  │    (Certificate)              │
  │                               │
  ├─ Verify Certificate ──────────│
  │                               │
  ├─ Encrypted Data ─────────────→│
  │                               │
  │ ←─ Encrypted Response ────────┤
```

**Why HTTPS?**
1. **Encryption:** Data encrypted in transit
2. **Authentication:** Verifies server identity
3. **Integrity:** Prevents tampering

**Interview Answer:**
"HTTPS encrypts data between client and server using TLS. This prevents man-in-the-middle attacks where someone intercepts the connection. The server's SSL certificate proves its identity. All sensitive data (passwords, tokens) must be sent over HTTPS."

---

### Environment Variables

```bash
# .env (never commit to git!)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/aiads
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
FREEPIK_API_KEY=FPSX6316e26277284161bd86d938cb679648
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
CLIENT_URL=http://localhost:3000
```

```javascript
// .gitignore
.env
.env.local
.env.production
```

**Security Rules:**

1. **Never commit secrets:** Use .gitignore
2. **Use environment variables:** Not hardcoded
3. **Different secrets per environment:** Dev, staging, prod
4. **Rotate secrets regularly:** Change every 90 days

**Interview Answer:**
"Environment variables store sensitive data like API keys and database URLs. We never commit .env files to git. Each environment (dev, staging, prod) has different secrets. In production, we use services like AWS Secrets Manager or Vercel Environment Variables."

---

### CORS Security

```javascript
// ❌ Bad: Allow all origins
app.use(cors({ origin: '*' }));

// ✅ Good: Whitelist specific origins
app.use(cors({
  origin: ['https://myapp.com', 'https://www.myapp.com'],
  credentials: true
}));

// ✅ Better: Dynamic origin check
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CLIENT_URL.split(',');
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

**Interview Answer:**
"CORS prevents malicious sites from making requests to our API. We whitelist our frontend domain. The `credentials: true` allows cookies but requires specific origin (can't use wildcard). This prevents CSRF attacks where a malicious site tricks users into making requests."

---

### File Upload Security

```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1 // Only 1 file
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images allowed'));
    }
    
    // Check extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      return cb(new Error('Invalid file extension'));
    }
    
    cb(null, true);
  }
});

// Additional validation
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Validate file size (double-check)
  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(413).json({ error: 'File too large' });
  }
  
  // Validate image (check if it's actually an image)
  try {
    const dimensions = await sharp(req.file.buffer).metadata();
    if (!dimensions.width || !dimensions.height) {
      return res.status(400).json({ error: 'Invalid image' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid image' });
  }
  
  // Process file...
});
```

**Security Checks:**

1. **MIME type validation:** Check Content-Type header
2. **Extension validation:** Check file extension
3. **Size limit:** Prevent large uploads
4. **Magic number validation:** Check file signature (first bytes)
5. **Virus scanning:** Use ClamAV in production

**Interview Answer:**
"We validate file uploads at multiple levels. First, check MIME type and extension. Then, verify file size. Finally, use a library like Sharp to ensure it's a valid image. In production, we'd add virus scanning with ClamAV. We store files on Cloudinary, not our server, to prevent directory traversal attacks."

---

## 12. Performance Optimizations

### Frontend Optimizations

#### 1. Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Spinner />,
  ssr: false // Don't render on server
});

// Route-based code splitting (automatic in Next.js)
// Each page is a separate bundle
```

**Benefits:**
- Smaller initial bundle
- Faster page load
- Load code only when needed

---

#### 2. Image Optimization

```typescript
import Image from 'next/image';

// ❌ Bad: Regular img tag
<img src="/product.jpg" alt="Product" />

// ✅ Good: Next.js Image component
<Image 
  src="/product.jpg"
  width={500}
  height={500}
  alt="Product"
  loading="lazy" // Lazy load
  placeholder="blur" // Blur placeholder
  quality={75} // Optimize quality
/>
```

**Next.js Image Features:**
- Automatic WebP conversion
- Responsive images
- Lazy loading
- Blur placeholder

---

#### 3. Memoization

```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return posts.filter(p => p.likes.length > 10)
    .sort((a, b) => b.likes.length - a.likes.length);
}, [posts]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedPost = React.memo(PostCard);
```

**When to use:**
- **useMemo:** Expensive calculations
- **useCallback:** Functions passed as props
- **React.memo:** Components that re-render often

---

#### 4. Virtual Scrolling

```typescript
// For long lists (1000+ items)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={posts.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <PostCard post={posts[index]} />
    </div>
  )}
</FixedSizeList>
```

**Benefits:**
- Only renders visible items
- Constant performance regardless of list size
- Smooth scrolling

---

### Backend Optimizations

#### 1. Database Indexing

```javascript
// Create indexes
userSchema.index({ email: 1 }); // Single field
postSchema.index({ user: 1, createdAt: -1 }); // Compound

// Check query performance
db.posts.find({ user: userId }).explain('executionStats');

// Result:
// executionTimeMillis: 2ms (with index)
// executionTimeMillis: 500ms (without index)
```

---

#### 2. Query Optimization

```javascript
// ❌ Bad: N+1 queries
const posts = await Post.find();
for (const post of posts) {
  post.user = await User.findById(post.user); // N queries
}

// ✅ Good: Single query with populate
const posts = await Post.find()
  .populate('user', 'name avatar') // 1 query
  .select('title imageUrl likes') // Only needed fields
  .lean(); // Skip Mongoose overhead
```

---

#### 3. Caching

```typescript
// In-memory cache
const cache = new Map<string, { data: any; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

function setCache(key: string, data: any, ttl: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  });
}

// Usage
router.get('/posts', async (req, res) => {
  const cacheKey = 'posts:all';
  const cached = getCached(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const posts = await Post.find();
  setCache(cacheKey, posts, 60000); // Cache for 1 minute
  
  res.json(posts);
});
```

**Production Caching:**
```typescript
// Using Redis
import Redis from 'ioredis';
const redis = new Redis();

router.get('/posts', async (req, res) => {
  const cached = await redis.get('posts:all');
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const posts = await Post.find();
  await redis.setex('posts:all', 60, JSON.stringify(posts));
  
  res.json(posts);
});
```

---

#### 4. Compression

```javascript
const compression = require('compression');

app.use(compression()); // Gzip responses

// Response size:
// Without compression: 500KB
// With compression: 50KB (10x smaller)
```

---

#### 5. CDN for Static Assets

```
User Request
    ↓
CDN (Cloudflare, CloudFront)
    ↓ (Cache Miss)
Origin Server
    ↓
CDN caches response
    ↓
Future requests served from CDN (fast!)
```

**Benefits:**
- Faster delivery (geographically distributed)
- Reduced server load
- DDoS protection

---

### Monitoring & Profiling

```typescript
// Performance monitoring
const start = Date.now();
const result = await expensiveOperation();
const duration = Date.now() - start;

console.log(`Operation took ${duration}ms`);

// Log slow queries
mongoose.set('debug', (collectionName, method, query, doc) => {
  const start = Date.now();
  // ... execute query
  const duration = Date.now() - start;
  
  if (duration > 100) {
    console.warn(`Slow query: ${collectionName}.${method} took ${duration}ms`);
  }
});
```

**Interview Answer:**
"We optimize performance through multiple strategies. Frontend: code splitting, image optimization, memoization. Backend: database indexing, query optimization, caching. We use CDNs for static assets. In production, we'd add monitoring with tools like New Relic or Datadog to identify bottlenecks."

---


## 13. Error Handling

### Frontend Error Handling

#### 1. Try-Catch Blocks

```typescript
const handleGenerate = async () => {
  setIsGenerating(true);
  setError(null);
  
  try {
    const result = await fetch('/api/v1/generate-ad', {
      method: 'POST',
      body: formData
    });
    
    if (!result.ok) {
      const error = await result.json();
      throw new Error(error.message || 'Generation failed');
    }
    
    const data = await result.json();
    setGenerationResult(data);
    
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setIsGenerating(false);
  }
};
```

---

#### 2. Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service (Sentry, Bugsnag)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

#### 3. Toast Notifications

```typescript
// Simple toast system
const [toasts, setToasts] = useState<Toast[]>([]);

const showToast = (message: string, type: 'success' | 'error') => {
  const id = Date.now();
  setToasts(prev => [...prev, { id, message, type }]);
  
  setTimeout(() => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, 3000);
};

// Usage
try {
  await generateAd();
  showToast('Ad generated successfully!', 'success');
} catch (error) {
  showToast('Failed to generate ad', 'error');
}
```

---

### Backend Error Handling

#### 1. Custom Error Classes

```javascript
// server/utils/errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// Usage
if (!user) {
  throw new NotFoundError('User not found');
}
```

---

#### 2. Global Error Handler

```javascript
// server/server.js
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Operational errors (expected)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }
  
  // Programming errors (unexpected)
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  
  res.status(500).json({
    success: false,
    error: message
  });
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Gracefully shutdown
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
```

---

#### 3. Async Error Wrapper

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
router.get('/posts', asyncHandler(async (req, res) => {
  const posts = await Post.find(); // If this throws, it's caught
  res.json({ posts });
}));
```

---

### Error Logging

```typescript
// Production error logging
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Log errors
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    user: { id: req.user.id },
    tags: { operation: 'generate-ad' }
  });
  throw error;
}
```

**Interview Answer:**
"We handle errors at multiple levels. Frontend: try-catch blocks, error boundaries for React errors, toast notifications for user feedback. Backend: custom error classes, global error handler, async wrappers. In production, we use Sentry to track errors with context like user ID and operation type."

---

## 14. Deployment Strategy

### Environment Setup

```
Development → Staging → Production

Local Machine → Vercel Preview → Vercel Production
```

---

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: Backend URL
- `CLOUDINARY_URL`: Cloudinary credentials
- `FREEPIK_API_KEY`: Freepik API key

---

### Backend Deployment (Render/Railway)

**render.yaml:**
```yaml
services:
  - type: web
    name: ai-ads-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: CLOUDINARY_URL
        sync: false
```

**Health Check Endpoint:**
```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

### Database Deployment (MongoDB Atlas)

```
1. Create cluster on MongoDB Atlas
2. Whitelist IP addresses (0.0.0.0/0 for all)
3. Create database user
4. Get connection string
5. Add to environment variables
```

**Connection String:**
```
mongodb+srv://username:password@cluster.mongodb.net/aiads?retryWrites=true&w=majority
```

---

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

### Monitoring & Logging

```typescript
// Application monitoring
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0
});

// Performance monitoring
const transaction = Sentry.startTransaction({
  op: 'generate-ad',
  name: 'Generate Ad Video'
});

try {
  const result = await aiService.generateAdVideo(...);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('error');
  throw error;
} finally {
  transaction.finish();
}
```

**Interview Answer:**
"We deploy frontend to Vercel and backend to Render. Vercel provides automatic deployments on git push, preview URLs for PRs, and edge caching. The backend runs on Render with auto-scaling. MongoDB is hosted on Atlas. We use GitHub Actions for CI/CD - run tests, build, then deploy. Sentry monitors errors and performance in production."

---

## 15. Design Patterns Used

### 1. Repository Pattern

```typescript
// Abstracts data access
interface IGenerationRepository {
  create(generation: Generation): Promise<void>;
  findById(id: string): Promise<Generation | null>;
  findByUserId(userId: string): Promise<Generation[]>;
  updateStatus(id: string, status: string): Promise<void>;
}

class MongoGenerationRepository implements IGenerationRepository {
  async create(generation: Generation): Promise<void> {
    await GenerationModel.create(generation);
  }
  // ... other methods
}

// Easy to swap implementations
const repo: IGenerationRepository = new MongoGenerationRepository();
// const repo: IGenerationRepository = new InMemoryRepository();
```

---

### 2. Service Layer Pattern

```typescript
// Business logic separated from routes
class AIService {
  async generateAdVideo(...): Promise<AdVideoResult> {
    // Orchestrates multiple operations
    const productUrl = await this.uploadProduct();
    const prompt = await this.enhancePrompt();
    const media = await this.generateMedia();
    const result = await this.uploadResult();
    return result;
  }
}

// Route just calls service
router.post('/generate-ad', async (req, res) => {
  const result = await aiService.generateAdVideo(...);
  res.json(result);
});
```

---

### 3. Middleware Pattern

```javascript
// Chain of responsibility
app.use(cors());           // 1. CORS
app.use(express.json());   // 2. Parse JSON
app.use(auth);             // 3. Authenticate
app.use(rateLimit);        // 4. Rate limit
app.use(routes);           // 5. Handle request
```

---

### 4. Factory Pattern

```typescript
// Create objects without specifying exact class
class UserFactory {
  static createUser(type: 'email' | 'google', data: any): User {
    if (type === 'email') {
      return new EmailUser(data);
    }
    if (type === 'google') {
      return new GoogleUser(data);
    }
    throw new Error('Invalid user type');
  }
}

const user = UserFactory.createUser('google', googleProfile);
```

---

### 5. Observer Pattern (React Context)

```typescript
// Observers (components) subscribe to subject (context)
const { user } = useAuth(); // Component observes auth state

// When state changes, all observers are notified
dispatch({ type: 'UPDATE_USER', payload: newUser });
// All components using useAuth() re-render
```

---

### 6. Singleton Pattern

```typescript
// Only one instance exists
class Database {
  private static instance: Database;
  
  private constructor() {
    // Connect to database
  }
  
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const db = Database.getInstance();
```

---

## 16. Scalability Concepts

### Horizontal vs Vertical Scaling

**Vertical Scaling (Scale Up):**
```
Single Server
CPU: 2 cores → 8 cores
RAM: 4GB → 32GB
```

**Horizontal Scaling (Scale Out):**
```
1 Server → 3 Servers
Load Balancer distributes traffic
```

**Our Approach:**
- Frontend: Horizontal (Vercel Edge Network)
- Backend: Horizontal (Multiple instances on Render)
- Database: Vertical + Sharding (MongoDB Atlas)

---

### Load Balancing

```
User Requests
    ↓
Load Balancer (Nginx, AWS ALB)
    ↓
┌────────┬────────┬────────┐
│Server 1│Server 2│Server 3│
└────────┴────────┴────────┘
```

**Algorithms:**
- **Round Robin:** Distribute evenly
- **Least Connections:** Send to server with fewest connections
- **IP Hash:** Same user always goes to same server

---

### Caching Strategy

```
User Request
    ↓
CDN Cache (Cloudflare)
    ↓ (Miss)
Application Cache (Redis)
    ↓ (Miss)
Database (MongoDB)
```

**Cache Levels:**
1. **Browser Cache:** Static assets
2. **CDN Cache:** Images, videos
3. **Application Cache:** API responses
4. **Database Cache:** Query results

---

### Database Sharding

```
Users 1-1000    → Shard 1
Users 1001-2000 → Shard 2
Users 2001-3000 → Shard 3
```

**Sharding Strategies:**
- **Range-based:** User ID ranges
- **Hash-based:** Hash user ID
- **Geographic:** By region

---

### Microservices Architecture

```
Monolith (Current):
┌─────────────────────┐
│  Single Application │
│  - Auth             │
│  - Generation       │
│  - Community        │
└─────────────────────┘

Microservices (Future):
┌──────────┐  ┌──────────────┐  ┌───────────┐
│Auth      │  │Generation    │  │Community  │
│Service   │  │Service       │  │Service    │
└──────────┘  └──────────────┘  └───────────┘
```

**When to use Microservices:**
- Team size > 10 developers
- Different scaling needs per service
- Need to deploy services independently

**Interview Answer:**
"Our current architecture is a monolith, which is fine for our scale. For horizontal scaling, we'd deploy multiple instances behind a load balancer. We'd add Redis for caching frequently accessed data. If we grow to millions of users, we'd consider microservices - separate services for auth, generation, and community. Each service could scale independently."

---

## 17. Interview Questions by Module

### Frontend Questions

**Q1: Explain the difference between Server and Client Components in Next.js 13+.**

**Answer:**
"Server Components run on the server and send HTML to the client. They can access databases directly and don't increase JavaScript bundle size. Client Components run in the browser and can use hooks, event handlers, and browser APIs. We use Server Components for static content like the landing page, and Client Components for interactive features like the generator form."

---

**Q2: How does React's Virtual DOM work?**

**Answer:**
"React maintains a virtual representation of the DOM in memory. When state changes, React creates a new virtual DOM tree and compares it with the previous one (diffing). It calculates the minimum changes needed and updates only those parts of the real DOM (reconciliation). This is faster than manipulating the real DOM directly because DOM operations are expensive."

---

**Q3: What is the purpose of useCallback and useMemo?**

**Answer:**
"useCallback memoizes functions to prevent re-creation on every render. This is useful when passing callbacks to child components that use React.memo. useMemo memoizes expensive calculations. Both take a dependency array - they only recompute when dependencies change. Overusing them can hurt performance, so use them only when profiling shows a benefit."

---

**Q4: Explain how you handle form validation.**

**Answer:**
"We use Zod for schema-based validation. It provides both TypeScript types and runtime validation. The schema defines constraints like string length, number ranges, and enum values. On form submit, we validate the data and show error messages if validation fails. This prevents invalid data from reaching the API."

---

### Backend Questions

**Q5: Explain the difference between authentication and authorization.**

**Answer:**
"Authentication verifies who you are (login with email/password). Authorization determines what you can do (access control). In our app, JWT handles authentication - it proves you're logged in. Authorization checks if you can perform an action - for example, you can only delete your own posts, not others'."

---

**Q6: How do you prevent SQL injection in MongoDB?**

**Answer:**
"MongoDB is less vulnerable to SQL injection because it uses BSON, not SQL. However, we still sanitize input. Mongoose automatically escapes queries, so we never concatenate user input into queries. We use parameterized queries like `User.findOne({ email })` instead of string concatenation. We also validate input with Zod before it reaches the database."

---

**Q7: Explain how JWT works.**

**Answer:**
"JWT has three parts: header (algorithm), payload (data), and signature (verification). When a user logs in, we generate a token containing their user ID, sign it with a secret, and return it. The client stores it and sends it with every request. We verify the signature to ensure it wasn't tampered with. The token expires after 30 days for security."

---

**Q8: What is the N+1 query problem and how do you solve it?**

**Answer:**
"N+1 happens when you fetch a list of items, then fetch related data for each item in a loop. For example, fetching 100 posts, then fetching the user for each post = 101 queries. We solve it with Mongoose's populate method, which joins related documents in one query. We also use projection to fetch only needed fields."

---

### Database Questions

**Q9: Why did you choose MongoDB over PostgreSQL?**

**Answer:**
"We chose MongoDB for its flexible schema - we're adding features frequently and don't want to write migrations. The JSON-like documents map naturally to JavaScript objects. MongoDB scales horizontally with built-in sharding. For a banking app, I'd use PostgreSQL for ACID transactions and data integrity. But for our use case, MongoDB's flexibility and speed are more important."

---

**Q10: Explain database indexing.**

**Answer:**
"An index is like a book's index - it helps find data quickly. Without an index, MongoDB scans every document (slow). With an index, it uses a B-tree structure to find data in O(log n) time. We create indexes on frequently queried fields like email. The tradeoff is slower writes because indexes must be updated. We use compound indexes for queries with multiple conditions."

---

### Security Questions

**Q11: How do you prevent XSS attacks?**

**Answer:**
"XSS happens when malicious scripts are injected into the page. We prevent it by sanitizing user input with DOMPurify before rendering. React automatically escapes values in JSX, so `<div>{userInput}</div>` is safe. We use Content Security Policy headers to restrict script sources. We never use dangerouslySetInnerHTML unless absolutely necessary."

---

**Q12: Explain CORS and why it's important.**

**Answer:**
"CORS prevents malicious sites from making requests to our API. Without CORS, evil.com could make requests to our API using the user's cookies. We whitelist our frontend domain in the CORS configuration. The browser sends a preflight OPTIONS request to check if the actual request is allowed. We set `credentials: true` to allow cookies but require a specific origin."

---

### System Design Questions

**Q13: How would you design a rate limiter?**

**Answer:**
"I'd use the sliding window algorithm with Redis. For each user, store a sorted set of timestamps. On each request, remove timestamps older than the window (e.g., 1 minute), add the current timestamp, and check the count. If count > limit, reject the request. Redis handles this efficiently with ZADD and ZREMRANGEBYSCORE commands. For distributed systems, use Redis to share state across servers."

---

**Q14: How would you handle 1 million concurrent users?**

**Answer:**
"First, horizontal scaling - deploy multiple backend instances behind a load balancer. Use CDN for static assets. Add Redis for caching frequently accessed data. Use database read replicas for read-heavy operations. Implement queue system (RabbitMQ, SQS) for AI generation to handle spikes. Use WebSockets for real-time updates instead of polling. Monitor with tools like New Relic to identify bottlenecks."

---

**Q15: Design a notification system.**

**Answer:**
"I'd use a pub/sub pattern. When an event occurs (new like, comment), publish to a message queue (Redis Pub/Sub, RabbitMQ). Subscribers listen for events and send notifications via different channels (email, push, SMS). Use a notification service (Firebase Cloud Messaging) for push notifications. Store notification preferences in the database. Implement batching to avoid spam - group notifications and send once per hour."

---

## 18. Real-World Analogies

### 1. Frontend-Backend Communication

**Analogy: Restaurant**
- **Frontend:** Waiter (takes your order, shows you the menu)
- **Backend:** Kitchen (prepares the food)
- **API:** Order slip (communication between waiter and kitchen)
- **Database:** Pantry (stores ingredients)

---

### 2. Authentication

**Analogy: Hotel Key Card**
- **Login:** Check-in at reception, get key card
- **JWT Token:** Key card
- **Protected Routes:** Hotel room (only your key card works)
- **Logout:** Check-out, key card deactivated

---

### 3. Database Indexing

**Analogy: Book Index**
- **Without Index:** Read entire book to find a topic (slow)
- **With Index:** Look up topic in index, jump to page (fast)
- **Tradeoff:** Index takes space, must be updated when book changes

---

### 4. Caching

**Analogy: Refrigerator**
- **Database:** Grocery store (far away, slow)
- **Cache:** Refrigerator (nearby, fast)
- **Cache Hit:** Food in fridge, no need to go to store
- **Cache Miss:** Food not in fridge, must go to store

---

### 5. Load Balancer

**Analogy: Airport Check-in**
- **Load Balancer:** Person directing you to shortest line
- **Servers:** Check-in counters
- **Requests:** Passengers
- **Algorithm:** Choose counter with fewest people

---

### 6. Microservices

**Analogy: Department Store**
- **Monolith:** One giant store with everything
- **Microservices:** Separate stores (clothing, electronics, groceries)
- **Benefits:** Each store can operate independently
- **Tradeoff:** Need to coordinate between stores

---

## 19. Common Pitfalls & How to Avoid Them

### 1. Not Handling Errors

**❌ Bad:**
```typescript
const data = await fetch('/api/posts');
setData(data); // What if fetch fails?
```

**✅ Good:**
```typescript
try {
  const data = await fetch('/api/posts');
  setData(data);
} catch (error) {
  setError(error.message);
}
```

---

### 2. Storing Sensitive Data in Frontend

**❌ Bad:**
```typescript
const API_KEY = 'sk_live_abc123'; // Exposed in bundle
```

**✅ Good:**
```typescript
// Store in backend environment variables
const API_KEY = process.env.API_KEY;
```

---

### 3. Not Validating Input

**❌ Bad:**
```javascript
const user = await User.create(req.body); // Trust user input?
```

**✅ Good:**
```javascript
const validated = userSchema.parse(req.body);
const user = await User.create(validated);
```

---

### 4. N+1 Queries

**❌ Bad:**
```javascript
const posts = await Post.find();
for (const post of posts) {
  post.user = await User.findById(post.user); // N queries
}
```

**✅ Good:**
```javascript
const posts = await Post.find().populate('user');
```

---

### 5. Not Using Indexes

**❌ Bad:**
```javascript
// No index on email
const user = await User.findOne({ email }); // Scans all documents
```

**✅ Good:**
```javascript
userSchema.index({ email: 1 }); // Create index
const user = await User.findOne({ email }); // Fast lookup
```

---

## 20. Practice Interview Scenarios

### Scenario 1: System Design

**Interviewer:** "Design a URL shortener like bit.ly."

**Your Answer:**
"I'd design it with these components:

1. **API Endpoints:**
   - POST /shorten - Create short URL
   - GET /:shortCode - Redirect to original URL

2. **Database Schema:**
   ```javascript
   {
     shortCode: String (indexed, unique),
     originalUrl: String,
     clicks: Number,
     createdAt: Date,
     expiresAt: Date
   }
   ```

3. **Short Code Generation:**
   - Use base62 encoding (a-z, A-Z, 0-9)
   - 6 characters = 62^6 = 56 billion combinations
   - Check for collisions, regenerate if exists

4. **Scaling:**
   - Cache popular URLs in Redis
   - Use CDN for redirects
   - Database sharding by shortCode prefix

5. **Analytics:**
   - Track clicks, referrers, locations
   - Use message queue for async processing"

---

### Scenario 2: Debugging

**Interviewer:** "Users report slow page loads. How do you debug?"

**Your Answer:**
"I'd follow this process:

1. **Reproduce:** Try to reproduce the issue
2. **Measure:** Use Chrome DevTools Performance tab
3. **Identify Bottleneck:**
   - Network: Check API response times
   - Rendering: Check for unnecessary re-renders
   - Bundle size: Check JavaScript bundle size

4. **Common Causes:**
   - Large images not optimized
   - No code splitting
   - Expensive calculations in render
   - N+1 queries on backend

5. **Solutions:**
   - Optimize images with Next.js Image
   - Lazy load heavy components
   - Add memoization
   - Add database indexes

6. **Monitor:** Set up performance monitoring (Lighthouse CI)"

---

### Scenario 3: Security Incident

**Interviewer:** "A user's account was hacked. What do you do?"

**Your Answer:**
"Immediate actions:

1. **Contain:**
   - Invalidate all user's tokens
   - Force password reset
   - Lock account temporarily

2. **Investigate:**
   - Check login logs for suspicious IPs
   - Check if password was leaked (haveibeenpwned.com)
   - Check for SQL injection attempts

3. **Notify:**
   - Email user about security incident
   - Provide steps to secure account

4. **Prevent:**
   - Implement 2FA
   - Add rate limiting on login
   - Monitor for brute force attacks
   - Use stronger password requirements

5. **Review:**
   - Audit all security practices
   - Penetration testing
   - Security training for team"

---

## 🎯 Final Interview Tips

### 1. STAR Method for Behavioral Questions

**Situation:** Describe the context
**Task:** Explain what needed to be done
**Action:** Detail what you did
**Result:** Share the outcome

**Example:**
"In this project (Situation), I needed to implement AI video generation (Task). I integrated Freepik API and Cloudinary, created a service layer for abstraction, and added error handling (Action). The result was a system that generates ads in 30 seconds with 95% success rate (Result)."

---

### 2. Explain Like I'm Five

Practice explaining complex concepts simply:
- "JWT is like a movie ticket - it proves you paid and lets you enter"
- "Caching is like keeping snacks in your desk instead of walking to the store"
- "Load balancing is like having multiple checkout lanes at a grocery store"

---

### 3. Know Your Tradeoffs

Every decision has tradeoffs. Be ready to explain:
- "We chose MongoDB for flexibility, but PostgreSQL would give better ACID guarantees"
- "We use localStorage for tokens for convenience, but httpOnly cookies are more secure"
- "We cache for 1 minute - longer would save more requests but show stale data"

---

### 4. Be Honest About What You Don't Know

"I haven't implemented that specific feature, but here's how I'd approach it..."
"I'm not familiar with that technology, but I've used similar tools like..."

---

### 5. Ask Clarifying Questions

Before answering system design questions:
- "What's the expected scale? 1000 or 1 million users?"
- "What's more important - consistency or availability?"
- "Are there any specific constraints or requirements?"

---

## 🚀 You're Ready!

You now have:
- ✅ Deep understanding of every component
- ✅ Ability to explain architecture decisions
- ✅ Knowledge of alternatives and tradeoffs
- ✅ Real-world analogies for complex concepts
- ✅ Practice with common interview questions
- ✅ Confidence to handle cross-questioning

**Remember:**
- Be confident but humble
- Explain your thought process
- Use diagrams when helpful
- Relate to real-world examples
- Show enthusiasm for learning

**Good luck with your interviews! 🎉**

