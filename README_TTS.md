# TTS (Text-to-Speech) API Documentation

## Tổng quan

Hệ thống TTS cho phép chuyển văn bản các chương truyện thành audio sử dụng Piper TTS (Vietnamese model).

## Kiến trúc

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  Node.js Backend │────▶│  Python TTS     │
│   (Next.js)     │     │  (Express)       │     │  Service (Flask)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                        │
                                ▼                        ▼
                        ┌──────────────┐         ┌──────────────┐
                        │   MongoDB    │         │  Piper Model │
                        │  (Chapters)  │         │  (Vietnamese)│
                        └──────────────┘         └──────────────┘
```

## Cài đặt

### 1. Cài đặt Piper TTS

```bash
# Windows - Download từ https://github.com/rhasspy/piper/releases
# Giải nén và thêm vào PATH

# Linux
pip install piper-tts
```

### 2. Chạy TTS Service (Python)

```bash
cd model_tts
pip install -r requirements.txt
python tts_service.py
```

Service sẽ chạy tại `http://localhost:5001`

### 3. Cấu hình Backend

Thêm vào file `.env`:
```
TTS_SERVICE_URL=http://localhost:5001
```

## API Endpoints

### Health Check

#### GET `/audio/health`
Kiểm tra trạng thái TTS Service.

**Response:**
```json
{
  "success": true,
  "data": {
    "tts_service": {
      "status": "healthy",
      "model": "vi_VN-vais1000-medium.onnx",
      "queue_size": 0
    },
    "service_url": "http://localhost:5001"
  }
}
```

---

### Single Chapter Audio

#### GET `/audio/chapter/:chapterId/audio`
Lấy thông tin audio của một chapter.

**Response:**
```json
{
  "success": true,
  "data": {
    "chapterId": "...",
    "chapterNumber": 1,
    "title": "Chương 1",
    "audioUrl": "/uploads/audio/audio-xxx.wav",
    "audioStatus": "completed",
    "audioDuration": 120.5,
    "audioGeneratedAt": "2024-01-01T00:00:00Z",
    "audioSource": "tts"
  }
}
```

---

#### POST `/audio/chapter/:chapterId/audio/upload`
Upload file audio cho chapter (manual upload).

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `audio`: File audio (mp3, wav, ogg, flac, aac, m4a)
- `duration`: (optional) Thời lượng audio (seconds)

**Response:**
```json
{
  "success": true,
  "data": {
    "audioUrl": "/uploads/audio/audio-xxx.mp3",
    "audioStatus": "completed",
    "audioDuration": 180
  },
  "message": "Upload audio thành công"
}
```

---

#### POST `/audio/chapter/:chapterId/audio/generate`
Generate audio cho chapter bằng TTS AI.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "audioUrl": "/uploads/audio/xxx.wav",
    "audioStatus": "completed",
    "audioDuration": 145.23
  },
  "message": "Tạo audio thành công"
}
```

---

#### DELETE `/audio/chapter/:chapterId/audio`
Xóa audio của chapter.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Xóa audio thành công"
}
```

---

### Novel Audio (Batch Processing)

#### GET `/audio/novel/:novelId/audio`
Lấy danh sách audio của tất cả chapters trong novel.

**Response:**
```json
{
  "success": true,
  "data": {
    "chapters": [
      {
        "chapterNumber": 1,
        "title": "Chương 1",
        "audioUrl": "/uploads/audio/xxx.wav",
        "audioStatus": "completed",
        "audioDuration": 120,
        "audioSource": "tts"
      },
      {
        "chapterNumber": 2,
        "title": "Chương 2",
        "audioUrl": null,
        "audioStatus": "none",
        "audioDuration": null,
        "audioSource": null
      }
    ],
    "stats": {
      "total": 100,
      "withAudio": 45,
      "processing": 2,
      "failed": 3,
      "none": 50,
      "totalDuration": 5400
    }
  }
}
```

---

#### POST `/audio/novel/:novelId/audio/batch-generate`
Generate audio hàng loạt cho nhiều chapters.

**Headers:**
- `Authorization: Bearer <token>`

**Body (JSON):**
```json
// Option 1: Chỉ định danh sách chapter IDs
{
  "chapterIds": ["id1", "id2", "id3"]
}

// Option 2: Chỉ định range chapters
{
  "fromChapter": 1,
  "toChapter": 10
}

// Option 3: Không có body - xử lý tất cả chapters chưa có audio
{}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": "novelId_timestamp_uuid",
    "total_chapters": 10,
    "status_url": "/audio/batch-status/xxx",
    "message": "Đã thêm 10 chapters vào hàng đợi"
  }
}
```

---

#### GET `/audio/batch-status/:jobId`
Kiểm tra trạng thái batch job.

**Response (Processing):**
```json
{
  "success": true,
  "data": {
    "job_id": "xxx",
    "status": "processing",
    "total": 10,
    "current": 3,
    "progress": 30,
    "current_chapter": "chapter_id"
  }
}
```

**Response (Completed):**
```json
{
  "success": true,
  "data": {
    "job_id": "xxx",
    "status": "completed",
    "total": 10,
    "progress": 100,
    "results": [
      {
        "chapter_id": "id1",
        "success": true,
        "output_file": "xxx.wav",
        "duration": 120
      }
    ]
  }
}
```

---

## Audio Status Values

| Status | Mô tả |
|--------|-------|
| `none` | Chưa có audio |
| `processing` | Đang xử lý TTS |
| `completed` | Có audio sẵn sàng |
| `failed` | Xử lý thất bại |

## Audio Source Values

| Source | Mô tả |
|--------|-------|
| `upload` | Upload thủ công |
| `tts` | Generate bởi AI TTS |

## Giới hạn

- **Max text length:** 50,000 ký tự/chapter
- **Max batch size:** 100 chapters/batch
- **Max upload size:** 100MB/file
- **Supported formats:** MP3, WAV, OGG, FLAC, AAC, M4A

## Ví dụ sử dụng (Frontend)

### Upload audio

```typescript
const uploadAudio = async (chapterId: string, file: File) => {
  const formData = new FormData();
  formData.append('audio', file);
  
  const response = await fetch(`/audio/chapter/${chapterId}/audio/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

### Generate audio đơn

```typescript
const generateAudio = async (chapterId: string) => {
  const response = await fetch(`/audio/chapter/${chapterId}/audio/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### Generate audio hàng loạt

```typescript
const batchGenerate = async (novelId: string, fromChapter: number, toChapter: number) => {
  const response = await fetch(`/audio/novel/${novelId}/audio/batch-generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fromChapter, toChapter })
  });
  
  const { data } = await response.json();
  
  // Poll status
  const checkStatus = async () => {
    const statusRes = await fetch(`/audio/batch-status/${data.job_id}`);
    const status = await statusRes.json();
    
    if (status.data.status === 'processing') {
      console.log(`Progress: ${status.data.progress}%`);
      setTimeout(checkStatus, 2000);
    } else {
      console.log('Batch completed!', status.data.results);
    }
  };
  
  checkStatus();
};
```

## Troubleshooting

### TTS Service không hoạt động

1. Kiểm tra Python TTS service đang chạy: `python tts_service.py`
2. Kiểm tra Piper đã được cài đặt và có trong PATH
3. Kiểm tra model file `vi_VN-vais1000-medium.onnx` tồn tại

### Audio không generate được

1. Kiểm tra nội dung chapter không quá dài (< 50,000 ký tự)
2. Kiểm tra chapter có nội dung text
3. Xem logs của TTS service

### Upload thất bại

1. Kiểm tra file size < 100MB
2. Kiểm tra định dạng file được hỗ trợ
3. Kiểm tra token authentication
