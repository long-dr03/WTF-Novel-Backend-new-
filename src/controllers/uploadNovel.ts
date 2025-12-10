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
        const data = req.body;
        let chapter;
        const novel = await Novel.findById(new mongoose.Types.ObjectId(data.novelId));
        console.log("novel found", data ,"id" , JSON.stringify(data.novelId));
        if (novel) {
            console.log("data", JSON.stringify(data));
            chapter = new Chapter(data);
            await chapter.save();
        }
        console.log("Chap mới", novel);
        res.status(200).json({
            EM: 'Tạo chương thành công',
            EC: 0,
            DT: {
                chapterId: chapter?._id,
                novelId: chapter?.novelId,
                chapterNumber: chapter?.chapterNumber
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            EM: 'Lỗi server. Vui lòng thử lại sau.',
            EC: -1,
            DT: {}
        });
    }
};
