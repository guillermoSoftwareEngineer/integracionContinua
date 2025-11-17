# Jenkins Multibranch Pipeline Setup Guide

## Issue: "Cannot find file specified" Error

The error you encountered occurs because Jenkins in a **multibranch pipeline** uses SCM-based checkout by default, and the working directory handling is different from standalone pipelines.

### Root Causes

1. **Checkout by SCM**: Multibranch pipelines automatically checkout code based on the branch, but don't need manual checkout step
2. **Working Directory Context**: The `post` block runs in a different shell context where `${WORKSPACE}` might not be set correctly
3. **Missing Path References**: Using relative paths without explicit directory changes can cause "file not found" errors

## Solution

The updated `Jenkinsfile` now includes:

✅ **Setup Stage**: Verifies workspace and files are present
✅ **Explicit `cd ${WORKSPACE}`**: Changes to workspace in each stage
✅ **File Existence Check**: Validates `docker-compose.test.yml` exists before using it
✅ **Graceful Fallback**: In post block, handles missing file gracefully
✅ **Better Diagnostics**: Logs current directory and file listings

## Multibranch Pipeline Configuration

### Step 1: Create the Multibranch Pipeline Job

1. Open Jenkins dashboard
2. Click **New Item**
3. Enter Job Name: `spendr-backend`
4. Select **Multibranch Pipeline**
5. Click **OK**

### Step 2: Configure GitHub Branch Source

In the pipeline configuration:

1. **Branch Sources** section:
   - Click **Add Source** → **GitHub**
   - Repository HTTPS URL: `https://github.com/YeisonSuarez03/spendr-backend`
   - Credentials: Select or create GitHub credentials
   - Behaviors: 
     - ✅ Discover branches
     - ✅ Discover pull requests
     - (Optional) Filter by name/pattern

2. **Build Configuration**:
   - Mode: **by Jenkinsfile**
   - Script Path: `Jenkinsfile` (default - matches our file location)

3. **Scan Multibranch Pipeline Triggers**:
   - Check: **Periodically if not otherwise run**
   - Interval: `1h` (or as needed)

4. Save the job

### Step 3: Configure GitHub Webhook (for push events)

In your GitHub repository settings:

1. Go to **Settings** → **Webhooks**
2. Click **Add webhook**
3. Payload URL: `http://<JENKINS_URL>/github-webhook/`
   - Example: `http://jenkins.example.com:8080/github-webhook/`
4. Content type: `application/json`
5. Events: 
   - ✅ Push events
   - ✅ Pull request events
6. Active: ✅ Enabled
7. Save webhook

### Step 4: Verify Jenkins Configuration

Ensure Jenkins has:

1. **GitHub Integration Plugin**: 
   - Manage Jenkins → Manage Plugins
   - Search: "GitHub Integration"
   - Install if not present

2. **Docker Compose Capability**:
   - Verify `docker` and `docker compose` are available on Jenkins agent
   - SSH into Jenkins machine and run: `docker --version && docker compose version`

3. **Dockerfile Reading**:
   - Verify Dockerfile and Dockerfile.init are in the repo root
   - Multibranch pipeline will clone them automatically

### Step 5: Test the Pipeline

#### Method 1: Manual Trigger
1. Open the `spendr-backend` multibranch pipeline job
2. Click **Scan Multibranch Pipeline Now**
3. Wait for branches to be discovered
4. Click the `master` branch build

#### Method 2: GitHub Push
Push a commit to the `master` branch:
```bash
git add .
git commit -m "test: trigger Jenkins pipeline"
git push origin master
```

GitHub webhook will automatically trigger Jenkins.

## Troubleshooting Commands

If the build still fails, check these on your Jenkins agent machine:

```bash
# Verify Docker is available
docker --version
docker compose version

# Check if Git repo is cloned
ls -la /var/lib/jenkins/workspace/spendr-backend/master/

# Verify docker-compose.test.yml exists
file /var/lib/jenkins/workspace/spendr-backend/master/docker-compose.test.yml

# Check Docker daemon status
systemctl status docker

# View Jenkins logs
tail -f /var/log/jenkins/jenkins.log
```

## What Changed in the Jenkinsfile

### Before (Standalone Pipeline)
```groovy
// Manual checkout - not needed for multibranch
checkout([...])

// Relative paths without cd
docker compose -f ${DOCKER_COMPOSE_FILE} up -d --build
```

### After (Multibranch Pipeline Compatible)
```groovy
// Added Setup stage for diagnostics
stage('Setup') {
    steps {
        sh 'pwd && ls -la'
    }
}

// Explicit workspace navigation
sh '''
    cd ${WORKSPACE}
    docker compose -f ${DOCKER_COMPOSE_FILE} up -d --build
'''

// Graceful file handling in post
if [ -f "${DOCKER_COMPOSE_FILE}" ]; then
    docker compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans
else
    docker compose down --remove-orphans || true
fi
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find file specified" | Added `cd ${WORKSPACE}` before all docker compose commands |
| Post block fails during cleanup | Added file existence check and fallback cleanup |
| Containers not stopping | Added `|| true` to allow cleanup to continue on failure |
| Builds running concurrently | Added `disableConcurrentBuilds()` option |
| Workspace not found | Added `${WORKSPACE}` explicit reference |

## Key Improvements

1. **Diagnostic Stage**: `Setup` stage prints workspace location and files
2. **Explicit Paths**: Every shell script changes to `${WORKSPACE}` first
3. **File Validation**: Checks for `docker-compose.test.yml` before using it
4. **Robust Cleanup**: Post block handles missing files gracefully
5. **Error Handling**: Uses `|| true` to prevent cleanup from failing the build

## Next Steps

1. ✅ Update Jenkinsfile in your repo
2. ✅ Push changes to master: `git push origin master`
3. ✅ Create multibranch pipeline job in Jenkins (follow Step 1-4 above)
4. ✅ Configure GitHub webhook
5. ✅ Trigger first build manually or via git push
6. ✅ Monitor console output for "Setup" stage diagnostics

## Expected Output

When the pipeline runs successfully, you should see:

```
========== Stage: Setup ==========
Workspace: /var/lib/jenkins/workspace/spendr-backend/master
Current directory:
/var/lib/jenkins/workspace/spendr-backend/master
[... file listing ...]

========== Stage: Initialize Docker ==========
Current directory: /var/lib/jenkins/workspace/spendr-backend/master
Files present:
[... docker-compose.test.yml listed ...]
Building and starting containers...
[... docker build output ...]

========== Stage: Execute Tests ==========
Running tests...
[... test output ...]
✓ All tests passed successfully!
```

---

**Need Help?**
- Check Jenkins system logs: Manage Jenkins → System Log
- View build console: Click build number → Console Output
- SSH into Jenkins agent and manually run commands from the Troubleshooting Commands section
