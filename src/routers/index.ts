import { Router } from 'express';
import authRoutes from './authRoutes';
import bookRoutes from './bookRoutes';
import authorRoutes from './authorRoutes';
import reviewRoutes from './reviewRoutes';

const router = Router();

// Mount the feature-specific routers
router.use('/auth', authRoutes);
router.use('/authors', authorRoutes);
router.use('/books', bookRoutes);
router.use('/reviews', reviewRoutes);

export default router;