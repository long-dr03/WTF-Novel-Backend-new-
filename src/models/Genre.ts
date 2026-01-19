import mongoose, { Schema, Document } from 'mongoose';

export interface IGenre extends Document {
    name: string;
    description: string;
    image: string;
    slug: string;
}

const GenreSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    }
}, {
    timestamps: true
});

GenreSchema.index({ slug: 1 });

export default mongoose.model<IGenre>('Genre', GenreSchema);