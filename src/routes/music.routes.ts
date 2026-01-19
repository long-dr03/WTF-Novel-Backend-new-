import express from 'express';
import { uploadMusic, getMusicLibrary, deleteMusic, getMyMusic } from '../controllers/music.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', protect, getMusicLibrary); // Optional auth for public system music
router.get('/my-music', protect, getMyMusic);
router.post('/', protect, uploadMusic);
router.delete('/:id', protect, deleteMusic);

export default router;
