# 🎬 AI Ads Project - Complete Beginner's Guide

> **Imagine you want to create cool video advertisements for your products in seconds using AI - that's what this project does!**

---

## 📚 Table of Contents

1. [What is This Project?](#what-is-this-project)
2. [How Does It Work? (The Flow)](#how-does-it-work-the-flow)
3. [Tech Stack Explained](#tech-stack-explained)
4. [Project Structure Explained](#project-structure-explained)
5. [JavaScript Concepts (From Scratch)](#javascript-concepts-from-scratch)
6. [Node.js Concepts (From Scratch)](#nodejs-concepts-from-scratch)
7. [How The Project Works Step-by-Step](#how-the-project-works-step-by-step)
8. [Database Explained](#database-explained)
9. [API Endpoints Explained](#api-endpoints-explained)
10. [Authentication Flow](#authentication-flow)
11. [How to Run This Project](#how-to-run-this-project)

---

## 🎯 What is This Project?

**AI Ads** is like a magic tool that creates professional video advertisements for you!

### Simple Explanation:
- You upload a picture of your product (like a shoe, phone, or any item)
- You tell the AI what style you want (luxury, fun, professional, etc.)
- **BOOM!** The AI creates a video ad for you in seconds!
- You can share it with others and even upgrade to make more ads

### Who Uses It?
- Small business owners who need ads but can't afford expensive agencies
- YouTubers and content creators
- Marketing teams
- Anyone who wants to create cool ads quickly!

---

## 🔄 How Does It Work? (The Flow)

Let me explain like you're 5 years old:

### Step 1: You Visit The Website
```
Your Computer → Opens Browser → Visits http://localhost:3000
```

### Step 2: You Sign Up or Login
```
You Type Email & Password → Frontend Sends to Backend → Backend Checks Database
→ If OK: You Get a "Token" (like a special key) → You're Logged In!
```

### Step 3: You Go to Ad Generator Page
```
You Click "Create Ad" → Upload Product Picture → Choose Style → Click Generate
```

### Step 4: Magic Happens (Behind the Scenes)
```
Frontend → Sends Request to Backend → Backend Calls Google AI (Gemini)
→ AI Creates Video → Video Uploaded to Cloudinary (Cloud Storage)
→ Video Link Sent Back to You → You See Your Ad!
```

### Step 5: You Can Share to Community
```
You Like Your Ad → Click Share → Everyone Can See It → People Can Like It!
```

### The Complete Flow Diagram:
```
┌─────────────────┐
│   USER BROWSER  │
│   (Frontend)    │
└────────┬────────┘
         │
         │ 1. Sends Request (HTTP)
         ▼
┌─────────────────┐
│  EXPRESS SERVER │
│   (Backend)     │
└────────┬────────┘
         │
         ├──→ 2. Check Auth (JWT Token) ──→ ┌──────────┐
         │                                   │  MongoDB │
         ├──→ 3. Call AI Service ──────────→│ Database │
         │                                   └──────────┘
         ├──→ 4. Upload Video ──────────────→ Cloudinary
         │
         └──→ 5. Send Response Back
                     │
                     ▼
            ┌─────────────────┐
            │  USER SEES AD   │
            └─────────────────┘
```

---

## 🛠️ Tech Stack Explained

Think of building a house:

| Part | What It Is | Like In Real Life |
|------|------------|-------------------|
| **Frontend (Next.js)** | The part you see and click | The walls, doors, and paint of your house |
| **Backend (Express)** | The brain that does the work | The plumbing and electrical wiring |
| **Database (MongoDB)** | Where we store data | The storage rooms and closets |
| **Cloudinary** | Where we store images/videos | Your garage or shed |
| **Google AI** | The AI that creates videos | A robot helper |
| **PhonePe** | Payment system | A cash register |

---

## 📁 Project Structure Explained

### Root Folder Structure:
```
Ai_Ads/
├── src/                    ← Frontend code (what users see)
├── server/                 ← Backend code (the brain)
├── public/                 ← Images, icons, static files
├── package.json            ← List of tools/libraries we use
├── next.config.ts          ← Next.js settings
└── README.md               ← You are here!
```

### Frontend Structure (src/):
```
src/
├── app/                    ← Pages (like website pages)
│   ├── page.tsx           ← Home page (first page you see)
│   ├── generator/         ← Where you create ads
│   ├── signin/            ← Login page
│   ├── signup/            ← Registration page
│   └── community/         ← See everyone's ads
│
├── components/            ← Reusable pieces (like LEGO blocks)
│   ├── ui/               ← Buttons, inputs, cards
│   ├── Navbar.tsx        ← Top navigation bar
│   └── Footer.tsx        ← Bottom footer
│
├── services/             ← Code that talks to backend
│   ├── api.ts           ← Main HTTP client
│   ├── auth.ts          ← Login/signup functions
│   └── payment.ts       ← Payment functions
│
├── context/              ← Global state (shared data)
│   └── AuthContext.tsx  ← User login status
│
└── lib/                  ← Helper functions
    └── services/
        ├── ai.service.ts        ← AI video generation logic
        └── gemini.service.ts    ← Google AI wrapper
```

### Backend Structure (server/):
```
server/
├── server.js             ← Main file (starts the server)
├── config/              ← Configuration files
│   ├── db.js           ← Database connection
│   ├── passport.js     ← Google login setup
│   └── cloudinary.js   ← Cloud storage setup
│
├── models/             ← Database structure (blueprints)
│   ├── User.js        ← User data structure
│   └── Post.js        ← Community post structure
│
├── routes/            ← API endpoints (URLs)
│   ├── auth.js       ← Login/signup routes
│   ├── user.js       ← User profile routes
│   ├── payment.js    ← Payment routes
│   └── community.js  ← Community routes
│
├── middleware/       ← Code that runs before routes
│   └── auth.js      ← Check if user is logged in
│
└── .env             ← Secret keys (passwords, API keys)
```

---

## 📖 JavaScript Concepts (From Scratch)

Let me explain JavaScript like you know nothing!

### 1. Variables (Storage Boxes)

Variables are like labeled boxes where you store information.

```javascript
// Three ways to create a box:

// 1. let - Can change the value
let age = 25;
age = 26; // ✅ Can change

// 2. const - CANNOT change (permanent)
const name = "John";
// name = "Jane"; // ❌ Error! Can't change

// 3. var - Old way (avoid using)
var city = "Mumbai";
```

**Real Example from Our Project:**
```javascript
// src/app/generator/page.tsx
let videoUrl = null; // Starts empty
videoUrl = "https://cloudinary.com/video123"; // Later gets filled
```

---

### 2. Data Types & Methods

Data types are different kinds of information:

#### String (Text)
```javascript
const greeting = "Hello World!";

// Methods (actions you can do):
greeting.toUpperCase();    // "HELLO WORLD!"
greeting.toLowerCase();    // "hello world!"
greeting.length;          // 12
greeting.includes("World"); // true
greeting.split(" ");      // ["Hello", "World!"]
greeting.replace("World", "Earth"); // "Hello Earth!"
```

#### Number
```javascript
const price = 999;

// Methods:
price.toString();        // "999"
price.toFixed(2);       // "999.00"
Math.round(4.7);        // 5
Math.floor(4.7);        // 4
Math.random();          // Random number 0-1
```

#### Boolean (True/False)
```javascript
const isLoggedIn = true;
const isPremium = false;

// Used in conditions:
if (isLoggedIn) {
  console.log("Welcome!");
}
```

#### Array (List of Items)
```javascript
const colors = ["red", "blue", "green"];

// Methods:
colors.push("yellow");      // Add to end
colors.pop();              // Remove from end
colors[0];                // "red" (first item)
colors.length;            // 4
colors.includes("blue");  // true
colors.map(c => c.toUpperCase()); // ["RED", "BLUE", "GREEN"]
colors.filter(c => c.length > 3); // ["blue", "green"]
```

**Real Example:**
```javascript
// server/models/Post.js
likes: [ObjectId] // Array of user IDs who liked
```

#### Object (Group of Related Data)
```javascript
const user = {
  name: "John",
  age: 25,
  email: "john@example.com"
};

// Access properties:
user.name;           // "John"
user["email"];       // "john@example.com"
user.age = 26;       // Change value
```

**Real Example:**
```javascript
// server/models/User.js
{
  name: String,
  email: String,
  password: String,
  credits: Number
}
```

---

### 3. ES6 Features (Modern JavaScript)

#### Arrow Functions (Shorter Way to Write Functions)
```javascript
// Old way:
function add(a, b) {
  return a + b;
}

// New way (Arrow Function):
const add = (a, b) => a + b;

// With one parameter:
const double = x => x * 2;

// With multiple lines:
const greet = (name) => {
  const message = `Hello ${name}`;
  return message;
};
```

**Real Example:**
```javascript
// src/services/auth.ts
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};
```

#### Spread Operator (...) - Copy or Combine
```javascript
// Copy an array:
const fruits = ["apple", "banana"];
const moreFruits = [...fruits, "orange"]; // ["apple", "banana", "orange"]

// Copy an object:
const user = { name: "John", age: 25 };
const updatedUser = { ...user, age: 26 }; // { name: "John", age: 26 }

// Combine arrays:
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4]
```

**Real Example:**
```javascript
// src/context/AuthContext.tsx
setUser({ ...user, credits: newCredits });
```

#### Rest Parameter (...) - Collect All Arguments
```javascript
// Collect unlimited arguments into an array:
const sum = (...numbers) => {
  return numbers.reduce((total, num) => total + num, 0);
};

sum(1, 2, 3);        // 6
sum(1, 2, 3, 4, 5);  // 15
```

#### IIFE (Immediately Invoked Function Expression)
```javascript
// Function that runs immediately:
(function() {
  console.log("I run right away!");
})();

// Arrow function version:
(() => {
  console.log("I also run immediately!");
})();

// Why use? To create private scope
(function() {
  const secret = "hidden";
  // secret is only available here
})();
// console.log(secret); // ❌ Error!
```

---

### 4. Events (Things That Happen)

Events are actions like clicks, typing, scrolling.

```javascript
// Click event:
button.addEventListener('click', () => {
  console.log("Button clicked!");
});

// Form submit:
form.addEventListener('submit', (event) => {
  event.preventDefault(); // Stop page reload
  console.log("Form submitted!");
});

// Input change:
input.addEventListener('change', (event) => {
  console.log(event.target.value); // Get input value
});
```

**Real Example:**
```javascript
// src/components/ui/Button.tsx
<button onClick={handleClick}>
  Generate Ad
</button>
```

---

### 5. DOM (Document Object Model)

The DOM is the webpage structure that JavaScript can manipulate.

```javascript
// Select elements:
const title = document.getElementById('title');
const buttons = document.querySelectorAll('.btn');

// Change content:
title.textContent = "New Title";
title.innerHTML = "<strong>Bold Title</strong>";

// Change styles:
title.style.color = "red";
title.style.fontSize = "24px";

// Add/remove classes:
title.classList.add('active');
title.classList.remove('hidden');
title.classList.toggle('dark');

// Create new elements:
const newDiv = document.createElement('div');
newDiv.textContent = "Hello";
document.body.appendChild(newDiv);
```

**Note:** In React (our project), we don't use DOM directly! React manages it for us.

---

### 6. BOM (Browser Object Model)

BOM controls the browser itself.

```javascript
// Window object (the browser):
window.alert("Hello!");
window.confirm("Are you sure?");
window.prompt("Enter your name:");

// Location (URL):
window.location.href;           // Current URL
window.location.reload();       // Refresh page
window.location.href = "/home"; // Navigate

// Local Storage (save data):
localStorage.setItem('token', 'abc123');
localStorage.getItem('token');     // "abc123"
localStorage.removeItem('token');
localStorage.clear();              // Remove all

// Session Storage (temporary):
sessionStorage.setItem('key', 'value');

// Cookies:
document.cookie = "user=john";
```

**Real Example:**
```javascript
// src/context/AuthContext.tsx
localStorage.setItem('token', response.data.token);
const token = localStorage.getItem('token');
```

---

### 7. Synchronous vs Asynchronous (Sync vs Async)

#### Synchronous (One After Another)
```javascript
console.log("1");
console.log("2");
console.log("3");
// Output: 1, 2, 3 (in order)
```

#### Asynchronous (Can Happen Later)
```javascript
console.log("1");
setTimeout(() => {
  console.log("2");
}, 1000);
console.log("3");
// Output: 1, 3, 2 (2 comes after 1 second)
```

#### Event Loop Explained:

Imagine a restaurant:
- **Call Stack** = Chef (does one task at a time)
- **Task Queue** = Orders waiting
- **Event Loop** = Waiter (brings orders to chef)

```javascript
console.log("Start");

setTimeout(() => {
  console.log("Async task");
}, 0);

console.log("End");

// Output:
// Start
// End
// Async task (even with 0 delay!)
```

**Why?** setTimeout goes to Task Queue, Event Loop waits for Call Stack to be empty.

#### Libuv (Node.js Engine)

Libuv is the "engine" that handles async operations in Node.js:
- File reading/writing
- Network requests
- Timers
- Database queries

---

### 8. Promises (Handle Async Better)

A Promise is like ordering food:
- **Pending**: Food is being prepared
- **Fulfilled**: Food is ready (success)
- **Rejected**: Kitchen is closed (error)

```javascript
// Create a promise:
const promise = new Promise((resolve, reject) => {
  const success = true;
  
  if (success) {
    resolve("Data received!");
  } else {
    reject("Error occurred!");
  }
});

// Use the promise:
promise
  .then(result => {
    console.log(result); // "Data received!"
  })
  .catch(error => {
    console.log(error);
  })
  .finally(() => {
    console.log("Always runs");
  });
```

#### Async/Await (Cleaner Way)
```javascript
// Instead of .then():
async function fetchData() {
  try {
    const result = await promise;
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}
```

**Real Example:**
```javascript
// src/services/auth.ts
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

---

### 9. Callbacks & Higher-Order Functions (HOF)

#### Callback (Function Passed to Another Function)
```javascript
// Callback example:
function greet(name, callback) {
  console.log(`Hello ${name}`);
  callback();
}

greet("John", () => {
  console.log("Callback executed!");
});

// Common callbacks:
setTimeout(() => console.log("After 1s"), 1000);
array.map(item => item * 2);
button.addEventListener('click', () => console.log("Clicked"));
```

#### Higher-Order Function (Function that Takes/Returns Function)
```javascript
// Takes function as argument:
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(num => num * 2); // map is HOF

// Returns a function:
function multiplier(factor) {
  return (number) => number * factor;
}

const double = multiplier(2);
double(5); // 10
```

**Real Example:**
```javascript
// src/app/generator/page.tsx
<button onClick={() => handleGenerate()}>
  Generate
</button>
```

---

## 🔧 Node.js Concepts (From Scratch)

### 1. What is Node.js?

**Simple Explanation:**
- JavaScript normally runs in browsers (Chrome, Firefox)
- Node.js lets JavaScript run on your computer/server
- Like giving JavaScript superpowers to access files, databases, etc.

**Before Node.js:**
```
JavaScript → Only in Browser → Can't access files
```

**After Node.js:**
```
JavaScript → On Server → Can access files, databases, create servers!
```

---

### 2. Creating a Server

A server is like a restaurant that serves requests.

#### Basic Server:
```javascript
// server.js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!');
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

#### With Express (Easier Way):
```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**Real Example:**
```javascript
// server/server.js
const express = require('express');
const app = express();

app.use(express.json()); // Middleware
app.use('/api/auth', authRoutes); // Routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### 3. Middleware (Functions That Run Before Routes)

Middleware is like security checks before entering a building.

```javascript
// Logger middleware:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Pass to next middleware
});

// Auth middleware:
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Error middleware:
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});
```

#### Types of Middleware:

| Type | Purpose | Example |
|------|---------|---------|
| **Application** | Runs on every request | Logging, CORS |
| **Router** | Runs on specific routes | `/api/*` |
| **Error** | Handles errors | 500 errors |
| **Built-in** | Provided by Express | `express.json()` |
| **Third-party** | External packages | `cors`, `morgan` |

**Real Examples:**
```javascript
// server/server.js

// Built-in middleware:
app.use(express.json());              // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse form data

// Third-party middleware:
app.use(cors({                       // Enable CORS
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Custom middleware:
const authMiddleware = require('./middleware/auth');
app.get('/api/user/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
```

---

### 4. RESTful API (The Rules for APIs)

REST = **RE**presentational **S**tate **T**ransfer (don't worry about the name!)

**Simple Explanation:**
Rules for how frontend and backend talk to each other.

#### HTTP Methods (Actions):

| Method | Action | Example |
|--------|--------|---------|
| **GET** | Get data | Get user profile |
| **POST** | Create new data | Create new user |
| **PUT** | Update entire data | Update full profile |
| **PATCH** | Update partial data | Update only email |
| **DELETE** | Delete data | Delete user |

#### RESTful Example:
```javascript
// Users API:
app.get('/api/users', getAllUsers);           // Get all users
app.get('/api/users/:id', getUserById);       // Get one user
app.post('/api/users', createUser);           // Create user
app.put('/api/users/:id', updateUser);        // Update user
app.delete('/api/users/:id', deleteUser);     // Delete user
```

**Real Examples:**
```javascript
// server/routes/auth.js
router.post('/signup', signup);    // Create account
router.post('/login', login);      // Login
router.get('/me', getMe);          // Get current user

// server/routes/community.js
router.get('/', getPosts);         // Get all posts
router.post('/', createPost);      // Create post
router.delete('/:id', deletePost); // Delete post
router.post('/:id/like', likePost); // Like post
```

#### REST Principles:
1. **Stateless**: Each request is independent
2. **Resource-based**: URLs represent resources (`/users`, `/posts`)
3. **HTTP methods**: Use correct method for action
4. **JSON format**: Data sent as JSON

---

### 5. Folder Structure (Explained in Detail)

#### MVC Pattern (Model-View-Controller):

Our backend follows this:

```
server/
├── models/        ← DATABASE STRUCTURE (What data looks like)
├── routes/        ← URLS (What URLs exist)
├── controllers/   ← LOGIC (What happens when URL is called)
├── middleware/    ← CHECKS (Before routes)
└── config/        ← SETTINGS (Database, services)
```

**Example Flow:**
```
User requests: GET /api/users/123
    ↓
routes/users.js → router.get('/:id', getUserController)
    ↓
middleware/auth.js → Check if logged in
    ↓
controllers/users.js → getUserController function
    ↓
models/User.js → Find user in database
    ↓
Return JSON: { user: {...} }
```

---

### 6. Packages (npm)

Packages are pre-made code tools you can use.

#### What is npm?
- **npm** = Node Package Manager
- Like an app store for code
- Stores packages in `node_modules/` folder
- Lists packages in `package.json`

#### Common Commands:
```bash
npm init                 # Create new project
npm install express      # Install package
npm install -g nodemon   # Install globally
npm uninstall express    # Remove package
npm update              # Update packages
```

#### package.json Explained:
```json
{
  "name": "ai-ads-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {        // Packages needed for production
    "express": "^4.18.0",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {     // Packages needed only for development
    "nodemon": "^3.0.0"
  }
}
```

#### Our Project's Key Packages:

**Backend:**
- `express` - Web server
- `mongoose` - Database (MongoDB)
- `bcryptjs` - Password hashing
- `jsonwebtoken` - Authentication tokens
- `cors` - Allow frontend to connect
- `dotenv` - Environment variables
- `multer` - File uploads
- `cloudinary` - Cloud storage
- `passport` - Google OAuth

**Frontend:**
- `next` - React framework
- `react` - UI library
- `axios` - HTTP requests
- `tailwindcss` - Styling
- `framer-motion` - Animations
- `zod` - Validation

---

### 7. GraphQL (Alternative to REST)

**What is GraphQL?**
- A different way to build APIs
- Instead of multiple URLs, ONE endpoint
- You ask for EXACTLY what you want

#### REST vs GraphQL:

**REST:**
```javascript
// Need multiple requests:
GET /api/users/1
GET /api/users/1/posts
GET /api/users/1/comments

// Get ALL data (even if you only need name):
{
  id: 1,
  name: "John",
  email: "john@example.com",
  age: 25,
  address: {...},
  preferences: {...}
}
```

**GraphQL:**
```javascript
// One request:
POST /graphql

query {
  user(id: 1) {
    name
    posts {
      title
    }
  }
}

// Get ONLY what you asked:
{
  "user": {
    "name": "John",
    "posts": [
      { "title": "Post 1" }
    ]
  }
}
```

**Note:** Our project uses REST, not GraphQL. But good to know!

---

### 8. Databases (SQL vs NoSQL)

#### SQL (Structured Query Language)

Like Excel spreadsheets with strict rules.

**Example: Users Table**
```
| id | name  | email           | age |
|----|-------|-----------------|-----|
| 1  | John  | john@email.com  | 25  |
| 2  | Jane  | jane@email.com  | 30  |
```

**Characteristics:**
- Tables with rows and columns
- Strict structure (schema)
- Relations between tables
- Examples: MySQL, PostgreSQL

**SQL Example:**
```sql
SELECT * FROM users WHERE age > 25;
INSERT INTO users (name, email, age) VALUES ('John', 'john@email.com', 25);
UPDATE users SET age = 26 WHERE id = 1;
DELETE FROM users WHERE id = 1;
```

#### NoSQL (Not Only SQL)

Like flexible documents (JSON).

**Example: Users Collection**
```json
{
  "_id": "1",
  "name": "John",
  "email": "john@email.com",
  "age": 25,
  "hobbies": ["coding", "gaming"],
  "address": {
    "city": "Mumbai",
    "country": "India"
  }
}
```

**Characteristics:**
- Flexible structure (no strict schema)
- Documents (like JSON)
- Easy to scale
- Examples: MongoDB, Firebase

#### When to Use Which?

| Use SQL When | Use NoSQL When |
|--------------|----------------|
| Data has clear relationships | Data structure changes often |
| Need complex queries | Need fast reads/writes |
| Banking, accounting | Social media, blogs |
| Data integrity is critical | Flexibility is important |

**Our Project Uses:** MongoDB (NoSQL)

---

### 9. ORM & ODM

#### ORM (Object-Relational Mapping) - For SQL

Converts JavaScript objects ↔ SQL tables

**Example with Sequelize (ORM):**
```javascript
// Define model:
const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  age: DataTypes.INTEGER
});

// Use it:
const user = await User.create({
  name: 'John',
  email: 'john@email.com',
  age: 25
});

// Instead of writing SQL:
// INSERT INTO users (name, email, age) VALUES ('John', 'john@email.com', 25);
```

#### ODM (Object-Document Mapping) - For NoSQL

Converts JavaScript objects ↔ MongoDB documents

**Example with Mongoose (ODM):**
```javascript
// Define schema:
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  createdAt: { type: Date, default: Date.now }
});

// Create model:
const User = mongoose.model('User', userSchema);

// Use it:
const user = await User.create({
  name: 'John',
  email: 'john@email.com',
  age: 25
});

// Find users:
const users = await User.find({ age: { $gt: 25 } });
const oneUser = await User.findById('123');
const updated = await User.findByIdAndUpdate('123', { age: 26 });
```

**Real Example from Our Project:**
```javascript
// server/models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: String,
  role: { type: String, enum: ['free', 'pro'], default: 'free' },
  credits: { type: Number, default: 50 }
}, { timestamps: true });

// Hash password before saving:
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
```

---

## 🔄 How The Project Works Step-by-Step

### Scenario: User Creates An Ad

#### Step 1: User Opens Website
```
Browser → http://localhost:3000
    ↓
Next.js loads src/app/page.tsx (Home page)
    ↓
User sees landing page with "Get Started" button
```

#### Step 2: User Signs Up
```
User clicks "Sign Up"
    ↓
Browser navigates to /signup
    ↓
Next.js loads src/app/signup/page.tsx
    ↓
User fills form: name, email, password
    ↓
Form submits → calls authService.signup()
    ↓
axios.post('http://localhost:5000/api/auth/signup', data)
    ↓
Backend receives request at server/routes/auth.js
    ↓
Validates data → Checks if email exists
    ↓
Hashes password with bcrypt
    ↓
Creates user in MongoDB
    ↓
Generates JWT token
    ↓
Returns: { token, user }
    ↓
Frontend stores token in localStorage
    ↓
Updates AuthContext (global state)
    ↓
User is logged in!
```

#### Step 3: User Goes to Generator
```
User clicks "Create Ad"
    ↓
ProtectedRoute checks if token exists
    ↓
If yes: loads /generator page
    ↓
Page shows: file upload, style selector, form
```

#### Step 4: User Uploads Image & Generates Ad
```
User uploads product.jpg
    ↓
Selects style: "Luxury"
    ↓
Selects aspect ratio: "9:16"
    ↓
Enters brand name: "Nike"
    ↓
Clicks "Generate Ad"
    ↓
Frontend creates FormData:
{
  productImage: File,
  brandName: "Nike",
  style: "luxury",
  aspectRatio: "9:16",
  duration: 6
}
    ↓
axios.post('/api/v1/generate-ad', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
    ↓
Next.js API route receives: src/app/api/v1/generate-ad/route.ts
    ↓
Extracts form data
    ↓
Validates user token (gets userId)
    ↓
Checks if user has enough credits
    ↓
Calls AIService.generateAd(...)
    ↓
AIService does:
  1. Enhances prompt with Gemini AI
  2. Calls Gemini to generate video
  3. Uploads video to Cloudinary
  4. Returns video URL
    ↓
Deducts credits from user (POST /api/user/credits/deduct)
    ↓
Returns to frontend:
{
  id: "gen123",
  status: "succeeded",
  videoUrl: "https://cloudinary.com/video.mp4"
}
    ↓
Frontend displays video player with result
    ↓
User sees their ad!
```

#### Step 5: User Shares to Community
```
User clicks "Share to Community"
    ↓
Opens modal: enter title, description
    ↓
Submits → axios.post('/api/community/share', {
  title: "Nike Ad",
  description: "Luxury style",
  imageUrl: videoUrl
})
    ↓
Backend (server/routes/community.js) receives request
    ↓
auth middleware verifies JWT token
    ↓
Creates Post in MongoDB:
{
  user: userId,
  title: "Nike Ad",
  imageUrl: videoUrl,
  likes: []
}
    ↓
Returns: { post }
    ↓
Frontend shows success message
    ↓
Post now appears in /community page!
```

#### Step 6: Other Users Like the Post
```
Another user visits /community
    ↓
Sees all posts
    ↓
Clicks ❤️ on Nike ad
    ↓
axios.post('/api/community/postId/like')
    ↓
Backend toggles like:
  - If user already liked: remove from likes[]
  - If not: add to likes[]
    ↓
Returns updated likeCount
    ↓
Frontend updates UI (heart turns red)
```

---

## 🗄️ Database Explained

### MongoDB Structure

```
Database: ai-ads
│
├── Collection: users
│   ├── Document: {
│   │     _id: ObjectId("507f1f77bcf86cd799439011"),
│   │     name: "John Doe",
│   │     email: "john@example.com",
│   │     password: "$2a$10$hashed...",
│   │     role: "free",
│   │     credits: 50,
│   │     createdAt: ISODate("2024-01-01")
│   │   }
│   └── Document: { ... }
│
└── Collection: posts
    ├── Document: {
    │     _id: ObjectId("507f1f77bcf86cd799439012"),
    │     user: ObjectId("507f1f77bcf86cd799439011"),
    │     title: "My Ad",
    │     imageUrl: "https://cloudinary.com/...",
    │     likes: [ObjectId("userId1"), ObjectId("userId2")],
    │     createdAt: ISODate("2024-01-02")
    │   }
    └── Document: { ... }
```

### Relationships

```
User (1) ←──→ (Many) Posts
     ↑
     │
   likes
     │
     └─→ Posts (Many-to-Many)
```

**How it works:**
```javascript
// Get user's posts:
const posts = await Post.find({ user: userId });

// Get post with user info:
const posts = await Post.find().populate('user', 'name email avatar');
// Result:
{
  _id: "123",
  title: "My Ad",
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "..."
  }
}
```

---

## 🔐 Authentication Flow

### Detailed Authentication Diagram:

```
┌──────────────────────────────────────────────────────┐
│                   USER SIGNUP                        │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
    ┌─────────────────────────────────────┐
    │ Frontend: User fills signup form    │
    │ { name, email, password }           │
    └───────────────┬─────────────────────┘
                    │
                    │ POST /api/auth/signup
                    ▼
    ┌────────────────────────────────────────┐
    │ Backend: Receive request               │
    │ 1. Validate data (email format, etc.)  │
    │ 2. Check if email already exists       │
    │ 3. Hash password (bcrypt)              │
    │ 4. Save user to MongoDB                │
    │ 5. Generate JWT token                  │
    └───────────────┬────────────────────────┘
                    │
                    │ Returns: { token, user }
                    ▼
    ┌────────────────────────────────────────┐
    │ Frontend: Receive response             │
    │ 1. Store token in localStorage         │
    │ 2. Update AuthContext                  │
    │ 3. Redirect to /generator              │
    └────────────────────────────────────────┘


┌──────────────────────────────────────────────────────┐
│                   USER LOGIN                         │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
    ┌─────────────────────────────────────┐
    │ Frontend: User enters credentials   │
    │ { email, password }                 │
    └───────────────┬─────────────────────┘
                    │
                    │ POST /api/auth/login
                    ▼
    ┌────────────────────────────────────────┐
    │ Backend: Receive request               │
    │ 1. Find user by email                  │
    │ 2. Compare password with hash (bcrypt) │
    │ 3. If valid: generate JWT token        │
    │ 4. If invalid: return error            │
    └───────────────┬────────────────────────┘
                    │
                    │ Returns: { token, user }
                    ▼
    ┌────────────────────────────────────────┐
    │ Frontend: Store token & login          │
    └────────────────────────────────────────┘


┌──────────────────────────────────────────────────────┐
│              PROTECTED API REQUEST                   │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
    ┌─────────────────────────────────────┐
    │ Frontend: Make API call             │
    │ Headers: {                          │
    │   Authorization: "Bearer token123"  │
    │ }                                   │
    └───────────────┬─────────────────────┘
                    │
                    │ GET /api/user/profile
                    ▼
    ┌────────────────────────────────────────┐
    │ Backend: Auth Middleware               │
    │ 1. Extract token from header           │
    │ 2. Verify token with JWT               │
    │ 3. If valid: attach user to req.user   │
    │ 4. If invalid: return 401 error        │
    │ 5. Call next() to continue             │
    └───────────────┬────────────────────────┘
                    │
                    │ req.user = { id, email, ... }
                    ▼
    ┌────────────────────────────────────────┐
    │ Route Handler: Access req.user         │
    │ const profile = await User.findById(   │
    │   req.user.id                          │
    │ );                                     │
    │ res.json({ user: profile });           │
    └───────────────┬────────────────────────┘
                    │
                    │ Returns: { user: {...} }
                    ▼
    ┌────────────────────────────────────────┐
    │ Frontend: Display user data            │
    └────────────────────────────────────────┘
```

### JWT Token Structure:

```javascript
// Token is 3 parts separated by dots:
"xxxxx.yyyyy.zzzzz"

// Part 1 (Header): Algorithm info
{
  "alg": "HS256",
  "typ": "JWT"
}

// Part 2 (Payload): User data
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "iat": 1516239022,  // Issued at
  "exp": 1518831022   // Expires at
}

// Part 3 (Signature): Security verification
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Code Examples:

**Generating Token (Backend):**
```javascript
// server/routes/auth.js
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);
```

**Verifying Token (Middleware):**
```javascript
// server/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer token123"
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Using in Frontend:**
```javascript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

// Automatically add token to all requests:
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🚀 How to Run This Project

### Prerequisites (What You Need):
1. **Node.js** - Download from nodejs.org
2. **MongoDB** - Either local or MongoDB Atlas (cloud)
3. **Text Editor** - VS Code recommended
4. **API Keys** - Google AI, Cloudinary, PhonePe

### Step-by-Step Setup:

#### 1. Install Node.js
```bash
# Check if installed:
node --version  # Should show v18+ or v20+
npm --version   # Should show v9+ or v10+
```

#### 2. Clone/Download Project
```bash
cd D:\Ai_Ads
```

#### 3. Setup Backend
```bash
# Go to server folder:
cd server

# Install packages:
npm install

# Create .env file:
# Copy from .env.example and fill in values
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Start server:
npm run dev
```

#### 4. Setup Frontend
```bash
# Open new terminal, go to root:
cd D:\Ai_Ads

# Install packages:
npm install

# Create .env.local file:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
GEMINI_API_KEY=your_gemini_api_key

# Start frontend:
npm run dev
```

#### 5. Open Browser
```
Frontend: http://localhost:3000
Backend: http://localhost:5000
```

### Folder Navigation:
```
Ai_Ads/
├── Terminal 1: cd server → npm run dev  (Backend)
└── Terminal 2: cd Ai_Ads → npm run dev  (Frontend)
```

---

## 📝 API Endpoints Reference

### Authentication
```
POST   /api/auth/signup
Body: { name, email, password }
Response: { token, user }

POST   /api/auth/login
Body: { email, password }
Response: { token, user }

GET    /api/auth/me
Headers: Authorization: Bearer {token}
Response: { user }
```

### User
```
GET    /api/user/profile
Headers: Authorization: Bearer {token}
Response: { user }

POST   /api/user/credits/deduct
Headers: Authorization: Bearer {token}
Body: { amount }
Response: { credits }
```

### Ad Generation
```
POST   /api/v1/generate-ad
Headers: Authorization: Bearer {token}
Body: FormData {
  productImage: File,
  modelImage: File (optional),
  brandName: String,
  style: "luxury" | "bold" | "minimal" | ...,
  aspectRatio: "16:9" | "9:16",
  duration: Number
}
Response: {
  id, status, videoUrl, thumbnailUrl
}

GET    /api/v1/generate-ad/history
Headers: Authorization: Bearer {token}
Response: { generations: [...] }
```

### Community
```
GET    /api/community
Query: ?page=1&limit=12
Response: { posts: [...], total }

POST   /api/community/share
Headers: Authorization: Bearer {token}
Body: { title, description, imageUrl }
Response: { post }

POST   /api/community/:id/like
Headers: Authorization: Bearer {token}
Response: { likes, hasLiked }

DELETE /api/community/:id
Headers: Authorization: Bearer {token}
Response: { message }
```

### Payment
```
POST   /api/payment/initiate
Headers: Authorization: Bearer {token}
Body: { amount }
Response: { paymentUrl, transactionId }

GET    /api/payment/verify/:transactionId
Headers: Authorization: Bearer {token}
Response: { success, user }
```

---

## 🎓 Summary & Key Takeaways

### What You Learned:

#### JavaScript:
- ✅ Variables (let, const, var)
- ✅ Data types (String, Number, Boolean, Array, Object)
- ✅ ES6 features (Arrow functions, Spread, Rest, IIFE)
- ✅ Events & DOM manipulation
- ✅ Sync vs Async & Event Loop
- ✅ Promises & Async/Await
- ✅ Callbacks & Higher-Order Functions

#### Node.js:
- ✅ Creating servers with Express
- ✅ Middleware types and usage
- ✅ RESTful API design
- ✅ Folder structure (MVC pattern)
- ✅ npm packages
- ✅ SQL vs NoSQL databases
- ✅ ORM vs ODM (Sequelize vs Mongoose)

#### This Project:
- ✅ Full-stack architecture (Next.js + Express + MongoDB)
- ✅ User authentication (JWT + Google OAuth)
- ✅ File uploads (Multer + Cloudinary)
- ✅ AI integration (Google Gemini)
- ✅ Payment integration (PhonePe)
- ✅ Community features (Posts, Likes)
- ✅ Credit system
- ✅ Protected routes

### Project Flow Summary:
```
User → Frontend (Next.js) → Backend (Express) → Database (MongoDB)
                ↓
         Third-party Services:
         - Google AI (Video generation)
         - Cloudinary (Storage)
         - PhonePe (Payments)
```

---

## 🎯 Next Steps

1. **Explore the code** - Open files and read comments
2. **Make changes** - Try modifying styles, text
3. **Add features** - Ideas:
   - Add more AI styles
   - Create user dashboard
   - Add admin panel
   - Email notifications
4. **Deploy** - Put it online (Vercel + Render)

---

## 🆘 Troubleshooting

### Common Issues:

**"Cannot find module..."**
```bash
# Solution: Install dependencies
npm install
```

**"Port already in use"**
```bash
# Solution: Change PORT in .env or kill process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**"MongoDB connection failed"**
```bash
# Solution: Check MONGODB_URI in .env
# Make sure MongoDB is running or connection string is correct
```

**"401 Unauthorized"**
```bash
# Solution: Check if token is in localStorage
# Or try logging in again
```

---

## 📚 Resources to Learn More

- **JavaScript**: javascript.info
- **Node.js**: nodejs.dev/learn
- **Express**: expressjs.com
- **React/Next.js**: nextjs.org/learn
- **MongoDB**: mongodb.com/docs
- **Mongoose**: mongoosejs.com/docs

---

## 🎉 Congratulations!

You now understand:
- ✅ How this full-stack project works
- ✅ JavaScript fundamentals
- ✅ Node.js & Express basics
- ✅ Database concepts
- ✅ API development
- ✅ Authentication
- ✅ Third-party integrations

**You're ready to build amazing projects! 🚀**

---

*Made with ❤️ for beginners who want to learn*
