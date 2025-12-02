import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 6969;

// Kết nối database trước khi start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log('✅ MongoDB connected successfully');
    });
}).catch((error) => {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
});
