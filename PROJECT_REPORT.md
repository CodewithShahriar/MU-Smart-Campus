# MU Smart Campus — Project Report

## 1. Executive summary

MU Smart Campus is a responsive web application for browsing university class schedules, checking classroom availability, viewing utilization summaries, maintaining course-offer information, editing routine entries, and reserving rooms. It presents separate student and faculty experiences. Students can browse without signing in; the faculty console has a demo sign-in and provides editing and booking tools.

The current implementation is a browser-oriented academic/demo application. Routine and room inventory are loaded from CSV files served as static assets. Faculty edits, room bookings, sign-in state, and course-offer changes are stored in the browser's local storage through Zustand persistence or component-specific storage. There is no shared database or server-side identity system, so changes are local to a browser and are not a reliable campus-wide source of truth.

## 2. Project purpose and objectives

The project brings common schedule and room questions into one interface. Its objectives are to:

- Make the central timetable searchable by common academic fields.
- Help students and faculty identify occupied and available rooms by day and time.
- Give faculty a simple interface to adjust schedule entries and reserve rooms.
- Summarize schedule and room-use patterns with dashboard metrics and charts.
- Keep initial schedule and room data easy to maintain through CSV files.

## 3. Stakeholders and user roles

### Students

Students can access the student portal without authentication. They can view the dashboard, routine, room availability, analytics, and course offers.

### Faculty

Faculty users enter through a sign-in page and can view the routine, edit routine records, book rooms, and manage course-offer data. The present login is a hard-coded demonstration credential check in client code, rather than an institutional authentication service.

### Project/data maintainers

Maintainers update the CSV files in `public/data` and the application source. The current design has no centralized administrative data service.

## 4. Functional scope

### Student experience

- Landing page with student and faculty entry points.
- Overview dashboard with schedule totals, course/department/room metrics, current time-slot classes, and links to key features.
- Central routine explorer with filters for department, batch, section, day, faculty, course, room, and time.
- Room availability page with day/time selection, text search, status filters, and available/occupied/booked counts.
- Utilization analytics page with room, time, and department summaries.
- Course-offer browser.

### Faculty experience

- Demo sign-in and faculty dashboard.
- Faculty routine browser.
- Routine management page with filtering, inline edits, and room/faculty conflict indicators. Conflicts are surfaced to the user but do not prevent saving.
- Room booking page for selecting a day, time slot, and available room, plus viewing/removing bookings.
- Course-offer management, including local additions, updates, removals, group replacement/removal, and CSV import.

### Shared application behavior

- File-based routing through TanStack Router and TanStack Start.
- Shared routine and room state, initialized from CSV assets.
- Responsive page shells and reusable interface components.
- Application-level not-found and error screens, runtime error reporting hooks, and server-side error response handling.

## 5. Main routes

| Route | Purpose | Access in current implementation |
| --- | --- | --- |
| `/` | Role selection and project landing page | Public |
| `/student` | Student overview | Public |
| `/student/routine` | Search and filter the central routine | Public |
| `/student/rooms` | Check classroom status by day/time | Public |
| `/student/analytics` | View utilization analytics | Public |
| `/student/course-offer` | Browse course offers | Public |
| `/faculty/login` | Faculty demo sign-in | Public entry |
| `/faculty` | Faculty dashboard | Intended faculty area |
| `/faculty/routine` | Faculty routine browser | Intended faculty area |
| `/faculty/manage` | Edit routine records | Intended faculty area |
| `/faculty/book` | Create and manage room bookings | Intended faculty area |
| `/faculty/course-offer` | Manage course-offer data | Intended faculty area |

The route pages use faculty layout components, but authorization is currently represented by client-side persisted state and navigation behavior. It should not be treated as access control for sensitive or authoritative data.

## 6. Technical architecture

### Front end and runtime

- React 19 and TypeScript.
- TanStack Router for generated, file-based route definitions.
- TanStack Start for the application runtime and server integration.
- Vite for development and production builds, configured through the Lovable TanStack Vite preset.
- Tailwind CSS 4 for styling, with reusable shadcn/ui-inspired components built on Radix UI primitives.

### State and data utilities

- Zustand stores routine, room, booking, edit, and demo authentication state.
- Zustand persistence saves selected state under the browser key `musy-portal`.
- PapaParse parses routine and room CSV files.
- Course-offer import/reading uses a project-specific CSV/text parser and local storage.
- TanStack Query is installed and a `QueryClientProvider` is mounted at the root; primary domain data is currently loaded and managed through Zustand rather than query hooks.
- Recharts provides charting support for analytics.

### Supporting libraries

React Hook Form, Zod, date-fns, Sonner, Lucide icons, and Radix UI components are included in the dependency set. The source also includes responsive-device and class-name utility helpers.

### High-level data flow

1. On page initialization, the shared data hook fetches `/data/routine.csv` and `/data/rooms.csv`.
2. PapaParse reads rows with headers; parsing utilities normalize room identifiers and derive department/section labels from source fields.
3. The Zustand store keeps the base records in memory and combines them with locally persisted edits and bookings.
4. Student and faculty views consume the same merged routine for filtering and status calculations.
5. Faculty changes update local persisted state in the current browser. Course offers are separately loaded from `/data/course_offers.csv` and merged with browser-local changes.

## 7. Data and domain model

### Routine records

The `ClassEntry` model includes an ID, day, department, batch, section, time, course, room, faculty, and an optional booking marker. The routine CSV has columns `Day`, `Department`, `Batch/Section`, `Time`, `Course`, `Room`, and `Faculty`.

### Rooms

The `RoomInfo` model includes room number, type, capacity, and primary department. The room CSV has columns `Room Type`, `Room Numbers`, `Capacity`, and `Primary Dept`. A row may contain multiple comma-separated room numbers.

### Bookings

A booking records ID, day, time, room, course, faculty, and creation timestamp. It is converted into a routine-like entry for shared displays. Booking IDs are generated in the browser.

### Course offers

Course offers may contain code, title, department, credits, semester, instructor, batch, section, and note. The supplied file is a one-column `Text` export (373 non-header rows at report preparation), so the parser includes a free-text fallback in addition to support for conventional multi-column CSV input.

### Supplied data snapshot

At report preparation, `public/data/routine.csv` contains 808 data rows across Sunday through Thursday; `public/data/rooms.csv` contains 10 source rows describing 33 distinct room identifiers; `public/data/course_offers.csv` contains 373 data rows in its text column. These counts describe the checked-in files at this point in time and will change when the data is updated.

The application defines six 90-minute teaching slots, from 09:00 AM through 06:00 PM, and the five instructional days Sunday through Thursday. Department codes include CSE, EEE, BBA, LAW, SWE, ENG, ECO, and DSC. Parsing logic also recognizes event rows and maps some batch naming patterns to departments.

## 8. Core workflows

### Find a class

Open the student routine, narrow the records using filters or search, then inspect course, room, faculty, batch, and time details.

### Check a room

Select a day and time slot. The availability view marks rooms as occupied from the routine and booked from local bookings. Bookings take display precedence over ordinary routine occupancy for the same room/time. Unlisted rooms found in the routine can also appear as occupied.

### Edit a routine entry

A faculty user filters the routine, opens an entry for editing, adjusts schedule fields, and saves. The UI identifies same-slot room or faculty conflicts. Saving persists a local patch that is merged with the static source record and reflected in views using the same browser storage.

### Reserve a room

The faculty booking interface evaluates room occupancy for the selected day and time, offers available inventory rooms, and saves a booking locally. The booking appears in the merged schedule and room-status calculations.

### Maintain course offers

The faculty course-offer interface parses available course data, supports editing/import operations, and writes resulting records and removed-group metadata to local storage. Local edits are merged with the supplied file for that browser.

## 9. Setup and operation

### Requirements

- Node.js 18 or newer (as documented by the project README).
- npm, or Bun if the team chooses to use the checked-in Bun lockfile/configuration.

### Local development

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The project also provides:

```bash
npm run build
npm run preview
npm run lint
npm run format
```

Routine, room, and course-offer files are under `public/data`. Changes to course schedules and room inventory should preserve the expected headers and formats. Routine/room parser expectations are visible in `src/lib/data/utils.ts`.

### Deployment note

Vite configuration uses the Lovable TanStack preset, whose comments specify Nitro build integration with Cloudflare as the default target. Deployment should follow the chosen hosting adapter's requirements and should be checked against the actual production environment. The current browser-local write model means production deployment alone will not enable shared editing or bookings.

## 10. Security, correctness, and operational limitations

The following are characteristics of the current source, not hypothetical design goals:

- The demo email/password pair is embedded in client-side source, and the persisted `authed` flag is browser-controlled. This is not secure authentication or authorization.
- Routine edits, bookings, and course-offer changes are browser-local. They do not synchronize between faculty, students, browsers, or devices and can be cleared with browser storage.
- There is no server-side database, audit trail, role/permission model, or authoritative conflict transaction. Two users could make conflicting changes independently.
- Conflict detection is a user-facing warning and allows saving despite a detected conflict.
- Base CSV data is loaded at the client from static paths. There is no administration UI for uploading or publishing a new shared dataset.
- The routine parser assumes specific header names and derives some metadata from batch/course strings. Source-format changes may cause records to be skipped or categorized differently.
- The course-offer input is currently a one-column text export and uses heuristics to infer course rows and grouping. Parser output should be checked when source formatting changes.
- The configured teaching days are Sunday through Thursday. Dashboard current-day behavior on Friday/Saturday should be reviewed against the institution's calendar and closures.
- The application uses browser local time for current-day/current-slot calculations.
- README documentation mentions local demo credentials, while the sign-in page hides the credential hint in commented markup. Credentials are still present in the store implementation.
- No automated test suite or CI workflow is documented in the repository snapshot reviewed for this report.

## 11. Recommended next steps

For a reliable multi-user campus service, prioritize:

1. Replace the hard-coded demo login with institutional identity or a server-side authentication provider.
2. Add a backend API and database for schedules, room inventory, bookings, and course offers.
3. Enforce role-based authorization on the server and record audit history for administrative changes.
4. Make booking creation atomic and enforce room/time conflict constraints on the server.
5. Define validation, ownership, and approval rules for routine edits and course-offer publication.
6. Add versioned import workflows with CSV validation, preview, error reporting, and rollback.
7. Add automated checks for parsing, department derivation, room conflicts, booking rules, and key route workflows.
8. Confirm calendar rules, time zone, data refresh ownership, backup/restore, and deployment monitoring with campus stakeholders.

## 12. Conclusion

MU Smart Campus provides a useful interface prototype for routine discovery, classroom status, utilization views, and faculty schedule workflows. The checked-in data and front-end features support a local demonstration. Shared institutional operation requires server-backed data and authentication, plus server-enforced booking and edit rules. This report reflects the repository source and bundled CSV files inspected on 26 September 2026.
