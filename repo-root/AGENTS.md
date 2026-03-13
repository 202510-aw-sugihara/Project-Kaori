# AGENTS.md
Repository guide for AI coding agents

Scope: This file governs the entire repository.

Read this file before creating or editing code.

---

# Source of Truth

The implementation details of this project are defined in the project documentation.

Primary reference documents are located in:

docs/
design/

These documents define:

- page content
- UI structure
- copywriting
- UX flow
- design rules

AGENTS.md, RULES.md and PROJECT_STRUCTURE.md define **repository rules only**.

They do NOT replace the project documentation.

Agents MUST read and reflect the documentation under:

docs/
design/

before implementing pages.

All user-facing text must be written in **Japanese** unless explicitly specified otherwise.

---

# 1. Project Overview

This repository contains a static website for:

**Original Perfume Workshop Experience**

The website is designed to:

- Explain the workshop experience
- Compare two perfume creation courses
- Reduce beginner anxiety with FAQ and flow
- Guide users to a reservation flow

Target users:

- couples
- tourists
- women in their 20s–40s
- first-time workshop participants

Primary goal:

maximize reservation conversions with clear UX

---

# 2. Implementation Scope

Agents MUST only modify files inside:

site/

Do NOT modify these folders:

docs/
design/
prompts/
txt/

These directories contain documentation and project assets.

---

# 3. Project Structure

All implementation lives under:

site/

Expected structure:

site/
  index.html
  about.html
  courses.html
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
    css/
    js/
    scss/
    images/

Agents MUST ensure this folder exists:

site/assets/images/

Even if only placeholder images are used.

---

# 4. Technology Rules

This project is a static site.

Allowed technologies:

HTML
SCSS
CSS
Vanilla JavaScript

Do NOT introduce:

React
Vue
Svelte
Tailwind
Node build systems
Backend APIs
External frameworks

The site must run as plain static files.

---

# 5. CSS Isolation Rule

Existing documentation may include CSS.

To avoid conflicts:

All styles must be scoped under:

.perfume-site

Example:

.perfume-site .l-header {}
.perfume-site .c-button {}

Every HTML page MUST include:

<body class="perfume-site">

---

# 6. CSS File

The stylesheet must be:

site/assets/css/perfume.css

HTML must reference:

<link rel="stylesheet" href="assets/css/perfume.css">

Do NOT create:

style.css
main.css
global.css

---

# 7. SCSS Architecture

SCSS must follow:

FLOCSS + BEM naming.

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

# 8. Page Layout (index.html)

Homepage section order:

1 hero
2 course comparison
3 reservation flow explanation
4 experience steps
5 reviews
6 faq preview
7 call-to-action
8 footer

Section content must reflect documentation under docs/ and design/.

---

# 9. Reviews Section

Homepage includes a horizontal scrolling review section.

These represent external platforms:

Google
Jalan

Rules:

- horizontal card layout
- overflow-x scroll
- scroll snap enabled
- swipe friendly on mobile
- usable without JavaScript

Each review card includes:

source platform
star rating
review text
visitor type
visit date

External links should lead to:

Google reviews
Jalan reviews

User-facing labels must be written in Japanese.

---

# 10. Reservation Flow

Reservation pages simulate booking.

State management:

sessionStorage

Steps:

course selection
date/time selection
user info form
confirmation
completion

Time slots:

11:00
13:00
15:00

Availability states:

Available
Few spots left
Full

Full slots must be disabled.

---

# 11. JavaScript Responsibilities

File:

site/assets/js/main.js

Implement:

hamburger navigation
FAQ accordion
smooth scrolling
reservation session storage
reservation confirmation display
basic form validation
review scroll helpers

JavaScript must not break page rendering if disabled.

---

# 12. Accessibility

Use semantic HTML.

Requirements:

one main element per page
one h1 per page
correct heading hierarchy
labels for all form fields
button elements for interactive controls
aria attributes for toggle elements

Focus states must be visible.

Do not rely on color alone for meaning.

---

# 13. Mobile First Design

Breakpoints:

mobile <= 768px
tablet <= 1024px
desktop >= 1025px

Content max width:

1200px

Readable text width:

760–800px

---

# 14. Completion Criteria

Implementation is complete when:

site/ directory exists
site/assets/images/ exists
all pages include body class "perfume-site"
all pages load CSS and JS correctly
no broken links between pages
reservation flow works with sessionStorage
homepage review section scrolls horizontally

User-facing copy must be Japanese and reflect project documentation.

---

# 15. Agent Behavior Rules

Agents should:

make small focused changes
avoid unnecessary dependencies
prefer simple static solutions
maintain consistent class naming
preserve existing directory structure

When uncertain:

consult documentation under docs/ and design/.