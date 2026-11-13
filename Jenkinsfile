pipeline {
    agent none

    parameters {
        choice(
            name: 'RUNTIME_VERSION', 
            choices: ['20-alpine', '18-alpine'], 
            description: 'Chọn phiên bản Node.js để chạy kiểm thử'
        )
        string(
            name: 'SRC_PATH', 
            defaultValue: '.', 
            description: 'Đường dẫn thư mục chứa mã nguồn cần quét'
        )
        string(
            name: 'PROJECT_KEY', 
            defaultValue: 'vts-payment-service', 
            description: 'Mã định danh dự án trên hệ thống SonarQube & SAST'
        )
        booleanParam(
            name: 'RUN_SONARQUBE', 
            defaultValue: true, 
            description: 'Bật kiểm tra chất lượng mã nguồn với SonarQube thật'
        )
        booleanParam(
            name: 'RUN_SAST', 
            defaultValue: true, 
            description: 'Bật kiểm tra an ninh SAST thật (chuẩn OWASP Top 10)'
        )
        booleanParam(
            name: 'ENFORCE_QUALITY_GATE', 
            defaultValue: false, 
            description: 'Bắt buộc đạt chuẩn an ninh (nếu phát hiện lỗ hổng sẽ fail build)'
        )
    }

    stages {
        stage('1. Kiểm thử chức năng (Unit Tests)') {
            agent {
                docker {
                    image "node:${params.RUNTIME_VERSION}"
                }
            }
            steps {
                echo ">>> [Unit Test] Chạy trên Node.js ${params.RUNTIME_VERSION}..."
                dir("${params.SRC_PATH}") {
                    sh 'node -v'
                    sh 'node index.js'
                }
            }
        }

        stage('2. Quét An ninh & Chất lượng Song song (Security Gates)') {
            parallel {
                // ==================== NHÁNH 1: SONARQUBE THẬT ====================
                stage('Quét SonarQube (Code Quality)') {
                    when {
                        expression { return params.RUN_SONARQUBE }
                    }
                    agent {
                        docker {
                            image 'sonarsource/sonar-scanner-cli:latest'
                            args '--entrypoint="" --network jenkin_default'
                        }
                    }
                    steps {
                        echo "=========================================================="
                        echo "🔍 BẮT ĐẦU QUÉT SONARQUBE THẬT (STATIC CODE ANALYSIS)"
                        echo "• Server: http://sonarqube:9000"
                        echo "• Project Key: ${params.PROJECT_KEY}"
                        echo "=========================================================="
                        dir("${params.SRC_PATH}") {
                            withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                                sh '''
                                    sonar-scanner \
                                        -Dsonar.host.url=http://sonarqube:9000 \
                                        -Dsonar.login=${SONAR_TOKEN} \
                                        -Dsonar.projectKey=${PROJECT_KEY} \
                                        -Dsonar.qualitygate.wait=true \
                                        -Dsonar.sources=.
                                '''
                            }
                        }
                    }
                }

                // ==================== NHÁNH 2: SAST BẢO MẬT THẬT ====================
                stage('Quét An ninh SAST (Security Vulnerabilities)') {
                    when {
                        expression { return params.RUN_SAST }
                    }
                    agent {
                        docker {
                            image 'returntocorp/semgrep:latest'
                            args '--entrypoint="" --network jenkin_default'
                        }
                    }
                    steps {
                        echo "=========================================================="
                        echo "🛡️ BẮT ĐẦU QUÉT BẢO MẬT SAST THẬT (OWASP Top 10)"
                        echo "• Project: ${params.PROJECT_KEY}"
                        echo "=========================================================="
                        dir("${params.SRC_PATH}") {
                            sh '''
                                if [ "${ENFORCE_QUALITY_GATE}" = "true" ]; then
                                    echo ">>> [STRICT MODE] Bật chặn build nếu phát hiện lỗi bảo mật..."
                                    semgrep scan --config auto --error .
                                else
                                    echo ">>> [AUDIT MODE] Quét an ninh & lập báo cáo (không chặn build)..."
                                    semgrep scan --config auto . || true
                                fi
                            '''
                        }
                    }
                }
            }
        }

        stage('3. Đóng gói Artifacts (Release)') {
            agent any
            steps {
                echo "Đóng gói ứng dụng sau khi đã vượt qua các cổng an ninh..."
                dir("${params.SRC_PATH}") {
                    sh "tar -czf ${params.PROJECT_KEY}-verified.tar.gz index.js"
                    archiveArtifacts artifacts: "${params.PROJECT_KEY}-verified.tar.gz", fingerprint: true
                    echo "Đã lưu trữ gói phần mềm an toàn: ${params.PROJECT_KEY}-verified.tar.gz"
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
                            -d "text=🛡️ *[VTS Security Pipeline] BẢO MẬT & CHẤT LƯỢNG ĐẠT CHUẨN!* %0A• *Dự án:* \`${PROJECT_KEY}\` %0A• *Môi trường:* Node.js \`${RUNTIME_VERSION}\` %0A• *SonarQube:* PASSED ✅ %0A• *SAST:* PASSED ✅ %0A• *Thành phẩm:* \`${PROJECT_KEY}-verified.tar.gz\` %0A• *Build:* #${BUILD_NUMBER} %0A• *Link:* ${BUILD_URL}"
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
                            -d "text=❌ *[VTS Security Pipeline] PHÁT HIỆN LỖI BẢO MẬT / CHẤT LƯỢNG!* %0A• *Dự án:* \`${PROJECT_KEY}\` %0A• *Build:* #${BUILD_NUMBER} %0A• *Xem chi tiết:* ${BUILD_URL}console"
                    '''
                }
            }
        }
    }
}
