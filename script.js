// ==================== CẤU HÌNH ====================
const API_BASE_URL = 'https://nhandienchim.onrender.com'; // URL backend Render

// ==================== HIỂN THỊ TIN NHẮN ====================
function displayMessage(message, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Markdown in đậm **text**
    const formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    messageDiv.innerHTML = `<p>${formattedMessage}</p>`;

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function displayImage(file, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';
    img.style.borderRadius = '8px';
    img.style.margin = '5px 0';

    messageDiv.appendChild(img);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ==================== XỬ LÝ GỬI TEXT ====================
function sendMessage() {
    const userInputElement = document.getElementById('userInput');
    const userInput = userInputElement.value.trim();
    if (userInput === "") return;

    displayMessage(userInput, 'user');
    userInputElement.value = '';

    fetch(`${API_BASE_URL}/api/chat_response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            displayMessage(data.bot_response, 'bot');
        } else {
            displayMessage(`[Lỗi Text Chat]: ${data.error || 'Lỗi không xác định.'}`, 'bot');
        }
    })
    .catch(err => {
        console.error(err);
        displayMessage('Không thể kết nối server API.', 'bot');
    });
}

// ==================== XỬ LÝ NHẬN DIỆN ẢNH ====================
function handleImageUpload(file) {
    if (!file) return;

    displayImage(file, 'user'); // Hiển thị ảnh ngay

    displayMessage(`Đang nhận diện...`, 'user');

    const formData = new FormData();
    formData.append('image', file);

    fetch(`${API_BASE_URL}/api/identify_bird`, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            displayMessage(data.bird_name, 'bot');
        } else {
            displayMessage(`[Lỗi Nhận Diện Ảnh]: ${data.error || 'Lỗi không xác định.'}`, 'bot');
        }
    })
    .catch(err => {
        console.error(err);
        displayMessage('Không thể kết nối server API.', 'bot');
    });
}

// ==================== EVENT LISTENERS ====================
const userInput = document.getElementById('userInput');
userInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

// Paste ảnh từ clipboard
userInput.addEventListener('paste', e => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            handleImageUpload(file);
            e.preventDefault();
        }
    }
});

// Chọn file từ input
const fileInput = document.getElementById('birdImage');
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        handleImageUpload(fileInput.files[0]);
        fileInput.value = '';
    }
});

// Drag & drop ảnh vào chatBox
const chatBox = document.getElementById('chatBox');
chatBox.addEventListener('dragover', e => e.preventDefault());
chatBox.addEventListener('drop', e => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleImageUpload(files[0]);
    }
});
