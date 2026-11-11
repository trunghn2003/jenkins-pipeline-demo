const appName = "Demo Node App";
const version = "1.0.0";

console.log(`Starting ${appName} v${version}...`);

// Giả lập một Developer vô tình đẩy code lỗi lên Git:
console.log("Đang kiểm tra kết nối Database...");
throw new Error("LỖI NGHIÊM TRỌNG: Database connection failed! Mất kết nối CSDL.");

console.log("App started successfully!");
