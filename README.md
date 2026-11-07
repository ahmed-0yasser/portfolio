# Ahmed Yasser - Portfolio

Personal portfolio website with an ASP.NET Core back-end.

- Front-end: HTML, CSS, JavaScript (dark/light mode, responsive, project filters)
- Back-end: ASP.NET Core Web API (C#, .NET 10) with Controllers, Services and dependency injection
  - `GET /api/profile` and `GET /api/projects?category=frontend|backend`
  - `POST /api/contact` with server-side validation and rate limiting
  - `GET /api/messages` protected by the `x-admin-key` header

## Run locally

```bash
dotnet run
```

Open http://localhost:3000

Set the `ADMIN_KEY` environment variable to read contact messages.
