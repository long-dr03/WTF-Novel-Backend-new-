import mongoose from 'mongoose';
import Genre from '../src/models/Genre';

const seedGenres = [
    {
        name: 'Tiên Hiệp',
        slug: 'tien-hiep',
        description: 'Thể loại tu tiên, tu luyện, với những câu chuyện về việc tìm kiếm đạo và trường sinh'
    },
    {
        name: 'Huyền Huyễn',
        slug: 'huyen-huyen',
        description: 'Thể loại giả tưởng phương Đông với ma pháp, võ công và những yếu tố huyền bí'
    },
    {
        name: 'Đô Thị',
        slug: 'do-thi',
        description: 'Thể loại đời thường trong bối cảnh đô thị hiện đại'
    },
    {
        name: 'Hệ Thống',
        slug: 'he-thong',
        description: 'Nhân vật chính nhận được hệ thống hỗ trợ với nhiệm vụ và phần thưởng'
    },
    {
        name: 'Trọng Sinh',
        slug: 'trong-sinh',
        description: 'Nhân vật chính được trở về quá khứ để sống lại cuộc đời'
    },
    {
        name: 'Xuyên Không',
        slug: 'xuyen-khong',
        description: 'Nhân vật di chuyển qua không gian hoặc thời gian sang thế giới khác'
    },
    {
        name: 'Ngôn Tình',
        slug: 'ngon-tinh',
        description: 'Thể loại tình cảm, lãng mạn'
    },
    {
        name: 'Kiếm Hiệp',
        slug: 'kiem-hiep',
        description: 'Thể loại võ hiệp cổ điển với giang hồ, kiếm pháp'
    },
    {
        name: 'Khoa Huyễn',
        slug: 'khoa-huyen',
        description: 'Thể loại khoa học viễn tưởng'
    },
    {
        name: 'Đồng Nhân',
        slug: 'dong-nhan',
        description: 'Truyện dựa trên các tác phẩm gốc đã có'
    }
];

async function seed() {
    try {
        // Connect to MongoDB - try common connection strings
        const mongoUri = process.env.MONGODB_URI ||
            'mongodb+srv://cluster0.mongodb.net/novel' ||
            'mongodb://localhost:27017/novel';

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing genres
        await Genre.deleteMany({});
        console.log('Cleared existing genres');

        // Insert seed genres
        const inserted = await Genre.insertMany(seedGenres);
        console.log(`Inserted ${inserted.length} genres:`, inserted.map(g => g.name).join(', '));

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
