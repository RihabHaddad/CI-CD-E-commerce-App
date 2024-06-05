pipeline {
    agent any

    environment {
        SONARQUBE_ENV = 'SonarQube'
        SCANNER_HOME = tool name: 'SonarQubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
        SONARQUBE_TOKEN_ID = 'sonarqube-token'
        KUBECONFIG_CREDENTIALS_ID = 'kubeconfig'
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
                echo 'Getting project from Git'
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [[$class: 'CloneOption', noTags: false, reference: '', shallow: true, depth: 1, timeout: 10]],
                    submoduleCfg: [],
                    userRemoteConfigs: [[url: 'https://github.com/RihabHaddad/CI-CD-E-commerce-App.git']]
                ])
            }
        }

        stage('Deploy to Staging') {
            steps {
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    sh 'kubectl apply -f K8s/Namespace.yml --kubeconfig $KUBECONFIG'
                    sh 'kubectl apply -f K8s/Deployment.yml --kubeconfig $KUBECONFIG'
                    sh 'kubectl apply -f K8s/Service.yml --kubeconfig $KUBECONFIG'
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
                    sh 'kubectl apply -f K8s/Deployment.yml --kubeconfig $KUBECONFIG'
                    sh 'kubectl apply -f K8s/Service.yml --kubeconfig $KUBECONFIG'
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
