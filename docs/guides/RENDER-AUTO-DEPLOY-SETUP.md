# Render Auto Deploy via GitHub Actions

This repo includes a workflow `.github/workflows/render-auto-deploy.yml` that triggers a deploy on Render.com after pushes to `main`.

## 1) Create a Deploy Hook on Render
1. Open https://dashboard.render.com/
2. Go to your Web Service (e.g., `garcia-builder`)
3. Settings → Deploy Hooks → Create Deploy Hook
4. Copy the generated URL (looks like `https://api.render.com/deploy/srv-XXXX?key=YYYY`)

## 2) Add GitHub Secret
1. In GitHub, open this repository → Settings → Secrets and variables → Actions
2. New repository secret:
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: paste the Deploy Hook URL from Render

## 3) When it runs
The workflow runs on:
- Pushes to `main` that modify HTML/CSS/JS, `render.yaml`, or `DEPLOY-TRIGGER.md`
- Manual dispatch (Actions tab → Render Auto Deploy → Run workflow)

## 4) Verify
After a push, check Render → Deploys tab. You should see a new deploy kicked off automatically.

Troubleshooting:
- If the workflow fails with `Missing GitHub secret RENDER_DEPLOY_HOOK_URL`, add the secret as described above.
- Ensure the service on Render corresponds to this repo and serves from the same root (Express `express.static` is configured).
