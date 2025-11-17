pipeline {
    agent any

    environment {
        // Docker and Git configuration
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        
        // Test configuration
        TEST_COMMAND = 'npm test'
        
        // Deployment simulation
        DEPLOY_MESSAGE = 'Deploying app to server...'
    }

    options {
        // Keep last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        
        // Add timestamps to console output
        timestamps()
        
        // Timeout after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
        
        // Disable concurrent builds for safety
        disableConcurrentBuilds()
    }

    stages {
        stage('Setup') {
            steps {
                echo '========== Stage: Setup ========== '
                echo "Workspace: ${WORKSPACE}"
                echo "Current directory:"
                bat '''
                    cd /d %WORKSPACE%
                    echo Current directory: %cd%
                    dir
                '''
            }
        }

        stage('Initialize Docker') {
            steps {
                echo '========== Stage: Initialize Docker =========='
                echo "Starting Docker containers using ${DOCKER_COMPOSE_FILE}..."
                bat '''
                    cd /d %WORKSPACE%
                    echo Current directory: %cd%
                    echo Files present:
                    dir | findstr /i "docker-compose"
                    
                    if not exist "%DOCKER_COMPOSE_FILE%" (
                        echo ERROR: %DOCKER_COMPOSE_FILE% not found!
                        exit /b 1
                    )
                    
                    echo Building and starting containers...
                    docker compose -f %DOCKER_COMPOSE_FILE% up -d --build
                    
                    echo Waiting for services to be ready...
                    timeout /t 10 /nobreak
                    
                    echo Current running containers:
                    docker compose -f %DOCKER_COMPOSE_FILE% ps
                '''
                echo 'Docker containers initialized successfully'
            }
        }

        stage('Execute Tests') {
            steps {
                echo '========== Stage: Execute Tests =========='
                echo 'Running Jest tests inside app container...'
                script {
                    def testResult = bat(
                        returnStatus: true,
                        script: '''
                            cd /d %WORKSPACE%
                            echo Running tests...
                            docker compose -f %DOCKER_COMPOSE_FILE% run --rm app %TEST_COMMAND%
                        '''
                    )
                    if (testResult != 0) {
                        error("Tests failed with exit code ${testResult}")
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                // Only deploy if on master branch and previous stages succeeded
                branch 'master'
                // Add condition to only deploy on successful build
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo '========== Stage: Deploy =========='
                echo "${DEPLOY_MESSAGE}"
                bat '''
                    echo Simulating deployment to production server...
                    echo Deploying app...
                    echo ✓ Deployment simulation complete!
                '''
            }
        }
    }

    post {
        always {
            echo '========== Post: Cleanup =========='
            echo 'Bringing down all Docker containers...'
            bat '''
                cd /d %WORKSPACE% || echo Failed to cd to workspace
                echo Current directory: %cd%
                
                docker compose -f %DOCKER_COMPOSE_FILE% down --remove-orphans
                if %ERRORLEVEL% neq 0 (
                    echo Warning: docker compose down had non-zero exit code, continuing...
                )
                
                echo Cleanup complete
            '''
        }

        success {
            echo '========== Build Successful =========='
            echo '✓ Pipeline completed successfully'
        }

        failure {
            echo '========== Build Failed =========='
            echo '✗ Pipeline failed. Check logs above for details.'
        }

        unstable {
            echo '========== Build Unstable =========='
            echo '⚠ Pipeline completed with warnings.'
        }

        cleanup {
            echo '========== Final Cleanup =========='
            deleteDir()
        }
    }
}
