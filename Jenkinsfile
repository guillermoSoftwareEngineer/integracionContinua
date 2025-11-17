 pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Build & Test') {
            steps {
                script {
                    echo 'Building images...'
                    bat 'docker compose -f %COMPOSE_FILE% build'

                    echo 'Starting services...'
                    bat 'docker compose -f %COMPOSE_FILE% up -d'

                    echo 'Waiting for services...'
                    sleep 15

                    echo 'Running backend tests...'
                    bat 'docker compose -f %COMPOSE_FILE% exec -T backend npm test'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up containers...'
            bat 'docker compose -f %COMPOSE_FILE% down --remove-orphans'
        }
    }
}
