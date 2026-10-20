# Farhan’s portfolio

Personal portfolio of **Farhan Labib Shishir**, an International Business student at INSEEC Paris exploring AI, social media, research and content workflows.

> I’m just getting started, but I learn by building.

## What’s here

```
index.html                       Homepage: hero, AI & Automation, Social Media & Research,
                                 Creative Experiments, About, Contact
projects/job-search-system.html  Case study: AI-assisted job-search system
assets/site.js                   Mobile menu, contact-form checks, case-study viewer tabs
```

Plain HTML and CSS with one small script. No build step, no dependencies. Fonts load from Google Fonts (Sora, Manrope, JetBrains Mono). Colours come from the Ultramarine palette: `#071039`, `#0F2270`, `#1A3BB0`, `#2E5DE6`, `#6E92F2`, `#AFC5F8`, `#E6EDFD`.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Publish with GitHub Pages

Settings → Pages → Deploy from a branch → `main` / root. The site is then live at
`https://frhnshishir-dotcom.github.io/portfolio/`.

## Project statuses

Labels describe what is actually built and used, not mock-ups:

| Project | Status |
|---|---|
| AI-assisted job-search system | Working system |
| Notion career command centre | Working system |
| Short-video research & scheduling | In progress |
| Automations for small businesses | Experiment |
| Keyword research | Experiment |
| Market research | Planned |
| Clothing, posters, landing pages, digital menu | Concept / Experiment |

## Still to add

- [ ] Public email address and LinkedIn link (contact section and sidebar)
- [ ] A form service for the contact form (e.g. Formspree or Netlify Forms). Until then, the form checks the fields and tells visitors their message was **not** sent.
- [ ] CV as a PDF, if a download link should replace “available on request”
- [ ] Anonymised screenshots for the job-search case study
