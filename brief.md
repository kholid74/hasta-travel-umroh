# TASK: Build a Complete Admin Dashboard Showcase for Hasta Travel Umrah

You are working on an existing travel Umrah website:

https://hasta-travel-umroh.vercel.app/

The existing project already contains the PUBLIC / CUSTOMER-FACING website.

Your task is to extend the existing project by building a complete, professional, highly interactive ADMIN DASHBOARD for the travel business.

## IMPORTANT PROJECT CONTEXT

This is primarily a SHOWCASE / DEMO application created by Kalsara Digital Studio to demonstrate what a custom travel Umrah management system could look like to prospective clients.

The goal is NOT to build the full production backend yet.

The admin dashboard must:

- look production-ready
- feel like a real operational system
- contain realistic Indonesian Umrah travel data
- be highly clickable
- allow prospective clients to explore workflows hands-on
- work well during a sales/demo presentation
- demonstrate the value of replacing Excel, WhatsApp, and fragmented manual processes
- reuse the existing Hasta Travel brand and visual identity where appropriate

Most functionality should use mock data and frontend state.

Only authentication architecture needs to be prepared for a real backend/database later.

A Neon PostgreSQL database will be provided later.

Do NOT overengineer backend infrastructure at this stage.

---

# 1. FIRST: AUDIT THE EXISTING PROJECT

Before implementing anything:

1. Inspect the entire repository.
2. Identify:
   - framework
   - routing
   - styling solution
   - component system
   - typography
   - colors
   - existing public pages
   - package structure
   - existing utilities
   - existing authentication code, if any
3. Reuse the existing technology and conventions whenever reasonable.
4. Do NOT unnecessarily rewrite the public website.
5. Do NOT introduce another frontend framework.
6. Ensure existing public pages remain functional.

Then create the admin application under an appropriate route such as:

`/admin`

Login:

`/admin/login`

Dashboard:

`/admin/dashboard`

---

# 2. DESIGN DIRECTION

The admin panel should feel like a polished modern SaaS / ERP product.

It should NOT look like a generic Bootstrap admin template.

Design principles:

- clean
- professional
- premium
- operational
- data-dense without feeling cluttered
- easy to scan
- strong hierarchy
- excellent whitespace
- modern typography
- subtle borders
- subtle shadows only when necessary
- consistent 8px-ish spacing system
- responsive
- excellent desktop experience
- still usable on tablet/mobile

Use the existing Hasta Travel branding as the foundation.

The public website and admin system should clearly feel like parts of the same product ecosystem.

Admin layout:

Desktop:
- collapsible left sidebar
- top navigation/header
- breadcrumb
- global search
- notification button
- profile dropdown
- contextual page actions

Mobile:
- drawer navigation
- simplified header
- responsive tables/cards

Avoid excessive gradients, oversized cards, excessive rounded corners, and decorative UI that does not help usability.

---

# 3. DEMO EXPERIENCE

This is extremely important.

A prospective travel owner should be able to open the admin dashboard and immediately understand:

"Semua operasional travel saya bisa dikelola dari sini."

Use realistic mock data throughout the application.

Do NOT use:

- Lorem ipsum
- User 1
- Package A
- Test Data
- dummy@example.com everywhere

Use realistic Indonesian names, packages, dates, cities, transactions, hotels, airlines, agents, etc.

Example travel packages:

- Umrah Reguler 9 Hari
- Umrah Plus Turki 12 Hari
- Umrah Awal Ramadan
- Umrah Lailatul Qadar
- Umrah Syawal
- Umrah Plus Dubai

Example airlines:

- Saudia
- Garuda Indonesia
- Qatar Airways
- Emirates

Example statuses:

- Draft
- Open Registration
- Almost Full
- Full
- Departed
- Completed
- Cancelled

The data across pages MUST be internally consistent.

For example:

If Dashboard says:

245 jamaah aktif

then other modules should contain data consistent with that general scale.

If a package has capacity 45 and 38 registered jamaah, display:

38 / 45 seats

throughout the UI.

---

# 4. GLOBAL ADMIN NAVIGATION

Create sidebar navigation roughly structured as:

OVERVIEW
- Dashboard

SALES
- CRM / Leads
- Booking
- Jamaah

OPERASIONAL
- Paket Umrah
- Keberangkatan
- Manifest
- Dokumen & Visa
- Rooming List
- Manasik
- Transportasi

FINANCE
- Pembayaran
- Invoice
- Pengeluaran
- Komisi Agen

PARTNERS
- Agen
- Supplier / Vendor

INVENTORY
- Perlengkapan Jamaah

COMMUNICATION
- Broadcast
- Notification Center

REPORTS
- Laporan
- Analytics

WEBSITE
- Paket Website
- Artikel
- Testimoni
- Galeri
- Leads Website

SYSTEM
- User & Roles
- Activity Log
- Settings

Use icons consistently.

Group navigation intelligently.

Sidebar sections may be collapsible if useful.

---

# 5. DASHBOARD

Create an impressive executive dashboard.

Header:

"Selamat pagi, Ahmad 👋"

Subtitle:

"Berikut ringkasan operasional Hasta Travel hari ini."

Provide date selector / period filter.

Primary KPI cards:

- Total Jamaah
- Jamaah Aktif
- Keberangkatan Mendatang
- Pendapatan Bulan Ini
- Tagihan Belum Lunas
- Lead Baru

Show percentage/trend where appropriate.

Example:

Total Jamaah
1,284
+12.5% dari periode sebelumnya

Jamaah Aktif
245

Keberangkatan
6
60 hari ke depan

Outstanding
Rp 487.500.000

Then create useful operational sections.

## Upcoming Departures

Table/card:

Tanggal
Paket
Flight
Jamaah
Capacity
Status

Example:

12 Oct 2026
Umrah Reguler 9 Hari
SV-817
42 / 45
Ready

Provide action:

"Lihat Manifest"

---

## Payment Overview

Visualization:

Lunas
DP
Cicilan
Belum Bayar

Show total collected vs outstanding.

---

## Document Readiness

Example:

Passport complete: 94%
Visa approved: 82%
Vaccination: 89%
Photo: 97%

Highlight jamaah requiring attention.

---

## Sales Funnel

Lead Baru
→ Follow Up
→ Qualified
→ Booking
→ DP
→ Lunas

Make this visually useful.

---

## Tasks / Alerts

Examples:

"7 paspor akan kedaluwarsa dalam 6 bulan"

"12 jamaah belum melengkapi dokumen"

"8 pembayaran jatuh tempo minggu ini"

"Keberangkatan UMR-1026-01 tinggal 10 hari"

Each should be clickable.

---

## Recent Activities

Examples:

"Rina Amelia mengunggah paspor"

"Admin Finance memverifikasi pembayaran Rp 15.000.000"

"Ahmad Fauzi dipindahkan ke Paket Umrah Plus Turki"

---

# 6. CRM / LEADS

Create a lightweight travel CRM.

Views:

- Table
- Kanban

Stages:

New Lead
Contacted
Follow Up
Qualified
Booking
Won
Lost

Lead data:

- name
- phone
- WhatsApp
- interested package
- source
- assigned sales
- status
- last contact
- next follow-up
- notes

Sources:

- Website
- WhatsApp
- Instagram
- Referral
- Agent
- Walk-in
- Meta Ads

Lead detail should show:

- contact information
- timeline
- notes
- follow-up
- interested package
- activity history

Allow mock actions:

- Add Lead
- Move stage
- Add note
- Schedule follow-up
- Convert to Booking

Use toast feedback.

---

# 7. JAMAAH MANAGEMENT

This is one of the most important modules.

Create a comprehensive jamaah database.

Table columns:

- Jamaah ID
- Name
- Gender
- Phone
- Package
- Departure
- Payment Status
- Document Status
- Visa Status
- Agent
- Status

Provide:

- search
- filters
- sorting
- pagination
- bulk selection
- export button
- import button
- add jamaah

Filters:

- package
- departure
- payment status
- document completeness
- visa status
- agent
- city

## Jamaah Detail

Create an excellent detail page.

Header:

Photo
Full name
Jamaah ID
Package
Status

Tabs:

### Personal Data

- full name according to passport
- NIK
- gender
- birth place
- birth date
- marital status
- blood type
- phone
- email
- address
- emergency contact

### Passport

- passport number
- issue date
- expiry date
- issuing office
- passport image
- validity warning

### Documents

Checklist:

- KTP
- KK
- Passport
- Photo
- Vaccination
- Marriage certificate
- Birth certificate
- Other required documents

Statuses:

Missing
Uploaded
Verified
Rejected

### Visa

Visa workflow:

Not Started
Submitted
Processing
Approved
Rejected

Show:

- visa number
- submitted date
- approved date
- expiry date
- notes

### Booking

Show:

- package
- room type
- departure
- agent
- booking date
- booking code

### Payments

Show invoice/payment timeline.

### Room

Hotel room allocation.

### Family / Group

Allow jamaah to be grouped as family.

Example:

Keluarga Bapak Hendra
4 Jamaah

### Activity

Timeline of changes.

---

# 8. PACKAGE MANAGEMENT

Create package management.

Package card/table should contain:

- package name
- code
- type
- departure
- duration
- airline
- hotel
- capacity
- booked seats
- available seats
- starting price
- status

Example:

UMR-REG-OCT26

Umrah Reguler 9 Hari

12–20 October 2026

Saudia Airlines

42 / 45 seats

Rp 32.500.000

Status: Almost Full

## Package Detail

Tabs:

Overview
Itinerary
Pricing
Hotels
Flights
Jamaah
Documents
Finance

Pricing should support:

Quad
Triple
Double

Example:

Quad
Rp 32.500.000

Triple
Rp 34.500.000

Double
Rp 37.500.000

Also show:

Adult
Child
Infant

where appropriate.

Allow mock actions:

- Create Package
- Duplicate
- Edit
- Publish
- Close Registration
- Archive

---

# 9. DEPARTURE MANAGEMENT

Separate PACKAGE from DEPARTURE.

A package is the product.

A departure is an operational batch.

Example:

Package:
Umrah Reguler 9 Hari

Departure:
UMR-261012-A

Departure detail should show:

Departure readiness score.

Example:

87% Ready

Checklist:

Jamaah confirmed
Payments
Passport
Visa
Flight tickets
Hotel
Rooming
Bus
Tour leader
Muthawwif
Manasik
Equipment

Show progress indicators.

---

# 10. MANIFEST

Create a professional manifest management screen.

Columns:

- No
- Jamaah
- Passport
- Gender
- DOB
- Package
- Room
- Visa
- Flight
- Status

Allow:

- filters
- search
- bulk select
- export Excel
- export PDF
- "Prepare SISKOPATUH Export"

The SISKOPATUH feature is DEMO ONLY.

Do NOT claim there is an actual government API integration.

Clearly label it in the interface where appropriate as:

"Format data siap ekspor"

or

"Simulasi integrasi"

Provide a modal:

"Persiapan Data SISKOPATUH"

Checklist:

✓ Identitas jamaah
✓ Passport
✓ Pembayaran
✓ Asuransi
✓ Visa
✓ Tiket

Show:

42 / 45 jamaah siap

3 jamaah membutuhkan perbaikan data.

---

# 11. DOCUMENT & VISA CENTER

Create centralized document management.

Dashboard metrics:

Complete
Incomplete
Needs Verification
Expired / Expiring Soon

Tabs:

All Documents
Passport
Visa
KTP
Vaccination
Photo

Create visual document verification workflow.

Admin can click:

Verify
Reject
Request Update

Use frontend-only state.

Visa pipeline:

Not Submitted
Submitted
Processing
Approved
Rejected

Provide batch actions.

---

# 12. ROOMING LIST

Make this visually impressive because it is excellent for a client demo.

Hotel selector:

Madinah:
Pullman Zamzam Madina

Makkah:
Swissotel Al Maqam

Room types:

Double
Triple
Quad

Create room cards.

Example:

Room 1204
QUAD
3 / 4

- Ahmad Fauzi
- Budi Santoso
- Hendra Wijaya
- Empty Slot

Support simulated drag-and-drop jamaah between rooms if feasible with the existing stack.

Provide:

Unassigned Jamaah: 7

Show warnings:

Family separated
Gender mismatch
Room over capacity

Add:

"Auto Assign"

button that performs a frontend mock allocation.

---

# 13. MANASIK

Create schedule management.

Events:

Manasik #1
Manasik #2
Technical Meeting
Document Verification
Airport Briefing

Fields:

- date
- time
- location
- package/departure
- speaker
- attendees
- attendance

Show attendance:

38 / 42 hadir

Allow mock check-in.

---

# 14. FLIGHT & TRANSPORTATION

Flight data:

- airline
- flight number
- PNR
- origin
- destination
- departure
- arrival
- terminal

Example:

SV 817

CGK → JED

12 Oct 2026
09:20 → 15:40

Transportation in Saudi Arabia:

Bus 01
45 seats
Driver
Phone
Route

JED Airport → Madinah

Provide bus allocation for jamaah.

---

# 15. PAYMENT MANAGEMENT

Create robust finance UI.

Payment dashboard:

Total Revenue
Collected
Outstanding
Overdue
Refund

Payment table:

Invoice
Jamaah
Package
Total
Paid
Remaining
Due Date
Status

Statuses:

Unpaid
DP
Installment
Paid
Overdue
Refunded

## Invoice Detail

Example:

INV/HT/2026/00182

Jamaah:
Ahmad Fauzi

Package:
Umrah Reguler 9 Hari

Total:
Rp 32.500.000

Payments:

DP
Rp 10.000.000

Installment #2
Rp 12.500.000

Remaining
Rp 10.000.000

Allow mock:

Record Payment
Verify Payment
Download Invoice
Download Receipt
Send Reminder

No real payment gateway required.

---

# 16. EXPENSE MANAGEMENT

Show operational expenses by departure.

Categories:

- Airline
- Hotel
- Visa
- Transportation
- Catering
- Guide
- Handling
- Equipment
- Marketing
- Miscellaneous

Show:

Revenue
Cost
Gross Profit
Margin

Example:

Umrah Reguler October

Revenue:
Rp 1.462.500.000

Operational Cost:
Rp 1.135.000.000

Estimated Gross Profit:
Rp 327.500.000

Margin:
22.4%

Make clear this is an operational estimate if necessary.

---

# 17. AGENT MANAGEMENT

Create agent / reseller management.

Fields:

- agent ID
- name
- phone
- city
- level
- jamaah generated
- active bookings
- total sales
- commission
- status

Agent detail:

Profile
Jamaah
Bookings
Commission
Payments
Activity

Levels:

Agent
Senior Agent
Coordinator

Commission examples:

Rp 1.000.000 / jamaah

or custom commission.

Show:

Pending Commission
Approved
Paid

Allow mock approval.

---

# 18. INVENTORY / PERLENGKAPAN

Manage Umrah equipment.

Items:

- Koper Besar
- Koper Kabin
- Tas Paspor
- Kain Ihram
- Mukena
- Seragam Batik
- Buku Manasik
- ID Card
- Luggage Tag

Show:

Stock
Reserved
Distributed
Remaining

Jamaah equipment checklist:

✓ Koper
✓ Tas
✓ Seragam
○ Buku Manasik

Allow:

"Mark as Distributed"

---

# 19. BROADCAST / COMMUNICATION

Create communication center.

Channels:

WhatsApp
Email

This is simulation only.

Templates:

Payment Reminder
Document Reminder
Manasik Reminder
Departure Information
Visa Approved
Booking Confirmation

Example:

"Assalamu'alaikum Bapak Ahmad, mengingatkan bahwa pembayaran paket Umrah Reguler Anda sebesar Rp10.000.000 jatuh tempo pada 5 Oktober 2026."

Audience filters:

Package
Departure
Payment status
Document status
Agent

Show estimated recipients.

Provide preview modal.

"Send Broadcast" should only simulate sending and display a toast.

---

# 20. NOTIFICATION CENTER

Create operational notifications.

Categories:

Payments
Documents
Visa
Departure
Inventory
System

Allow:

Mark as read
Mark all read

---

# 21. WEBSITE CMS

Because Hasta already has a public website, demonstrate how travel staff could manage it.

Modules:

## Website Packages

Show packages currently published on public website.

Actions:

Publish
Unpublish
Featured
Edit

## Articles

Fields:

Title
Slug
Category
Status
Published At

## Testimonials

Approve / hide testimonials.

## Gallery

Manage:

Umrah trips
Hotels
Manasik
Departure
Saudi activities

## Website Leads

Show inquiries coming from public website.

This should reinforce the concept:

PUBLIC WEBSITE → LEAD → CRM → BOOKING → JAMAAH → OPERATION.

---

# 22. REPORTS

Create reporting dashboard.

Reports:

- Sales
- Revenue
- Outstanding Payments
- Package Performance
- Departure Profitability
- Agent Performance
- Jamaah Acquisition Source
- Document Readiness
- Inventory
- Lead Conversion

Include charts where useful.

Use existing chart library if available.

If no chart library exists, add a lightweight, appropriate library.

Do not overload the dashboard with meaningless charts.

Every visualization must answer a business question.

---

# 23. USER & ROLE MANAGEMENT

Roles:

Owner
Super Admin
Operations
Finance
Sales
Document Officer
Tour Leader

Create permission matrix UI.

Example:

Finance:

Dashboard ✓
Jamaah View ✓
Payment ✓
Expense ✓
Reports ✓
Edit Package ✗
User Management ✗

No sophisticated RBAC backend required yet.

Simulate the UI.

---

# 24. ACTIVITY LOG

Create audit log UI.

Examples:

10:42
Finance Admin
Verified payment INV/HT/2026/00182

10:15
Operations
Updated passport Ahmad Fauzi

09:48
Sales
Converted lead Siti Rahma to booking

Filters:

User
Module
Action
Date

---

# 25. SETTINGS

Settings sections:

Travel Profile
Branding
Branches
Payment
Notification
Document Requirements
Package Defaults
User & Security

Travel profile:

Hasta Travel
PPIU License
Address
Phone
Email
Website

Branch management:

Jakarta
Bandung
Surabaya

This is UI/demo only.

---

# 26. GLOBAL SEARCH

Create Cmd/Ctrl + K global search if feasible.

Search entities:

Jamaah
Booking
Package
Invoice
Agent
Departure

Example search:

"Ahmad"

results:

Ahmad Fauzi
Jamaah
UMR-JMH-10281

Ahmad Hidayat
Agent
AGT-0031

---

# 27. COMMAND / QUICK ACTION

Add a "+ Tambah" or quick action menu.

Options:

Tambah Jamaah
Tambah Booking
Tambah Lead
Buat Paket
Catat Pembayaran
Tambah Pengeluaran

This should make the application feel operational.

---

# 28. CLICKABLE INTERACTIONS

This requirement is critical.

Do not build static screens.

Buttons should actually respond.

Examples:

Add Jamaah
→ modal/drawer opens

Verify Payment
→ status changes

Verify Document
→ document becomes verified

Move CRM Lead
→ card changes column

Assign Room
→ jamaah moves

Publish Package
→ badge changes

Mark Equipment Distributed
→ checklist updates

Send Reminder
→ toast appears

Create Invoice
→ invoice appears

Filters
→ actually filter mock data

Search
→ actually search data

Pagination
→ works

Tabs
→ work

Dropdowns
→ work

Dialogs
→ work

Use frontend state.

It is okay for changes to reset after refresh.

Optionally use localStorage for selected interactions if useful.

---

# 29. DEMO MODE

Add a subtle badge somewhere in the admin header:

"Demo"

On hover/click:

"Data pada dashboard ini merupakan data simulasi untuk keperluan demonstrasi."

Do NOT put large warnings everywhere.

The application should still feel like a real product.

Optionally provide:

"Reset Demo Data"

under profile/settings.

---

# 30. LOGIN

Create polished login:

`/admin/login`

Brand:

Hasta Travel

Heading:

"Selamat datang kembali"

Subheading:

"Masuk untuk mengelola operasional travel Anda."

Fields:

Email
Password

Remember me

Forgot password

Login button

Later this login will connect to Neon PostgreSQL.

For now:

Create authentication abstraction cleanly enough that real auth can be connected later.

If the project already has auth, reuse it.

If no auth exists, implement the simplest secure architecture suitable for later replacement.

DO NOT build an unnecessarily complex auth platform.

Provide a clearly identifiable DEMO credential mechanism.

After login:

redirect to `/admin/dashboard`.

Protected admin routes should redirect unauthenticated users to login.

---

# 31. FUTURE DATABASE PREPARATION

Backend database will eventually use Neon PostgreSQL.

Do NOT create the entire backend now.

However, structure frontend data models sensibly.

Potential future entities include:

users
roles
permissions
jamaah
families
leads
bookings
packages
departures
payments
invoices
expenses
documents
visas
hotels
rooms
room_assignments
flights
buses
agents
commissions
inventory_items
inventory_distributions
manasik_events
notifications
broadcasts
activities

Do not create migrations unless actually required for authentication.

Mock data should be separated cleanly from UI components so API/database integration later is straightforward.

Example concept:

data/
services/
types/
components/
features/

Follow the conventions of the existing project instead of blindly forcing this exact structure.

---

# 32. DATA ARCHITECTURE

Avoid giant components containing hundreds of lines of hardcoded data.

Create reusable typed models.

Example concepts:

Jamaah
Package
Departure
Booking
Payment
Document
Agent

Centralize mock datasets.

Create service/repository abstraction if appropriate:

jamaahService.getAll()

packageService.getAll()

paymentService.getAll()

For now these can return mock data.

Later they should be replaceable by API/database calls.

---

# 33. UX DETAILS

Provide:

Skeleton/loading states where appropriate.

Empty states.

Error states.

Confirmation dialogs for destructive actions.

Toast notifications.

Tooltips for unfamiliar icons.

Status badges.

Responsive table handling.

Consistent date format:

12 Okt 2026

Currency:

Rp 32.500.000

Language:

Indonesian.

Use terminology familiar to Indonesian Umrah travel operators.

---

# 34. DEMO STORY

Optimize the application so Kalsara can demonstrate this story to a prospect:

1. Lead enters from website / WhatsApp.
2. Sales follows up in CRM.
3. Lead chooses Umrah package.
4. Lead becomes booking.
5. Jamaah pays DP.
6. Jamaah completes personal data.
7. Admin verifies passport/documents.
8. Visa is processed.
9. Jamaah is assigned to departure.
10. Admin creates rooming arrangement.
11. Manasik attendance is recorded.
12. Equipment is distributed.
13. Manifest becomes ready.
14. Payment is completed.
15. Jamaah departs.
16. Travel sees revenue/profit/reporting.

The UI should make this workflow discoverable.

---

# 35. DASHBOARD "OPERATIONAL JOURNEY"

Consider adding a visual operational journey widget:

Lead
↓
Booking
↓
Documents
↓
Payment
↓
Visa
↓
Manasik
↓
Ready to Depart
↓
Departed
↓
Completed

Show counts for each stage.

This gives travel owners an immediate mental model of the system.

---

# 36. SAMPLE DATA QUALITY

Create enough data that screens look realistic.

Recommended:

30-50 visible jamaah records

8-12 packages

5-8 departures

20+ leads

20+ transactions

10+ agents

several invoices

several hotels

several room allocations

multiple activity records

Do NOT manually render every row.

Generate/import structured mock datasets.

Ensure relationships make sense.

---

# 37. PERFORMANCE

Do not sacrifice performance just because this is a showcase.

Avoid:

- huge client bundles
- unnecessary dependencies
- giant images
- unnecessary animation libraries
- excessive rerenders

Use lazy loading/code splitting if naturally supported by the existing framework.

---

# 38. ACCESSIBILITY

Ensure:

keyboard navigation

visible focus states

semantic buttons

form labels

reasonable contrast

accessible dialogs

accessible dropdowns

---

# 39. DO NOT IMPLEMENT FAKE REAL INTEGRATIONS

The following should be visually demonstrable but MUST NOT falsely behave as real integrations:

SISKOPATUH
WhatsApp
Payment Gateway
Airline API
Visa API
Email
OCR
Government services

Instead use UI labels such as:

"Simulasi"

"Integration Ready"

"Preview"

"Format Siap Ekspor"

where necessary.

The interface should demonstrate capability without pretending external actions occurred.

---

# 40. PRIORITY ORDER

Implement in this priority:

P0
- Admin shell
- Login
- Dashboard
- Jamaah
- Jamaah Detail
- Package
- Package Detail
- Booking
- Payment
- Departure
- Manifest

P1
- Documents & Visa
- Rooming List
- CRM
- Agents
- Finance
- Manasik
- Inventory

P2
- Reports
- Broadcast
- Website CMS
- Users & Roles
- Activity Log
- Settings

Do not leave P0 pages visually unfinished just to implement every P2 feature.

Quality > raw number of screens.

---

# 41. REUSABLE COMPONENTS

Build reusable admin components where appropriate:

PageHeader
StatCard
StatusBadge
DataTable
FilterBar
SearchInput
EmptyState
ConfirmDialog
FormDrawer
DetailHeader
ActivityTimeline
ProgressIndicator
CurrencyDisplay
DateDisplay
DocumentStatus
PaymentStatus
PackageStatus

Avoid duplicating nearly identical UI.

---

# 42. FINAL QUALITY CHECK

Before declaring the work finished:

Run the project.

Run lint.

Run typecheck.

Run build.

Fix errors.

Check browser console.

Check all admin routes.

Check mobile responsiveness.

Check that public Hasta Travel pages still work.

Check every sidebar navigation item.

Check interactive demo buttons.

Check dialogs and drawers.

Check filters.

Check realistic mock data.

Check loading/empty states.

Check visual consistency.

Remove obvious unfinished placeholders.

Remove dead code.

---

# 43. DOCUMENTATION

Create:

`docs/ADMIN_SHOWCASE.md`

Explain:

- admin architecture
- routes
- modules
- mock data architecture
- authentication approach
- demo credentials
- how to run
- how to reset demo state
- what is frontend simulation
- what will eventually require backend implementation
- suggested Neon integration path

Also create:

`docs/FUTURE_BACKEND.md`

Document recommended future backend entities and integrations without implementing them.

Include a section:

## Demo vs Production

Clearly identify which features currently use:

- frontend state
- localStorage
- mock data
- authentication backend
- future database
- future external integrations

---

# 44. IMPLEMENTATION APPROACH

Do NOT immediately attempt to generate the entire application in one huge uncontrolled change.

Work incrementally.

Phase 1:
Audit repository and establish admin design system / shell.

Phase 2:
Dashboard + navigation.

Phase 3:
Core travel operational modules.

Phase 4:
Finance and supporting modules.

Phase 5:
CRM/CMS/reporting/settings.

Phase 6:
Polish interactions and responsive behavior.

After each phase:

- run relevant checks
- fix regressions
- maintain consistency

You may autonomously make reasonable product and UI decisions.

Do not stop to ask questions about minor implementation details.

When multiple approaches are possible, choose the approach that creates the strongest polished showcase while preserving maintainability.

---

# SUCCESS CRITERIA

The finished admin dashboard should make a prospective Umrah travel owner feel that Hasta Travel has a complete digital operating system behind its public website.

The strongest impression should be:

"Website bukan hanya company profile. Lead dari website bisa masuk ke sistem, diproses menjadi booking, dikelola sebagai jamaah, pembayaran dan dokumennya dipantau, lalu seluruh proses keberangkatannya dikelola dari satu dashboard."

It should be visually polished enough to use in a Kalsara Digital Studio sales presentation and interactive enough that a prospective client can explore the system independently.
