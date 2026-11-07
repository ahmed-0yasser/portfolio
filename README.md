# Ahmed Yasser - Portfolio

Personal portfolio website with a Node.js + Express back-end.

- Front-end: HTML, CSS, JavaScript (dark/light mode, responsive, project filters)
- Back-end: Express REST API for profile and projects, contact form with validation and rate limiting

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000

Set `ADMIN_KEY` to read contact messages from `GET /api/messages` (header `x-admin-key`).
