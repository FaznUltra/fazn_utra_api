import { Request, Response, NextFunction } from 'express';
import Game from '../models/Game';
import { asAuthRequest } from '../types';
import { AppError } from '../utils/AppError';

export const createGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = asAuthRequest(req);
    const gameData = {
      ...req.body,
      createdBy: authReq.user?.id
    };

    const game = await Game.create(gameData);

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      game
    });
  } catch (error) {
    next(error);
  }
};

export const getAllGames = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, isActive, search } = req.query;

    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const games = await Game.find(filter).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: games.length,
      games
    });
  } catch (error) {
    next(error);
  }
};

export const getGameById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const game = await Game.findById(id);

    if (!game) {
      return next(new AppError('Game not found', 404));
    }

    res.status(200).json({
      success: true,
      game
    });
  } catch (error) {
    next(error);
  }
};

export const getGamesByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.params;

    const games = await Game.find({ 
      category, 
      isActive: true 
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: games.length,
      games
    });
  } catch (error) {
    next(error);
  }
};

export const updateGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const game = await Game.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!game) {
      return next(new AppError('Game not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Game updated successfully',
      game
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGame = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const game = await Game.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!game) {
      return next(new AppError('Game not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Game deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveGames = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const games = await Game.find({ isActive: true }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: games.length,
      games
    });
  } catch (error) {
    next(error);
  }
};
