import mongoose from 'mongoose';

const frameSchema = new mongoose.Schema({
    difficultyLevel: [{
        type: Number,
        ref: 'Level',
        required: true
    }],
    // This is subject to change, so this is just a mock data model. 
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
