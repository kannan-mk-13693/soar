# Playbook Execution Architecture — Docs

This folder splits the **Playbook Execution Architecture** HLD into three execution sub-categories, each with its own folder for content + diagrams.

## Layout

```
docs/playbook-execution/
├── index.html              ← landing page (3 sub-tiles)
├── doc.css                 ← shared styling for all sub-pages
├── README.md               ← this file
├── priority/
│   ├── index.html          ← Playbook Execution with Priority (two-lane pipeline)
│   └── assets/
│       ├── flowchart-enqueue.png
│       ├── component-architecture-overview.png
│       └── component-architecture-detail.png
├── audit/
│   ├── index.html          ← Playbook Audit Execution (DB → Elasticsearch)
│   └── assets/
│       └── flowchart-audit.png
└── ondemand/
    ├── index.html          ← Playbook OnDemand Execution (live WebSocket)
    └── assets/
        ├── architecture-diagram.png
        └── workflow-diagram.png
```

## Source PDFs

Content was extracted from these three PDFs in `E:\SOAR TA Review\Learn Playbook Execution\`:

- `Playbook Execution.pdf` → `priority/`
- `Playbook Audit Data Flow.pdf` → `audit/`
- `OnDemand Playbook Execution.pdf` → `ondemand/`

## How to update content

1. **Text changes:** edit the relevant `<sub-folder>/index.html` — content lives in `<section class="card">` blocks.
2. **Diagram changes:** drop the new PNG into `<sub-folder>/assets/` using the same filename. No HTML change needed.
3. **Styling changes:** edit `doc.css` (single source of truth — applies to all sub-pages and the landing page).

## Wiring in the tracker

The main tracker (`/index.html`) links to these pages from the **Docs** tab → **High-Level Design (HLD)** section. The single "Playbook Execution Architecture" tile has been replaced with three sub-tiles pointing here.
