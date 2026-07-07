// 1. Hàm lấy số lượng phiếu khảo sát còn lại
function getRemainingSurveys() {
    const textElement = document.getElementById('ctl00_ctl00_contentPane_MainPanel_MainContent_lbFirstText');
    if (textElement) {
        const match = textElement.innerText.match(/Bạn đang có (\d+) phiếu/);
        if (match) return parseInt(match[1]);
    }
    return 0; // Trả về 0 nếu không tìm thấy (đã hết khảo sát)
}

// 2. Hàm điền random và submit
function autoFillAndSubmit() {
    const remaining = getRemainingSurveys();
    console.log("Số phiếu khảo sát còn lại: " + remaining);

    if (remaining === 0) {
        console.log("Đã hoàn thành tất cả khảo sát!");
        sessionStorage.removeItem('autoSurveyActive'); // Xóa trạng thái
        alert("Đã hoàn thành tất cả các khảo sát!");
        return;
    }

    // Lọc lấy tất cả radio inputs của DevExpress
    const radioInputs = Array.from(document.querySelectorAll('input.dxKBSI[id*="_RBL_"]'));
    
    // Tìm các ID gốc của từng câu hỏi (nhóm lại để mỗi câu chỉ random 1 lần)
    const questionIds = new Set(radioInputs.map(input => {
        const match = input.id.match(/(.*_RBL_\d+)_RB\d+_I/);
        return match ? match[1] : null;
    }).filter(id => id !== null));

    // Duyệt qua từng câu hỏi và chọn random đáp án
    questionIds.forEach(qId => {
        const options = document.querySelectorAll(`input[id^="${qId}_RB"][id$="_I"]`);
        if (options.length > 0) {
            const randomIndex = Math.floor(Math.random() * options.length);
            options[randomIndex].click(); // Giả lập click của người dùng
        }
    });

    // Phần điền tự luận sẽ bị bỏ qua như yêu cầu

    // Submit form sau một khoảng delay nhỏ để UI kịp phản hồi click
    setTimeout(() => {
        const submitBtn = document.getElementById('ctl00_ctl00_contentPane_MainPanel_MainContent_formLayout_submitButton_I');
        if (submitBtn) {
            submitBtn.click();
        }
    }, 500);
}

// Lắng nghe lệnh từ Popup của Extension (Click 1 lần duy nhất để bắt đầu)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_AUTO_SURVEY") {
        sessionStorage.setItem('autoSurveyActive', 'true'); // Bật cờ tự động
        autoFillAndSubmit();
        sendResponse({ status: "started" });
    }
});

// Tự động chạy tiếp nếu cờ đang bật (khi trang vừa reload sau khi submit phiếu trước đó)
if (sessionStorage.getItem('autoSurveyActive') === 'true') {
    // Đợi 1 giây để DevExpress load xong sự kiện
    setTimeout(autoFillAndSubmit, 1000);
}
