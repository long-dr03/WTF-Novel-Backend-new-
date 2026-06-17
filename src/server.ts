import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';
import Chapter from './models/Chapter';

const PORT = process.env.PORT || 3000;

const publishScheduledChapters = async () => {
    try {
        const now = new Date();
        // Cập nhật tất cả các chương ở trạng thái 'scheduled' mà thời gian scheduledAt đã qua
        const result = await Chapter.updateMany(
            {
                status: 'scheduled',
                scheduledAt: { $lte: now }
            },
            {
                $set: {
                    status: 'published',
                    publishedAt: now
                }
            }
        );
        if (result.modifiedCount > 0) {
            console.log(`⏰ [Scheduler] Đã tự động đăng tải ${result.modifiedCount} chương truyện hẹn giờ.`);
        }
    } catch (err) {
        console.error('⏰ [Scheduler] Lỗi khi đăng tải chương truyện hẹn giờ:', err);
    }
};

connectDB().then(() => {
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log('✅ MongoDB connected successfully');
        
        // Chạy kiểm tra đăng chương hẹn giờ mỗi 1 phút
        publishScheduledChapters();
        setInterval(publishScheduledChapters, 60 * 1000);
    });
}).catch((error) => {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
});
