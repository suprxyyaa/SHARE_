# Deploy SHARE Backend on Render

Render gives you a URL (e.g. `https://share-xxxx.onrender.com`) **only after** the service starts successfully.

## Step 1 — Create Web Service (manual setup)

1. [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect repo: `suprxyyaa/SHARE_`
3. **Settings (critical):**

| Field | Value |
|-------|--------|
| **Name** | `share-api` (any name) |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app.main:app --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT` |

> Do **not** leave Root Directory empty. Do **not** use `sh server.sh` unless Root Directory is `backend`.

## Step 2 — Environment variables (required)

Render → your service → **Environment** → add every variable below.

Copy values from your local `backend/.env`:

| Key | Example / notes |
|-----|-----------------|
| `DATABASE_URL` | Full Neon PostgreSQL URL (`postgresql://...?sslmode=require`) |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `JWT_SECRET` | Long random string (not the dev default) |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRE_MINUTES` | `120` |
| `ADMIN_EMAIL` | `admin@medshare.com` |
| `ADMIN_PASSWORD` | Your admin password |
| `CORS_ORIGINS` | `https://share-chi-weld.vercel.app` (your Vercel URL) |

Click **Save Changes**.

## Step 3 — Deploy

1. **Manual Deploy** → **Deploy latest commit**
2. Open **Logs** and wait for `Build successful` then `Listening at: http://0.0.0.0:XXXX`
3. Top of the page shows your URL: `https://<service-name>.onrender.com`

## Step 4 — Test backend

Open in browser:

```
https://YOUR-RENDER-URL.onrender.com/health
```

Expected: `{"status":"ok","service":"MedShare API"}`

If that works, run seed once (optional, creates tables):

**Shell** tab on Render (or add to build later):

```bash
python seed.py
```

## Step 5 — Connect Vercel frontend

Vercel → Project → **Environment Variables**:

| Key | Value |
|-----|--------|
| `BACKEND_URL` | `https://YOUR-RENDER-URL.onrender.com` (no trailing `/`) |

Redeploy Vercel. Push latest `frontend/lib/axios.ts` if not already deployed.

---

## Common failures

| Log error | Fix |
|-----------|-----|
| `cannot open server.sh: No such file` | Set **Root Directory** = `backend`, or use the **gunicorn** start command above |
| `Port scan timeout` | Start command wrong or app crashed — check logs above this line |
| `ValidationError` / missing env | Add all environment variables in Step 2 |
| `seed.py` / database error during build | Remove `python seed.py` from build; run seed manually after deploy |
| Build OK but instant crash | Missing `DATABASE_URL` or invalid Neon URL |

## Free tier note

Free instances **spin down** after ~15 min idle. First request may take 30–60 seconds (cold start). URL still works once awake.
