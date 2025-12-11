import Novel from "../models/Novel";
import Chapter from "../models/Chapter";
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

// Lấy danh sách chapters của một novel
export const getChaptersByNovel = async (req: Request, res: Response) => {
    try {
        const novelId = req.params.novelId;
        if (!novelId || !mongoose.Types.ObjectId.isValid(novelId)) {
            return res.status(400).json({ error: 'Invalid novel ID format' });
        }
        const chapters = await Chapter.find({ novelId: novelId })
            .select('chapterNumber title status publishedAt createdAt views wordCount')
            .sort({ chapterNumber: 1 });
        return res.json(chapters);
    } catch (error) {
        console.error('Get chapters error:', error);
        return res.status(500).json({ error: 'Lỗi khi lấy danh sách chương' });
    }
}

// Lấy nội dung một chapter
export const getChapterContent = async (req: Request, res: Response) => {
    try {
        const { novelId, chapterNumber } = req.params;
        if (!novelId || !mongoose.Types.ObjectId.isValid(novelId)) {
            return res.status(400).json({ error: 'Invalid novel ID format' });
        }
        const chapter = await Chapter.findOne({ 
            novelId: novelId, 
            chapterNumber: parseInt(chapterNumber) 
        });
        if (!chapter) {
            return res.status(404).json({ error: 'Không tìm thấy chương' });
        }
        // Tăng view
        chapter.views = (chapter.views || 0) + 1;
        await chapter.save();
        return res.json(chapter);
    } catch (error) {
        console.error('Get chapter content error:', error);
        return res.status(500).json({ error: 'Lỗi khi lấy nội dung chương' });
    }
}