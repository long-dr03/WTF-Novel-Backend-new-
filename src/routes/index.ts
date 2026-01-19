import { Router } from 'express';
import homeRoutes from './home.routes';
import ttsRoutes from './tts.routes';

import musicRoutes from './music.routes';

const router = Router();

router.use('/', homeRoutes);
router.use('/audio', ttsRoutes);
router.use('/music', musicRoutes);

export default router;
