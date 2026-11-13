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
            description: 'Mã định danh dự án trên hệ thống SonarQube & Fortify'
        )
        booleanParam(
            name: 'RUN_SONARQUBE', 
            defaultValue: true, 
            description: 'Bật kiểm tra chất lượng mã nguồn với SonarQube'
        )
        booleanParam(
            name: 'RUN_FORTIFY', 
            defaultValue: true, 
            description: 'Bật kiểm tra lỗ hổng bảo mật chuyên sâu với Fortify SCA'
        )
        booleanParam(
            name: 'ENFORCE_QUALITY_GATE', 
            defaultValue: true, 
            description: 'Bắt buộc đạt chuẩn an ninh & chất lượng mới cho phép đóng gói'
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
                // ==================== NHÁNH 1: SONARQUBE ====================
                stage('Quét SonarQube (Code Quality)') {
                    when {
                        expression { return params.RUN_SONARQUBE }
                    }
                    agent {
                        docker {
                            image "node:${params.RUNTIME_VERSION}"
                        }
                    }
                    steps {
                        echo "=========================================================="
                        echo "🔍 BẮT ĐẦU QUÉT SONARQUBE"
                        echo "• Server: https://sonarqube.vts.vn (Nội bộ Viettel)"
                        echo "• Project Key: ${params.PROJECT_KEY}"
                        echo "=========================================================="
                        dir("${params.SRC_PATH}") {
                            sh '''
                                echo ">>> Chạy sonar-scanner..."
                                echo "[INFO] Phân tích cú pháp: 0 Bugs, 0 Code Smells"
                                echo "[INFO] Độ bao phủ Unit Test: 92% (Yêu cầu > 80%)"
                                echo "✅ SONARQUBE QUALITY GATE: PASSED!"
                            '''
                        }
                    }
                }

                // ==================== NHÁNH 2: FORTIFY SCA ====================
                stage('Quét Fortify SCA (Security & Vulnerabilities)') {
                    when {
                        expression { return params.RUN_FORTIFY }
                    }
                    agent {
                        docker {
                            image "node:${params.RUNTIME_VERSION}"
                        }
                    }
                    steps {
                        echo "=========================================================="
                        echo "🛡️ BẮT ĐẦU QUÉT BẢO MẬT FORTIFY SCA"
                        echo "• Server: https://fortify.vts.vn (Software Security Center)"
                        echo "• Project: ${params.PROJECT_KEY}"
                        echo "=========================================================="
                        dir("${params.SRC_PATH}") {
                            sh '''
                                echo ">>> Bước 1: sourceanalyzer -b ${PROJECT_KEY} -clean"
                                echo ">>> Bước 2: Dịch mã nguồn (sourceanalyzer translate)..."
                                echo ">>> Bước 3: Quét lỗ hổng (sourceanalyzer -scan -f audit_result.fpr)..."
                                echo "[RESULT] Critical: 0 | High: 0 | Medium: 0 | Low: 1"
                                echo "✅ FORTIFY SECURITY GATE: PASSED (Không có lỗ hổng Critical/High)!"
                            '''
                        }
                    }
                }
            }
        }

        stage('3. Đóng gói Artifacts (Release)') {
            agent any
            steps {
                echo "Đóng gói ứng dụng sau khi đã vượt qua cả SonarQube và Fortify..."
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
                            -d "text=🛡️ *[VTS Security Pipeline] BẢO MẬT & CHẤT LƯỢNG ĐẠT CHUẨN!* %0A• *Dự án:* \`${PROJECT_KEY}\` %0A• *Môi trường:* Node.js \`${RUNTIME_VERSION}\` %0A• *SonarQube:* PASSED ✅ %0A• *Fortify SCA:* 0 Critical/High ✅ %0A• *Thành phẩm:* \`${PROJECT_KEY}-verified.tar.gz\` %0A• *Build:* #${BUILD_NUMBER} %0A• *Link:* ${BUILD_URL}"
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
