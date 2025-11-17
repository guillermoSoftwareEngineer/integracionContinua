# Jenkins Windows Configuration Guide

## Summary of Changes

The Jenkinsfile has been updated to use **Windows batch commands** instead of Unix shell commands. All `sh` steps have been replaced with `bat` steps to ensure compatibility with Windows Jenkins agents.

## Key Changes from Unix to Windows

| Unix Command | Windows Equivalent | Jenkinsfile Change |
|-------------|-------------------|-------------------|
| `sh` | `bat` | All shell steps use `bat` |
| `cd ${WORKSPACE}` | `cd /d %WORKSPACE%` | Added `/d` flag for drive changes |
| `pwd` | `%cd%` | Display current directory |
| `ls -la` | `dir` | List directory contents |
| `grep spendr` | `findstr /i "docker-compose"` | Search for files |
| `[ -f file ]` | `if exist "file"` | Check file existence |
| `$?` exit code | `%ERRORLEVEL%` | Check command status |
| `sleep 10` | `timeout /t 10 /nobreak` | Pause execution |
| `[ $? -eq 0 ]` | `if %ERRORLEVEL% equ 0` | Check success |
| `exit 1` | `exit /b 1` | Exit with error code |

## Windows-Specific Configurations

### 1. Drive Change Support
```batch
cd /d %WORKSPACE%
```
The `/d` flag allows changing to a different drive (e.g., from C: to D:) if needed.

### 2. Variable Syntax
```batch
%DOCKER_COMPOSE_FILE%     :: BAT syntax (not %{...})
%cd%                       :: Current directory variable
%ERRORLEVEL%              :: Exit code of last command
%WORKSPACE%               :: Jenkins workspace variable
```

### 3. Conditional Statements
```batch
if not exist "%DOCKER_COMPOSE_FILE%" (
    echo ERROR: File not found!
    exit /b 1
)

if %ERRORLEVEL% equ 0 (
    echo Success!
) else (
    echo Failed!
)
```

### 4. File Operations
```batch
:: Check if file exists
if exist "filename" (...)

:: Check if file does NOT exist
if not exist "filename" (...)

:: List files with filter
dir | findstr /i "search-term"
```

### 5. Process Management
```batch
:: List containers matching a name
for /f "tokens=1" %%i in ('docker ps -a --filter "name=spendr" --quiet') do docker stop %%i 2>nul

:: Note: In batch, loop variables use %%i (double %)
```

### 6. Wait/Sleep Equivalent
```batch
:: Wait 10 seconds
timeout /t 10 /nobreak
```

## Setup Steps for Windows Jenkins Server

### Prerequisites

1. **Jenkins Installed on Windows**
   - Download from: https://www.jenkins.io/download/
   - Install as Windows service or standalone

2. **Docker Desktop Installed**
   ```powershell
   # Verify installation
   docker --version
   docker compose version
   ```

3. **Git Installed**
   ```powershell
   # Verify installation
   git --version
   ```

4. **Jenkins Plugins Installed**
   - Manage Jenkins → Manage Plugins
   - Search and install:
     - ✅ GitHub Integration
     - ✅ Docker Pipeline (optional but recommended)

### Configuration Steps

#### Step 1: Jenkins Agent Configuration

1. Open Jenkins → Manage Jenkins → Nodes and Clouds
2. Click on `Built-in Node` (or your agent)
3. Verify:
   - Labels: `windows` (add if not present)
   - Node Properties: Check "Docker agents can only run jobs with label"

#### Step 2: Job Configuration (Multibranch Pipeline)

1. New Item → Multibranch Pipeline
2. Name: `spendr-backend`
3. Branch Sources:
   - Add Source → GitHub
   - Repository: `https://github.com/YeisonSuarez03/spendr-backend`
   - Credentials: Select or create (GitHub username + personal token)
   - Behaviors: ✅ Discover branches, ✅ Discover PRs

4. Build Configuration:
   - Mode: **by Jenkinsfile**
   - Script Path: `Jenkinsfile`

5. Scan Multibranch Pipeline Triggers:
   - ✅ Periodically if not otherwise run
   - Interval: `1h` (checks every hour)

6. Save

#### Step 3: GitHub Webhook Setup

1. GitHub Repo → Settings → Webhooks → Add webhook
2. Payload URL: `http://<JENKINS_SERVER_IP>:8080/github-webhook/`
3. Content type: `application/json`
4. Events:
   - ✅ Push events
   - ✅ Pull request events
5. Save webhook

#### Step 4: Verify Docker Daemon Access

On Windows Jenkins server:

```powershell
# PowerShell (run as Administrator)

# Check Docker daemon
docker --version
docker compose version

# Test Docker access
docker ps

# Verify docker compose command exists
docker compose --help
```

If Docker is installed via Docker Desktop, it should automatically be available. If not:

```powershell
# Add Docker to PATH (if needed)
$env:PATH += ";C:\Program Files\Docker\Docker\resources\bin"

# Verify again
docker compose version
```

### Windows PATH Configuration (if needed)

If Jenkins cannot find Docker or docker compose:

1. **For Jenkins Service**: Edit Jenkins service environment variables
   ```powershell
   # As Administrator, set environment variable
   setx /M PATH "%PATH%;C:\Program Files\Docker\Docker\resources\bin"
   ```

2. **Restart Jenkins**
   ```powershell
   # Restart Jenkins service
   Restart-Service Jenkins
   ```

### Firewall Configuration (if needed)

If Jenkins is behind a corporate firewall:

1. Allow outbound HTTPS to GitHub (port 443)
2. Allow Docker communication on Windows (port 2375 for TCP, 2376 for TLS)
3. Configure proxy settings in Jenkins:
   - Manage Jenkins → Manage Plugins → Advanced
   - Set HTTP Proxy and HTTPS Proxy if required

## Troubleshooting

### Error: "bat" is not recognized

**Cause**: Jenkins is running on Unix/Linux agent instead of Windows

**Solution**: 
1. Check agent label: Manage Jenkins → Nodes and Clouds
2. Ensure job uses Windows agent or remove agent constraints
3. Add `agent { label 'windows' }` to Jenkinsfile if you have multiple agents

### Error: "docker compose command not found"

**Cause**: Docker is not installed or not in PATH

**Solution**:
```powershell
# On Windows, verify Docker installation
docker --version
docker compose version

# Add to PATH if missing
$env:PATH += ";C:\Program Files\Docker\Docker\resources\bin"

# Verify
docker compose --version
```

### Error: "File not found" in cleanup

**Cause**: Workspace path has changed or file deleted mid-build

**Solution**: Already handled in updated Jenkinsfile:
```batch
if exist "%DOCKER_COMPOSE_FILE%" (
    docker compose down ...
) else (
    echo File not found, using fallback cleanup
)
```

### Error: "Cannot connect to Docker daemon"

**Cause**: Docker Desktop not running

**Solution**:
```powershell
# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait for it to fully start
Start-Sleep -Seconds 15

# Test connection
docker ps
```

## Testing the Pipeline

### Option 1: Manual Trigger

```powershell
# From your repo directory
git push origin master
```

Jenkins webhook will automatically trigger.

### Option 2: Scan Multibranch Pipeline

1. Open Jenkins dashboard
2. Click `spendr-backend` job
3. Click **Scan Multibranch Pipeline Now**
4. Click `master` branch
5. Click **Build Now**

### Option 3: Test with GitHub Push

```powershell
# Push to master
git add .
git commit -m "test: trigger Jenkins"
git push origin master

# Check Jenkins console output
# Jenkins dashboard → spendr-backend → Scan results
```

## Batch Script Syntax Reference

For quick reference, here are Windows batch command equivalents:

```batch
:: Variables
set MYVAR=value              :: Set variable
echo %MYVAR%                 :: Print variable
echo %cd%                    :: Print current directory
echo %ERRORLEVEL%            :: Print last exit code

:: Navigation
cd /d C:\path                :: Change directory (with drive change support)
pushd C:\path                :: Save current dir and change
popd                         :: Return to saved directory

:: File Operations
if exist "file.txt" (...)    :: Check if file exists
if not exist "file.txt" (...) :: Check if file doesn't exist
del /f /q file.txt           :: Delete file
copy source.txt dest.txt     :: Copy file
type file.txt                :: Display file contents

:: Control Flow
if %ERRORLEVEL% equ 0 (...)  :: If command succeeded
if %ERRORLEVEL% neq 0 (...)  :: If command failed
exit /b 1                    :: Exit with error code 1
setlocal enabledelayedexpansion :: Enable delayed expansion

:: Loops
for /f "tokens=1" %%i in ('command') do (...)  :: Parse command output
for /f %%i in ('dir /b *.txt') do (...)        :: Loop through files

:: Process Management
tasklist                     :: List processes
taskkill /PID 1234 /F        :: Kill process by PID
timeout /t 10 /nobreak       :: Wait 10 seconds

:: Docker Commands
docker ps                    :: List running containers
docker ps -a                 :: List all containers
docker compose -f file.yml up -d     :: Start services
docker compose -f file.yml down      :: Stop services
docker logs container_id     :: View container logs
```

## Notes for Windows Jenkins

1. **Case Sensitivity**: Windows is case-insensitive; `/docker-compose.test.yml` works same as `/Docker-Compose.Test.yml`
2. **Path Separators**: Both `/` and `\` work in most commands; use `/` for consistency
3. **Quotes**: Always quote paths with spaces: `"%DOCKER_COMPOSE_FILE%"`
4. **Error Handling**: `%ERRORLEVEL%` resets after each command; capture it immediately
5. **Unicode**: Some Jenkins versions may have charset issues; ensure UTF-8 encoding in files

## Next Steps

1. ✅ Push updated Jenkinsfile to master
2. ✅ Create Multibranch Pipeline job in Jenkins
3. ✅ Configure GitHub webhook
4. ✅ Test with manual trigger or git push
5. ✅ Monitor console output for Windows-specific issues

The pipeline is now fully Windows-compatible!
