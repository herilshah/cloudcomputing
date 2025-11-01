pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:${env.PATH}"
    }

    stages {
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Push Docker Images') {
            steps {
                echo 'Skipping push stage for local testing'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                // Use your local Docker Desktop cluster
                sh 'kubectl apply -f k8s/'
            }
        }
    }
}
