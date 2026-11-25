# MU Smart Campus — Comprehensive Technical & Academic Project Report

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Introduction & Background](#2-introduction--background)
3. [Problem Statement & Motivation](#3-problem-statement--motivation)
4. [Project Goals & Measurable Objectives](#4-project-goals--measurable-objectives)
5. [Stakeholder Analysis & User Personas](#5-stakeholder-analysis--user-personas)
6. [Functional Requirements & Feature Breakdown](#6-functional-requirements--feature-breakdown)
7. [System Architecture & Technology Stack](#7-system-architecture--technology-stack)
8. [Data Models & Schema Specifications](#8-data-models--schema-specifications)
9. [Core Business Logic & Algorithms](#9-core-business-logic--algorithms)
10. [Detailed Route & Screen Walkthrough](#10-detailed-route--screen-walkthrough)
11. [Setup, Execution & Deployment Guide](#11-setup-execution--deployment-guide)
12. [Security, Concurrency & Technical Limitations](#12-security-concurrency--technical-limitations)
13. [Strategic Future Roadmap](#13-strategic-future-roadmap)
14. [Conclusion & Recommendations](#14-conclusion--recommendations)

---

## 1. Executive Summary

**MU Smart Campus** is a modern, responsive, web-based campus schedule and classroom management portal custom-built for Metropolitan University, Sylhet. It provides an intuitive, high-speed digital interface for students and faculty to search class timetables, check classroom availability in real time, examine campus space utilization analytics, and manage academic course offerings.

The system solves long-standing challenges associated with conventional static PDF schedules and notice boards. It operates on a high-efficiency client-side model using **React 19**, **TypeScript**, **TanStack Start / TanStack Router**, **Tailwind CSS 4**, and **Zustand**. Data is initialized from standardized CSV files (`routine.csv`, `rooms.csv`, `course_offers.csv`) and enriched with local browser persistence (`musy-portal`), providing an instant zero-database experience for immediate deployment and academic demonstration.

---

## 2. Introduction & Background

Modern university campuses manage complex scheduling matrices involving hundreds of course offerings, dozens of student batches, multiple academic departments (CSE, EEE, BBA, LAW, SWE, ENG, ECO, DSC), and constrained classroom facilities.

At Metropolitan University, students and faculty often require quick answers to everyday questions:
- *"Where is my batch's next class right now?"*
- *"Which rooms on the 4th and 5th floors are empty during the 11:30 AM slot?"*
- *"Is Room 501 available for an extra makeup class on Tuesday?"*
- *"What courses are offered for CSE Batch 60 this term?"*

MU Smart Campus unifies all these routines, room inventories, and course catalogs into a single, cohesive, mobile-friendly web platform.

---

## 3. Problem Statement & Motivation

Prior to this solution, university stakeholders faced several friction points:
1. **Inefficient Schedule Discovery:** Routines distributed as static multi-page PDF documents or images are difficult to search or filter on smartphones during campus transit.
2. **Classroom Vacancy Ambiguity:** Students wanting empty rooms for collaborative study or club activities had to manually walk room to room to check occupancy.
3. **Faculty Scheduling Clashes:** Arranging makeup lectures or extra review sessions often resulted in room double-bookings or instructor schedule collisions due to a lack of real-time conflict visibility.
4. **Fragmented Course Catalogues:** Course offer notices and prerequisites were siloed across different departmental noticeboards without unified search tools.

---

## 4. Project Goals & Measurable Objectives

- **Sub-Second Searchability:** Allow students to filter over 800 schedule records across 8 departments, 10+ batches, and 33 rooms in less than 200 milliseconds.
- **Dynamic Vacancy Matrix:** Calculate instantaneous vacancy across six 90-minute daily instructional periods for every campus classroom.
- **Conflict-Aware Faculty Reservations:** Provide faculty with a booking mechanism that automatically flags room and faculty collisions before reserving.
- **Utilization Visualizations:** Render analytics on peak hours, classroom load distribution, and departmental scheduling density using interactive SVG charts.
- **Lightweight Zero-Maintenance Architecture:** Ingest standard administrative CSV files directly, minimizing server infrastructure overhead.

---

## 5. Stakeholder Analysis & User Personas

| Stakeholder / Persona | Access Method | Key Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **Student** | Public (No login required) | • View current active classes & daily schedule<br>• Filter routine by Department, Batch, Section, Room, Faculty<br>• Check room availability by day and time slot<br>• Explore campus utilization charts and course catalogs |
| **Faculty Member** | Demo Authentication (`admin@gmail.com`) | • Personalized faculty routine view<br>• Inline schedule editing with collision detection<br>• Instant classroom reservation & booking management<br>• Manage and import course offerings |
| **Academic Coordinator** | Demo Authentication / Admin | • Monitor room utilization rates across departments<br>• Ingest updated departmental CSV files into `/public/data`<br>• Identify underutilized time slots and overburdened classrooms |

---

## 6. Functional Requirements & Feature Breakdown

### 6.1 Student Experience
1. **Live Dashboard:** Displays current day, active time slot, schedule highlights, and campus-wide metrics.
2. **Central Routine Explorer:** Multi-faceted filtering system supporting Department, Batch, Section, Day, Faculty initials, Room number, and Course code.
3. **Room Vacancy Matrix:** Interactive grid displaying room status:
   - `Available` (Green badge)
   - `Occupied` by regular routine (Amber badge)
   - `Booked` by faculty reservation (Blue badge)
4. **Campus Analytics:** Visual breakdowns of busiest hours, room utilization rankings, and departmental class load.
5. **Course Offer Browser:** Searchable list of offered subjects with batch, credit, and instructor details.

### 6.2 Faculty Experience
1. **Secure Demo Gateway:** Authentication barrier with persistent session management via Zustand.
2. **Faculty Workspace:** Quick statistics on scheduled lectures and pending reservations.
3. **Inline Routine Management:** Update day, room, faculty, or time slot with real-time room conflict and faculty overlap warnings.
4. **Room Booking Module:** Select day, time slot, and free room from inventory; automatically records booking timestamp and author initials.
5. **Course Offer Management:** Add, update, delete, or bulk-import course offering rows via CSV.

---

## 7. System Architecture & Technology Stack

The project follows a modern, full-stack React architecture utilizing TanStack Start:

```
+-------------------------------------------------------------------------+
|                              Client Browser                             |
|                                                                         |
|  +--------------------+  +----------------------+  +-----------------+  |
|  |  Student Portal    |  |    Faculty Portal    |  | Analytics Views |  |
|  |  (Public Routes)   |  | (Protected Workspace)|  | (Recharts SVG)  |  |
|  +--------------------+  +----------------------+  +-----------------+  |
|             \                      |                      /             |
|              v                     v                     v              |
|        +------------------------------------------------------+         |
|        |     TanStack Router (File-Based Route Tree Engine)   |         |
|        +------------------------------------------------------+         |
|                                    |                                    |
|        +------------------------------------------------------+         |
|        |       Zustand State Store (Key: 'musy-portal')       |         |
|        |       - routineEntries   - bookings                  |         |
|        |       - editedEntries    - authSession               |         |
|        +------------------------------------------------------+         |
|                       /                                \                |
|                      v                                  v               |
|      +-------------------------------+     +-------------------------+  |
|      |  Browser LocalStorage Cache   |     | PapaParse CSV Engine    |  |
|      +-------------------------------+     +-------------------------+  |
+---------------------------------------------------------|---------------+
                                                          |
                                           HTTP GET (Static CSV Files)
                                                          |
                                                          v
                                       +-----------------------------------+
                                       |      Server / CDN File Assets     |
                                       |   /public/data/routine.csv        |
                                       |   /public/data/rooms.csv          |
                                       |   /public/data/course_offers.csv  |
                                       +-----------------------------------+
```

### Complete Technology Manifest

- **Language & Runtime:** TypeScript 5.8, Node.js 18+
- **Front-End Library:** React 19.2.0
- **Routing & Full-Stack Core:** TanStack Start 1.168, TanStack Router 1.170
- **Build Engine:** Vite 8.0, `@lovable.dev/vite-tanstack-config` with Nitro integration
- **Styling Framework:** Tailwind CSS 4.2, `tw-animate-css`
- **Component Primitives:** Radix UI (Dialog, Dropdown, Tabs, Popover, Select, ScrollArea)
- **State Store:** Zustand 5.0 with `persist` middleware
- **Data Ingestion:** PapaParse 5.5
- **Visual Analytics:** Recharts 2.15
- **Form Validation:** React Hook Form 7.71 + Zod 3.24
- **Date Handling:** Date-fns 4.1

---

## 8. Data Models & Schema Specifications

### 8.1 Class Routine Model (`ClassEntry`)
```typescript
export interface ClassEntry {
  id: string;               // Deterministic composite ID
  day: string;              // "Sunday" | "Monday" | ... | "Thursday"
  department: string;       // "CSE" | "EEE" | "BBA" | "LAW" | "SWE" | "ENG" | "ECO" | "DSC"
  batch: string;            // Batch numeric string, e.g., "60"
  section: string;          // Section identifier, e.g., "A"
  time: string;             // Schedule slot string, e.g., "09:00 AM - 10:30 AM"
  course: string;           // Course Code / Title, e.g., "CSE 311"
  room: string;             // Room number or Lab name, e.g., "501"
  faculty: string;          // Faculty initials or name, e.g., "MSI"
  isBooked?: boolean;       // Flag indicating dynamic reservation
}
```

### 8.2 Room Inventory Model (`RoomInfo`)
```typescript
export interface RoomInfo {
  roomNumber: string;       // Primary room code, e.g., "301"
  type: string;             // "Classroom", "Computer Lab", "Electrical Lab"
  capacity: number;         // Seating capacity, e.g., 50
  primaryDept: string;      // Assigned department code or "Shared"
}
```

### 8.3 Faculty Reservation Model (`RoomBooking`)
```typescript
export interface RoomBooking {
  id: string;               // Browser-generated unique identifier
  day: string;              // Day of reservation
  time: string;             // Time slot of reservation
  room: string;             // Target room number
  course: string;           // Course or activity purpose
  faculty: string;          // Reserving faculty identifier
  createdAt: string;        // ISO 8601 creation timestamp
}
```

### 8.4 Academic Calendar Snapshot
- **Weekly Schedule:** 5 Teaching Days (Sunday through Thursday).
- **Daily Time Slots:** Six 90-minute blocks:
  1. 09:00 AM – 10:30 AM
  2. 10:30 AM – 12:00 PM
  3. 12:00 PM – 01:30 PM
  4. 01:30 PM – 03:00 PM
  5. 03:00 PM – 04:30 PM
  6. 04:30 PM – 06:00 PM
- **Dataset Metrics:**
  - `routine.csv`: 808 active scheduled classes
  - `rooms.csv`: 33 distinct classrooms/labs across 10 categories
  - `course_offers.csv`: 373 course offer records

---

## 9. Core Business Logic & Algorithms

### 9.1 Three-Way Classroom Status Resolution
Classroom availability is evaluated through a strict precedence hierarchy:
1. **Dynamic Faculty Booking:** If a booking exists for `{room, day, time}`, mark as `Booked`.
2. **Academic Routine:** If a scheduled routine entry exists for `{room, day, time}`, mark as `Occupied`.
3. **Vacancy:** If neither exists, mark as `Available`.

### 9.2 Conflict Detection Engine
During routine modifications or room booking requests:
- **Room Conflict Check:**
  $$\exists c \in (\text{Routine} \cup \text{Bookings}) \text{ s.t. } c.\text{room} = R \land c.\text{day} = D \land c.\text{time} = T$$
- **Faculty Conflict Check:**
  $$\exists c \in (\text{Routine} \cup \text{Bookings}) \text{ s.t. } c.\text{faculty} = F \land c.\text{day} = D \land c.\text{time} = T$$
When detected, non-blocking UI alert banners provide the exact course code, room, and instructor causing the overlap.

---

## 10. Detailed Route & Screen Walkthrough

| Route | Component | Access | Functionality |
| :--- | :--- | :--- | :--- |
| `/` | `src/routes/index.tsx` | Public | Portal landing page with dual role selector (Student / Faculty). |
| `/student` | `src/routes/student/index.tsx` | Public | Student overview, current live slot, quick statistics, today's schedule preview. |
| `/student/routine` | `src/routes/student/routine.tsx` | Public | Full routine search with instant multi-facet filter bar. |
| `/student/rooms` | `src/routes/student/rooms.tsx` | Public | Interactive room availability grid by day and time slot with status badges. |
| `/student/analytics`| `src/routes/student/analytics.tsx`| Public | Dynamic Recharts visualizations for room usage and peak hours. |
| `/student/course-offer`| `src/routes/student/course-offer.tsx`| Public | Departmental course offering browser. |
| `/faculty/login` | `src/routes/faculty/login.tsx` | Public | Demo login form with state-persisted authorization. |
| `/faculty` | `src/routes/faculty/index.tsx` | Protected | Faculty dashboard with teaching stats and quick-action buttons. |
| `/faculty/routine` | `src/routes/faculty/routine.tsx` | Protected | Personalized faculty schedule view. |
| `/faculty/manage` | `src/routes/faculty/manage.tsx` | Protected | Inline routine editor with conflict detection engine. |
| `/faculty/book` | `src/routes/faculty/book.tsx` | Protected | Room reservation interface with auto-filtering for vacant rooms. |
| `/faculty/course-offer`| `src/routes/faculty/course-offer.tsx`| Protected | Course offer CRUD operations and batch CSV upload tool. |

---

## 11. Setup, Execution & Deployment Guide

### Local Development
```bash
# 1. Clone repository & install dependencies
npm install

# 2. Start local development server
npm run dev
# Vite server starts at: http://localhost:5173

# 3. Format and lint checks
npm run lint
npm run format

# 4. Production build and preview
npm run build
npm run preview
```

### Production Hosting
The application produces a production build optimized for edge platforms (Cloudflare Pages, Vercel, Netlify) via Vite and Nitro. Static assets in `public/data/` are served with caching headers for minimal latency.

---

## 12. Security, Concurrency & Technical Limitations

1. **Authentication:** The current demo credentials (`admin@gmail.com` / `123456`) are evaluated client-side. Production deployment requires integration with an institutional OAuth 2.0 / SAML identity provider.
2. **State Boundary:** Routine edits, reservations, and course offer updates are persisted in browser `localStorage`. Changes do not automatically replicate to other users' devices without a centralized database backend.
3. **Conflict Policies:** Collision detection currently serves as an advisory warning rather than a hard transactional block.
4. **Calendar Rules:** Instructional schedules assume Sunday–Thursday operations. Weekend or holiday adjustments must be reflected in the source CSV data.

---

## 13. Strategic Future Roadmap

- **Phase 1: Institutional SSO Integration:** Implement Google Workspace / Microsoft Entra ID single sign-on with role-based JWT claims.
- **Phase 2: Relational Cloud Database:** Transition from static CSVs and `localStorage` to a centralized PostgreSQL (Supabase/Prisma) database with transactional conflict locks.
- **Phase 3: Real-Time Event Sync:** Integrate WebSockets or Server-Sent Events (SSE) to broadcast live room booking updates across campus devices.
- **Phase 4: Progressive Web App (PWA):** Enable offline schedule caching and native push notifications for class rescheduling alerts.

---

## 14. Conclusion & Recommendations

The **MU Smart Campus** portal provides a high-value, performant prototype that modernizes campus scheduling and classroom discovery for Metropolitan University, Sylhet. It demonstrates that complex academic timetables can be transformed into accessible, responsive, and data-driven tools that dramatically improve daily campus life.
