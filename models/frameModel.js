import mongoose from 'mongoose';

const frameSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    difficultyLevel: [{
        type: Number,
        ref: 'Level',
        required: true
    }],
    coordinates: {
        cameraX: {
            type: Number,
            required: true
        },
        cameraY: {
            type: Number,
            required: true
        },
        cameraZ: {
            type: Number,
            required: true
        }
    }
}, {
    timestamps: true
});

const Frame = mongoose.model('Frame', frameSchema);

export default Frame;
