import Gameplay from '../models/gameplayModel.js';

// Save a new gameplay session
export const saveGameplay = async (req, res, next) => {
    const { player, level, score, completedTime, numberOfResets, isWon } = req.body;

    try {
        const newGameplay = new Gameplay({
            player,
            level,
            score,
            completedTime,
            numberOfResets,
            isWon
        });
        const savedGameplay = await newGameplay.save();
        res.status(201).json(savedGameplay);
    } catch (error) {
        next(error); // Passes error to middleware
    }
};

// Get gameplay by ID
export const getGameplayById = async (req, res, next) => {
    try {
        const gameplay = await Gameplay.findById(req.params.id);
        if (!gameplay) {
            return res.status(404).json({ message: 'Gameplay not found' });
        }
        res.status(200).json(gameplay);
    } catch (error) {
        next(error); // Passes error to middleware
    }
};

// Get all gameplays by player
export const getGameplaysByPlayer = async (req, res, next) => {
    try {
        const gameplays = await Gameplay.find({ player: req.params.player });
        if (gameplays.length === 0) {
            return res.status(404).json({ message: 'No gameplays found for this player' });
        }
        res.status(200).json(gameplays);
    } catch (error) {
        next(error); // Passes error to middleware
    }
};

// Get all gameplays by level
export const getGameplaysByLevel = async (req, res, next) => {
    try {
        const gameplays = await Gameplay.find({ level: req.params.levelId });
        if (gameplays.length === 0) {
            return res.status(404).json({ message: 'No gameplays found for this level' });
        }
        res.status(200).json(gameplays);
    } catch (error) {
        next(error); // Passes error to middleware
    }
};
