import mongoose, { Schema, Document } from 'mongoose';

// Interface cho JSON content từ Tiptap Editor
export interface ITiptapContent {
    type: string;
    content?: ITiptapContent[];
    attrs?: Record<string, unknown>;
    marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
    text?: string;
}

export interface IChapter extends Document {
    novelId: mongoose.Types.ObjectId;
    chapterNumber: number;
    title: string;
    content: string;                    // HTML format - để render nhanh cho reader
    contentJson?: ITiptapContent | null; // JSON format - để load lại vào editor khi edit (optional cho Word import)
    wordCount: number;
    charCount: number;
    status: 'draft' | 'published' | 'scheduled';
    scheduledAt?: Date;                 // Thời gian đăng theo lịch (nếu status = scheduled)
    publishedAt?: Date;
    views: number;
    authorNote?: string;                // Ghi chú của tác giả cuối chương
    // Audio/TTS fields
    audioUrl?: string;                  // URL của file audio
    audioStatus: 'none' | 'processing' | 'completed' | 'failed'; // Trạng thái audio
    audioDuration?: number;             // Thời lượng audio (giây)
    audioGeneratedAt?: Date;            // Thời gian tạo audio
    audioSource?: 'upload' | 'tts';     // Nguồn audio: upload thủ công hoặc TTS AI
}

const ChapterSchema: Schema = new Schema({
    novelId: {
        type: Schema.Types.ObjectId,
        ref: 'Novel',
        required: true
    },
    chapterNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true
    },
    contentJson: {
        type: Schema.Types.Mixed,       // Lưu JSON object từ Tiptap
        required: false,                // Optional - có thể không có khi import từ Word
        default: null
    },
    wordCount: {
        type: Number,
        default: 0,
        min: 0
    },
    charCount: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'scheduled'],
        default: 'draft'
    },
    scheduledAt: {
        type: Date,
        default: null
    },
    publishedAt: {
        type: Date,
        default: null
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    authorNote: {
        type: String,
        maxlength: 1000,
        default: null
    },
    // Audio/TTS fields
    audioUrl: {
        type: String,
        default: null
    },
    audioStatus: {
        type: String,
        enum: ['none', 'processing', 'completed', 'failed'],
        default: 'none'
    },
    audioDuration: {
        type: Number,
        default: null
    },
    audioGeneratedAt: {
        type: Date,
        default: null
    },
    audioSource: {
        type: String,
        enum: ['upload', 'tts'],
        default: null
    }
}, {
    timestamps: true    // Tự động thêm createdAt và updatedAt
});

// Indexes for optimization
ChapterSchema.index({ novelId: 1, chapterNumber: 1 }, { unique: true }); // Compound unique index
ChapterSchema.index({ novelId: 1, status: 1 }); // Query chapters by novel and status
ChapterSchema.index({ status: 1, scheduledAt: 1 }); // Query scheduled chapters
ChapterSchema.index({ publishedAt: -1 }); // Sort by publish date
ChapterSchema.index({ views: -1 }); // Sort by views (popular chapters)
ChapterSchema.index({ audioStatus: 1 }); // Query by audio status

// Virtual để lấy thời gian đọc ước tính (200 từ/phút)
ChapterSchema.virtual('readingTime').get(function(this: IChapter) {
    return Math.ceil(this.wordCount / 200);
});

// Middleware: Tự động set publishedAt khi status chuyển sang published
ChapterSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next;
});

export default mongoose.model<IChapter>('Chapter', ChapterSchema);
