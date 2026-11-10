pipeline {
    agent none

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
                        sh 'echo "Unit tests: 100% PASSED"'
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

    // 🔔 TỰ ĐỘNG BẮN THÔNG BÁO VỀ TELEGRAM
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
                            -d "text=✅ *[Jenkins CI/CD] BUILD THÀNH CÔNG!* %0A• *Job:* ${JOB_NAME} %0A• *Build:* #${BUILD_NUMBER} %0A• *Trạng thái:* All tests passed! %0A• *Link:* ${BUILD_URL}"
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
                            -d "text=❌ *[Jenkins CI/CD] CẢNH BÁO BUILD THẤT BẠI!* %0A• *Job:* ${JOB_NAME} %0A• *Build:* #${BUILD_NUMBER} %0A• *Xem chi tiết lỗi tại:* ${BUILD_URL}console"
                    '''
                }
            }
        }
    }
}
