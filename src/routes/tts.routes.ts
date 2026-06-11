import { Router } from 'express';
import {
    uploadChapterAudio,
    deleteChapterAudio,
    getChapterAudioInfo,
    getNovelAudioList,
    updateChapterAudioUrl
} from '../controllers/tts.controller';
import { audioUpload } from '../middlewares/audioUpload.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// ==================== Single Chapter Audio ====================
// GET /chapter/:chapterId/audio - Lấy thông tin audio của chapter
router.get('/chapter/:chapterId/audio', getChapterAudioInfo);

// POST /chapter/:chapterId/audio/upload - Upload audio file cho chapter
router.post('/chapter/:chapterId/audio/upload', protect, audioUpload.single('audio'), uploadChapterAudio);

// POST /chapter/:chapterId/audio/url - Cập nhật audio URL (UploadThing)
router.post('/chapter/:chapterId/audio/url', protect, updateChapterAudioUrl);

// DELETE /chapter/:chapterId/audio - Xóa audio của chapter
router.delete('/chapter/:chapterId/audio', protect, deleteChapterAudio);

// ==================== Novel Audio ====================
// GET /novel/:novelId/audio - Lấy danh sách audio của tất cả chapters
router.get('/novel/:novelId/audio', getNovelAudioList);

export default router;

