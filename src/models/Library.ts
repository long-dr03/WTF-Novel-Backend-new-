import mongoose, { Schema, Document } from 'mongoose';

export interface ILibrary extends Document {
    user: mongoose.Types.ObjectId;
    novel: mongoose.Types.ObjectId;
    type: 'history' | 'favorite';
    lastReadChapter?: mongoose.Types.ObjectId;
    lastReadPage?: number; // For future detailed reading position
    createdAt: Date;
    updatedAt: Date;
}

const LibrarySchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    novel: {
        type: Schema.Types.ObjectId,
        ref: 'Novel',
        required: true
    },
    type: {
        type: String,
        enum: ['history', 'favorite'],
        required: true
    },
    lastReadChapter: {
        type: Schema.Types.ObjectId,
        ref: 'Chapter'
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate favorite/history entries for same user/novel (except we might want to update history)
// Actually for history, we just update the 'updatedAt' and 'lastReadChapter'.
LibrarySchema.index({ user: 1, novel: 1, type: 1 }, { unique: true });
LibrarySchema.index({ user: 1, type: 1, updatedAt: -1 }); // For fast retrieval of "My Favorites" or "Recent History"

export default mongoose.model<ILibrary>('Library', LibrarySchema);
