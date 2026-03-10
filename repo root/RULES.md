# RULES.md
Mandatory rules for AI coding agents

These rules override any other instructions.

AI agents must follow these constraints when modifying this repository.

---

# 1. Documentation Source (Critical Rule)

Project specifications are defined in the documentation located in:

docs/
design/

These directories contain the authoritative information for:

- page structure
- content
- UI requirements
- UX flows
- copywriting
- design guidelines

Agents MUST read and reflect the documentation under:

docs/
design/

before implementing any pages.

AGENTS.md, RULES.md and PROJECT_STRUCTURE.md define repository rules only.

They do NOT replace the project documentation.

---

# 2. Language Rule (Critical Rule)

All **user-facing content MUST be written in Japanese.**

This includes:

- page titles
- navigation labels
- headings
- button text
- form labels
- helper messages
- CTA text
- review section headings
- reservation messages
- FAQ content

English placeholder text must NOT be used.

Exception:
technical identifiers such as class names may remain English.

---

# 3. Modification Scope

Agents MUST only create or modify files inside:

site/

Agents MUST NOT modify any files in:

docs/
design/
prompts/
txt/

These directories contain documentation and design assets.

---

# 4. Project Type

This project is a **static website**.

Allowed technologies:

HTML
SCSS
CSS
Vanilla JavaScript

Do NOT introduce:

React
Vue
Svelte
Tailwind CSS
Node.js build systems
API integrations
Backend services
external frameworks

All pages must work as plain static files.

---

# 5. CSS Isolation (Critical Rule)

To avoid style conflicts with documentation files, all styles must be scoped under:

.perfume-site

Example:

.perfume-site .l-header {}
.perfume-site .c-button {}

Every HTML page MUST include:

<body class="perfume-site">

Failure to include this will break the documentation site.

---

# 6. CSS File Rule

The only stylesheet allowed is:

site/assets/css/perfume.css

HTML pages must reference:

<link rel="stylesheet" href="assets/css/perfume.css">

Do NOT create:

style.css
main.css
global.css

---

# 7. Required Directory

Agents MUST ensure this directory exists:

site/assets/images/

Even if only placeholder images are used.

---

# 8. SCSS Architecture

SCSS must follow:

FLOCSS architecture + BEM naming.

Prefix rules:

l- layout
c- component
p- project
u- utility
is- state
js- javascript hook

Important rule:

js-* classes MUST NOT contain styles.

---

# 9. JavaScript Restrictions

JavaScript must remain minimal.

Allowed:

navigation toggle
faq accordion
smooth scrolling
reservation flow logic
form validation

Do NOT introduce:

external libraries
frameworks
bundlers

JavaScript must not break page rendering if disabled.

---

# 10. Reservation Flow

Reservation is a **simulated booking system**.

State management must use:

sessionStorage

Steps:

course selection
date selection
user info form
confirmation
completion

Do NOT implement backend logic.

---

# 11. Homepage Reviews

Homepage must include a horizontal scrolling review section.

Review sources represent external platforms:

Google reviews
Jalan reviews

Implementation rules:

horizontal card layout
overflow-x scroll
scroll-snap support
mobile swipe friendly

JavaScript must not be required for scrolling.

---

# 12. Accessibility

All pages must use semantic HTML.

Requirements:

one main element per page
one h1 per page
proper heading hierarchy
labels for form inputs
button elements for interactive controls

Focus states must be visible.

Do not rely on color alone to convey meaning.

---

# 13. Performance

Avoid heavy scripts.

Prefer:

CSS solutions
native browser features

Do not add unnecessary code.

---

# 14. Agent Behavior Rules

Agents must:

make minimal changes
avoid unnecessary complexity
prefer simple solutions
maintain existing directory structure

When uncertain:

consult documentation under docs/ and design/.

---

# 15. Completion Requirements

Implementation is complete when:

site/ directory contains all pages
site/assets/images/ exists
CSS is scoped under .perfume-site
all HTML pages link perfume.css
no broken internal links exist
reservation flow works using sessionStorage

All user-facing text must be Japanese and reflect the documentation.