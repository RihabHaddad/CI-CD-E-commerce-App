pipeline {
    agent any

    environment {
        SONARQUBE_ENV = 'SonarQube'
        SCANNER_HOME = tool name: 'SonarQubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
        SONARQUBE_TOKEN_ID = 'sonarqube-token'
        KUBECONFIG_CREDENTIALS_ID = 'kubeconfig'
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
    }

    tools {
        jdk 'JDK 17'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }
        stage('Checkout') {
            steps {
                retry(3) {
                    echo 'Getting project from Git'
                    checkout([$class: 'GitSCM',
                        branches: [[name: '*/main']],
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [[$class: 'CloneOption', noTags: false, reference: '', shallow: true, depth: 1, timeout: 30]],
                        submoduleCfg: [],
                        userRemoteConfigs: [[url: 'https://github.com/RihabHaddad/CI-CD-E-commerce-App.git']]
                    ])
                }
            }
        }
        stage('Build') {
            steps {
                script {
                    docker.build('rihab26/e-commerceapp:latest')
                }
            }
        }
        stage('Unit Tests') {
            steps {
                script {
                    sh 'npm install'
                    sh 'npm run test:unit '
                }
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
                            def image = docker.image('rihab26/e-commerceapp:latest')
                            image.push()
                        }
                    }
                }
            }
        }
        stage('Deploy to Staging') {
            steps {
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    retry(3) {
                        sh 'kubectl apply -f K8s/Namespace.yml --kubeconfig $KUBECONFIG'
                        sh 'kubectl apply -f K8s/Deployment.yml --kubeconfig $KUBECONFIG'
                        sh 'kubectl apply -f K8s/Service.yml --kubeconfig $KUBECONFIG'
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
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    retry(3) {
                        sh 'kubectl apply -f K8s/Deployment.yml --kubeconfig $KUBECONFIG'
                        sh 'kubectl apply -f K8s/Service.yml --kubeconfig $KUBECONFIG'
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
