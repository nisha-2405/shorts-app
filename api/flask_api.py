
# app.py - Flask API for your PyTorch models
import torch
import torch.nn as nn
from transformers import T5Tokenizer, T5EncoderModel
import timm
from PIL import Image
from torchvision import transforms
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
import json

app = Flask(__name__)
CORS(app)

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ========== TEXT MODEL ==========
class T5Classifier(nn.Module):
    def __init__(self):
        super(T5Classifier, self).__init__()
        self.encoder = T5EncoderModel.from_pretrained("t5-small")
        self.classifier = nn.Linear(512, 2)

    def forward(self, input_ids, attention_mask):
        outputs = self.encoder(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.last_hidden_state[:, 0, :]
        logits = self.classifier(pooled_output)
        return logits

# ========== IMAGE TRANSFORMS ==========
image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ========== LOAD MODELS ==========
print("Loading models...")

# Load text model
text_model = T5Classifier()
text_model.load_state_dict(torch.load("text_model.pth", map_location=device))
text_model.to(device)
text_model.eval()
print("✅ Text model loaded")

# Load image model
image_model = timm.create_model("convnext_tiny", pretrained=False, num_classes=2)
image_model.load_state_dict(torch.load("image_model.pth", map_location=device))
image_model.to(device)
image_model.eval()
print("✅ Image model loaded")

# Load tokenizer
tokenizer = T5Tokenizer.from_pretrained("t5-small")
print("✅ Tokenizer loaded")

# ========== HELPER FUNCTIONS ==========
def predict_text(text):
    """Predict if text contains cyberbullying"""
    if not text or len(text.strip()) < 3:
        return {"error": "Text too short"}
    
    try:
        # Tokenize
        encoding = tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=128,
            return_tensors="pt"
        )
        
        input_ids = encoding["input_ids"].to(device)
        attention_mask = encoding["attention_mask"].to(device)
        
        # Predict
        with torch.no_grad():
            outputs = text_model(input_ids, attention_mask)
            probabilities = torch.softmax(outputs, dim=1)
            prediction = torch.argmax(outputs, dim=1).item()
            confidence = probabilities[0][prediction].item()
        
        return {
            "isCyberbullying": bool(prediction == 1),
            "score": float(confidence),
            "prediction": "cyberbullying" if prediction == 1 else "non_cyberbullying",
            "confidence": float(confidence),
            "text_length": len(text)
        }
        
    except Exception as e:
        return {"error": str(e)}

def predict_image_base64(image_base64):
    """Predict if image contains cyberbullying from base64"""
    try:
        # Decode base64
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Transform
        image_tensor = image_transform(image).unsqueeze(0).to(device)
        
        # Predict
        with torch.no_grad():
            outputs = image_model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            prediction = torch.argmax(outputs, dim=1).item()
            confidence = probabilities[0][prediction].item()
        
        return {
            "isCyberbullying": bool(prediction == 1),
            "score": float(confidence),
            "prediction": "cyberbullying" if prediction == 1 else "non_cyberbullying",
            "confidence": float(confidence)
        }
        
    except Exception as e:
        return {"error": str(e)}

# ========== API ENDPOINTS ==========
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "models_loaded": True,
        "device": str(device),
        "endpoints": ["/api/detect/text", "/api/detect/image", "/api/detect/both"]
    })

@app.route('/api/detect/text', methods=['POST'])
def detect_text():
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        result = predict_text(text)
        
        if "error" in result:
            return jsonify(result), 500
            
        return jsonify({
            "success": True,
            **result,
            "model": "T5-classifier"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/detect/image', methods=['POST'])
def detect_image():
    try:
        data = request.json
        image_base64 = data.get('image', '')
        
        if not image_base64:
            return jsonify({"error": "No image provided"}), 400
        
        result = predict_image_base64(image_base64)
        
        if "error" in result:
            return jsonify(result), 500
            
        return jsonify({
            "success": True,
            **result,
            "model": "ConvNeXt-Tiny"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/detect/both', methods=['POST'])
def detect_both():
    try:
        data = request.json
        text = data.get('text', '')
        image_base64 = data.get('image', '')
        
        results = {}
        
        if text:
            text_result = predict_text(text)
            results["text"] = text_result
            
        if image_base64:
            image_result = predict_image_base64(image_base64)
            results["image"] = image_result
        
        # Combined decision logic
        if "text" in results and "image" in results:
            # Simple average of scores
            text_score = results["text"].get("score", 0) if results["text"].get("isCyberbullying", False) else 0
            image_score = results["image"].get("score", 0) if results["image"].get("isCyberbullying", False) else 0
            
            combined_score = (text_score + image_score) / 2
            combined_prediction = combined_score > 0.5
            
            results["combined"] = {
                "isCyberbullying": combined_prediction,
                "score": combined_score,
                "prediction": "cyberbullying" if combined_prediction else "non_cyberbullying"
            }
        
        return jsonify({
            "success": True,
            **results
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Cyberbullying Detection API on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
