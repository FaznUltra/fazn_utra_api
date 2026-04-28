import { Router } from 'express';
import {
  createGame,
  getAllGames,
  getGameById,
  getGamesByCategory,
  updateGame,
  deleteGame,
  getActiveGames
} from '../controllers/game.controller';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGameSchema, updateGameSchema } from '../validators/game.validator';
import { UserRole } from '../types';

const router = Router();

router.get('/active', getActiveGames);
router.get('/category/:category', getGamesByCategory);
router.get('/:id', getGameById);
router.get('/', getAllGames);

router.use(protect);
router.use(restrictTo(UserRole.SUPER_ADMIN, UserRole.ADMIN));

router.post('/', validate(createGameSchema), createGame);
router.patch('/:id', validate(updateGameSchema), updateGame);
router.delete('/:id', deleteGame);

export default router;
