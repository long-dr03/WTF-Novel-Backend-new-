import mongoose from 'mongoose';
import Genre from '../src/models/Genre';
import dotenv from 'dotenv';
dotenv.config();

const seedGenres = [
    {
        name: 'Tiên Hiệp',
        slug: 'tien-hiep',
        description: 'Thể loại tu tiên, tu luyện, với những câu chuyện về việc tìm kiếm đạo và trường sinh'
    },
    {
        name: 'Kiếm Hiệp',
        slug: 'kiem-hiep',
        description: 'Thể loại võ hiệp cổ điển với giang hồ, kiếm pháp'
    },
    {
        name: 'Ngôn Tình',
        slug: 'ngon-tinh',
        description: 'Thể loại tình cảm, lãng mạn'
    },
    {
        name: 'Đam Mỹ',
        slug: 'dam-my',
        description: 'Thể loại truyện tình cảm nam - nam'
    },
    {
        name: 'Bách Hợp',
        slug: 'bach-hop',
        description: 'Thể loại truyện tình cảm nữ - nữ'
    },
    {
        name: 'Quan Trường',
        slug: 'quan-truong',
        description: 'Thể loại truyện về chính trị, tranh đoạt quyền lực trong cơ quan nhà nước'
    },
    {
        name: 'Võng Du',
        slug: 'vong-du',
        description: 'Thể loại truyện về game online, thế giới ảo'
    },
    {
        name: 'Khoa Huyễn',
        slug: 'khoa-huyen',
        description: 'Thể loại khoa học viễn tưởng'
    },
    {
        name: 'Hệ Thống',
        slug: 'he-thong',
        description: 'Nhân vật chính nhận được hệ thống hỗ trợ với nhiệm vụ và phần thưởng'
    },
    {
        name: 'Huyền Huyễn',
        slug: 'huyen-huyen',
        description: 'Thể loại giả tưởng phương Đông với ma pháp, võ công và những yếu tố huyền bí'
    },
    {
        name: 'Dị Giới',
        slug: 'di-gioi',
        description: 'Truyện có bối cảnh ở một thế giới khác hoàn toàn thế giới thực'
    },
    {
        name: 'Dị Năng',
        slug: 'di-nang',
        description: 'Nhân vật sở hữu năng lực đặc biệt, siêu năng lực'
    },
    {
        name: 'Quân Sự',
        slug: 'quan-su',
        description: 'Thể loại chiến tranh, quân đội, binh pháp'
    },
    {
        name: 'Lịch Sử',
        slug: 'lich-su',
        description: 'Truyện lấy bối cảnh lịch sử hoặc liên quan đến các nhân vật, sự kiện lịch sử'
    },
    {
        name: 'Xuyên Không',
        slug: 'xuyen-khong',
        description: 'Nhân vật di chuyển qua không gian hoặc thời gian sang thế giới khác'
    },
    {
        name: 'Xuyên Nhanh',
        slug: 'xuyen-nhanh',
        description: 'Nhân vật liên tục xuyên qua nhiều thế giới khác nhau để làm nhiệm vụ'
    },
    {
        name: 'Trọng Sinh',
        slug: 'trong-sinh',
        description: 'Nhân vật chính được trở về quá khứ để sống lại cuộc đời'
    },
    {
        name: 'Trinh Thám',
        slug: 'trinh-tham',
        description: 'Thể loại phá án, điều tra, giải mã bí ẩn'
    },
    {
        name: 'Linh Dị',
        slug: 'linh-di',
        description: 'Thể loại kinh dị, ma quái, tâm linh'
    },
    {
        name: 'Ngược',
        slug: 'nguoc',
        description: 'Truyện có tình tiết đau khổ, dằn vặt nhân vật chính'
    },
    {
        name: 'Sắc',
        slug: 'sac',
        description: 'Truyện có yếu tố nhạy cảm, người lớn'
    },
    {
        name: 'Sủng',
        slug: 'sung',
        description: 'Truyện có tình tiết ngọt ngào, cưng chiều nhân vật'
    },
    {
        name: 'Cung Đấu',
        slug: 'cung-dau',
        description: 'Tranh đấu giành quyền lực, vị thế trong hoàng cung'
    },
    {
        name: 'Nữ Cường',
        slug: 'nu-cuong',
        description: 'Nhân vật chính là nữ có tính cách mạnh mẽ, tài giỏi'
    },
    {
        name: 'Gia Đấu',
        slug: 'gia-dau',
        description: 'Tranh đấu, tranh giành quyền lợi giữa các thế lực, thành viên trong gia tộc'
    },
    {
        name: 'Đông Phương',
        slug: 'dong-phuong',
        description: 'Truyện mang đậm bản sắc văn hóa phương Đông'
    },
    {
        name: 'Đô Thị',
        slug: 'do-thi',
        description: 'Thể loại đời thường trong bối cảnh đô thị hiện đại'
    },
    {
        name: 'Điền Văn',
        slug: 'dien-van',
        description: 'Truyện kể về cuộc sống bình dị, làm ruộng, gia đình hàng ngày'
    },
    {
        name: 'Mạt Thế',
        slug: 'mat-the',
        description: 'Truyện về ngày tận thế, sinh tồn'
    },
    {
        name: 'Truyện Teen',
        slug: 'truyen-teen',
        description: 'Truyện dành cho lứa tuổi thanh thiếu niên, học đường'
    },
    {
        name: 'Nữ Phụ',
        slug: 'nu-phu',
        description: 'Nhân vật chính xuyên vào hoặc đóng vai nữ phụ trong cốt truyện gốc'
    },
    {
        name: 'Light Novel',
        slug: 'light-novel',
        description: 'Tiểu thuyết ngắn có nguồn gốc từ Nhật Bản'
    },
    {
        name: 'Đoản Văn',
        slug: 'doan-van',
        description: 'Truyện cực ngắn, cốt truyện súc tích'
    },
    {
        name: 'Hiện đại',
        slug: 'hien-dai',
        description: 'Truyện có bối cảnh thời kỳ hiện đại ngày nay'
    },
    {
        name: 'Khác',
        slug: 'khac',
        description: 'Các thể loại truyện khác chưa được phân loại cụ thể'
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
