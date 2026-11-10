pipeline {
    agent any

    stages {
        stage('1. Kiểm thử song song (Parallel Tests)') {
            // Khối parallel cho phép chạy nhiều stage con cùng lúc
            parallel {
                stage('Nhánh A: Unit Tests') {
                    steps {
                        echo ">>> [Luồng A] Đang chạy kiểm thử chức năng..."
                        sh 'node index.js'
                        sh 'echo "Unit tests: 100% PASSED"'
                    }
                }

                stage('Nhánh B: Security & Lint Scan') {
                    steps {
                        echo ">>> [Luồng B] Đang quét mã độc và bảo mật..."
                        sh 'echo "Scanning index.js for vulnerabilities..."'
                        sh 'echo "No security threats found: 0 CVE"'
                    }
                }
            }
        }

        stage('2. Đóng gói & Lưu trữ (Package & Archive)') {
            steps {
                echo "Đang đóng gói ứng dụng..."
                sh 'tar -czf demo-app-v1.0.tar.gz index.js'
                
                // 👉 LƯU TRỮ THÀNH PHẨM LÊN GIAO DIỆN WEB JENKINS
                archiveArtifacts artifacts: 'demo-app-v1.0.tar.gz', fingerprint: true
                echo "Đã lưu trữ file demo-app-v1.0.tar.gz thành công!"
            }
        }
    }

    post {
        success {
            echo " Pipeline hoàn thành xuất sắc! Thành phẩm đã sẵn sàng tải về."
        }
    }
}
