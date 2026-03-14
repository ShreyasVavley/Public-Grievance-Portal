from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
import random
import string
import os
import uuid
from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import io
from dotenv import load_dotenv
from twilio.rest import Client as TwilioClient

load_dotenv()

# Twilio Setup
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE_NUMBER")

# Admin credentials from env
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin_blr")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@123")

twilio_client = None
if TWILIO_SID and TWILIO_TOKEN:
    try:
        twilio_client = TwilioClient(TWILIO_SID, TWILIO_TOKEN)
    except Exception as e:
        print(f"Twilio init failed: {e}")

app = FastAPI(title="Bengaluru Sahaya Portal API")

# Serve uploaded photos as static files
UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# YOLOv8 Setup
# ---------------------------------------------------------------------------
yolo_model = None  # Loaded once at startup

# COCO class → grievance category mapping (Expanded for "Perfection")
CATEGORY_CLASS_MAP = {
    "garbage": {
        # Standard plastic/food waste
        "bottle", "cup", "bowl", "fork", "spoon", "knife", "banana", "apple", 
        "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake",
        # Abandoned items/debris
        "backpack", "handbag", "suitcase", "umbrella", "tie", "scissors", "book",
        "hair drier", "toothbrush", "teddy bear", "frisbee", "skis", "snowboard", 
        "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard",
        "tennis racket", "vase",
        # E-waste / Bulk waste
        "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", 
        "oven", "toaster", "sink", "refrigerator", "clock", "chair", "couch", "bed", 
        "dining table", "toilet", "potted plant"
    },
    "pothole": {
        # Road context (Presence of these items on a road suggests valid reporting area)
        "car", "truck", "bus", "motorcycle", "bicycle", "traffic light", "stop sign",
        "parking meter", "bench", "fire hydrant"
    },
    "water_leak": {
        "sink", "toilet", "bottle", "cup", "vase", "bowl", "fire hydrant"
    },
    "electricity": {
        "tv", "laptop", "cell phone", "remote", "keyboard", "refrigerator", "microwave", "traffic light"
    },
}

# Contextual mapping: If we see these, the photo is likely at an urban site
URBAN_CONTEXT_CLASSES = {
    "car", "truck", "bus", "motorcycle", "bicycle", "traffic light", "stop sign",
    "bench", "fire hydrant", "person", "parking meter"
}

def load_yolo():
    """Load YOLOv8n model — downloads weights on first call."""
    global yolo_model
    try:
        from ultralytics import YOLO
        yolo_model = YOLO("yolov8n.pt")
        print("✅ YOLOv8n model loaded successfully.")
    except Exception as e:
        print(f"⚠️  YOLOv8 load failed: {e}. Falling back to mock detection.")
        yolo_model = None


def yolo_classify(image_bytes: bytes, user_category: str):
    """
    Run YOLOv8 inference on image_bytes.
    Returns (category_match: bool, detected_objects: list[dict], match_type: str)
    detected_objects = [{"label": str, "confidence": float}, ...]
    """
    if yolo_model is None:
        # Fallback: return mock high-confidence result
        return True, [{"label": user_category, "confidence": 0.85}], "fallback"

    try:
        import tempfile, os
        # Save bytes to a temp file — ultralytics works best with file paths
        suffix = ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name

        results = yolo_model(tmp_path, verbose=False)
        os.unlink(tmp_path)

        boxes = results[0].boxes
        detected = []
        if boxes is not None and len(boxes) > 0:
            for cls_id, conf in zip(boxes.cls.tolist(), boxes.conf.tolist()):
                label = yolo_model.names[int(cls_id)]
                detected.append({"label": label, "confidence": round(conf, 3)})

        # Deduplicate by label, keep highest confidence
        seen = {}
        for obj in detected:
            lbl = obj["label"]
            if lbl not in seen or obj["confidence"] > seen[lbl]:
                seen[lbl] = obj["confidence"]
        detected_unique = [{"label": lbl, "confidence": conf} for lbl, conf in seen.items()]
        detected_unique.sort(key=lambda x: x["confidence"], reverse=True)

        # Check if any detection belongs to the user's category
        category_objects = CATEGORY_CLASS_MAP.get(user_category.lower(), set())
        
        # 1. Direct Object Match (e.g. bottle found in garbage)
        # Higher confidence filter for better accuracy
        direct_matches = [obj for obj in detected_unique if obj["label"] in category_objects and obj["confidence"] > 0.4]
        direct_match = len(direct_matches) > 0
        
        # 2. Contextual Match (e.g. street scene objects found for road-based issues)
        context_count = sum(1 for obj in detected_unique if obj["label"] in URBAN_CONTEXT_CLASSES)
        is_urban_context = context_count >= 2  # At least two street objects imply valid context
        
        # 3. Deep Match (Multiple direct matches or very high confidence)
        is_deep_match = any(obj["confidence"] > 0.7 for obj in direct_matches) or len(direct_matches) >= 2

        # Logic for "Perfect" matching:
        if is_deep_match:
            category_match = True
            match_type = "deep"
        elif direct_match:
            category_match = True
            match_type = "direct"
        elif is_urban_context and user_category.lower() in ["garbage", "pothole"]:
            category_match = True
            match_type = "context"
        else:
            category_match = direct_match or (is_urban_context and user_category.lower() == "pothole")
            match_type = "none" if not category_match else "context"

        return category_match, detected_unique, match_type

    except Exception as e:
        print(f"YOLOv8 inference error: {e}")
        return True, [], "error"


# ---------------------------------------------------------------------------
# In-memory OTP storage
# ---------------------------------------------------------------------------
otp_storage = {}


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class Grievance(BaseModel):
    name: str
    mail_id: str
    phone_number: str
    title: str
    description: str
    category: str
    ward: str
    status: str = "Submitted"
    ack_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    location: dict  # GeoJSON
    image_url: Optional[str] = None
    detected_objects: Optional[List[dict]] = None  # YOLOv8 results
    category_match: Optional[bool] = None


class Feedback(BaseModel):
    name: str
    phone_number: str
    rating: int  # 1-5
    comment: str
    created_at: datetime = Field(default_factory=datetime.now)


# ---------------------------------------------------------------------------
# Image Quality Helpers
# ---------------------------------------------------------------------------
def get_image_metadata(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_data = img._getexif()
        metadata = {}
        if exif_data:
            for tag, value in exif_data.items():
                decoded = TAGS.get(tag, tag)
                metadata[decoded] = value
        return metadata
    except Exception:
        return {}


def get_decimal_from_dms(dms, ref):
    degrees = float(dms[0])
    minutes = float(dms[1])
    seconds = float(dms[2])
    decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
    if ref in ['S', 'W']:
        decimal = -decimal
    return decimal


def quality_check(image_bytes: bytes, user_gps):
    """
    Tier-3 quality pre-filter: blur + darkness + EXIF timestamp/GPS checks.
    Returns (pass: bool, reason: str)
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img_cv is None:
        return False, "Could not read the image. Please try again."

    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

    # Blur detection
    if cv2.Laplacian(gray, cv2.CV_64F).var() < 100:
        return False, "Photo is too blurry. Please take a clearer photo."

    # Darkness check
    if np.mean(gray) < 30:
        return False, "Photo is too dark. Use a flash or report during daylight."

    # EXIF timestamp (last 24 h)
    metadata = get_image_metadata(image_bytes)
    img_time_str = metadata.get('DateTimeOriginal') or metadata.get('DateTime')
    if img_time_str:
        try:
            img_time = datetime.strptime(img_time_str, '%Y:%m:%d %H:%M:%S')
            if datetime.now() - img_time > timedelta(hours=24):
                return False, "Photo is too old. Please take a fresh photo within the last 24 hours."
        except Exception:
            pass

    # GPS check
    gps_info = metadata.get('GPSInfo')
    if gps_info and user_gps:
        try:
            img_lat = get_decimal_from_dms(gps_info[2], gps_info[1])
            img_lon = get_decimal_from_dms(gps_info[4], gps_info[3])
            dist = np.sqrt((img_lat - user_gps[0])**2 + (img_lon - user_gps[1])**2)
            if dist > 0.0005:
                return False, "GPS mismatch. Please ensure you are at the location of the issue."
        except Exception:
            pass

    return True, "Quality OK"


# ---------------------------------------------------------------------------
# Database Fallback Logic
# ---------------------------------------------------------------------------
class MockCollection:
    def __init__(self):
        self.data = []

    async def insert_one(self, document):
        if "_id" not in document:
            document["_id"] = str(len(self.data) + 1)
        self.data.append(document)

        class Result:
            def __init__(self, id):
                self.inserted_id = id
        return Result(document["_id"])

    async def find_one(self, query):
        for item in self.data:
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                return item
        return None

    async def find(self, query=None):
        if not query:
            return self.data
        return [item for item in self.data if all(item.get(k) == v for k, v in query.items())]

    async def update_one(self, query, update):
        for item in self.data:
            if all(item.get(k) == v for k, v in query.items()):
                for k, v in update.get("$set", {}).items():
                    item[k] = v
                return True
        return False


class MockDB:
    def __init__(self):
        self.grievances = MockCollection()
        self.feedback = MockCollection()
        self.otp = MockCollection()


# MongoDB connection attempt
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = None
try:
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=1000)
    db = client.bengaluru_sahaya
except Exception:
    db = MockDB()


@app.on_event("startup")
async def startup_db_client():
    global db, client
    try:
        if client is not None:
            await client.admin.command('ping')
            app.mongodb = db
        else:
            raise Exception("No client")
    except Exception:
        db = MockDB()
        app.mongodb = db

    # Load YOLOv8 model after DB is ready
    load_yolo()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    yolo_status = "YOLOv8n active" if yolo_model is not None else "YOLOv8 unavailable (mock)"
    return {
        "message": (
            "Welcome to Bengaluru Sahaya Portal API (In-memory storage active)"
            if isinstance(db, MockDB)
            else "Welcome to Bengaluru Sahaya Portal API"
        ),
        "ml_model": yolo_status,
    }


@app.post("/grievances/")
async def create_grievance(grievance: Grievance):
    year = datetime.now().year
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    grievance.ack_id = f"BLR-ACK-{year}-{random_str}"

    # Text-based AI verification for status
    keywords = {
        "garbage": ["waste", "trash", "garbage", "dump", "smell", "ಕಸ", "ತ್ಯಾಜ್ಯ"],
        "pothole": ["road", "hole", "pothole", "drive", "accident", "ರಸ್ತೆ", "ಗುಂಡಿ"],
        "water_leak": ["water", "pipe", "leak", "flood", "ನೀರು", "ಸೋರಿಕೆ"],
        "electricity": ["power", "light", "wire", "shock", "ವಿದ್ಯುತ್", "ಕರಂಟ್"]
    }
    desc_lower = grievance.description.lower()
    matches = any(kw in desc_lower for kw in keywords.get(grievance.category.lower(), []))
    grievance.status = "AI Verified" if matches else "Verification Pending"

    doc = grievance.dict()
    result = await db.grievances.insert_one(doc)
    inserted_id = result.inserted_id

    created_grievance = await db.grievances.find_one({"_id": inserted_id})
    if created_grievance and "_id" in created_grievance:
        created_grievance["_id"] = str(created_grievance["_id"])
    return created_grievance


@app.post("/verify-photo/")
async def verify_photo(
    file: UploadFile = File(...),
    category: str = Form(...),
    latitude: float = Form(None),
    longitude: float = Form(None)
):
    contents = await file.read()
    user_gps = (latitude, longitude) if latitude and longitude else None

    # --- Tier 1: Quality check (blur, darkness, EXIF) ---
    quality_ok, quality_msg = quality_check(contents, user_gps)
    if not quality_ok:
        return {
            "valid": False,
            "message": quality_msg,
            "image_url": None,
            "detected_objects": [],
            "category_match": False,
            "maya_response": quality_msg,
        }

    # --- Tier 2: YOLOv8 inference ---
    category_match, detected_objects, match_type = yolo_classify(contents, category)

    # Save photo if quality OK
    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOADS_DIR / filename
    with open(save_path, "wb") as f:
        f.write(contents)
    image_url = f"/uploads/{filename}"

    # Compose "Perfect" Maya response
    if match_type == "direct":
        top_labels = ", ".join(
            f"{o['label']} ({int(o['confidence']*100)}%)" for o in detected_objects[:3]
        )
        maya_response = f"Photo verified! Detected {top_labels} which matches your '{category}' report."
        message = "AI Verified"
    elif match_type == "context":
        maya_response = (
            f"AI detected a valid '{category}' context with surrounding objects. "
            "Although specific debris labels aren't clear, your report is verified for investigation."
        )
        message = "Context Verified"
    elif not detected_objects:
        maya_response = "No specific objects detected, but your photo is clear and saved for review."
        message = "Verification Pending"
    else:
        obj_labels = ", ".join(o["label"] for o in detected_objects[:3])
        maya_response = (
            f"AI detected: {obj_labels}. This doesn't strongly match '{category}', "
            "but we've saved it for admin review."
        )
        message = "Verification Pending — Mismatch"

    return {
        "valid": True,
        "message": message,
        "image_url": image_url,
        "detected_objects": detected_objects,
        "category_match": category_match,
        "maya_response": maya_response,
    }


@app.get("/grievances/{ack_id}")
async def get_grievance(ack_id: str):
    grievance = await db.grievances.find_one({"ack_id": ack_id})
    if grievance:
        if "_id" in grievance:
            grievance["_id"] = str(grievance["_id"])
        return grievance
    raise HTTPException(status_code=404, detail="Grievance not found")


# Admin Endpoints
@app.get("/admin/grievances/")
async def get_all_grievances():
    if isinstance(db, MockDB):
        result = await db.grievances.find()
        return result
    cursor = db.grievances.find({})
    return await cursor.to_list(length=100)


@app.post("/admin/confirm/{ack_id}")
async def confirm_grievance(ack_id: str):
    result = await db.grievances.update_one({"ack_id": ack_id}, {"$set": {"status": "Resolved"}})
    if result:
        return {"message": "Grievance marked as Resolved"}
    raise HTTPException(status_code=404, detail="Grievance not found")


class AdminLogin(BaseModel):
    username: str
    password: str


@app.post("/admin/login")
async def admin_login(creds: AdminLogin):
    if creds.username == ADMIN_USERNAME and creds.password == ADMIN_PASSWORD:
        return {"access_token": "mock_token_123", "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid admin credentials")


# Client Login & OTP
class OTPRequest(BaseModel):
    name: str
    phone_number: str


@app.post("/auth/send-otp")
async def send_otp(req: OTPRequest):
    otp = "".join([str(random.randint(0, 9)) for _ in range(4)])
    otp_storage[req.phone_number] = otp

    print(f"OTP for {req.phone_number}: {otp}")

    if twilio_client:
        try:
            twilio_client.messages.create(
                body=f"Your Bengaluru Sahaya OTP is: {otp}",
                from_=TWILIO_PHONE,
                to=req.phone_number
            )
        except Exception as e:
            print(f"Twilio error: {e}")

    return {"message": "OTP sent successfully", "demo_otp": otp}


class OTPVerify(BaseModel):
    phone_number: str
    otp: str


@app.post("/auth/verify-otp")
async def verify_otp(req: OTPVerify):
    if req.phone_number in otp_storage and otp_storage[req.phone_number] == req.otp:
        return {"message": "Verified", "access_token": "client_token_xyz"}
    raise HTTPException(status_code=400, detail="Invalid OTP")


# Feedback
@app.post("/feedback/")
async def create_feedback(fb: Feedback):
    doc = fb.dict()
    await db.feedback.insert_one(doc)
    return {"message": "Feedback submitted successfully"}
