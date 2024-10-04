
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: 0
    },
    avatar: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'player'],
        default: 'player'
    },
    currentLevel: {
        type: Number,
        default: 1,
        min: 1
    },
    totalScore: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
