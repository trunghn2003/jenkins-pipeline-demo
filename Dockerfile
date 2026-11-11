# Sử dụng base image NodeJS siêu nhẹ (Alpine Linux)
FROM node:20-alpine

# Thư mục làm việc bên trong container
WORKDIR /app

# Copy mã nguồn vào container
COPY index.js .

# Lệnh mặc định khi container khởi động
CMD ["node", "index.js"]
