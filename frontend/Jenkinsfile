pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    environment {
        DOCKER_REGISTRY = 'localhost:5000'
        IMAGE_NAME = 'spendr-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        COMPOSE_PROJECT_NAME = "spendr-${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '========== Checking out from GitHub =========='
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    echo "Git Commit: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '========== Installing Dependencies =========='
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo '========== Running Tests =========='
                sh 'npm run test -- --run'
            }
        }

        stage('Build') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo '========== Building Application =========='
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo '========== Building Docker Image =========='
                script {
                    sh '''
                        docker build -t ${IMAGE_NAME}:${IMAGE_TAG} \
                                     -t ${IMAGE_NAME}:latest \
                                     --target test \
                                     -f Dockerfile .
                    '''
                }
            }
        }

        stage('Verify Tests in Container') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo '========== Verifying Tests in Docker Container =========='
                script {
                    sh '''
                        docker run --rm \
                                   --name test-${BUILD_NUMBER} \
                                   ${IMAGE_NAME}:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Build Production Image') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo '========== Building Production Docker Image =========='
                script {
                    sh '''
                        docker build -t ${IMAGE_NAME}:${IMAGE_TAG}-prod \
                                     -t ${IMAGE_NAME}:latest-prod \
                                     --target production \
                                     -f Dockerfile .
                    '''
                }
            }
        }

        stage('Deploy (Mock)') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                echo '========== Deploying Application (Mock) =========='
                sh '''
                    echo "Deploying app version ${IMAGE_TAG}..."
                    echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}-prod"
                    echo "Git Commit: ${GIT_COMMIT_SHORT}"
                    echo "Deployment in progress..."
                    sleep 2
                    echo "Application deployed successfully!"
                '''
            }
        }
    }

    post {
        always {
            echo '========== Cleanup =========='
            script {
                // Stop and remove test containers
                sh '''
                    docker stop test-${BUILD_NUMBER} || true
                    docker rm test-${BUILD_NUMBER} || true
                '''
                
                // Bring down docker-compose services if running
                sh '''
                    COMPOSE_PROJECT_NAME=spendr-${BUILD_NUMBER} docker-compose down || true
                '''
            }
            
            // Archive test results
            junit testResults: '**/test-results.xml', allowEmptyResults: true
            
            // Clean workspace on failure
            cleanWs(
                deleteDirs: true,
                patterns: [
                    [pattern: 'node_modules', type: 'EXCLUDE'],
                    [pattern: '.git', type: 'EXCLUDE']
                ]
            )
        }

        success {
            echo '========== Pipeline Completed Successfully =========='
            echo "Build #${BUILD_NUMBER} completed successfully"
            echo "Docker Image: ${IMAGE_NAME}:${IMAGE_TAG}-prod"
        }

        failure {
            echo '========== Pipeline Failed =========='
            echo "Build #${BUILD_NUMBER} failed"
            // You can add notifications here (email, Slack, etc.)
        }

        unstable {
            echo '========== Pipeline Unstable =========='
            echo "Build #${BUILD_NUMBER} is unstable"
        }
    }
}
