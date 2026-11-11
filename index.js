const appName = "Demo Node App";
const version = "1.0.1";

// Hàm nghiệp vụ tính tổng
function sum(a, b) {
    return a + b;
}

console.log(`Starting ${appName} v${version}...`);

// Kiểm thử (Unit Test) logic nghiệp vụ thực tế
console.log("--- Bắt đầu chạy Unit Test ---");
const result = sum(2, 3);
const expected = 5;

if (result !== expected) {
    console.error(`❌ Test FAILED: Mong đợi ${expected} nhưng nhận được ${result}`);
    process.exit(1); // Trả về mã lỗi 1 để Jenkins biết test thất bại
}

console.log(`✅ Test PASSED: sum(2, 3) = ${result}`);
console.log("App sẵn sàng đóng gói!");
