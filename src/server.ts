import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log('✅ MongoDB connected successfully');
    });
}).catch((error) => {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
});
