# Branch Protection & CI/CD Workflow

## Branch Strategy

```
feature/* → develop → main
     ↓          ↓        ↓
  Preview   Staging  Production
```

## Setup Instructions

### 1. Vercel Project Setup

1. Connect the repo to Vercel
2. Set Production Branch to `main`
3. Enable Preview Deployments for all branches
4. Configure environment variables in Vercel dashboard

### 2. GitHub Branch Protection Rules

#### For `main` branch:
- Go to Settings → Branches → Add rule
- Branch name pattern: `main`
- Enable:
  - [x] Require a pull request before merging
  - [x] Require approvals (1)
  - [x] Require status checks to pass
    - Select: `lint-and-typecheck`, `build`
  - [x] Require branches to be up to date
  - [x] Require conversation resolution

#### For `develop` branch:
- Branch name pattern: `develop`
- Enable:
  - [x] Require a pull request before merging
  - [x] Require status checks to pass
    - Select: `lint-and-typecheck`, `build`
  - [x] Require branches to be up to date

### 3. Claude Code Review Setup

Add Claude as a reviewer for PRs:
1. In GitHub Settings → Integrations → GitHub Apps
2. Or use the Claude Code CLI to review PRs manually:
   ```bash
   # Review a PR with Claude
   /compound-engineering:workflows:review <PR-number>
   ```

## Workflow

### Feature Development
```bash
# Start from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Work on feature...
git add .
git commit -m "feat: description"
git push -u origin feature/my-feature

# Create PR: feature/my-feature → develop
# - Automatic Vercel preview deployment
# - CI checks run
# - Claude review (optional)
# - Merge when approved
```

### Releasing to Production
```bash
# Create PR: develop → main
# - More thorough review
# - All status checks must pass
# - Merge triggers production deployment
```

## Environment Mapping

| Branch | Vercel Environment | URL Pattern |
|--------|-------------------|-------------|
| main | Production | your-app.vercel.app |
| develop | Preview | develop-*.vercel.app |
| feature/* | Preview | feature-*-*.vercel.app |
