import mongoose, { Schema, Model } from 'mongoose';
import { IGame, GameCategory } from '../types';

const gameSchema = new Schema<IGame>(
  {
    name: {
      type: String,
      required: [true, 'Game name is required'],
      trim: true,
      maxlength: [100, 'Game name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Game description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
      type: String,
      required: [true, 'Game category is required'],
      enum: Object.values(GameCategory)
    },
    platforms: {
      type: [String],
      required: [true, 'At least one platform is required'],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one platform must be specified'
      }
    },
    imageUrl: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rules: {
      type: [String],
      default: []
    },
    metadata: {
      minPlayers: {
        type: Number,
        required: true,
        min: [1, 'Minimum players must be at least 1'],
        default: 2
      },
      maxPlayers: {
        type: Number,
        required: true,
        min: [1, 'Maximum players must be at least 1'],
        default: 2
      }
    },
    createdBy: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc: any, ret: any) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

gameSchema.index({ name: 1 });
gameSchema.index({ category: 1 });
gameSchema.index({ isActive: 1 });

const Game: Model<IGame> = mongoose.model<IGame>('Game', gameSchema);

export default Game;
