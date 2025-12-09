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
    contentJson: ITiptapContent;        // JSON format - để load lại vào editor khi edit
    wordCount: number;
    charCount: number;
    status: 'draft' | 'published' | 'scheduled';
    scheduledAt?: Date;                 // Thời gian đăng theo lịch (nếu status = scheduled)
    publishedAt?: Date;
    views: number;
    authorNote?: string;                // Ghi chú của tác giả cuối chương
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
        required: true
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

// Virtual để lấy thời gian đọc ước tính (200 từ/phút)
ChapterSchema.virtual('readingTime').get(function() {
    return Math.ceil(this?.wordCount / 200);
});

// Middleware: Tự động set publishedAt khi status chuyển sang published
ChapterSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next;
});

export default mongoose.model<IChapter>('Chapter', ChapterSchema);
