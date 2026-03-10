# Frontend Implementation Task

Read the repository rules before starting.

Required reading order:

1. AGENTS.md
2. RULES.md
3. PROJECT_STRUCTURE.md

Follow all constraints defined in those files.

---

# Objective

Implement the frontend of a static website for:

**Original Perfume Workshop Experience**

The site explains the workshop, compares perfume courses, and guides users through a reservation flow.

The site must work as a **static website deployable on GitHub Pages**.

No backend functionality is required.

---

# Implementation Scope

All implementation must be created inside:

site/

Do NOT modify:

docs/
design/
prompts/
txt/

Only work inside the **site/** directory.

---

# Required Directory Structure

Create the following structure if it does not exist.

site/

index.html
about.html
courses.html
course-12blend.html
course-20blend-limited.html
compare.html
flow.html
faq.html
reviews.html
contact.html
access.html

reserve.html
reserve-select-course.html
reserve-select-slot.html
reserve-form.html
reserve-confirm.html
reserve-complete.html

assets/

assets/css/perfume.css

assets/js/main.js

assets/scss/

assets/images/

Ensure the directory:

site/assets/images/

exists even if only placeholder images are used.

---

# Technology Rules

Use only:

HTML
SCSS
CSS
Vanilla JavaScript

Do NOT use:

React
Vue
Svelte
Tailwind
Node build tools
API integrations
Backend frameworks

All pages must work as plain static files.

---

# CSS Isolation Rule

To avoid CSS conflicts with documentation pages:

All styles must be scoped under:

.perfume-site

Example:

.perfume-site .l-header {}
.perfume-site .c-button {}

Every HTML page must include:

<body class="perfume-site">

---

# CSS File

The stylesheet must be:

site/assets/css/perfume.css

HTML pages must reference:

<link rel="stylesheet" href="assets/css/perfume.css">

Do NOT create other global stylesheets.

---

# SCSS Architecture

Use:

FLOCSS + BEM

Prefixes:

l- layout
c- component
p- project
u- utility
is- state
js- javascript hook

Important rule:

js-* classes must NOT contain styles.

---

# Homepage Layout

index.html must contain the following sections in order:

1 hero
2 course comparison
3 reservation flow overview
4 experience steps
5 reviews
6 FAQ preview
7 call-to-action
8 footer

---

# Reviews Section

The homepage must include a **horizontal scrolling review section**.

These reviews represent external platforms:

Google Reviews
Jalan Reviews

Implementation rules:

- horizontal card layout
- overflow-x scroll
- scroll snap enabled
- swipe friendly on mobile
- usable without JavaScript

Each review card should include:

review source
star rating
review text
visitor type
visit date

Add links such as:

"View Google reviews"
"View Jalan reviews"

---

# Reservation Flow

Reservation pages simulate booking using:

sessionStorage

Steps:

course selection
date selection
user information form
confirmation
completion

Available time slots:

11:00
13:00
15:00

Availability states:

Available
Few spots left
Full

Full slots must be disabled.

---

# JavaScript

Create:

site/assets/js/main.js

Implement:

hamburger menu toggle
FAQ accordion
smooth scrolling
reservation session storage
reservation confirmation display
basic form validation
review scroll helpers

JavaScript must not break page rendering if disabled.

---

# Accessibility

Use semantic HTML.

Requirements:

one main element per page
one h1 per page
proper heading hierarchy
labels for form inputs
buttons for interactive controls
aria attributes for toggles

Focus states must be visible.

Do not rely only on color to convey meaning.

---

# Mobile First Design

Breakpoints:

mobile <= 768px
tablet <= 1024px
desktop >= 1025px

Max content width:

1200px

Readable text width:

760–800px

---

# Completion Criteria

Implementation is complete when:

site/ directory contains all pages
site/assets/images/ exists
all pages include body class "perfume-site"
all pages load perfume.css correctly
JavaScript loads without errors
reservation flow works using sessionStorage
homepage reviews scroll horizontally
no broken internal links exist

---

# Final Step

After implementation:

List all created files.