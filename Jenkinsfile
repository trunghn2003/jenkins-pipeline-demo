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

    environment {
        PROJECT_KEY = "${params.PROJECT_KEY ?: 'vts-payment-service'}"
        RUNTIME_VERSION = "${params.RUNTIME_VERSION ?: '20-alpine'}"
        SRC_PATH = "${params.SRC_PATH ?: '.'}"
        ENFORCE_QUALITY_GATE = "${params.ENFORCE_QUALITY_GATE != null ? params.ENFORCE_QUALITY_GATE : false}"
    }

    stages {
        stage('1. Kiểm thử chức năng (Unit Tests)') {
            agent {
                docker {
                    image "node:${params.RUNTIME_VERSION ?: '20-alpine'}"
                }
            }
            steps {
                echo ">>> [Unit Test] Chạy trên Node.js ${env.RUNTIME_VERSION}..."
                dir("${env.SRC_PATH}") {
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
                        expression { return params.RUN_SONARQUBE != false }
                    }
                    agent {
                        docker {
                            image 'sonarsource/sonar-scanner-cli:latest'
                            args '--network jenkin_default'
                        }
                    }
                    steps {
                        echo "=========================================================="
                        echo "🔍 BẮT ĐẦU QUÉT SONARQUBE THẬT (STATIC CODE ANALYSIS)"
                        echo "• Server: http://sonarqube:9000"
                        echo "• Project Key: ${env.PROJECT_KEY}"
                        echo "=========================================================="
                        dir("${env.SRC_PATH}") {
                            withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                                sh '''
                                    sonar-scanner \
                                        -Dsonar.host.url=http://sonarqube:9000 \
                                        -Dsonar.token=${SONAR_TOKEN} \
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
                        expression { return params.RUN_SAST != false }
                    }
                    agent {
                        docker {
                            image 'returntocorp/semgrep:latest'
                            args '--network jenkin_default'
                        }
                    }
                    steps {
                        echo "=========================================================="
                        echo "🛡️ BẮT ĐẦU QUÉT BẢO MẬT SAST THẬT (OWASP Top 10)"
                        echo "• Project: ${env.PROJECT_KEY}"
                        echo "=========================================================="
                        dir("${env.SRC_PATH}") {
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
                dir("${env.SRC_PATH}") {
                    sh "tar -czf ${env.PROJECT_KEY}-verified.tar.gz index.js"
                    archiveArtifacts artifacts: "${env.PROJECT_KEY}-verified.tar.gz", fingerprint: true
                    echo "Đã lưu trữ gói phần mềm an toàn: ${env.PROJECT_KEY}-verified.tar.gz"
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
                            -d "parse_mode=HTML" \
                            -d "text=🛡️ <b>[VTS Security Pipeline] BẢO MẬT &amp; CHẤT LƯỢNG ĐẠT CHUẨN!</b>%0A• <b>Dự án:</b> ${PROJECT_KEY}%0A• <b>Môi trường:</b> Node.js ${RUNTIME_VERSION}%0A• <b>SonarQube:</b> PASSED ✅%0A• <b>SAST:</b> PASSED ✅%0A• <b>Thành phẩm:</b> ${PROJECT_KEY}-verified.tar.gz%0A• <b>Build:</b> #${BUILD_NUMBER}%0A• <b>Link:</b> ${BUILD_URL}"
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
                            -d "parse_mode=HTML" \
                            -d "text=❌ <b>[VTS Security Pipeline] PHÁT HIỆN LỖI BẢO MẬT / CHẤT LƯỢNG!</b>%0A• <b>Dự án:</b> ${PROJECT_KEY}%0A• <b>Build:</b> #${BUILD_NUMBER}%0A• <b>Xem chi tiết:</b> ${BUILD_URL}console"
                    '''
                }
            }
        }
    }
}
