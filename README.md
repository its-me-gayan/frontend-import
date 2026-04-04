# ChatClose LK Frontend (Integrated)

This frontend is now wired to the Spring Boot backend in `../`.

## What is integrated

- Pipeline board loads from `GET /api/deals/pipeline`
- Inbox loads from `GET /api/inbox`
- Drag-drop stage move syncs to `POST /api/deals/{id}/move-stage`
- Chat send syncs to `POST /api/deals/{id}/reply`
- Mark read syncs to `POST /api/inbox/{dealId}/read`
- If backend/token is unavailable, UI falls back to local mock data

## Configure

1. Copy env file:

```bash
cp .env.example .env
```

2. Set backend URL + tenant slug in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_TENANT_SLUG=colombo-tech
```

## Run

```bash
npm install
npm run dev
```

## Authenticate (store token)

There is no login screen yet, so create a token once and store it in localStorage.

Example (PowerShell):

```powershell
$body = @{ email = "owner@colombotech.lk"; password = "Admin1234!" } | ConvertTo-Json
$res = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/auth/login" -Headers @{"X-Tenant-Slug"="colombo-tech"} -ContentType "application/json" -Body $body
$res.data.accessToken
```

Then in browser console:

```javascript
localStorage.setItem("chatclose_token", "<PASTE_TOKEN_HERE>");
```

Refresh the app.

## Build / test

```bash
npm run build
npm run test
```
