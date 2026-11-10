pipeline {
    // Không chỉ định agent toàn cục, để từng stage tự chọn môi trường
    agent none

    stages {
        stage('1. Chạy với NodeJS (Container node:20-alpine)') {
            agent {
                docker {
                    image 'node:20-alpine'
                }
            }
            steps {
                echo "--- MÔI TRƯỜNG NODEJS ---"
                sh 'node -v'
                sh 'node index.js'
            }
        }

        stage('2. Chạy với Python (Container python:3.11-alpine)') {
            agent {
                docker {
                    image 'python:3.11-alpine'
                }
            }
            steps {
                echo "--- MÔI TRƯỜNG PYTHON ---"
                sh 'python --version'
                sh 'python -c "print(\'Hello từ Python Container! Môi trường hoàn toàn cách ly.\')"'
            }
        }
    }

    post {
        always {
            echo "Pipeline hoàn tất! Toàn bộ container tạm đã được dọn dẹp sạch sẽ."
        }
    }
}
