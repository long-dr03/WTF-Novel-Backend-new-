// src/config/controllers/authentication.ts
import { Request, Response } from 'express';
import Novel from '../models/Novel';
import Chapter from '../models/Chapter';
import mongoose from "mongoose";

// Map status từ tiếng Việt sang English
const mapStatus = (status: string): 'ongoing' | 'completed' | 'hiatus' => {
    const statusMap: Record<string, 'ongoing' | 'completed' | 'hiatus'> = {
        'Đang viết': 'ongoing',
        'Hoàn thành': 'completed',
        'Tạm dừng': 'hiatus',
        'ongoing': 'ongoing',
        'completed': 'completed',
        'hiatus': 'hiatus'
    };
    return statusMap[status] || 'ongoing';
};

// Cập nhật profile
export const createNovel = async (req: Request, res: Response) => {
    try {
        const data = req.body.data; // Lấy data từ req.body.data
        console.log("novel upload", data);

        if (!data || !data.title || !data.description || !data.author) {
            return res.status(400).json({
                status: 'error',
                message: 'Thiếu thông tin bắt buộc: title, description, author'
            });
        }

        // Xử lý genres - lọc bỏ empty strings
        const validGenres = (data.genres || []).filter((g: string) => g && g.trim() !== '');

        // Xử lý image - nếu là blob URL thì dùng default
        let imageUrl = data.image;
        if (!imageUrl || imageUrl.startsWith('blob:')) {
            imageUrl = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        }

        const novelData = {
            title: data.title,
            description: data.description,
            author: data.author,
            genres: validGenres,
            image: imageUrl,
            status: mapStatus(data.status),
            views: data.views || 0,
            likes: data.likes || 0
        };

        const novel = new Novel(novelData);
        await novel.save();

        console.log("novel mới đã lưu", novel);

        return res.status(200).json({
            EM: 'Tạo truyện thành công',
            EC: 0,
            DT: {
                novelId: novel._id,
                title: novel.title,
                description: novel.description,
                image: novel.image,
                status: novel.status
            }
        });

    } catch (error) {
        console.error('Create novel error:', error);
        return res.status(500).json({
            EM: 'Lỗi server. Vui lòng thử lại sau.',
            EC: -1,
            DT: {}
        });
    }
};
export const uploadChapter = async (req: Request, res: Response) => {
    try {
        const data = req.body.data; // Lấy data từ req.body.data (giống createNovel)
        let chapter;
        
        if (!data || !data.novelId) {
            return res.status(400).json({
                EM: 'Thiếu thông tin novelId',
                EC: -1,
                DT: {}
            });
        }
        
        const novel = await Novel.findById(new mongoose.Types.ObjectId(data.novelId));
        console.log("novel found", data, "id", data.novelId);
        if (!novel) {
            return res.status(404).json({
                EM: 'Không tìm thấy truyện',
                EC: -1,
                DT: {}
            });
        }

        // Kiểm tra xem là tạo mới hay cập nhật
        // Nếu có chapterId hoặc tìm thấy chương với cùng novelId và chapterNumber -> update
        let existingChapter = null;
        
        if (data.chapterId) {
            existingChapter = await Chapter.findById(data.chapterId);
        } else {
            // Tìm chương theo novelId và chapterNumber
            existingChapter = await Chapter.findOne({
                novelId: new mongoose.Types.ObjectId(data.novelId),
                chapterNumber: data.chapterNumber
            });
        }

        if (existingChapter) {
            // Update chương cũ
            existingChapter.title = data.title;
            existingChapter.content = data.content;
            existingChapter.contentJson = data.contentJson;
            existingChapter.wordCount = data.wordCount;
            existingChapter.charCount = data.charCount;
            existingChapter.status = data.status || existingChapter.status;
            
            await existingChapter.save();
            chapter = existingChapter;
            
            console.log("Cập nhật chương:", chapter);
            res.status(200).json({
                EM: 'Cập nhật chương thành công',
                EC: 0,
                DT: {
                    chapterId: chapter._id,
                    novelId: data.novelId,
                    chapterNumber: chapter.chapterNumber,
                    isUpdate: true
                }
            });
        } else {
            // Tạo chương mới
            console.log("data", JSON.stringify(data));
            chapter = new Chapter({
                novelId: new mongoose.Types.ObjectId(data.novelId),
                chapterNumber: data.chapterNumber,
                title: data.title,
                content: data.content,
                contentJson: data.contentJson,
                wordCount: data.wordCount,
                charCount: data.charCount,
                status: data.status || 'draft'
            });
            await chapter.save();
            
            console.log("Chap mới:", chapter);
            res.status(200).json({
                EM: 'Tạo chương thành công',
                EC: 0,
                DT: {
                    chapterId: chapter._id,
                    novelId: data.novelId,
                    chapterNumber: chapter.chapterNumber,
                    isUpdate: false
                }
            });
        }

    } catch (error) {
        console.error('Upload chapter error:', error);
        return res.status(500).json({
            EM: 'Lỗi server. Vui lòng thử lại sau.',
            EC: -1,
            DT: {}
        });
    }
};

// Cập nhật trạng thái chương
export const updateChapterStatus = async (req: Request, res: Response) => {
    try {
        const { chapterId } = req.params;
        const { status } = req.body;

        if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
            return res.status(400).json({
                EM: 'ID chương không hợp lệ',
                EC: -1,
                DT: {}
            });
        }

        if (!status || !['draft', 'published', 'scheduled'].includes(status)) {
            return res.status(400).json({
                EM: 'Trạng thái không hợp lệ. Các trạng thái hợp lệ: draft, published, scheduled',
                EC: -1,
                DT: {}
            });
        }

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return res.status(404).json({
                EM: 'Không tìm thấy chương',
                EC: -1,
                DT: {}
            });
        }

        chapter.status = status;
        if (status === 'published' && !chapter.publishedAt) {
            chapter.publishedAt = new Date();
        }
        await chapter.save();

        res.status(200).json({
            EM: 'Cập nhật trạng thái chương thành công',
            EC: 0,
            DT: {
                chapterId: chapter._id,
                status: chapter.status,
                publishedAt: chapter.publishedAt
            }
        });
    } catch (error) {
        console.error('Update chapter status error:', error);
        return res.status(500).json({
            EM: 'Lỗi server. Vui lòng thử lại sau.',
            EC: -1,
            DT: {}
        });
    }
};

// Cập nhật trạng thái truyện
export const updateNovelStatus = async (req: Request, res: Response) => {
    try {
        const { novelId } = req.params;
        const { status } = req.body;

        if (!novelId || !mongoose.Types.ObjectId.isValid(novelId)) {
            return res.status(400).json({
                EM: 'ID truyện không hợp lệ',
                EC: -1,
                DT: {}
            });
        }

        if (!status || !['ongoing', 'completed', 'hiatus'].includes(status)) {
            return res.status(400).json({
                EM: 'Trạng thái không hợp lệ. Các trạng thái hợp lệ: ongoing, completed, hiatus',
                EC: -1,
                DT: {}
            });
        }

        const novel = await Novel.findById(novelId);
        if (!novel) {
            return res.status(404).json({
                EM: 'Không tìm thấy truyện',
                EC: -1,
                DT: {}
            });
        }

        novel.status = status;
        await novel.save();

        res.status(200).json({
            EM: 'Cập nhật trạng thái truyện thành công',
            EC: 0,
            DT: {
                novelId: novel._id,
                status: novel.status
            }
        });
    } catch (error) {
        console.error('Update novel status error:', error);
        return res.status(500).json({
            EM: 'Lỗi server. Vui lòng thử lại sau.',
            EC: -1,
            DT: {}
        });
    }
};
