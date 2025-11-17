# Jenkins Multibranch Pipeline - Issue Fix Summary

## Problem

When pushing code to the master branch, Jenkins multibranch pipeline fails with:
```
Error when executing always post condition:
java.io.IOException: CreateProcess error=2, The system cannot find the file specified
```

The pipeline cannot find `docker-compose.test.yml` when trying to execute docker compose commands.

## Root Cause

In a **multibranch pipeline**, Jenkins uses SCM-based checkout by default. The working directory context isn't explicitly set in each shell script, causing relative file paths to fail.

The `post` block runs in a different shell context where the relative path `docker-compose.test.yml` cannot be resolved.

## Solution

The updated `Jenkinsfile` includes:

### 1. **Add Workspace Navigation** 
Every shell script now explicitly changes to the workspace:

```groovy
sh '''
    cd ${WORKSPACE}
    docker compose -f ${DOCKER_COMPOSE_FILE} up -d --build
'''
```

### 2. **Add Setup Stage for Diagnostics**
Verify workspace and files before starting tests:

```groovy
stage('Setup') {
    steps {
        echo "Workspace: ${WORKSPACE}"
        sh 'pwd && ls -la'
    }
}
```

### 3. **Remove Manual Checkout**
Multibranch pipelines don't need explicit checkout - SCM handles it automatically.

### 4. **Robust Post Block**
File existence check before cleanup:

```groovy
if [ -f "${DOCKER_COMPOSE_FILE}" ]; then
    docker compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
else
    echo "WARNING: ${DOCKER_COMPOSE_FILE} not found"
    docker compose down --remove-orphans || true
fi
```

## How to Apply

1. **The Jenkinsfile has already been updated** with all fixes
2. **Commit and push** to master:
   ```powershell
   git add Jenkinsfile
   git commit -m "fix: Jenkins file > add workspace navigation for multibranch pipeline"
   git push origin master
   ```

3. **In Jenkins**, recreate your job as a **Multibranch Pipeline**:
   - New Item → Select **Multibranch Pipeline**
   - Branch Source: GitHub → repository URL
   - Script Path: `Jenkinsfile`
   - Save

4. **GitHub Webhook** (one-time setup):
   - Settings → Webhooks → Add webhook
   - Payload URL: `http://<JENKINS_URL>/github-webhook/`
   - Content type: `application/json`
   - Events: Push events, Pull request events

5. **Test**: Push to master branch - Jenkins should automatically trigger

## Key Changes in Updated Jenkinsfile

| Change | Reason |
|--------|--------|
| Removed manual `checkout()` step | Multibranch pipeline auto-checks out from SCM |
| Added `cd ${WORKSPACE}` in each stage | Ensures correct directory for relative paths |
| Added `Setup` stage with diagnostics | Shows workspace location and available files |
| Added file existence check in post block | Handles cleanup gracefully if file missing |
| Added `disableConcurrentBuilds()` option | Prevents race conditions |
| Increased sleep time to 10s | Gives containers more time to start |

## Verification

After applying the fix, you should see in Jenkins console output:

```
========== Stage: Setup ==========
Workspace: /var/lib/jenkins/workspace/spendr-backend/master
/var/lib/jenkins/workspace/spendr-backend/master
docker-compose.test.yml
Dockerfile
Dockerfile.init
[... more files ...]

========== Stage: Initialize Docker ==========
Current directory: /var/lib/jenkins/workspace/spendr-backend/master
Building and starting containers...
[... docker build output ...]

✓ All tests passed successfully!
```

## Troubleshooting

If issues persist:

### Check 1: Multibranch Pipeline Job Type
```
Jenkins dashboard → spendr-backend job
Should show: "This is a multibranch Pipeline"
```

### Check 2: Jenkinsfile in Repository
```bash
git log --oneline | head -1  # Verify last commit is the Jenkinsfile update
git show HEAD:Jenkinsfile | grep "cd \${WORKSPACE}"  # Should show workspace navigation
```

### Check 3: Docker on Jenkins Agent
SSH into Jenkins agent and run:
```bash
docker --version
docker compose version
docker ps
```

### Check 4: Jenkins Logs
View Jenkins system logs:
```
Manage Jenkins → System Log → All Logs
```

### Check 5: Manual Build Trigger
```
Jenkins dashboard → spendr-backend → Scan Multibranch Pipeline Now
Then click the master branch and "Build Now"
```

## Files Changed

- ✅ `Jenkinsfile` - Updated with workspace navigation and robust error handling
- ✅ `JENKINS_MULTIBRANCH_SETUP.md` - Complete setup guide

## Next Steps

1. Push the updated Jenkinsfile to master
2. Verify multibranch pipeline job configuration in Jenkins
3. Configure GitHub webhook
4. Test by pushing a commit or manually triggering a build
