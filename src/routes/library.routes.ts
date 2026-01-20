import express from 'express';
import { addToLibrary, getLibrary, removeFromLibrary, checkLibraryStatus } from '../controllers/library.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect); // All routes require auth

router.get('/', getLibrary);
router.post('/', addToLibrary);
router.delete('/:novelId', removeFromLibrary);
router.get('/check/:novelId', checkLibraryStatus);

export default router;
