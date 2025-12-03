import mongoose, { Schema, Document } from 'mongoose';

export interface INovel extends Document {
    title: string;
    description: string;
    image: string;
    author: mongoose.Types.ObjectId;
    genres: mongoose.Types.ObjectId[];
    status: 'ongoing' | 'completed' | 'hiatus';
    views: number;
    likes: number;
}

const NovelSchema: Schema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    genres: [{
        type: Schema.Types.ObjectId,
        ref: 'Genre'
    }],
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'hiatus'],
        default: 'ongoing'
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for optimization
NovelSchema.index({ title: 'text' }); // Text search
NovelSchema.index({ author: 1 });
NovelSchema.index({ genres: 1 });
NovelSchema.index({ status: 1 });
NovelSchema.index({ views: -1, createdAt: -1 }); // Compound index for sorting by popularity

export default mongoose.model<INovel>('Novel', NovelSchema);
