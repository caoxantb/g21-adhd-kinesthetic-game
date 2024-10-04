import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
        unique: true,
        min: 1,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    theme: {
        type: String,
        required: true,
        trim: true
    },
    defaultTime: {
        type: Number,
        required: true,
        min: 0
    },
    maximumScore: {
        type: Number,
        required: true,
        min: 0
    },
    numberOfMovements: {
        type: Number,
        required: true,
        min: 0
    },
    numberOfFreezes: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

const Level = mongoose.model('Level', levelSchema);

export default Level;
