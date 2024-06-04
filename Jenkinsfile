pipeline {
    agent any

    environment {
        SONARQUBE_ENV = 'SonarQube'
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        SCANNER_HOME = tool name: 'SonarQubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
        SONARQUBE_TOKEN_ID = 'sonarqube-token'
        KUBECONFIG_CREDENTIALS_ID = 'kubeconfig-credentials'
        KUBECONFIG = '/var/jenkins_home/kubeconfigs/kubeconfig'
    }

    tools {
        jdk 'JDK 17'
    }

    stages {
        stage('Git') {
            steps {
                echo 'Getting project from Git'
                git branch: 'main', url: 'https://github.com/RihabHaddad/CI-CD-E-commerce-App.git', credentialsId: 'your-credentials-id'
            }
        }
        stage('Build') {
            steps {
                script {
                    docker.build('test-node-app')
                }
            }
        }
        stage('Unit Tests') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }
        stage('Integration Tests') {
            steps {
                sh 'npm run test:integration'
            }
        }
        stage('Code Quality') {
            steps {
                sh 'java -version'
                sh 'ls -l $SCANNER_HOME/bin/sonar-scanner'
                withSonarQubeEnv(SONARQUBE_ENV) {
                    withCredentials([string(credentialsId: SONARQUBE_TOKEN_ID, variable: 'SONARQUBE_TOKEN')]) {
                        sh '''
                            export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
                            export PATH=$JAVA_HOME/bin:$PATH
                            export PATH=$SCANNER_HOME/bin:$PATH
                            sonar-scanner \
                            -Dsonar.projectKey=CI-CD-E-commerce-App \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://localhost:9000 \
                            -Dsonar.login=$SONARQUBE_TOKEN
                        '''
                    }
                }
            }
        }
        stage('Push to DockerHub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKERHUB_CREDENTIALS_ID, passwordVariable: 'DOCKERHUB_PASSWORD', usernameVariable: 'DOCKERHUB_USERNAME')]) {
                        docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS_ID) {
                            def image = docker.build("rihab26/e-commerceapp:${env.BUILD_NUMBER}")
                            image.push()
                        }
                    }
                }
            }
        }
        stage('Deploy to Staging') {
            steps {
                script {
                    withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                        sh 'kubectl apply -f K8s/Namespace.yaml'
                        sh 'kubectl apply -f K8s/Deployment.yaml'
                        sh 'kubectl apply -f K8s/Service.yaml'
                    }
                }
            }
        }
        stage('End-to-End Tests') {
            steps {
                sh 'npm run test:e2e'
            }
        }
        stage('Deploy to Production') {
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps {
                script {
                    withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                        sh 'kubectl apply -f K8s/Deployment.yaml'
                        sh 'kubectl apply -f K8s/Service.yaml'
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
