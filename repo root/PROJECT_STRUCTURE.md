# PROJECT_STRUCTURE.md
Repository directory structure specification

This file defines the required project structure.

AI coding agents MUST follow this structure when creating files.

Do not move or rename existing directories unless explicitly instructed.

---

# Documentation Source (Important)

Project implementation must follow documentation located in:

docs/
design/

These directories contain the actual project specifications such as:

- project proposal
- sitemap
- wireframes
- design guidelines
- UX requirements
- content structure

Agents MUST read and reflect the documentation under:

docs/
design/

before implementing pages.

AGENTS.md, RULES.md and PROJECT_STRUCTURE.md define repository rules only.

They do NOT replace project documentation.

All user-facing content must reflect the documentation.

---

# Root Directory Structure

repo root
│
├ site/        → Frontend implementation
├ docs/        → Project documentation
├ design/      → Design assets and guidelines
├ prompts/     → AI prompt templates
├ txt/         → Text resources
│
├ AGENTS.md
├ RULES.md
├ PROJECT_STRUCTURE.md

Agents must not modify the root directory layout.

---

# Implementation Directory

All website implementation must exist under:

site/

Do NOT create HTML files outside this directory.

---

# Site Directory Layout

site/
│
├ index.html
├ about.html
├ courses.html
├ course-12blend.html
├ course-20blend-limited.html
├ compare.html
├ flow.html
├ faq.html
├ reviews.html
├ contact.html
├ access.html
│
├ reserve.html
├ reserve-select-course.html
├ reserve-select-slot.html
├ reserve-form.html
├ reserve-confirm.html
├ reserve-complete.html
│
├ assets/
│
│  ├ css/
│  │   └ perfume.css
│  │
│  ├ js/
│  │   └ main.js
│  │
│  ├ scss/
│  │
│  │  ├ foundation/
│  │  ├ layout/
│  │  ├ component/
│  │  ├ project/
│  │  ├ utility/
│  │  └ perfume.scss
│  │
│  └ images/
│
└ README.md

---

# Required Directories

Agents MUST ensure the following directories exist:

site/assets/
site/assets/css/
site/assets/js/
site/assets/scss/
site/assets/images/

If missing, agents should create them.

---

# Prohibited Structure Changes

Agents MUST NOT:

create HTML files outside site/
rename existing directories
delete documentation directories
move assets outside assets/

All assets must remain under:

site/assets/

---

# Asset Placement Rules

Images must be placed in:

site/assets/images/

CSS must be placed in:

site/assets/css/perfume.css

JavaScript must be placed in:

site/assets/js/main.js

SCSS must be placed in:

site/assets/scss/

---

# HTML Linking Rules

HTML files must reference CSS using:

<link rel="stylesheet" href="assets/css/perfume.css">

JavaScript must be referenced using:

<script src="assets/js/main.js"></script>

Paths must remain relative to the site directory.

---

# CSS Namespace Rule

All styles must be scoped under:

.perfume-site

Every HTML page must contain:

<body class="perfume-site">

---

# Language Rule (Important)

User-facing content must be written in **Japanese**.

This includes:

- page titles
- navigation labels
- headings
- button text
- form labels
- helper messages
- CTA text
- review section headings
- reservation flow messages

English placeholder text must NOT be used unless explicitly required.

---

# Structural Stability Rule

Agents must preserve this directory structure.

If additional files are needed, place them in appropriate subdirectories under:

site/assets/

Never create new top-level directories.