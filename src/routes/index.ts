import { Router } from 'express';
import homeRoutes from './home.routes';
import ttsRoutes from './tts.routes';

const router = Router();

router.use('/', homeRoutes);
router.use('/audio', ttsRoutes);

export default router;
