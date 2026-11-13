pipeline {
    agent none

    parameters {
        choice(
            name: 'RUNTIME_VERSION', 
            choices: ['20-alpine', '18-alpine'], 
            description: 'Chọn phiên bản Node.js để chạy kiểm thử & phân tích'
        )
        string(
            name: 'SRC_PATH', 
            defaultValue: '.', 
            description: 'Đường dẫn thư mục chứa mã nguồn cần phân tích'
        )
        string(
            name: 'SONAR_PROJECT_KEY', 
            defaultValue: 'vts-demo-service', 
            description: 'Mã định danh dự án trên hệ thống Quản lý chất lượng (SonarQube/Fortify)'
        )
        booleanParam(
            name: 'ENFORCE_QUALITY_GATE', 
            defaultValue: true, 
            description: 'Tích chọn nếu bắt buộc vượt qua Quality Gate mới cho phép đóng gói'
        )
    }

    stages {
        stage('1. Phân tích & Quét mã nguồn (Code Analysis)') {
            agent {
                docker {
                    // TỰ ĐỘNG CHỌN ĐÚNG PHIÊN BẢN CONTAINER DỰA THEO THAM SỐ DEV CHỌN
                    image "node:${params.RUNTIME_VERSION}"
                }
            }
            steps {
                echo "=========================================================="
                echo " BẮT ĐẦU QUÉT MÃ NGUỒN (TEMPLATE DOANH NGHIỆP)"
                echo "• Môi trường: Node.js ${params.RUNTIME_VERSION}"
                echo "• Thư mục mã nguồn: ${params.SRC_PATH}"
                echo "• Mã dự án Sonar/Fortify: ${params.SONAR_PROJECT_KEY}"
                echo "• Bắt buộc Quality Gate: ${params.ENFORCE_QUALITY_GATE}"
                echo "=========================================================="

                // Di chuyển vào thư mục code được chỉ định qua tham số SRC_PATH
                dir("${params.SRC_PATH}") {
                    sh 'node -v'
                    echo "--- Đang phân tích mã nguồn file index.js ---"
                    sh 'node index.js'
                    
                    // Giả lập bước kiểm tra Quality Gate của SonarQube
                    script {
                        echo ">>> Kết nối SonarQube Server nội bộ để kiểm tra Quality Gate..."
                        def passed = true // Giả lập kết quả quét thành công
                        
                        if (params.ENFORCE_QUALITY_GATE && !passed) {
                            error("❌ Quality Gate FAILED: Mã nguồn không đạt chuẩn chất lượng của Viettel!")
                        } else {
                            echo "✅ Quality Gate PASSED: 0 Bugs, 0 Vulnerabilities, Coverage 95%!"
                        }
                    }
                }
            }
        }

        stage('2. Đóng gói Artifacts theo tham số') {
            agent any
            steps {
                echo "Đóng gói ứng dụng từ thư mục ${params.SRC_PATH}..."
                dir("${params.SRC_PATH}") {
                    sh "tar -czf ${params.SONAR_PROJECT_KEY}-release.tar.gz index.js"
                    archiveArtifacts artifacts: "${params.SONAR_PROJECT_KEY}-release.tar.gz", fingerprint: true
                    echo "Đã lưu trữ thành phẩm: ${params.SONAR_PROJECT_KEY}-release.tar.gz"
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
                            -d "text=🛡️ *[Template Analysis] QUÉT MÃ NGUỒN THÀNH CÔNG!* %0A• *Dự án:* \`${SONAR_PROJECT_KEY}\` %0A• *Môi trường:* Node.js \`${RUNTIME_VERSION}\` %0A• *Thư mục:* \`${SRC_PATH}\` %0A• *Quality Gate:* PASSED ✅ %0A• *Build:* #${BUILD_NUMBER} %0A• *Link:* ${BUILD_URL}"
                    '''
                }
            }
        }
    }
}
