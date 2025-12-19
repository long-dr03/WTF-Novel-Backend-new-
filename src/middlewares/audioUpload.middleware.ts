import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Đảm bảo thư mục uploads/audio tồn tại
const audioUploadDir = 'uploads/audio';
if (!fs.existsSync(audioUploadDir)) {
    fs.mkdirSync(audioUploadDir, { recursive: true });
}

const audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, audioUploadDir);
    },
    filename: function (req, file, cb) {
        // Format: audio-{chapterId}-{timestamp}.{ext}
        const chapterId = req.params.chapterId || 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `audio-${chapterId}-${uniqueSuffix}${ext}`);
    }
});

const audioFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Chấp nhận các định dạng audio phổ biến
    const allowedMimes = [
        'audio/mpeg',       // .mp3
        'audio/mp3',
        'audio/wav',        // .wav
        'audio/wave',
        'audio/x-wav',
        'audio/ogg',        // .ogg
        'audio/flac',       // .flac
        'audio/aac',        // .aac
        'audio/m4a',        // .m4a
        'audio/x-m4a',
        'audio/mp4'
    ];

    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Định dạng file không hỗ trợ. Chấp nhận: ${allowedExtensions.join(', ')}`));
    }
};

export const audioUpload = multer({
    storage: audioStorage,
    fileFilter: audioFileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // Giới hạn 100MB cho audio
    }
});

// Export cấu hình để có thể sử dụng ở nơi khác
export const AUDIO_CONFIG = {
    uploadDir: audioUploadDir,
    maxFileSize: 100 * 1024 * 1024,
    allowedExtensions: ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'],
    allowedMimes: [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/ogg',
        'audio/flac',
        'audio/aac',
        'audio/m4a',
        'audio/x-m4a',
        'audio/mp4'
    ]
};
