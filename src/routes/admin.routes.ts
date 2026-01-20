import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { admin } from '../middlewares/authAdmin.middleware';
import * as adminController from '../controllers/adminController';

const router = Router();

// Tất cả các route admin đều yêu cầu đăng nhập và quyền admin
router.use(protect, admin);

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus); // Ban/Unban/Change Role

// Novel Management
router.get('/novels', adminController.getNovels);
router.put('/novels/:id/approve', adminController.approveNovel);
router.put('/novels/:id/reject', adminController.rejectNovel);
router.put('/novels/:id/featured', adminController.toggleFeatured);
router.delete('/novels/:id', adminController.deleteNovel);

// Genre Management
router.get('/genres', adminController.getGenres);
router.post('/genres', adminController.createGenre);
router.post('/genres/seed', adminController.seedGenres);
router.put('/genres/:id', adminController.updateGenre);
router.delete('/genres/:id', adminController.deleteGenre);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

export default router;
