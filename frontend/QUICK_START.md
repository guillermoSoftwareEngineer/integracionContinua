# Quick Start: Jenkins CI/CD Setup

## In 5 Minutes

### 1. Choose Your Jenkinsfile
- **Standard**: `Jenkinsfile` - Basic test, build, deploy
- **Full Stack**: `Jenkinsfile.docker-compose` - With integration testing

### 2. Jenkins Job Setup
```
1. New Item → Pipeline
2. Name: spendr-frontend
3. Definition: Pipeline script from SCM
4. SCM: Git
5. Repository URL: https://github.com/YeisonSuarez03/spendr-frontend.git
6. Script Path: Jenkinsfile
7. Save
```

### 3. Trigger Build
```
Build Now
```

### 4. Monitor Pipeline
```
Console Output → Follow stages
```

## What Happens in the Pipeline

```
✓ Code Checkout
  ↓
✓ Dependencies Install
  ↓
✓ Run Tests (must pass)
  ↓
✓ Build App (only if tests pass)
  ↓
✓ Build Docker Images
  ↓
✓ Run Tests in Container
  ↓
✓ Build Production Image
  ↓
✓ Deploy (Mock)
  ↓
✓ Cleanup
```

## Testing Locally (Before Jenkins)

```bash
# Install dependencies
npm install

# Run tests
npm run test -- --run

# Expected: 7 passed (7)
```

## Docker Testing Locally

```bash
# Build test image
docker build -t spendr-frontend:test --target test -f Dockerfile .

# Run tests in container
docker run --rm spendr-frontend:test

# Build production image
docker build -t spendr-frontend:latest --target production -f Dockerfile .

# Run production container
docker run -p 80:80 spendr-frontend:latest
```

## What Gets Built

### Docker Images
1. **spendr-frontend:test**
   - Size: ~400MB
   - Purpose: Run Vitest suite
   - Base: Node 20 Alpine

2. **spendr-frontend:latest-prod**
   - Size: ~50MB
   - Purpose: Production serving
   - Base: Nginx Alpine

### Artifacts
- Test results XML (if configured)
- Build artifacts in Jenkins workspace
- Docker images in Docker registry

## Environment Setup

### Jenkins Credentials (Optional)
```
Manage Jenkins → Credentials
  Add GitHub credentials
  Add Docker registry credentials
```

### Environment Variables
```
VITE_SECRET_KEY = IDSOFTWARE123456
VITE_API_URL = http://localhost:3000
DOCKER_REGISTRY = localhost:5000
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Build fails at test stage | Run `npm run test -- --run` locally |
| Docker build fails | Check disk space: `docker system df` |
| Port already in use | Kill process: `lsof -i :80` |
| Tests timeout | Increase timeout in Jenkinsfile |

## Useful Commands

```bash
# Jenkins
jenkins-cli build spendr-frontend
jenkins-cli tail spendr-frontend

# Docker
docker ps                          # Running containers
docker images                      # Available images
docker logs <container>           # Container logs
docker-compose ps                 # Compose services
docker-compose logs               # Compose logs

# Git
git log --oneline                # Recent commits
git status                        # Current status
```

## Next Steps

1. ✅ Set up Jenkins job (see Jenkins Job Setup above)
2. ✅ Configure GitHub webhook (optional for auto-trigger)
3. ✅ Run first build
4. ✅ Monitor deployment
5. ✅ Celebrate! 🎉

## Files Overview

| File | Purpose |
|------|---------|
| `Jenkinsfile` | Standard CI/CD pipeline |
| `Jenkinsfile.docker-compose` | Full stack CI/CD pipeline |
| `Dockerfile` | Multi-stage Docker build |
| `docker-compose.yml` | Local dev environment |
| `JENKINS_SETUP.md` | Detailed setup guide |
| `JENKINS_CI_CD_COMPLETE.md` | Complete overview |
| `CI_CD_COMMANDS.sh` | Command reference |

## Support

For detailed information, see:
- `JENKINS_SETUP.md` - Complete setup guide
- `JENKINS_CI_CD_COMPLETE.md` - Architecture overview
- `CI_CD_COMMANDS.sh` - Command examples

---

Ready to deploy! 🚀
