# 📘 Complete Project Structure & File Guide

Welcome! This guide explains **every single file and folder** in the **Kalpanaaa Finance** project in simple, easy-to-understand terms.

---

## 🌟 High-Level Project Overview

**Kalpanaaa Finance** is built using a modern **Full-Stack Architecture**:
1. **Backend (`/backend-java`)**: Built with **Java 21** and **Spring Boot 3.2.5**. Handles security, business logic, database queries, and REST APIs.
2. **Frontend (`/frontend`)**: Built with **React 18**, **Vite**, and **Tailwind CSS**. Handles the user interface (UI), dashboards, interactive calculators, and client interactions.
3. **Database (`MySQL 8.0`)**: Stores user accounts, transactions, investments, loans, and blogs. Migrations are handled automatically by **Flyway**.

---

## 📂 1. Root Directory (`/`)

The root directory contains project-wide deployment, containerization, and configuration files.

| File / Folder | What it is | Why it is used in our project |
| :--- | :--- | :--- |
| **`Dockerfile`** | Docker Blueprint file | Creates a lightweight, isolated container image of our application so it can run identically on any server (Windows, Mac, Linux, AWS, Docker Desktop) without manual setup. |
| **`nixpacks.toml`** | Nixpacks Build Config | Used by modern cloud hosting platforms like **Railway.app** or **Render.com**. It tells the cloud builder automatically which Java JDK version and Node.js environment to install and how to build the app without writing complex Docker commands. |
| **`railway.json`** | Railway Cloud Deployment Config | Instructions for **Railway.app** specifying build commands (`mvnw package`, `npm run build`), restart behavior, and deployment environments. |
| **`package-lock.json`** | Dependency Lock File | Locks the exact versions of npm libraries to ensure everyone on the team gets the exact same dependencies installed. |
| **`README.md`** | Main Documentation | The project handbook containing the feature overview, architecture diagram, setup instructions, default credentials, and API routes. |
| **`Kalpanaaa_Finance_Presentation.pptx`** | Project Slides | Pitch deck presentation explaining business goals, architecture, and features. |
| **`Kalpanaaa_Finance_Project_Report.pptx`** | Project Technical Report | Slide presentation version of the comprehensive technical report. |
| **`backend-java/`** | Backend Folder | Folder containing the entire Spring Boot Java backend code and database migrations. |
| **`frontend/`** | Frontend Folder | Folder containing the entire React + Vite frontend web app source code. |

---

## ☕ 2. Backend Directory (`/backend-java`)

This is the server engine powered by **Java 21** and **Spring Boot**.

### ⚙️ Root Configuration Files (`/backend-java`)

| File / Folder | What it is | Why it is used |
| :--- | :--- | :--- |
| **`pom.xml`** | Maven Project Object Model | The heart of Java backend. Lists all project libraries/dependencies (Spring Boot, Spring Security, MySQL Connector, JWT, Flyway, OpenPDF, Lombok) and Java version (JDK 21). |
| **`mvnw` & `mvnw.cmd`** | Maven Wrapper Scripts | `mvnw` (Linux/Mac) and `mvnw.cmd` (Windows) allow you to run Maven commands (e.g. `./mvnw spring-boot:run`) without needing Maven installed globally on your computer. |
| **`.mvn/`** | Maven Wrapper Config | Folder containing `maven-wrapper.properties` which downloads the exact Maven version needed automatically. |
| **`.env`** | Environment Variables File | Stores sensitive secret keys and credentials locally (Database password `12345`, JWT Secret Key, Server Port `8080`). |
| **`.env.example`** | Environment Template | Template file showing other developers what environment variables need to be filled in. |
| **`Dockerfile` & `nixpacks.toml`** | Backend Container Configs | Defines how to compile Java source code into a runnable `.jar` file inside a container. |
| **`HashMaker.java` / `TestHash.java`** | Password Hash Helpers | Small developer utility scripts to test and generate BCrypt password hashes for database seeding. |
| **`generate_files.py` / `gen_finance.py`** | Python Code Generators | Automation helper scripts used during development to quickly generate boilerplates for entities, repositories, and mock data. |

---

### 🗄️ Database Migrations (`/backend-java/src/main/resources/db/migration/`)

Flyway manages our MySQL database schema. When Spring Boot starts, Flyway checks these files in order (`V1` to `V55`) and applies schema updates automatically:

- **`V1__init.sql` to `V5__Add_Balance_To_Users.sql`**: Initial database schema (users, roles, initial balance).
- **`V6__Seed_Mock_Blogs.sql`**: Inserts default blog posts and blog categories.
- **`V7__Seed_Mock_Users_And_Transactions.sql`**: Inserts mock customer and admin users with transaction records.
- **`V19__Consultant_System.sql`**: Creates tables for financial consultants, availability schedules, and client assignment sessions.
- **`V26__Add_Missing_Columns_And_Tables.sql`**: Adds wallet transaction history tracking (`balance_before`, `balance_after`) and loan EMI tables.
- **`V27__investment_plans_and_rates_overhaul.sql`**: Populates high-yield investment plans (Fixed Returns, Equity Growth, High Yield).
- **`V28__loan_system_plans_and_overhaul.sql`**: Configures loan plans (Personal, Business, Home, Education loans).
- **`V55__add_missing_amount_to_loan_installments.sql`**: Adds missing `amount` column to loan installment records to ensure smooth loan queries.

---

### 🧠 Backend Source Code (`/backend-java/src/main/java/com/kalpanaaafinance/`)

```
backend-java/src/main/java/com/kalpanaaafinance/
├── KalpanaaaFinanceApplication.java      # 🚀 Main entry point of Spring Boot application
├── config/                              # 🔧 CORS, Flyway repair, and Swagger/OpenAPI configs
└── modules/
    ├── shared/                          # 🤝 Entities, Repositories, DTOs & JWT Security
    ├── publicapi/                       # 🌐 Public APIs (Blogs, Calculators, Contact Requests)
    ├── user/                            # 👤 Customer Portal Services & Controllers
    ├── consultant/                      # 👨‍💼 Financial Advisor Services & Controllers
    └── admin/                           # 🛡️ Admin Dashboard Services & Controllers
```

#### Detailed Breakdown of Modules:

1. **`KalpanaaaFinanceApplication.java`**: Contains the main function (`public static void main`) that boots up Tomcat web server on port `8080`.
2. **`config/`**:
   - **`CorsConfig.java`**: Controls Cross-Origin Resource Sharing so the React frontend on `localhost:5173` can securely communicate with the Spring Boot backend on `localhost:8080`.
   - **`FlywayRepairConfig.java`**: Automatically repairs database migration history if a migration script had an edit.
3. **`modules/shared/`**:
   - **`entity/`**: Java classes representing database tables (`User.java`, `Transaction.java`, `Loan.java`, `Investment.java`, `Blog.java`, `ConsultantProfile.java`).
   - **`repository/`**: Spring Data JPA interfaces that run SQL queries (`UserRepository.java`, `TransactionRepository.java`, `LoanRepository.java`).
   - **`security/`**:
     - **`JwtAuthFilter.java`**: Intercepts every API request, verifies the JWT token header (`Authorization: Bearer <token>`), and authenticates the user.
     - **`JwtService.java`**: Generates and validates encrypted JSON Web Tokens.
     - **`SecurityConfig.java`**: Defines password encoders (BCrypt) and role permission rules (e.g. `/api/admin/**` requires `ADMIN` role).
4. **`modules/user/`**:
   - **`WalletService.java`**: Handles wallet deposits, withdrawals, and balance updates.
   - **`FinancialStatementService.java`**: Generates downloadable PDF and CSV financial statements for customer transaction histories.
   - **`LoanService.java`**: Manages loan applications, approval flows, and EMI repayments.
   - **`InvestmentService.java`**: Processes investment subscriptions and interest calculations.
5. **`modules/publicapi/`**:
   - **`BlogController.java`**: Serves news, market updates, and blog articles to the public landing website.
   - **`ContactController.java`**: Receives customer contact and advisory inquiry forms.
6. **`modules/admin/`**:
   - **`AdminDashboardController.java`**: Provides executive system analytics (total platform deposits, active loan volumes, total users).
   - **`AdminUserController.java`**: Allows admins to activate/deactivate accounts and change user roles.

---

## ⚛️ 3. Frontend Directory (`/frontend`)

This is the user interface built with **React 18**, **Vite**, and **Tailwind CSS**.

### ⚙️ Frontend Config Files (`/frontend`)

| File / Folder | What it is | Why it is used |
| :--- | :--- | :--- |
| **`package.json`** | NPM Manifest | Defines all React packages (React 18, Vite, Tailwind CSS, Lucide icons, Recharts, Axios, Framer Motion) and scripts (`npm run dev` to start dev server, `npm run build` for production). |
| **`vite.config.js`** | Vite Config | Configures Vite super-fast development server, port `5173`, and React plugin. |
| **`tailwind.config.js`** | Tailwind CSS Config | Customizes our design palette (teal-green `#106354`, dark emerald `#05231e`, gold `#887333`) and glassmorphism styling. |
| **`postcss.config.js`** | CSS Post Processor | Processes Tailwind directives into standard CSS. |
| **`nginx.conf`** | Production Web Server Config | Configures Nginx reverse proxy routing when the frontend is built into production static HTML/JS. |
| **`vercel.json`** | Vercel Deployment Config | Enables Single-Page Application (SPA) route rewrites when hosted on Vercel. |
| **`index.html`** | Root HTML File | The HTML shell containing `<div id="root"></div>` where React renders the app. |
| **`public/`** | Static Assets Folder | Contains site favicons, company logotypes, and static images. |

---

### 🎨 Frontend Source Code (`/frontend/src`)

```
frontend/src/
├── main.jsx                             # 📍 React Entry point (renders App in DOM)
├── App.jsx                              # 🛣️ Central App Router & Auth Context Guard
├── index.css                            # 🎨 Global Tailwind CSS & Animations
├── shared/                              # 🧩 Shared Navbars, Footers, and API Interceptor
│   ├── api/axios.js                     # ⚡ Central HTTP Axios client with JWT auto-attach
│   └── components/                      # 🧱 Reusable UI cards, buttons, badges
└── apps/                                # 📱 Portals split by user roles:
    ├── public/                          # 🌐 Public Landing Page, Calculators, Blogs
    ├── user/                            # 👤 Customer Portal (Wallet, Statement Modal, Loans)
    ├── consultant/                      # 👨‍💼 Financial Consultant Advisory Portal
    └── admin/                           # 🛡️ Admin Executive Analytics & User Management
```

#### Detailed Breakdown:

1. **`shared/api/axios.js`**: Central HTTP client. Automatically attaches the user's logged-in `Authorization: Bearer <token>` header to every API call sent to Spring Boot.
2. **`App.jsx`**: Manages all page routes using `React Router`:
   - `/` -> Public Landing Page
   - `/login` / `/register` -> Authentication
   - `/user/dashboard` -> Customer Portal (Protected)
   - `/consultant/dashboard` -> Consultant Portal (Protected)
   - `/admin/dashboard` -> Admin Portal (Protected)
3. **`apps/user/components/StatementDownloadModal.jsx`**: Interactive modal dialog allowing customers to select statement date ranges (Last 30 Days, FY, Custom) and download PDF or CSV statements.
4. **`apps/public/pages/CalculatorsPage.jsx`**: Interactive EMI and Investment ROI calculator tool.

---

## 🎯 Summary Checklist

- **`nixpacks.toml`**: Cloud platform build configuration for automated deployment without Docker commands.
- **`Dockerfile`**: Container image blueprint for standalone container deployments.
- **`backend-java`**: Spring Boot API server managing data, security, business rules, and PDF/CSV generation.
- **`frontend`**: React + Vite UI providing a responsive glassmorphic user experience across all portals.
