import { Router } from 'express';
import { index } from '../controllers/home.controller';
import { login, register, getProfile, updateProfile } from '../controllers/authendication';
import { createNovel,uploadChapter } from '../controllers/uploadNovel';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', index);
router.post('/login', login);
router.post('/register', register);
router.post('/create-novel', createNovel);
router.post('/upload-chapter', uploadChapter);
router.get('/me', protect, getProfile);
router.put('/me', protect, upload.single('avatar'), updateProfile);

export default router;
