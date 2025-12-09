// src/config/controllers/authentication.ts
import { Request, Response } from 'express';
import Novel from '../models/Novel';
import Chapter from '../models/Chapter';
// Cập nhật profile
export const createNovel = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const novel = new Novel(data);
        console.log(novel);
        res.status(200).json({
            status: 'success',
            message: 'Cập nhật thông tin thành công',
            data: {
                novel: {
                    id: novel._id,
                    title: novel.title,
                    image: novel.image,
                    status: novel.status,
                    description: novel.description,
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server. Vui lòng thử lại sau.'
        });
    }
};
export const uploadChapter = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const chapter = new Chapter(data);
        const novel = await Novel.findById(data.novelId);
        if (novel) {
           chapter.novelId = novel._id;
        }
        console.log(novel);
        res.status(200).json({
            status: 'success',
            message: 'Cập nhật thông tin thành công',
            data: {
                novel: {
                    id: chapter._id,
                    title: chapter.title,
                    content: chapter.content,
                    status: chapter.status,
                    wordCount: chapter.wordCount,
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server. Vui lòng thử lại sau.'
        });
    }
};
