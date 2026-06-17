import mongoose, { Schema, Document } from 'mongoose';

// Cấu hình 1 banner quảng cáo (ảnh + link)
export interface IAdSlot {
    enabled: boolean;
    imageUrl: string;
    link: string;
}

export interface ISetting extends Document {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    emailNotification: boolean;
    autoApproveNovels: boolean;
    minWordsPerChapter: number;
    // Quảng cáo 2 bên trái/phải
    ads: {
        enabled: boolean;
        left: IAdSlot;
        right: IAdSlot;
    };
    // Popup chào mừng hiện ngay khi vào web
    popup: {
        enabled: boolean;
        title: string;
        description: string;
        imageUrl: string;
        link: string;
    };
}

const AdSlotSchema = new Schema<IAdSlot>({
    enabled: { type: Boolean, default: false },
    imageUrl: { type: String, default: '' },
    link: { type: String, default: '' }
}, { _id: false });

// Dùng sub-schema (không phải nested object thường) để Mongoose theo dõi
// được thay đổi khi gán lại cả object lúc cập nhật cài đặt.
const AdsSchema = new Schema({
    enabled: { type: Boolean, default: false },
    left: { type: AdSlotSchema, default: () => ({}) },
    right: { type: AdSlotSchema, default: () => ({}) }
}, { _id: false });

const PopupSchema = new Schema({
    enabled: { type: Boolean, default: false },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    link: { type: String, default: '' }
}, { _id: false });

const SettingSchema: Schema = new Schema({
    siteName: { type: String, default: 'Novel' },
    siteDescription: { type: String, default: 'Nền tảng đọc truyện online hàng đầu Việt Nam' },
    maintenanceMode: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: true },
    autoApproveNovels: { type: Boolean, default: false },
    minWordsPerChapter: { type: Number, default: 1000 },
    ads: { type: AdsSchema, default: () => ({}) },
    popup: { type: PopupSchema, default: () => ({}) }
}, {
    timestamps: true
});

export default mongoose.model<ISetting>('Setting', SettingSchema);
