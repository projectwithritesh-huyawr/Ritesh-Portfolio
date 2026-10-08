# Ritesh Sahebrav Rajput Portfolio

A premium, static GitHub Pages portfolio with an optional Express REST API, MongoDB Atlas storage, and a private admin CMS. The existing site remains at the repository root so its current GitHub Pages URL, portrait, animations, theme toggle, custom cursor, responsive layout, and visual identity remain intact. The root files are the frontend; `backend/` contains the separately deployed Node.js API; `admin/` contains the static sign-in and CMS.

## Project layout

```text
index.html, style.css, script.js, config.js   Static frontend (GitHub Pages root)
assets/                                      Existing portrait, project artwork, favicon
admin/                                       Static private CMS interface
backend/src/config/                          MongoDB connection
backend/src/controllers/                     API handlers
backend/src/middleware/                       Authentication, validation, errors, limits
backend/src/models/                           Mongoose collection models
backend/src/routes/                           REST API routes
backend/src/scripts/                          Safe initial admin and portfolio seed scripts
backend/test/                                 API tests that do not need Atlas credentials
```

## Setup required

The application code is ready, but the live contact form, database-backed content, visitor analytics, and admin sign-in need your own MongoDB Atlas database, a deployed Node.js host, and environment variables. No database connection or deployment is claimed until you complete those steps.

### 1. Install Node.js

Install Node.js 20 or newer. Confirm both commands work in a terminal:

```powershell
node --version
npm --version
```

### 2. Create a MongoDB Atlas database

1. Create an account at MongoDB Atlas and create a free or paid cluster.
2. In **Database Access**, create a database user with a strong, unique password. This database user is separate from the portfolio admin account.
3. In **Network Access**, allow the outbound IP addresses used by your backend host. Prefer a private network connection or a stable, narrow IP allowlist when your host supports it.
4. Choose **Connect**, then **Drivers**, and copy the Node.js connection string. Replace its username, password, and database name with the values you created. URL-encode special characters in the database password.
5. Keep the connection string private. Do not put it in `config.js`, frontend JavaScript, source control, screenshots, or public deployment logs.

### 3. Configure the backend locally

In PowerShell, from the repository root:

```powershell
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and set:

- `MONGODB_URI`: the private Atlas connection string.
- `JWT_SECRET`: a newly generated, random secret with at least 32 bytes of randomness.
- `ADMIN_EMAIL`: the email address you will use to sign in.
- `ADMIN_PASSWORD`: a unique password of at least 16 characters.
- `CLIENT_URL`: `http://localhost:8000` for local frontend testing.
- `VISITOR_HASH_SECRET`: a separate random secret used only to hash visitor IP addresses.
- `NOTIFICATION_EMAIL`: already set in the example to `projectwithriteshh@gmail.com`; this is where contact notifications are delivered.

The form collects name, mobile number, email, subject, and message. All five are saved with the contact record. To deliver notifications to `projectwithriteshh@gmail.com`, turn on 2-Step Verification for that Google account and create a Google **App Password**. Use the App Password only in the backend `.env` or hosting provider's private environment settings; never use or publish the normal Gmail password.

For Gmail, set these backend values:

```text
NOTIFICATION_EMAIL=projectwithriteshh@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=projectwithriteshh@gmail.com
EMAIL_PASSWORD=<Google App Password, not the normal Gmail password>
EMAIL_FROM=Ritesh Portfolio <projectwithriteshh@gmail.com>
```

Until those SMTP settings are present and valid, the API still saves the message in MongoDB and honestly reports that email notification is not configured or could not be delivered. Configure the same private values on the backend hosting service for production.

Create your first admin and optionally seed the three genuine portfolio projects and the skills already shown on the site:

```powershell
cd backend
npm install
npm run seed:admin
npm run seed:portfolio
npm run dev
```

`seed:admin` reads the email and password from `backend/.env`, hashes the password with bcrypt, and refuses to overwrite an existing account. It never puts credentials into source code. `seed:portfolio` inserts the Library Management System, Surat BRTS Website, Kids Corner Website, and skills already listed on the portfolio. It does not overwrite existing edits.

### 4. Run the frontend locally

In a second terminal, from the repository root:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. Edit `config.js` and set `API_BASE_URL` to `http://localhost:5000/api` while testing locally:

```js
window.PORTFOLIO_CONFIG = {
  API_BASE_URL: 'http://localhost:5000/api'
};
```

The browser frontend never contains database credentials or admin secrets. If the API URL is blank or unavailable, the original authored project and skill content remains on the page. The contact form requires a configured API and displays a send error rather than claiming success when the API is unreachable.

The API health endpoint is `http://localhost:5000/api/health`. It is a process liveness check and does not claim that MongoDB is connected. Database-backed endpoints return `503` until Atlas is configured and connected.

### 5. Run backend tests

```powershell
cd backend
npm test
```

These tests cover health, allowed and blocked CORS origins, validation, malformed JSON, `404` responses, and unauthenticated admin requests. They do not need Atlas. Successful database writes, admin login, SMTP delivery, and analytics require the credentials and services described above.

## Deploy the backend

Choose a Node.js hosting provider such as Render, Railway, or another service that runs persistent Express applications. Create a web service from this repository and set its service/root directory to `backend`. Use Node.js 20 or newer, install with `npm install`, and start with `npm start`.

Set these values in the hosting provider's private environment-variable settings, not in repository files:

```text
NODE_ENV=production
PORT=<provided by the host, if required>
MONGODB_URI=<private Atlas connection string>
JWT_SECRET=<new random secret>
JWT_EXPIRES_IN=8h
CLIENT_URL=<exact deployed GitHub Pages origin>
ADMIN_EMAIL=<your admin sign-in email>
ADMIN_PASSWORD=<strong initial admin password>
ADMIN_NAME=Ritesh Sahebrav Rajput
VISITOR_HASH_SECRET=<separate random secret>
EMAIL_HOST=<optional mail provider host>
EMAIL_PORT=465
EMAIL_USER=projectwithriteshh@gmail.com
EMAIL_PASSWORD=<private Google App Password>
EMAIL_FROM=Ritesh Portfolio <projectwithriteshh@gmail.com>
NOTIFICATION_EMAIL=projectwithriteshh@gmail.com
```

Use the exact frontend origin in `CLIENT_URL`, with no path or trailing slash. For a project site, the origin is normally `https://<username>.github.io`; GitHub Pages' repository path is not part of the origin. Do not set production CORS to `*`. Configure the hosting provider's health-check path as `/api/health` if it supports health checks.

After deployment, verify `https://<your-api-host>/api/health` returns `{"success":true,"message":"Ritesh Portfolio API is running"}`. Then run `npm run seed:admin` and `npm run seed:portfolio` in the deployed service's shell/console, or run them from a trusted local machine using the same private environment variables. Do not publish the service shell or `.env` values.

## Deploy the frontend to GitHub Pages

1. In `config.js`, set `API_BASE_URL` to your deployed backend URL ending in `/api`, for example `https://<your-api-host>/api`. This is a public URL, not a secret.
2. Commit and push the static site, `admin/`, and `config.js` to the repository's configured GitHub Pages branch/folder.
3. Confirm the existing root portfolio still loads, then visit `/admin/` under the same GitHub Pages repository path and sign in.
4. Confirm `CLIENT_URL` on the backend matches the actual Pages origin, and test contact submission and admin content changes.

The API and GitHub Pages are separate origins. Requests work only after the backend CORS allowlist is configured with the exact GitHub Pages origin. Never add `.env`, `node_modules/`, credentials, or service secrets to the repository. Root and backend `.gitignore` files exclude environment files and dependencies.

## REST API

All endpoints are under `/api`. Successful responses use `success: true`, a `data` property when there is a result, and a short `message`. Errors use `success: false` and a safe message. Admin requests use `Authorization: Bearer <token>`; the browser keeps the token in session storage and the API invalidates it on sign-out.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | API process health |
| POST | `/auth/login` | Public, rate limited | Admin sign-in |
| GET | `/auth/me` | Admin | Verify current session |
| POST | `/auth/logout` | Admin | Revoke current admin tokens |
| POST | `/contact` | Public, validated, rate limited | Save name, phone, email, subject, and message; notify `NOTIFICATION_EMAIL` when SMTP is configured |
| GET | `/projects` | Public | List projects in display order |
| GET | `/projects/:slug` | Public | Read a project |
| POST | `/projects` | Admin | Create a project |
| PUT | `/projects/:id` | Admin | Update or reorder a project |
| DELETE | `/projects/:id` | Admin | Delete a project |
| GET | `/skills` | Public | List skills |
| POST | `/skills` | Admin | Create a skill |
| PUT | `/skills/:id` | Admin | Update or reorder a skill |
| DELETE | `/skills/:id` | Admin | Delete a skill |
| GET | `/messages` | Admin | List contact messages; optional `?status=unread` |
| GET | `/messages/:id` | Admin | Read a message (marks unread messages as read) |
| PATCH | `/messages/:id/status` | Admin | Set `unread`, `read`, or `replied` |
| DELETE | `/messages/:id` | Admin | Delete a message |
| POST | `/visitors` | Public, rate limited | Record a page visit with a keyed IP hash |
| GET | `/visitors/stats` | Admin | Visit total, latest visits, popular pages |

## Safety and privacy

- Passwords are stored as bcrypt hashes. Admin provisioning is a one-time, environment-driven script.
- JWTs expire and are revoked on sign-out by incrementing the admin token version.
- Helmet, allowlisted CORS, field validation, bounded JSON bodies, and rate limits protect the API.
- Public visitor tracking stores a keyed IP hash, a short user-agent string, a sanitized page path, and a timestamp. The raw IP is not stored. Set a private `VISITOR_HASH_SECRET` in each environment.
- No image upload endpoint is provided; project images use HTTPS URLs or safe relative paths.
- The admin page is a static login shell; all private data and every write operation are protected and authorized by the API. Hiding dashboard controls is not the security boundary.# Ritesh Sahebrav Rajput Portfolio

A premium dark minimal portfolio website for Ritesh Sahebrav Rajput, designed as a luxury creative developer portfolio with responsive layout, theme toggle, custom cursor, and modern interactions.

## Project structure

- `index.html` — content and semantic structure
- `style.css` — design system, layout, responsiveness, and premium visual styling
- `script.js` — interactions, animation hooks, form validation, theme persistence, and portrait integration
- `assets/images/` — local images and portrait assets
- `assets/favicon/` — favicon files

## Photo integration

Place your own professional portrait in one of these paths to use it automatically:

- `assets/images/portrait.jpg`
- `assets/images/portrait.jpeg`
- `assets/images/portrait.png`
- `assets/images/portrait.webp`

If no photo is present, the page automatically falls back to a clean editorial placeholder.

## Run locally

Open the project in your browser directly, or serve it locally:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Notes

- No fake employers, certifications, or achievements are included.
- The education section clearly states the current BCA pursuit.
- The contact form sends name, mobile number, email, subject, and message to the API. Email delivery requires the private SMTP settings above.
