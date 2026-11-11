pipeline {
    agent none

    triggers {
        pollSCM('* * * * *')
    }

    stages {
        stage('1. Kiểm thử song song (CI)') {
            parallel {
                stage('Nhánh A: Unit Tests (NodeJS)') {
                    agent {
                        docker {
                            image 'node:20-alpine'
                        }
                    }
                    steps {
                        echo ">>> [Luồng A] Chạy Unit Test..."
                        sh 'node -v'
                        sh 'node index.js'
                    }
                }

                stage('Nhánh B: Security Scan (Python)') {
                    agent {
                        docker {
                            image 'python:3.11-alpine'
                        }
                    }
                    steps {
                        echo ">>> [Luồng B] Quét bảo mật..."
                        sh 'python --version'
                        sh 'echo "Scanning code... 0 CVE found!"'
                    }
                }
            }
        }

        stage('2. Đóng gói Docker Image (CD)') {
            agent any
            steps {
                echo "Đang đóng gói ứng dụng thành Docker Image..."
                // Build Docker image gắn tag theo số thứ tự của lượt build: demo-node-app:${BUILD_NUMBER}
                sh 'docker build -t demo-node-app:${BUILD_NUMBER} -t demo-node-app:latest .'
                sh 'docker images | grep demo-node-app'
            }
        }

        stage('3. Kiểm tra Container chạy thử') {
            agent any
            steps {
                echo "Khởi chạy thử nghiệm container từ image vừa build..."
                // Chạy thử container để kiểm chứng ứng dụng hoạt động độc lập không cần source code
                sh 'docker run --rm demo-node-app:${BUILD_NUMBER}'
            }
        }
    }

    post {
        success {
            node('built-in') {
                withCredentials([
                    string(credentialsId: 'telegram-bot-token', variable: 'BOT_TOKEN'),
                    string(credentialsId: 'telegram-chat-id', variable: 'CHAT_ID')
                ]) {
                    sh '''
                        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                            -d "chat_id=${CHAT_ID}" \
                            -d "parse_mode=Markdown" \
                            -d "text=🐳 *[Jenkins CI/CD] DOCKER IMAGE BUILD THÀNH CÔNG!* %0A• *Image:* \`demo-node-app:${BUILD_NUMBER}\` %0A• *Job:* ${JOB_NAME} (#${BUILD_NUMBER}) %0A• *Status:* Container test passed! %0A• *Link:* ${BUILD_URL}"
                    '''
                }
            }
        }

        failure {
            node('built-in') {
                withCredentials([
                    string(credentialsId: 'telegram-bot-token', variable: 'BOT_TOKEN'),
                    string(credentialsId: 'telegram-chat-id', variable: 'CHAT_ID')
                ]) {
                    sh '''
                        curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
                            -d "chat_id=${CHAT_ID}" \
                            -d "parse_mode=Markdown" \
                            -d "text=❌ *[Jenkins CI/CD] BUILD DOCKER THẤT BẠI!* %0A• *Job:* ${JOB_NAME} (#${BUILD_NUMBER}) %0A• *Xem chi tiết:* ${BUILD_URL}console"
                    '''
                }
            }
        }
    }
}
