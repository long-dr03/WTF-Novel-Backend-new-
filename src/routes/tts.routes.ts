import { Router } from 'express';
import {
    uploadChapterAudio,
    generateChapterAudio,
    batchGenerateAudio,
    getBatchStatus,
    deleteChapterAudio,
    getChapterAudioInfo,
    getNovelAudioList,
    checkTTSHealth
} from '../controllers/tts.controller';
import { audioUpload } from '../middlewares/audioUpload.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// ==================== Health Check ====================
// GET /audio/health - Kiểm tra TTS Service
router.get('/health', checkTTSHealth);

// ==================== Single Chapter Audio ====================
// GET /chapter/:chapterId/audio - Lấy thông tin audio của chapter
router.get('/chapter/:chapterId/audio', getChapterAudioInfo);

// POST /chapter/:chapterId/audio/upload - Upload audio file cho chapter
router.post('/chapter/:chapterId/audio/upload', protect, audioUpload.single('audio'), uploadChapterAudio);

// POST /chapter/:chapterId/audio/generate - Generate audio bằng TTS AI
router.post('/chapter/:chapterId/audio/generate', protect, generateChapterAudio);

// DELETE /chapter/:chapterId/audio - Xóa audio của chapter
router.delete('/chapter/:chapterId/audio', protect, deleteChapterAudio);

// ==================== Novel Audio (Batch) ====================
// GET /novel/:novelId/audio - Lấy danh sách audio của tất cả chapters
router.get('/novel/:novelId/audio', getNovelAudioList);

// POST /novel/:novelId/audio/batch-generate - Generate audio hàng loạt
router.post('/novel/:novelId/audio/batch-generate', protect, batchGenerateAudio);

// ==================== Batch Status ====================
// GET /audio/batch-status/:jobId - Kiểm tra trạng thái batch job
router.get('/batch-status/:jobId', getBatchStatus);

export default router;
