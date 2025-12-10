import { Router } from 'express';
import { index } from '../controllers/home.controller';
import { login, register, getProfile, updateProfile } from '../controllers/authendication';
import { createNovel, uploadChapter } from '../controllers/uploadNovel';
import { getPopularNovels, getNovelsByAuthor, getNovelById } from '../controllers/getNovel';
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
// profile
router.get('/me', protect, getProfile);
router.put('/me', protect, upload.single('avatar'), updateProfile);

export default router;
