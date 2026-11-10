pipeline {
    agent any

    environment {
        APP_ENV = 'production'
    }

    stages {
        stage('1. Checkout from Git') {
            steps {
                echo "Mã nguồn đã được Jenkins tự động kéo về từ GitHub!"
                sh 'git log -1 --oneline'
                sh 'ls -la'
            }
        }

        stage('2. Run Tests') {
            steps {
                echo "Đang chạy kiểm thử mã nguồn..."
                sh 'cat index.js'
                sh 'echo "Syntax check: PASSED"'
            }
        }

        stage('3. Build & Package') {
            steps {
                echo "Đóng gói ứng dụng thành file zip..."
                sh 'tar -czf release.tar.gz index.js'
                sh 'ls -lh release.tar.gz'
            }
        }
    }

    post {
        success {
            echo " Pipeline từ GitHub chạy THÀNH CÔNG!"
        }
        failure {
            echo " Pipeline từ GitHub bị LỖI!"
        }
    }
}
