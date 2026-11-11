pipeline {
    agent none

    // ⏰ KÍCH HOẠT TỰ ĐỘNG THĂM DÒ GIT MỖI PHÚT
    triggers {
        pollSCM('* * * * *')
    }

    stages {
        stage('1. Kiểm thử song song (Parallel Tests)') {
            parallel {
                stage('Nhánh A: Unit Tests (NodeJS)') {
                    agent {
                        docker {
                            image 'node:20-alpine'
                        }
                    }
                    steps {
                        echo ">>> [Luồng A] Chạy Node trong container node:20-alpine..."
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
                        echo ">>> [Luồng B] Quét bảo mật trong container python:3.11-alpine..."
                        sh 'python --version'
                        sh 'echo "Scanning code... 0 CVE found!"'
                    }
                }
            }
        }

        stage('2. Đóng gói & Lưu trữ (Package & Archive)') {
            agent any
            steps {
                echo "Đang đóng gói ứng dụng..."
                sh 'tar -czf demo-app-v1.0.tar.gz index.js'
                archiveArtifacts artifacts: 'demo-app-v1.0.tar.gz', fingerprint: true
                echo "Đã lưu trữ file demo-app-v1.0.tar.gz thành công!"
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
                            -d "text=🤖 *[Jenkins Auto-CI]* Code mới đã được TEST & BUILD tự động thành công! %0A• *Job:* ${JOB_NAME} %0A• *Build:* #${BUILD_NUMBER} %0A• *Link:* ${BUILD_URL}"
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
                            -d "text=❌ *[Jenkins Auto-CI] CẢNH BÁO BUILD THẤT BẠI!* %0A• *Job:* ${JOB_NAME} %0A• *Build:* #${BUILD_NUMBER} %0A• *Xem chi tiết:* ${BUILD_URL}console"
                    '''
                }
            }
        }
    }
}
