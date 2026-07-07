document.getElementById('startBtn').addEventListener('click', () => {
    // Tìm tab đang mở hiện tại
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            // Gửi tin nhắn tới content.js của tab đó
            chrome.tabs.sendMessage(tabs[0].id, { action: "START_AUTO_SURVEY" }, (response) => {
                if (chrome.runtime.lastError) {
                    alert("Không thể kết nối với trang. Hãy chắc chắn bạn đang mở trang khảo sát và tải lại trang (F5).");
                } else {
                    document.getElementById('startBtn').innerText = "Đang chạy...";
                    document.getElementById('startBtn').disabled = true;
                    document.getElementById('startBtn').style.backgroundColor = "gray";
                }
            });
        }
    });
});
