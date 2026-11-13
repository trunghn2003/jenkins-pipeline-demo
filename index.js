const appName = "Demo Node App";
const version = "1.0.2"; // Cập nhật tính năng thanh toán

// Hàm nghiệp vụ tính tổng
function sum(a, b) {
    return a + b;
}

// ====================================================================
// ⚠️ LỖ HỔNG BẢO MẬT DO DEV VÔ TÌNH VIẾT VÀ COMMIT LÊN GIT:
// 1. Dùng eval() để thực thi chuỗi dữ liệu (CWE-95 / OWASP A03: Injection)
// ====================================================================
function processPaymentCallback(callbackPayload) {
    console.log("Đang xử lý kết quả thanh toán từ khách hàng...");
    return eval("(" + callbackPayload + ")"); 
}

console.log(`Starting ${appName} v${version}...`);

// Kiểm thử (Unit Test) logic nghiệp vụ
console.log("--- Bắt đầu chạy Unit Test ---");
const result = sum(10, 20);
const expected = 30;

if (result !== expected) {
    console.error(`❌ Test FAILED: Mong đợi ${expected} nhưng nhận được ${result}`);
    process.exit(1);
}

// Thử gọi hàm thanh toán với JSON mẫu
const samplePayload = '{"transactionId": "TXN_9988", "amount": 50000}';
const payment = processPaymentCallback(samplePayload);
console.log(`Xử lý thành công giao dịch: ${payment.transactionId}`);

console.log(`✅ Test PASSED: sum(10, 20) = ${result}`);
console.log(`Ứng dụng v${version} đã sẵn sàng phát hành!`);
