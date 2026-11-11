const appName = "Demo Node App";
const version = "1.0.1"; // Nâng cấp phiên bản tự động

// Hàm nghiệp vụ tính tổng
function sum(a, b) {
    return a + b;
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

console.log(`✅ Test PASSED: sum(10, 20) = ${result}`);
console.log(`Ứng dụng v${version} đã sẵn sàng phát hành!`);
