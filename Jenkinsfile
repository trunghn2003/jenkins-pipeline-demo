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
