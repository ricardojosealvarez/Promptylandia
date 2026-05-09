# Deployment and GitHub Security

## Deployment

The app is a static HTML/CSS/JavaScript site. GitHub Actions deploys the repository contents to GitHub Pages using the official Pages actions.

The workflow is `.github/workflows/deploy.yml`.

It does not inject secrets and does not push commits back to `main`.

Required GitHub Pages setting:

1. Open the repository on GitHub.
2. Go to `Settings -> Pages`.
3. Set `Build and deployment -> Source` to `GitHub Actions`.

## Secrets

Do not add Supabase secret keys to this repository or to frontend code.

Allowed in frontend:

- `sb_publishable_...`

Forbidden in frontend:

- `sb_secret_...`
- legacy `service_role`
- database passwords
- Edge Function secrets

## Recommended Repository Settings

Enable these before commercial use:

- Require two-factor authentication for the GitHub organization/account.
- Add a branch protection rule for `main`.
- Require pull requests before merging to `main`.
- Require at least one approving review, even if this is a solo project and the reviewer is a future collaborator.
- Require status checks to pass before merging once checks exist.
- Disable force pushes to `main`.
- Disable branch deletion for `main`.

## Supabase Deployment Notes

Edge Functions are deployed separately to Supabase. The current production function is versioned in:

- `supabase/functions/prompts-proxy/index.ts`

When changing it, deploy the function and verify:

- non-authenticated calls return `401`
- authenticated non-admin calls return `403`
- authenticated admin writes succeed
- direct REST writes with `sb_publishable_...` fail
