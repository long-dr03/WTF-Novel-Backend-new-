import { Router } from 'express';
import { index } from '../controllers/home.controller';
import { login, register, getProfile, updateProfile } from '../controllers/authendication';
import { createNovel, uploadChapter, updateChapterStatus, updateNovelStatus, updateNovel } from '../controllers/uploadNovel';
import { getPopularNovels, getNovelsByAuthor, getNovelById, getChaptersByNovel, getChapterContent, getPublicNovels, getPublicGenres } from '../controllers/getNovel';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
// authen
router.get('/', index);
router.post('/login', login);
router.post('/register', register);
// novel
router.post('/create-novel', createNovel);
router.post('/upload-chapter', uploadChapter);
router.get('/novel/:id', getNovelById);
router.get('/author/:authorId/novels', getNovelsByAuthor);
router.get('/novels/popular', getPopularNovels);
router.get('/novels', getPublicNovels);
router.get('/genres', getPublicGenres);
router.put('/novel/:novelId/status', updateNovelStatus);
router.put('/novel/:novelId', updateNovel);
// chapters
router.get('/novel/:novelId/chapters', getChaptersByNovel);
router.get('/novel/:novelId/chapter/:chapterNumber', getChapterContent);
router.put('/chapter/:chapterId/status', updateChapterStatus);
// profile
router.get('/me', protect, getProfile);
router.put('/me', protect, upload.single('avatar'), updateProfile);

export default router;
