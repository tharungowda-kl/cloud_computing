# Cloud-Based Rural Digital Service Platform (GraminSeva)

> **5th-Semester Engineering Mini Project**  
> **Course:** Web Technologies / Cloud Computing / Information Systems  
> **Architecture:** Modern RESTful Web Application (HTML5, CSS3, JavaScript, Node.js, Express.js, MongoDB)

---

## 1. Project Objective

Rural citizens often experience severe challenges accessing vital public services due to dispersed information across multiple disconnected portals, intermediaries, and complex paperwork.

The **Cloud-Based Rural Digital Service Platform (GraminSeva)** solves this problem by providing a centralized, accessible, mobile-responsive single-window portal where rural residents can:
1. Explore and check eligibility for verified central and state **Government Schemes** (PM-KISAN, PM-JAY, PMAY-G, MGNREGA).
2. Discover and track **Student Scholarships** (Pre-Matric, Post-Matric, Girls Technical Grants, Merit Aid).
3. Access scientific **Agriculture Information** (Crop management, drip irrigation, organic fertilizers, pest control).
4. Monitor localized district **Weather Forecasts** and customized agricultural field advisories.
5. Manage and validate citizen verification proofs in a **Digital Document Locker** with automated file type and size checks.
6. Receive real-time broadcast **Notifications & Announcements** with read/unread tracking.
7. Manage the system via a secure **Administrator Control Center** with role-based access control (RBAC).

---

## 2. Technologies Used

- **Frontend:**
  - **HTML5:** Semantic document structure with high accessibility and descriptive headings.
  - **Vanilla CSS3:** Clean, modern responsive design with white background and green/blue theme (`#15803d` agri green, `#0284c7` sky blue). No heavy framework overhead.
  - **JavaScript (ES6+):** Dynamic client-side routing, live search/filtering, asynchronous `fetch()` API calls, and toast notification system.
- **Backend:**
  - **Node.js (v18+) & Express.js:** RESTful API architecture handling authentication, schemes, scholarships, agriculture, weather, documents, and notifications.
  - **JSON Web Tokens (JWT):** Secure token-based session handling.
  - **Bcrypt.js:** Cryptographic password hashing (salt rounds: 10).
  - **Multer:** Multipart file upload handling with strict MIME type and 5MB size limit validation.
- **Database & Persistence:**
  - **MongoDB with Mongoose Models:** Native document database storing collections for `users`, `schemes`, `scholarships`, `agriculture`, `documents`, and `notifications`.
  - **Seamless Portable Fallback Mode (`dbAdapter.js`):** If MongoDB service is not started on a student laptop, the system automatically runs using an embedded persistent JSON store (`data/db.json`), guaranteeing **100% immediate functionality** without setup errors!

---

## 3. Project Directory Structure

```text
cloud_computing/
├── public/                     # Static frontend assets served by Express
│   ├── index.html              # Home page with 6 service cards & benefits
│   ├── login.html              # User authentication & 1-click evaluator login
│   ├── register.html           # Citizen registration form with validation
│   ├── dashboard.html          # User dashboard with sidebar, KPIs & alerts
│   ├── schemes.html            # Government schemes with search & modal
│   ├── scholarships.html       # Scholarships with category filtering & details
│   ├── agriculture.html        # Farming guides, irrigation & soil health
│   ├── weather.html            # District weather forecasts & agro-advisory
│   ├── documents.html          # Document locker with drag-and-drop & validation
│   ├── notifications.html      # Announcements with mark-as-read tracking
│   ├── admin.html              # Administrator control panel (CRUD operations)
│   ├── css/
│   │   └── style.css           # Responsive stylesheet (Green/Blue rural theme)
│   └── js/
│       ├── app.js              # Shared auth state, navbar, badges & toasts
│       ├── auth.js             # Sign in, registration, demo credential prefill
│       ├── schemes.js          # Schemes listing, search, category filters
│       ├── scholarships.js     # Scholarships listing & criteria modal
│       ├── agriculture.js      # Agriculture articles & farming tips reader
│       ├── weather.js          # Weather display & district selector
│       ├── documents.js        # File upload, size validation & delete
│       ├── notifications.js    # Notification feed & mark-read handler
│       └── admin.js            # Admin KPI stats, CRUD modals & user manager
├── routes/                     # Modular Express REST API routes
│   ├── auth.js                 # POST /register, POST /login, GET /me
│   ├── schemes.js              # GET, POST, PUT, DELETE /api/schemes
│   ├── scholarships.js         # GET, POST, PUT, DELETE /api/scholarships
│   ├── agriculture.js          # GET, POST, PUT, DELETE /api/agriculture
│   ├── weather.js              # GET /api/weather
│   ├── documents.js            # GET, POST /upload, DELETE /api/documents
│   ├── notifications.js        # GET, PATCH /read, POST, DELETE /api/notifications
│   └── admin.js                # GET /stats, GET /users, DELETE /users/:id
├── models/                     # Database schemas and Data Access Layer
│   ├── User.js                 # Mongoose User schema (role: citizen | admin)
│   ├── Scheme.js               # Mongoose Government Scheme schema
│   ├── Scholarship.js          # Mongoose Scholarship schema
│   ├── Agriculture.js          # Mongoose Agriculture Article schema
│   ├── Document.js             # Mongoose Document metadata schema
│   ├── Notification.js         # Mongoose Notification schema
│   └── dbAdapter.js            # Unified DB adapter (MongoDB + JSON fallback)
├── middleware/
│   └── auth.js                 # JWT verification & requireAdmin protection
├── data/
│   ├── initialData.js          # Authentic seed data & demo accounts
│   └── db.json                 # Auto-generated persistent fallback store
├── uploads/                    # Local storage folder for uploaded documents
├── .env.example                # Environment configuration template
├── .env                        # Local active environment settings
├── .gitignore                  # Git exclusions (node_modules, uploads, .env)
├── package.json                # Project dependencies and npm scripts
├── seed.js                     # Standalone database initialization script
├── server.js                   # Main application entry point
└── README.md                   # Complete documentation & evaluator guide
```

---

## 4. Prerequisites

To run this project, your computer needs:
1. **Node.js**: Version 18.0.0 or higher. Check by typing `node -v` in terminal.
2. **npm**: Version 8.0.0 or higher.
3. **MongoDB** *(Optional)*: If you have MongoDB installed locally or have a MongoDB Atlas cloud URI, you can paste it into `.env`. If not, **the project automatically runs with its built-in JSON store!**

---

## 5. Installation & Setup Instructions

### Step 1: Open Terminal in the Project Directory
```bash
cd "c:\Users\tharungowda k l\cloud_computing"
```

### Step 2: Install Required Dependencies
```bash
npm install
```
*(On Windows PowerShell where script execution might be restricted, use `npm.cmd install`)*

### Step 3: Configure Environment Variables
Verify or adjust the `.env` file in the project root:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/rural_platform
JWT_SECRET=rural_digital_secret_key_2025
NODE_ENV=development
# Optional: OpenWeatherMap API key for live real-world weather data
WEATHER_API_KEY=
```

### Step 4: Seed the Database (Optional)
The server auto-seeds upon initial start. You can also re-seed at any time by running:
```bash
node seed.js
```

### Step 5: Start the Server
```bash
node server.js
```
or
```bash
npm start
```

You will see the console confirmation:
```text
===============================================================
  RURAL DIGITAL SERVICE PLATFORM (MINI PROJECT)               
===============================================================
  🚀 Server Running:   http://localhost:3000
  📊 Database Status:  Local JSON Store / MongoDB Connected
---------------------------------------------------------------
  Demo Login Credentials for Evaluation:
  👉 Citizen Account:  citizen@rural.gov  | Password: citizen123
  👉 Admin Account:    admin@rural.gov    | Password: admin123
===============================================================
```

Open your browser and navigate to: **`http://localhost:3000`**

---

## 6. Pre-Configured Demo Accounts (For Evaluator & Viva)

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Rural Citizen** | `citizen@rural.gov` | `citizen123` | Dashboard, browse schemes & scholarships, check weather, read farming guides, upload documents to locker, mark notifications as read. |
| **Administrator** | `admin@rural.gov` | `admin123` | All citizen features + **Admin Control Center**: add/edit/delete schemes, add/edit/delete scholarships, publish farming guides, broadcast announcements, view citizen registry. |

> **Pro Tip for Presentation:** On the `login.html` page, click the **"👤 Rural Citizen"** or **"🛡️ Administrator"** quick-login buttons to immediately fill credentials with 1 click.

---

## 7. Step-by-Step Feature Demonstration Guide

### Feature A: Home Page (`index.html`)
- Open `http://localhost:3000`.
- Observe the professional rural-themed UI (green/blue color scheme, clear typography, and large readable buttons).
- Notice the **6 Core Service Cards** (Government Schemes, Scholarships, Agriculture Guidance, Weather Updates, Document Locker, Notifications).
- Review the **Platform Benefits** section explaining zero-middleman direct benefit transfer (DBT).

### Feature B: User Authentication (`login.html` & `register.html`)
- Click **Sign In** in the navigation bar.
- Test the 1-click **"👤 Rural Citizen"** button and log in.
- Alternatively, go to **Register**, create a new citizen account with validation, and observe automatic password hashing with bcrypt and JWT generation.

### Feature C: Citizen Dashboard (`dashboard.html`)
- Personalized greeting ("Namaste, Ramesh Kumar! 👋") showing the citizen's district.
- Real-time KPI stat widgets: Available Schemes, Student Scholarships, Uploaded Documents, and Unread Alerts.
- Quick Jump links to all six services.
- Recent announcements preview with direct read toggling.
- Local district weather snapshot widget.

### Feature D: Government Schemes (`schemes.html`)
- View authentic pre-seeded schemes (PM-Kisan, Ayushman Bharat PM-JAY, PMAY-Gramin, MGNREGA, PM Krishi Sinchayee, PM Fasal Bima).
- **Search:** Type *"kisan"* or *"health"* into the search box to filter instantly.
- **Filter:** Click category filter pills (*Agriculture*, *Healthcare*, *Housing*, *Employment*).
- Click **"View Details"** on any scheme to inspect required verification documents (Aadhaar, Land RTC, Ration Card) and click **"Apply Online"** to simulate official portal access.

### Feature E: Student Scholarships (`scholarships.html`)
- Browse verified scholarships categorized by educational stage (Class 9-10, Post-Matric, Girls Technical Grants, Degree/University, Merit-Based).
- Inspect grant amounts (e.g., ₹12,000/yr to ₹50,000/yr) and application deadlines.
- Filter by category and search by student eligibility.
- Click **"Criteria & Guidelines"** for eligibility breakdowns.

### Feature F: Agriculture Information (`agriculture.html`)
- Explore practical agronomy manuals on **Drip Irrigation Maintenance**, **Organic Jeevamrutha Preparation**, **Integrated Pest Management (IPM)**, **Millet (Shree Anna) Cultivation**, and **Solar Water Pump Subsidies (PM-KUSUM)**.
- Filter by topic and search by crop type.
- Click **"Read Complete Practical Guide"** to open the modal containing step-by-step field actions for farmers.

### Feature G: Weather Updates (`weather.html`)
- Select rural districts using the dropdown (Mandya, Dharwad, Pune, Coimbatore, Varanasi, Jaipur) or type any village name.
- View temperature, humidity, wind velocity, rain probability, and soil moisture.
- Read the tailored **Agricultural Field Advisory** (e.g., optimal day for pesticide spraying or rain warnings).
- Inspect the **5-Day Village Weather Forecast**.
- Observe the clearly labeled demonstration notice explaining that setting `WEATHER_API_KEY` in `.env` activates real-time OpenWeatherMap data.

### Feature H: Digital Document Locker (`documents.html`)
- Drag and drop or browse to select a verification document (PDF, JPG, PNG).
- Notice automated client & server-side validation:
  - If a file exceeds 5MB, a warning toast is shown.
  - If an unsupported file extension is chosen (e.g. `.exe` or `.zip`), it is rejected.
- Select a category (e.g., *Aadhaar Card*, *Land Record / RTC*, *Ration Card*).
- Click **Upload Document**.
- View the uploaded file in the table with formatted file size, server path, and upload date.
- Click **"View"** to open the uploaded file in a new tab, or click **"Delete"** to remove it from disk and database.
- Notice the explicit transparency notice stating files are stored locally in the server's `/uploads` folder.

### Feature I: Notifications & Alerts (`notifications.html`)
- View active government announcements with priority tags (*Normal*, *High*, *Urgent*).
- Filter announcements by category (Schemes, Scholarships, Agriculture, Weather).
- Click **"Mark as Read ✓"** on any notification, or click **"Mark All as Read ✓"** to update your account's unread counter dynamically.

### Feature J: Administrator Control Panel (`admin.html`)
- Sign in with the Admin account (`admin@rural.gov` / `admin123`).
- Navigate to **Admin Panel** in the top navigation.
- Inspect the live system counters (Total Schemes, Scholarships, Agri Guides, Users, Documents).
- **Add a Scheme:** Click "+ Add New Scheme", fill details, and submit. Check `schemes.html` to confirm it immediately appears.
- **Edit / Delete a Scheme:** Modify benefits or delete with confirmation.
- **Manage Scholarships & Agri Guides:** Add, update, or remove entries.
- **Broadcast Announcements:** Send a high-priority announcement to all citizens; it instantly appears in `notifications.html`.
- **Citizen Registry:** View registered users and delete test accounts.

---

## 8. REST API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new citizen account | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Token Required |
| `GET` | `/api/schemes` | List schemes (search & category filters) | Public |
| `GET` | `/api/schemes/:id` | Get single scheme details | Public |
| `POST` | `/api/schemes` | Create new scheme | Admin Only |
| `PUT` | `/api/schemes/:id` | Update existing scheme | Admin Only |
| `DELETE`| `/api/schemes/:id` | Delete scheme | Admin Only |
| `GET` | `/api/scholarships`| List scholarships | Public |
| `POST` | `/api/scholarships`| Create scholarship | Admin Only |
| `PUT` | `/api/scholarships/:id`| Update scholarship | Admin Only |
| `DELETE`| `/api/scholarships/:id`| Delete scholarship | Admin Only |
| `GET` | `/api/agriculture` | List farming guides | Public |
| `POST` | `/api/agriculture` | Publish new farming article | Admin Only |
| `PUT` | `/api/agriculture/:id` | Update farming article | Admin Only |
| `DELETE`| `/api/agriculture/:id` | Delete farming article | Admin Only |
| `GET` | `/api/weather` | Get district forecast & advisory | Public |
| `GET` | `/api/documents` | List uploaded user documents | Token Required |
| `POST` | `/api/documents/upload` | Upload document file via Multer | Token Required |
| `DELETE`| `/api/documents/:id` | Remove document record & file | Token Required |
| `GET` | `/api/notifications` | List announcements with read status | Optional Token |
| `PATCH`| `/api/notifications/:id/read` | Mark notification as read | Token Required |
| `POST` | `/api/notifications/mark-all-read` | Mark all notifications read | Token Required |
| `POST` | `/api/notifications` | Broadcast announcement | Admin Only |
| `GET` | `/api/admin/stats` | System aggregate counts & DB mode | Admin Only |
| `GET` | `/api/admin/users` | List registered citizens | Admin Only |
| `DELETE`| `/api/admin/users/:id` | Delete citizen account | Admin Only |

---

## 9. Troubleshooting & FAQ

### Q1: The terminal says `File npm.ps1 cannot be loaded because running scripts is disabled`.
**Fix:** On Windows PowerShell, execute using `npm.cmd` instead of `npm`, or start using:
```powershell
node server.js
```

### Q2: Is MongoDB mandatory on my laptop?
**No.** If you do not have MongoDB running, the application's built-in `dbAdapter.js` automatically uses the local persistent JSON store (`data/db.json`). All authentication, role permissions, file uploads, and admin CRUD work identically.

### Q3: How do I switch to real MongoDB or MongoDB Atlas?
1. Open `.env`.
2. Update `MONGODB_URI` to your MongoDB connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/rural_platform`).
3. Restart `node server.js`. The console will display `[Database] Connected successfully to MongoDB!`.

### Q4: How do I enable live OpenWeatherMap API?
1. Obtain a free API key from [OpenWeatherMap](https://openweathermap.org/api).
2. Set `WEATHER_API_KEY=your_key_here` in `.env`.
3. Restart `node server.js`. The weather page will now fetch real-time atmospheric data.

---

## 10. Mini Project Viva / Evaluator Q&A Cheat Sheet

1. **What is the cloud computing aspect of this mini project?**  
   *Answer:* The platform is architected as a stateless cloud-native RESTful web service. Static assets and the REST API are decoupled, user session management uses stateless JSON Web Tokens (JWT), and the storage abstraction layer is ready for AWS S3 object storage integration and scalable deployment to cloud platforms like Heroku, Render, AWS Elastic Beanstalk, or Google Cloud Run.

2. **How is security handled in this project?**  
   *Answer:* Passwords are never stored in plain text; they are hashed using `bcrypt` with 10 salt rounds. Sensitive API endpoints (such as scheme creation and user deletion) are protected by a role-based access control (RBAC) middleware verifying JWT tokens and ensuring `req.user.role === 'admin'`. Document uploads enforce strict MIME type checking and a 5MB size limit to prevent buffer overflow and server resource exhaustion.

3. **Why use Vanilla CSS and JavaScript instead of frameworks like React?**  
   *Answer:* For a 5th-semester mini project, using native HTML5, CSS3, and JavaScript provides a clear understanding of fundamental DOM manipulation, HTTP request-response cycles, and CSS layout algorithms (Flexbox and CSS Grid) without unnecessary build tool abstractions or heavy bundle overhead.

---

*Developed with pride for rural empowerment and academic mini project presentation.*
