import { Router } from 'express';
import homeRoutes from './home.routes';
import ttsRoutes from './tts.routes';
import musicRoutes from './music.routes';
import adminRoutes from './admin.routes';
import libraryRoutes from './library.routes';

const router = Router();

router.use('/', homeRoutes);
router.use('/audio', ttsRoutes);
router.use('/music', musicRoutes);
router.use('/admin', adminRoutes);
router.use('/library', libraryRoutes);

export default router;
