# CogniCase — Attorney Case Management Platform

**Centralized Workspace for Modern Legal Operations.**

CogniCase is a modern attorney case management SaaS designed to centralize legal workflows, case tracking, client communication, and activity auditing. It transforms fragmented legal processes into a unified, intelligent workspace, allowing legal professionals to manage complex caseloads with technical precision and data integrity.

---

## 1. Product Overview

CogniCase is engineered around a **case-centric design** philosophy. In professional legal practice, data fragmentation is the primary source of operational risk. This platform mitigates that risk by consolidating all matter-related data—tasks, documents, billable tracking, and client records—into a single context-aware viewport.

### Why this matters in Legal Software:
- **Legal Workflow Automation**: Reducing manual status tracking ensures deadlines are never missed.
- **Real-time Analytics**: Attorneys need immediate visibility into caseload distribution and billing performance to optimize firm output.
- **Auditability**: The built-in activity timeline provides a non-repudiable audit trail of all changes, essential for compliance and internal accountability.
- **Multi-user SaaS Isolation**: Data is strictly scoped at the database level, ensuring that even in a multi-tenant environment, privacy and legal privilege are maintained.

---

## 2. Core Features

### Authentication & Entry
- **Email-based OTP**: Production-grade authentication using real SMTP delivery.
- **JWT Session Management**: Secure, stateless session handling with JSON Web Tokens.
- **Integrated Onboarding**: Multi-step profile completion to initialize firm-specific metadata.

### Case Management
- **Full CRUD Lifecycle**: Create, update, and manage cases with professional status workflows (Open, In Progress, Closed).
- **Metric Tracking**: Granular tracking of billable hours, court locations, and critical deadlines.
- **Priority Logic**: Dynamic priority assignment (High, Medium, Low) for caseload triage.

### Case Ecosystem
- **Client Management**: Dedicated profiles linked to specific legal matters.
- **Task Management**: Matter-specific task queues with deadline monitoring and completion states.
- **Document Vault**: Metadata-driven document organization attached directly to cases.
- **Activity Timeline**: Automatic event logging for every interaction within a case.

### Practice Intelligence
- **Dashboard Analytics**: Real-time visualization of case status distribution and task urgency.
- **SaaS Isolation Model**: All data is strictly scoped per user using `createdBy` ownership patterns.

---

## 3. Tech Stack

### Frontend
- **React**: Component-based UI architecture.
- **Vite**: High-performance build tool and HMR.
- **Axios**: Interceptor-based API client for JWT synchronization.
- **Context API**: Global state management for authentication and user preferences.

### Backend
- **Node.js & Express**: High-concurrency server environment.
- **JWT**: Secure authentication and authorization middleware.
- **Nodemailer**: SMTP integration for transactional security (OTP).

### Database
- **MongoDB**: Schema-flexible document storage optimized for complex legal matter relationships.

---

## 4. Architecture

CogniCase follows a strict **Matter-First Architecture**.

### Data Modeling & Isolation
- **Case as Core Entity**: The `Case` object serves as the root node. All other entities (Tasks, Documents, Notes) reference a `caseId`.
- **CreatedBy Pattern**: Every document in MongoDB includes a `createdBy` field. This enables **SaaS isolation**, where the backend query filters are hard-coded to the authenticated user ID (`req.user._id`), preventing horizontal Privilege Escalation.

### Layout System
- **PublicLayout**: Handles unauthenticated entry states (Landing, Login, Signup).
- **AuthLayout**: Manages the protected entry state during the onboarding and verification phase.
- **AppLayout**: The main dashboard shell featuring a persistent sidebar and scoped data viewports.

### Data Lifecycle
CogniCase utilizes a **Server-as-Source-of-Truth** pattern. All client-side mutations follow a Write -> Validate -> Refetch flow, ensuring the UI always reflects the actual persisted state in the database.

---

## 5. Authentication Flow

1. **Email Identification**: User provides a valid email address.
2. **OTP Generation**: Server generates a cryptographically secure 6-digit code.
3. **SMTP Delivery**: The code is sent via a real SMTP relay (Nodemailer/Gmail).
4. **Verification**: User enters the OTP; the server validates the code and issues a JWT.
5. **Authorization**: Subsequent requests include the JWT in the `Authorization: Bearer <token>` header.
6. **Persistence**: The token is stored in `localStorage`, maintaining the session across refreshes until expiration.

---

## 6. Data Persistence Strategy

- **Relational Consistency**: While using NoSQL (MongoDB), the application maintains relational integrity through manual `ObjectId` references across collections.
- **Scoped Queries**: No query is ever executed without a `createdBy` filter, ensuring total data isolation between different attorney accounts.
- **Optimistic UI with Background Refetches**: The frontend maintains high responsiveness by updating UI states while verifying consistency with the server in the background.

---

## 7. Platform Screens

- **Landing**: SaaS product marketing and value proposition header.
- **Login / Signup**: Secure entry points featuring the OTP verification flow.
- **Onboarding**: Firm profile initialization.
- **Dashboard**: High-level practice analytics and recent activity feed.
- **Cases**: Searchable index of all legal matters.
- **Case Details**: Tabbed interface consolidating Tasks, Documents, Invoices, and Notes.
- **Clients**: Comprehensive database of case-linked contacts.
- **Tasks**: firm-wide or case-specific task organization.
- **Documents**: Metadata view of all uploaded matter files.

---

## 8. Development Setup

### Prerequisites
- Node.js (v16.x or higher)
- MongoDB (Local or Atlas instance)
- Gmail account for SMTP (with App Password enabled)

### Backend Installation
1. Navigate to `/backend`.
2. Run `npm install`.
3. Create a `.env` file with the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secure_secret
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   ```
4. Run `npm start`.

### Frontend Installation
1. Navigate to `/frontend`.
2. Run `npm install`.
3. Run `npm run dev`.

---

## 9. Roadmap & Future Enhancements

- **Role-Based Access Control (RBAC)**: Distinguishing between Senior Partners, Associates, and Paralegals.
- **Cloud File Storage**: Integration with AWS S3 or Google Cloud Storage for actual file hosting.
- **Calendar Integration**: Synchronization with Google/Outlook calendars for court dates.
- **Automated Billing**: Logic for generating PDF invoices based on recorded billable hours.
- **Team Collaboration**: Shared case access between multiple team members within a firm.

---

## 10. Implementation Credits

**Focus**: Full-stack architecture, SaaS design, UX structure.  
**Project Type**: Portfolio SaaS.  
**Platform Intelligence**: This system implementation involved the use of AI resources for architectural planning and code refinement.

---
© 2024 CogniCase SaaS. All rights reserved.
