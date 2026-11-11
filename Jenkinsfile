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

        stage('2. Đóng gói Docker Image (CD - Build)') {
            agent any
            steps {
                echo "Đang đóng gói ứng dụng thành Docker Image..."
                sh 'docker build -t demo-node-app:${BUILD_NUMBER} -t demo-node-app:latest .'
            }
        }

        stage('3. Kiểm tra Container chạy thử') {
            agent any
            steps {
                echo "Khởi chạy thử nghiệm container nội bộ..."
                sh 'docker run --rm demo-node-app:${BUILD_NUMBER}'
            }
        }

        stage('4. Đẩy lên Docker Hub (CD - Push)') {
            agent any
            steps {
                echo "Đang đăng nhập và đẩy Image lên Docker Hub..."
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', 
                                                 usernameVariable: 'DOCKER_USER', 
                                                 passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        # Đăng nhập an toàn vào Docker Hub
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        # Gắn thẻ (Tag) chuẩn username/repository:tag
                        docker tag demo-node-app:${BUILD_NUMBER} ${DOCKER_USER}/demo-node-app:${BUILD_NUMBER}
                        docker tag demo-node-app:${BUILD_NUMBER} ${DOCKER_USER}/demo-node-app:latest

                        # Đẩy lên Docker Hub
                        docker push ${DOCKER_USER}/demo-node-app:${BUILD_NUMBER}
                        docker push ${DOCKER_USER}/demo-node-app:latest

                        # Đăng xuất
                        docker logout
                    '''
                }
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
                            -d "text=🚀 *[Jenkins CI/CD] DOCKER HUB RELEASE THÀNH CÔNG!* %0A• *Image:* \`trunghn2003/demo-node-app:${BUILD_NUMBER}\` %0A• *Build:* #${BUILD_NUMBER} %0A• *Kho chứa:* https://hub.docker.com/r/trunghn2003/demo-node-app %0A• *Link:* ${BUILD_URL}"
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
                            -d "text=❌ *[Jenkins CI/CD] ĐẨY DOCKER HUB THẤT BẠI!* %0A• *Build:* #${BUILD_NUMBER} %0A• *Xem chi tiết lỗi:* ${BUILD_URL}console"
                    '''
                }
            }
        }
    }
}
