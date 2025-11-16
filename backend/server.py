import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from PIL import Image
from io import BytesIO

app = Flask(__name__)
# Cho phép kết nối từ frontend (tránh lỗi CORS)
CORS(app) 

# --- Cấu hình API Gemini ---
# ⚠️ QUAN TRỌNG: Thiết lập biến môi trường GEMINI_API_KEY trước khi chạy server
try:
    client = genai.Client() 
except Exception:
    print("LỖI: Không tìm thấy khóa GEMINI_API_KEY. Vui lòng thiết lập biến môi trường này.")
    # client = None # Hoặc bạn có thể dán key trực tiếp vào đây nếu cần debug nhanh: client = genai.Client(api_key='YOUR_API_KEY_HERE')

# --- API Endpoint để nhận diện Chim ---
@app.route('/api/identify_bird', methods=['POST'])
def identify_bird():
    if 'image' not in request.files:
        return jsonify({"error": "Không tìm thấy file ảnh."}), 400
    
    if not client:
        return jsonify({"error": "Lỗi kết nối Gemini: Chưa thiết lập API Key."}), 500

    image_file = request.files['image']
    
    try:
        # Đọc file ảnh
        image = Image.open(BytesIO(image_file.read()))
        
        # Prompt cho Gemini
        prompt = "Phân tích bức ảnh này và cho tôi biết đây là loài chim gì. Chỉ trả lời bằng tiếng Việt. Bắt đầu bằng tên loài, sau đó là thông tin ngắn gọn về tên khoa học và môi trường sống của nó."

        # Gọi API Gemini (sử dụng model có khả năng Multimodal)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, image]
        )
        
        # Trả về kết quả
        return jsonify({
            "success": True,
            "bird_name": response.text.strip()
        })

    except Exception as e:
        print(f"Lỗi khi gọi Gemini API: {e}")
        return jsonify({"success": False, "error": f"Lỗi xử lý API: {e}"}), 500

# --- API Endpoint để trả lời câu hỏi Text ---
@app.route('/api/chat_response', methods=['POST'])
def chat_response():
    data = request.get_json()
    user_input = data.get('userInput')

    if not user_input:
        return jsonify({"error": "Không có nội dung tin nhắn."}), 400
    
    if not client:
        return jsonify({"error": "Lỗi kết nối Gemini: Chưa thiết lập API Key."}), 500
    
    try:
        # Thêm ngữ cảnh vào prompt
        prompt = f"Bạn là một chuyên gia về chim. Trả lời câu hỏi sau một cách thân thiện và chính xác bằng tiếng Việt: {user_input}"
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        return jsonify({
            "success": True,
            "bot_response": response.text.strip()
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": f"Lỗi xử lý API: {e}"}), 500

if __name__ == '__main__':
    # Chạy server. Ports 5000 thường được Codespaces tự động chuyển tiếp.
    app.run(debug=True, host='0.0.0.0', port=5000)