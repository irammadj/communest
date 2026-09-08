# Communest — Frontend Development Prompt

## Project Overview
Build the frontend for **Communest**, a website for estate management and house hunting in Kenya, designed to help Kenyans easily find good housing and estate managers to manage their estates.

## Tech Stack
- **Frontend:** React.js with TypeScript
- Source code must be clean, readable, and well-organized to support future backend/database integration.
- Do not use any logo for the website anywhere in the frontend.
- Do not mention or reference Figma anywhere in the project files or documentation.

## Design Requirements
- Fully responsive across different devices (mobile, tablet, desktop).
- Dark theme combined with dark blue as the primary color scheme.
- Font family: the one used on Apple devices (system font stack, e.g. San Francisco / `-apple-system`).
- Consistent hover effects/interactions throughout the site.
- Background images used consistently across page hero sections (images to be supplied later).

## User Roles (Frontend Behavior)
The frontend must adapt navigation, visible pages, and page content based on user role. Each user must display a role badge that updates automatically when their status changes.

1. **Communest Admin** — owner/head of the website. Badge: Communest Admin.
2. **Estate Admin** — owner of a listed estate. Badge: Estate Admin.
3. **Tenant** — has rented in a listed estate. Badge: Tenant.
4. **Regular User** — has an account but has not rented in any listed estate. Badge: Regular User.
5. **Outsider** — visiting without an account.

When a user's status changes (e.g., Regular User → Tenant), their badge must update automatically across the UI.

## Pages
1. Home Page
2. Explore Page
3. My Estate Page
4. About Page
5. List Your Estate Page
6. Admin Page
7. Privacy Policy Page
8. Terms and Conditions Page
9. Sign In / Register Page
10. Profile Page

Every page must include a **footer** with:
- Working social links
- Privacy Policy link
- Terms and Conditions link
(All footer links must actually navigate/function correctly.)

---

## Navbar
- Contains a sidebar menu toggle, the site name "Communest" (text only, no logo), and centered nav links.
- On the opposite end: a **Client Area** button for sign in/register (before login).
- After login: the Client Area button is replaced with the user's profile picture, which links to the Profile Page.

**Navbar links visible per role:**
| Role | Visible Pages |
|---|---|
| Communest Admin | Home, Explore, About, Admin |
| Estate Admin | Home, Explore, My Estate, About |
| Tenant | Home, Explore, My Estate, About |
| Regular User | Home, Explore, My Estate, About |
| Outsider | Home, Explore, About (no My Estate) |

### Sidebar Menu
- Mirrors the navbar links per role.
- Additionally includes a **List Your Estate** button, visible only to Regular Users and Estate Admins.
- Contains the Client Area button at the bottom (before login).
- After login: shows the user's profile (links to Profile Page) and a Sign Out button beneath it.

---

## Home Page
- Hero section with a background image and housing-related copy/messaging.
- Below the hero text: an **Explore Estates** button (→ Explore Page) and a **Sign In** button (→ Sign In page).
- Remaining sections: general, relevant information introducing/welcoming users to the website.
- Footer at the bottom.

---

## List Your Estate Page
- Accessible only to Regular Users and Estate Admins, via the "List Your Estate" sidebar button.
- Hero section: background image + copy about listing an estate.
- Purpose: lets users submit a new estate for admin approval, and later register houses once approved.

### Estate Listing Form Fields
All fields required unless noted otherwise.

**Estate Details**
- Estate Name — 4–20 characters
- Location — 4–20 characters
- County — 4–10 characters, dropdown selection
- Number of Units — numeric, min 1, max 1000
- Total Area (m²) — numeric, 1–6 digits
- Description — **optional** textarea

**Management Details**
- Management Name — 4–20 characters
- Management Email — must end with `@gmail.com` or `email.com`
- Management Phone Number — must start with `+254`, minimum 9 digits following

**Legal Documentation**
- Title Deed Number — must be validated appropriately

**Media**
- Estate Photo — required, exactly 1 photo (used later on Explore page)
- Amenities Photos — optional, multiple photos allowed

**Consent**
- Checkbox (required): agree to Terms and Conditions and Privacy Policy — both must be clickable links routing to their respective pages.

**Submission**
- "Submit for Approval" button — enabled only when all required fields are valid; sends listing to Communest Admin for review.

---

## My Estate Page
- Accessible only to: Communest Admin, the Estate Admin of that estate, and Tenants of that estate. All other users are blocked from viewing/accessing this page's content for a given estate.
- Hero section: estate photo (from listing), estate name, location, and current estate badge (e.g., Pending / Approved and Verified / Denied).
- Sections: Overview, Management, Notification, Maintenance, Payment, Inquiries.

### Estate Admin View
Granted once the Communest Admin approves the listed estate; My Estate becomes visible in this account's navbar.

**1. Overview Section**
- Summary/overview of all other sections.
- Displays estate info: management name, management email, management phone number, total area.
- Ability to change the hero section's estate picture.

**2. Management Section**
- Ability to register houses under this estate (houses only ever belong to the estate that listed them).
- Entry point leads to a page with two options: **List Houses in Bulk** and **List a House**, with explanatory text for each.

  - **List Houses in Bulk**: upload a CSV file containing multiple houses to register at once. System should attempt to auto-register from the CSV.
  - **List a House** (single house form) fields:
    - House number
    - Total area covered by the house
    - Number of rooms
    - House photos (multiple)
    - Amenities in the house
    - Rent amount
    - Manager's phone number (for prospective tenants to contact)

- Estate Admin can mark a listed house as **Vacant** — it then appears:
  - Under the estate's card on the Explore page (vacant houses list)
  - In the Management section (Vacant Houses list) of My Estate page
- Vacant houses display a **Vacant** badge.
- Estate Admin marks a house **Occupied** once a tenant is found:
  - House gains an **Occupied** badge.
  - It disappears from the Vacant list (Explore page card + Management section) **48 hours** after being marked occupied.
- Separate **Vacant Houses** and **Occupied Houses** sections/views, visible to the Estate Admin only.
- Estate Admin can view full details per rental house: bill payment status (electricity, water, rent), any filed inquiries, and house photos.
- Estate Admin can approve rental proposals here — approval grants the applicant Tenant status and moves the relevant house from Vacant to Occupied.

**3. Notification Section**
- Estate Admin can post notifications/announcements to all tenants via a form: title, event date & time, description → "Post Notification" button.
- Notifications appear to tenants in My Estate page and are also sent automatically via email.
- Estate Admin can view and delete past notifications.

**4. Maintenance Section**
- Estate Admin posts maintenance issues with a status badge: **Scheduled**, **In Progress**, **Resolved**.
- Only the Estate Admin can change a maintenance status (by clicking the badge to select a new one).
- Estate Admin can delete resolved maintenance issues via a delete button.

**5. Payment Section**
- Estate Admin can add/remove payment options for tenants.
- Estate Admin can view each tenant's payment status and manually mark it **Paid** or **Pending** (badge updates accordingly, and reflects on the tenant's view).

**6. Inquiries Section**
- Estate Admin receives and replies to tenant inquiries.
- Displays the tenant's unit, and date/time of inquiry and reply.
- Inquiry badge: **Pending** until answered, then **Resolved** — disappears 48 hours after the tenant views the reply.

### Tenant View
Granted once a regular user's rental proposal is approved for a listed vacant house.

- **Overview Section**: overview of other sections + estate info (same info as admin view).
- **Notification Section**: view announcements/events posted by the Estate Admin.
- **Maintenance Section**: view maintenance issues and their status badges.
- **Payment Section**: view available payment options, pay bills, and see current bill status (Estate Admin updates this manually upon receiving payment).

---

## Explore Page
- Displays all approved estates as cards, updated automatically when a new estate is approved.
- Hero section: background image, welcoming/explore-themed copy, and a **search bar**.
- Each estate card shows detailed estate info (as provided at listing) and a **View Estate** button.
- **View Estate** leads to a detailed view: full description, amenity photos, and currently vacant houses.
  - Each vacant house listing shows: rent amount, photos, additional house info, and management phone number.
  - **Apply to Rent** button → rental application page showing the specific house in detail, with a form collecting:
    - Name
    - Email address (must end with `@gmail.com` or `@email.com`)
    - Phone number
    - (All inputs validated according to their type/format.)
  - **Submit** button sends the rental proposal to that estate's Estate Admin.
- **Filters**:
  - By county (20 total counties, including Nairobi, Nakuru, Mombasa, Eldoret, Kisumu, Kiambu, Thika, Machakos, Meru, and others)
  - By price: Under 10,000 / Under 20,000 / Under 30,000 / Under 40,000 / Under 50,000 / Under 70,000 / Under 100,000
- Footer included.

---

## About Page
- Hero section with a background image (to be supplied) and general copy about the website.
- Content should highlight the platform positively; **do not include a "team" section**.
- Footer included.

---

## Admin Page
- Accessible only to the Communest Admin.
- Hero section: background image (to be supplied) + copy about estate management and Communest generally.
- Sections: **Add Admin** and **Estates**.

**Add Admin Section**
- "Add Admin" button opens a prompt requiring an email address.
- The email must belong to a Regular User account only (not Estate Admin or Tenant accounts).
- The added account gains full Communest Admin status.

**Estates Section**
- Displays submitted estates with status badges: **Pending**, **Approved and Verified**, **Denied**.
- Communest Admin can approve or deny each estate (with a confirmation step required before finalizing).
- On approval: estate becomes visible on the Explore page with an "Approved and Verified" badge across all pages; the Estate Admin receives an email notifying them of approval and prompting them to register houses.
- On denial: Estate Admin receives an email notifying them of denial and to retry in 1 week; the "Denied" badge disappears after 24 hours.

---

## Privacy Policy & Terms and Conditions Pages
- **Privacy Policy**: states that user information will be handled with care and protected.
- **Terms and Conditions**: states that the website owner is protected and not held accountable for information leakage or hacking.
- All Privacy Policy / Terms and Conditions links across the site must correctly route to these pages.

---

## Sign In / Register Page
Accessed via buttons on the Home Page.

**Registration Form Fields**
- Full Name — 4–20 characters
- Email Address — must end with `@gmail.com` or `@email.com`; requires a verification code sent by the system. If not verified, profile shows "Unverified" badge; once verified, shows "Verified" badge.
- Phone Number — must start with `+254`, total of 12 characters (9 digits after prefix); also requires code verification with the same Unverified/Verified badge behavior.
- Password, requiring:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 symbol
  - At least 1 number
  - Minimum 12 characters
  - Include a show/hide password toggle
- Checkbox (required): agree to Terms and Conditions and Privacy Policy.
- "Create Account" button at the bottom.

**Sign In**
- Standard sign-in with email/password.
- "Forgot Password" directs users to contact the Communest email for account retrieval.

**Post-login redirect by role:**
- Communest Admin → Admin Page
- Estate Admin → My Estate Page
- Tenant → My Estate Page
- Regular User → Explore Page

---

## Profile Page
- Allows users to update personal details and profile picture.
- Displays: email address, phone number, profile picture, and account status badge.
- All users can view their badge status here.

**Account Deletion**
- Available to all users **except** Communest Admin and Estate Admin.
- Estate Admin can only request deletion by emailing the Communest Admin.
- Users who can self-delete must confirm the action (permanent loss warning).

**Role-specific features**
- Tenants: "View My Estate" button that navigates directly to their estate's My Estate page.
- Estate Admin: can also view their estate, and edit personal information (changes here should reflect in the estate's management info wherever it's displayed).
- Estate Admin: "Add Admin" button at the bottom of the page — searches for a registered email and grants that account admin status for the estate.

**Sign Out**
- On sign out, all users (regardless of role) are redirected immediately to the Explore Page.

---

## Chatbot
- Includes an FAQ section with answered questions.
- Provides navigation to website links and social links.

## New User Guide
- A step-by-step guide that walks new users through how to use and navigate the site.
- Should trigger by detecting a device/browser that has never logged into the website before.
- Guides the user progressively as they move across different pages.