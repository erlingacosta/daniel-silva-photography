# Frontend Build Environment Setup

## Critical: NEXT_PUBLIC_ Variables are Baked at Build Time

**Important:** Next.js `NEXT_PUBLIC_*` environment variables are compiled into the JavaScript bundle at BUILD TIME. They cannot be changed at runtime without rebuilding the frontend.

This means:
- ✅ Local development: Use `.env.local` and restart dev server
- ✅ Production build: MUST set env vars BEFORE building
- ❌ Cannot change API URL after deployment without rebuilding

## DigitalOcean App Spec Configuration

In your `app.yaml` (App Spec) for DigitalOcean App Platform:

```yaml
services:
- name: daniel-silva-frontend
  github:
    repo: erlingacosta/daniel-silva-photography
    branch: main
    deploy_on_push: true
  build_command: npm ci && npm run build
  envs:
    # CRITICAL: Use BUILD_TIME or RUN_AND_BUILD_TIME scope
    - key: NEXT_PUBLIC_API_URL
      scope: BUILD_TIME  # or RUN_AND_BUILD_TIME
      value: https://www.danielsilvaphotography.com/api
    
    - key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      scope: BUILD_TIME
      value: pk_live_YOUR_KEY_HERE
  
  http_routes:
    - path: /
      component_name: daniel-silva-frontend
```

**Why `BUILD_TIME` is required:**
- Next.js needs these values during the build process
- If set as RUN_TIME only, they won't be available during `npm run build`
- Use `BUILD_TIME` for variables that never change
- Use `RUN_AND_BUILD_TIME` if you might need runtime changes (requires rebuild to take effect)

## Local Development

Create `.env.local` in the frontend folder:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Then:
```bash
npm install
npm run dev
```

Changes to `.env.local` require restarting the dev server to take effect.

## Verifying the Build

After deploying, check that the API URL was baked in correctly:

1. Open DevTools → Sources
2. Search for `/api/auth/login` in the bundled JavaScript
3. Verify it shows the correct domain (e.g., `https://www.danielsilvaphotography.com/api/auth/login`)
4. If it shows `http://localhost:8000`, the build didn't pick up the env var — rebuild with the correct var set

## If API URL Changes

**You MUST rebuild the frontend:**

1. Update the environment variable in DigitalOcean App Spec
2. Trigger a rebuild/redeploy (Push to GitHub or manually rebuild in DO dashboard)
3. Wait for the build to complete
4. Clear browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete)
5. Test the login endpoint

## Troubleshooting

**Frontend still calling localhost:8000:**
- Check that `NEXT_PUBLIC_API_URL` is set in the build environment (not just runtime)
- Rebuild the frontend with the env var set
- Clear browser cache
- Check browser console for the actual API URLs being called

**Login returns 404 at /api/auth/login:**
- Verify the backend is running and `/api/auth/login` is accessible
- Check the frontend browser console for the full URL being called
- Ensure CORS is enabled on the backend for your frontend domain
