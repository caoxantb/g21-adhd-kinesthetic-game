import mongoose from 'mongoose';

const gameplaySchema = new mongoose.Schema({
    player: {
        type: String,
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
}, {
    timestamps: true
});

const Gameplay = mongoose.model('Gameplay', gameplaySchema);

export default Gameplay;
