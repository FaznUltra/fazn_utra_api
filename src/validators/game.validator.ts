import Joi from 'joi';
import { GameCategory } from '../types';

export const createGameSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.min': 'Game name must be at least 2 characters long',
      'string.max': 'Game name cannot exceed 100 characters',
      'any.required': 'Game name is required'
    }),
  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .trim()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 500 characters',
      'any.required': 'Description is required'
    }),
  category: Joi.string()
    .valid(...Object.values(GameCategory))
    .required()
    .messages({
      'any.only': 'Invalid game category',
      'any.required': 'Category is required'
    }),
  platforms: Joi.array()
    .items(Joi.string().trim().min(2).max(50))
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one platform is required',
      'any.required': 'Platforms are required'
    }),
  imageUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Please provide a valid image URL'
    }),
  rules: Joi.array()
    .items(Joi.string().trim().max(200))
    .optional()
    .messages({
      'string.max': 'Each rule cannot exceed 200 characters'
    }),
  metadata: Joi.object({
    minPlayers: Joi.number()
      .integer()
      .min(1)
      .default(2)
      .messages({
        'number.min': 'Minimum players must be at least 1'
      }),
    maxPlayers: Joi.number()
      .integer()
      .min(1)
      .default(2)
      .messages({
        'number.min': 'Maximum players must be at least 1'
      })
  }).default({
    minPlayers: 2,
    maxPlayers: 2
  })
});

export const updateGameSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .trim()
    .messages({
      'string.min': 'Game name must be at least 2 characters long',
      'string.max': 'Game name cannot exceed 100 characters'
    }),
  description: Joi.string()
    .min(10)
    .max(500)
    .optional()
    .trim()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 500 characters'
    }),
  category: Joi.string()
    .valid(...Object.values(GameCategory))
    .optional()
    .messages({
      'any.only': 'Invalid game category'
    }),
  platforms: Joi.array()
    .items(Joi.string().trim().min(2).max(50))
    .min(1)
    .optional()
    .messages({
      'array.min': 'At least one platform is required'
    }),
  imageUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Please provide a valid image URL'
    }),
  isActive: Joi.boolean()
    .optional(),
  rules: Joi.array()
    .items(Joi.string().trim().max(200))
    .optional()
    .messages({
      'string.max': 'Each rule cannot exceed 200 characters'
    }),
  metadata: Joi.object({
    minPlayers: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.min': 'Minimum players must be at least 1'
      }),
    maxPlayers: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.min': 'Maximum players must be at least 1'
      })
  }).optional()
});
