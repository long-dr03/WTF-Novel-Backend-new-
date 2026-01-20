import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    emailNotification: boolean;
    autoApproveNovels: boolean;
    minWordsPerChapter: number;
}

const SettingSchema: Schema = new Schema({
    siteName: { type: String, default: 'Novel' },
    siteDescription: { type: String, default: 'Nền tảng đọc truyện online hàng đầu Việt Nam' },
    maintenanceMode: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: true },
    autoApproveNovels: { type: Boolean, default: false },
    minWordsPerChapter: { type: Number, default: 1000 }
}, {
    timestamps: true
});

export default mongoose.model<ISetting>('Setting', SettingSchema);
