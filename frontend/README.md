# Health App Admin — React frontend

Separate React + Vite application. The Express backend remains in `../backend`.

## Start locally

Backend terminal:

```bash
cd health-app/backend
npm install
npm start
```

Frontend terminal:

```bash
cd health-app/frontend
npm install
npm run dev
```

Open http://localhost:3000. Vite proxies `/api` to http://localhost:8000. If your backend port differs, copy `.env.example` to `.env` and adjust `BACKEND_URL`.

## Email OTP and admin setup

Configure these values in **backend/.env**, then restart the backend:

```dotenv
ADMIN_EMAILS=your-admin-email@example.com
SMTP_HOST=your-provider-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-provider-smtp-password
SMTP_FROM=your-verified-sender@example.com
```

Use your email provider's SMTP credentials. For providers requiring an app password, use that rather than your normal mailbox password. Port 465 uses `SMTP_SECURE=true`; port 587 uses STARTTLS. Never place SMTP credentials or JWT secrets in frontend environment variables.

Register with an email listed in `ADMIN_EMAILS`, submit the code received by email, and enter the dashboard. Existing users can sign in if their email is allowlisted. Both registration and login require a password followed by email OTP; no bypass or code logging is implemented. Without configured SMTP, authentication returns 503 and remains locked.

OTP expires in 5 minutes, permits 5 attempts, and has a 60-second resend cooldown. Resend repeats the initial register/login request and replaces the previous code. Registration creates the account only after verification. The admin session is stored in sessionStorage for the current browser tab and survives hard refresh. Access tokens last up to 15 minutes and refresh tokens rotate automatically. The server enforces a fixed one-hour deadline from OTP verification; refresh never extends it. Closing the tab clears its session storage; expiry and explicit logout clear saved tokens. Expired sessions return to the sign-in screen.

## Dashboard

- Overview: users, health records, active devices, and today's received records (UTC).
- Users: registered accounts, email, status, and registration time.
- Health records: all users' synced measurements, search, metric and date filters, and record details.
- Devices: registered devices, user IDs, platform, status, and last sync.
- Lists default to 20 records per page, with 10/20/50/100 page-size options; date filters use inclusive UTC days.
- The dashboard shows real backend data; empty datasets show an empty state.

For persistence, configure MongoDB and set `USE_MONGODB=true` in the backend. In-memory mode resets users, OTP challenges, and records on restart. MongoDB mode persists OTP challenges and uses atomic consumption; ensure indexes are created, including the unique challenge email and TTL indexes.

## Build / deploy

```bash
npm run build
```

Serve `dist/` using your frontend host. Proxy `/api` to the Express backend, or configure `VITE_API_BASE_URL` with its HTTPS origin before building and allow the frontend origin in backend `ALLOWED_ORIGINS`. Never publish backend `.env` files. No external deployment is included.

## Verification

`npm run build` checks frontend bundling. Run `npm test` in `../backend` for email-OTP and admin-access integration tests. Tests replace email delivery with an in-process stub and never send actual emails. MongoDB and real SMTP must be verified with your own configured services before deployment.


## User management

Open Users and click the row's details arrow to see the user profile, point balance, health-record/device counts, and separate paginated health-record/device lists. Search, metric/date filters, and page size are applied by backend queries. Suspend/activate requires confirmation; admin/self accounts are protected. Suspended users lose access, and reactivation requires a new sign-in. User status filters are available on the main Users list. Overview counts are fetched independently of typing into list filters, and searches are debounced with canceled stale requests.

Permanent public User IDs (`USR-…`) appear on the Users list, user details and admin profile. They are searchable, server-assigned and independent of MongoDB IDs.
