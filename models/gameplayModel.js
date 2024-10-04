import mongoose from 'mongoose';

const gameplaySchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    level: {
        type: Number,
        ref: 'Level',
        required: true
    },
    score: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    completedTime: {
        type: Number,
        required: true,
        min: 0
    },
    numberOfResets: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    isWon: {
        type: Boolean,
        required: true,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Gameplay = mongoose.model('Gameplay', gameplaySchema);

export default Gameplay;
