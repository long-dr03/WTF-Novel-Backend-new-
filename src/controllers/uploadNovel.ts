// src/config/controllers/authentication.ts
import { Request, Response } from 'express';
import Novel from '../models/Novel';
import Chapter from '../models/Chapter';
import mongoose from "mongoose";
import ApiResponse from '../utils/apiResponse';

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

// Tạo truyện mới
export const createNovel = async (req: Request, res: Response) => {
    try {
        const data = req.body.data;
        console.log("novel upload", data);

        if (!data || !data.title || !data.description || !data.author) {
            return ApiResponse.badRequest(res, 'Thiếu thông tin bắt buộc: title, description, author');
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

        return ApiResponse.created(res, {
            novelId: novel._id,
            title: novel.title,
            description: novel.description,
            image: novel.image,
            status: novel.status
        }, 'Tạo truyện thành công');

    } catch (error) {
        console.error('Create novel error:', error);
        return ApiResponse.serverError(res);
    }
};

export const uploadChapter = async (req: Request, res: Response) => {
    try {
        const data = req.body.data;
        let chapter;
        
        if (!data || !data.novelId) {
            return ApiResponse.badRequest(res, 'Thiếu thông tin novelId');
        }
        
        const novel = await Novel.findById(new mongoose.Types.ObjectId(data.novelId));
        console.log("novel found", data, "id", data.novelId);
        if (!novel) {
            return ApiResponse.notFound(res, 'Không tìm thấy truyện');
        }

        // Kiểm tra xem là tạo mới hay cập nhật
        let existingChapter = null;
        
        if (data.chapterId) {
            existingChapter = await Chapter.findById(data.chapterId);
        } else {
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
            return ApiResponse.updated(res, {
                chapterId: chapter._id,
                novelId: data.novelId,
                chapterNumber: chapter.chapterNumber,
                isUpdate: true
            }, 'Cập nhật chương thành công');
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
            return ApiResponse.created(res, {
                chapterId: chapter._id,
                novelId: data.novelId,
                chapterNumber: chapter.chapterNumber,
                isUpdate: false
            }, 'Tạo chương thành công');
        }

    } catch (error) {
        console.error('Upload chapter error:', error);
        return ApiResponse.serverError(res);
    }
};

// Cập nhật trạng thái chương
export const updateChapterStatus = async (req: Request, res: Response) => {
    try {
        const { chapterId } = req.params;
        const { status } = req.body;

        if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
            return ApiResponse.badRequest(res, 'ID chương không hợp lệ');
        }

        if (!status || !['draft', 'published', 'scheduled'].includes(status)) {
            return ApiResponse.badRequest(res, 'Trạng thái không hợp lệ. Các trạng thái hợp lệ: draft, published, scheduled');
        }

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return ApiResponse.notFound(res, 'Không tìm thấy chương');
        }

        chapter.status = status;
        if (status === 'published' && !chapter.publishedAt) {
            chapter.publishedAt = new Date();
        }
        await chapter.save();

        return ApiResponse.updated(res, {
            chapterId: chapter._id,
            status: chapter.status,
            publishedAt: chapter.publishedAt
        }, 'Cập nhật trạng thái chương thành công');
    } catch (error) {
        console.error('Update chapter status error:', error);
        return ApiResponse.serverError(res);
    }
};

// Cập nhật trạng thái truyện
export const updateNovelStatus = async (req: Request, res: Response) => {
    try {
        const { novelId } = req.params;
        const { status } = req.body;

        if (!novelId || !mongoose.Types.ObjectId.isValid(novelId)) {
            return ApiResponse.badRequest(res, 'ID truyện không hợp lệ');
        }

        if (!status || !['ongoing', 'completed', 'hiatus'].includes(status)) {
            return ApiResponse.badRequest(res, 'Trạng thái không hợp lệ. Các trạng thái hợp lệ: ongoing, completed, hiatus');
        }

        const novel = await Novel.findById(novelId);
        if (!novel) {
            return ApiResponse.notFound(res, 'Không tìm thấy truyện');
        }

        novel.status = status;
        await novel.save();

        return ApiResponse.updated(res, {
            novelId: novel._id,
            status: novel.status
        }, 'Cập nhật trạng thái truyện thành công');
    } catch (error) {
        console.error('Update novel status error:', error);
        return ApiResponse.serverError(res);
    }
};
