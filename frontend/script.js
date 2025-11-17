// Vì bạn đang dùng Codespaces/GitHub.dev, chúng ta trỏ đến localhost:5000. 
// Codespaces sẽ tự động xử lý chuyển tiếp (forwarding) qua URL công khai.
const API_BASE_URL = 'https://nhandienchim.onrender.com'; 

// --- 1. Hàm Hiển Thị Tin Nhắn ---
function displayMessage(message, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    
    messageDiv.classList.add('message', sender);

    // Xử lý in đậm Markdown (**text**) thành <strong>text</strong>
    const formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messageDiv.innerHTML = `<p>${formattedMessage}</p>`;
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- 2. Xử lý Gửi Tin Nhắn Văn Bản ---
function sendMessage() {
    const userInputElement = document.getElementById('userInput');
    const userInput = userInputElement.value.trim();
    
    if (userInput === "") return;

    displayMessage(userInput, 'user');
    userInputElement.value = ''; 

    fetch(`${API_BASE_URL}/api/chat_response`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userInput: userInput })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayMessage(data.bot_response, 'bot');
        } else {
            displayMessage(`[Lỗi Text Chat]: ${data.error || 'Lỗi không xác định.'}`, 'bot');
        }
    })
    .catch(error => {
        console.error('Lỗi khi gửi tin nhắn:', error);
        displayMessage('Không thể kết nối với máy chủ API. Vui lòng kiểm tra server Python đã chạy chưa.', 'bot');
    });
}

// Cho phép người dùng nhấn Enter để gửi tin nhắn
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});


// --- 3. Xử lý Tải Ảnh để Nhận Diện ---
function handleImageUpload() {
    const fileInput = document.getElementById('birdImage');
    const file = fileInput.files[0];
    
    if (!file) return;

    displayMessage(`Đang gửi ảnh **${file.name}** để nhận diện bởi Gemini...`, 'user');

    const formData = new FormData();
    formData.append('image', file);

    fetch(`${API_BASE_URL}/api/identify_bird`, {
        method: 'POST',
        body: formData 
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Hiển thị kết quả nhận diện từ Gemini
            displayMessage(data.bird_name, 'bot');
        } else {
            displayMessage(`[Lỗi Nhận Diện Ảnh]: ${data.error || 'Lỗi không xác định.'}`, 'bot');
        }
    })
    .catch(error => {
        console.error('Lỗi khi gửi ảnh:', error);
        displayMessage('Không thể kết nối với máy chủ API. Vui lòng kiểm tra server Python đã chạy chưa.', 'bot');
    })
    .finally(() => {
        fileInput.value = '';
    });
}