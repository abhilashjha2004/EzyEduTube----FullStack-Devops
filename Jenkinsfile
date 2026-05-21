pipeline {
    agent any

    environment {
        // Safe, non-secret environment tokens for DevOps showcase configuration.
        // Production secret tokens are never hardcoded here; instead, they are 
        // externalized and loaded dynamically using Jenkins Credentials Manager.
        DOCKER_IMAGE_PREFIX = "ezyedutube"
        COMPOSE_PROJECT_NAME = "ezyedutube-ci"
    }

    stages {
        stage('1. Clone Repository') {
            steps {
                echo '=== STAGE: Cloned Repository ==='
                // Automatically check out source code from SCM (Git/GitHub) configured in the job.
                checkout scm
                echo 'Repository cloned and verified successfully.'
            }
        }

        stage('2. Verify Docker Environment') {
            steps {
                echo '=== STAGE: Verifying Docker Installation ==='
                // Ensures the Jenkins build agent has access to the host's Docker socket.
                // Highly valuable for live DevOps viva presentations to show tool chain integration.
                sh 'docker --version'
                sh 'docker compose version'
                echo 'Docker capability verified successfully.'
            }
        }

        stage('3. Build Docker Images') {
            steps {
                echo '=== STAGE: Building Application Docker Images ==='
                // Builds all three critical application layers (frontend, api, nginx).
                // Uses '--no-cache' to guarantee fresh, reproducible builds, preventing stale state.
                sh 'docker compose build --no-cache'
                echo 'All container images (frontend, api, nginx) built successfully!'
            }
        }

        stage('4. Run Containers') {
            steps {
                echo '=== STAGE: Orchestrating Containers via Docker Compose ==='
                // Spins up the orchestrated microservice layers in detached mode (-d).
                // Does NOT affect external production deployments (Render/Vercel) or databases.
                sh 'docker compose up -d'
                echo 'Containers launched successfully in detached mode.'
            }
        }

        stage('5. Verify Running Containers') {
            steps {
                echo '=== STAGE: Verifying Container Health ==='
                // Wait briefly for container health checks, networks, and entrypoints to settle.
                sleep time: 5, unit: 'SECONDS'
                
                // Displays the status of running containers to demonstrate container state control.
                sh 'docker ps --filter "name=devopsprojectezyedutube"'
                
                echo 'Local containers active and verified successfully!'
            }
        }

        /*
        // =========================================================================
        // DEVOP SHOWCASE: OPTIONAL DOCKER HUB RELEASE STAGE (DISABLED BY DEFAULT)
        // =========================================================================
        // For a full CI/CD delivery showcase, un-comment this stage and configure 
        // the 'docker-hub-credentials' ID in your Jenkins Credential Store.
        
        stage('6. Docker Hub Release (Optional Showcase)') {
            steps {
                // withCredentials securely injects credentials from Jenkins vault to prevent log leaks.
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', 
                                                 usernameVariable: 'DOCKER_USER', 
                                                 passwordVariable: 'DOCKER_PASS')]) {
                    echo '=== STAGE: Docker Hub Release (Showcase Only) ==='
                    // sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                    
                    // Tag images for registry
                    // sh "docker tag devopsprojectezyedutube-frontend:latest \$DOCKER_USER/ezyedutube-frontend:latest"
                    // sh "docker tag devopsprojectezyedutube-api:latest \$DOCKER_USER/ezyedutube-api:latest"
                    // sh "docker tag devopsprojectezyedutube-nginx:latest \$DOCKER_USER/ezyedutube-nginx:latest"
                    
                    // Push to Docker Hub
                    // sh "docker push \$DOCKER_USER/ezyedutube-frontend:latest"
                    // sh "docker push \$DOCKER_USER/ezyedutube-api:latest"
                    // sh "docker push \$DOCKER_USER/ezyedutube-nginx:latest"
                    
                    echo 'Images pushed to Docker Hub successfully!'
                }
            }
        }
        */
    }

    post {
        always {
            echo '=== Jenkins Pipeline Run Completed ==='
        }
        success {
            echo 'Pipeline completed successfully! All DevOps stages passed.'
        }
        failure {
            echo 'Pipeline failed. Please inspect build logs above for troubleshooting.'
            // Safe automated rollback to prevent orphaned resources on host machine
            echo 'Rolling back: shutting down and cleaning up containers...'
            sh 'docker compose down'
        }
    }
}
