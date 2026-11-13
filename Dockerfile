# Sử dụng Node.js 20 trên Alpine Linux
FROM node:20-alpine

# Thư mục làm việc
WORKDIR /app

# Copy mã nguồn
COPY index.js .

# Chuyển quyền sở hữu cho user node
RUN chown -R node:node /app

# Chạy container bằng user không phải root
USER node

# Lệnh chạy ứng dụng
CMD ["node", "index.js"]