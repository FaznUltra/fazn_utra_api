import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole, Currency } from '../types';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: false,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores']
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    },
    oauthProviders: {
      google: {
        id: { type: String },
        email: { type: String }
      },
      twitch: {
        id: { type: String },
        username: { type: String }
      }
    },
    streamingAccounts: {
      youtube: {
        channelId: { type: String },
        channelName: { type: String },
        isVerified: { type: Boolean, default: false },
        verifiedAt: { type: Date }
      },
      twitch: {
        username: { type: String },
        channelId: { type: String },
        isVerified: { type: Boolean, default: false },
        verifiedAt: { type: Date }
      }
    },
    wallets: [
      {
        currency: {
          type: String,
          enum: ['NGN', 'USD'],
          required: true
        },
        balance: {
          type: Number,
          default: 0,
          min: [0, 'Balance cannot be negative']
        }
      }
    ],
    rankings: [
      {
        gameId: {
          type: String,
          required: true
        },
        rank: {
          type: Number,
          default: 0
        },
        wins: {
          type: Number,
          default: 0
        },
        losses: {
          type: Number,
          default: 0
        },
        draws: {
          type: Number,
          default: 0
        },
        totalEarnings: {
          type: Number,
          default: 0
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc: any, ret: any) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.pre('save', async function (next) {
  if (this.isNew && (!this.wallets || this.wallets.length === 0)) {
    this.wallets = [
      { currency: Currency.NGN, balance: 0 },
      { currency: Currency.USD, balance: 0 }
    ];
  }

  if (!this.isModified('password') || !this.password) return next();

  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
