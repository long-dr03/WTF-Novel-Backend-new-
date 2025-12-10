import Novel from "../models/Novel";
import mongoose from "mongoose";
import { Request, Response } from "express";

export const getNovelById = async (req: Request, res: Response) => {
    try {
        const novelId = req.params.id;
        // Validate ObjectId format before querying
        if (!novelId || !mongoose.Types.ObjectId.isValid(novelId)) {
            return res.status(400).json({ error: 'Invalid novel ID format' });
        }
        const novel = await Novel.findById(novelId)
            .populate('author', 'username avatar') // Lấy thông tin tác giả
        if (!novel) {
            return res.status(404).json({ error: 'Novel not found' });
        }
        return res.json(novel);
    } catch (error) {
        console.error('Get novel error:', error);
        return res.status(500).json({ error: 'Lỗi khi lấy thông tin truyện' });
    }
}

export const getNovelsByAuthor = async (req: Request, res: Response) => {
    try {
        const authorId = req.params.authorId;
        if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ error: 'Invalid author ID format' });
        }
        const novels = await Novel.find({ author: authorId })
            .sort({ createdAt: -1 });
        return res.json(novels);
    } catch (error) {
        console.error('Get novels by author error:', error);
        return res.status(500).json({ error: 'Lỗi khi lấy danh sách truyện của tác giả' });
    }
}

export const getPopularNovels = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const novels = await Novel.find()
            .sort({ views: -1 })
            .limit(limit)
            .populate('author', 'username avatar');
        return res.json(novels);
    } catch (error) {
        console.error('Get popular novels error:', error);
        return res.status(500).json({ error: 'Lỗi khi lấy danh sách truyện phổ biến' });
    }  
}