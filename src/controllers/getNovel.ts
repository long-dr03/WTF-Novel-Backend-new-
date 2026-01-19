import Novel from "../models/Novel";
import Chapter from "../models/Chapter";
import mongoose from "mongoose";
import { Request, Response } from "express";
import ApiResponse from "../utils/apiResponse";

/**
 * Lấy thông tin chi tiết của một cuốn truyện theo ID
 * @param req Request chứa id truyện trong params
 * @param res Response trả về thông tin truyện (kèm author)
 */
export const getNovelById = async (req: Request, res: Response) => {
    try {
        const novelId = req.params.id;

        if (!novelId || !mongoose.Types.ObjectId.isValid(novelId)) {
            return ApiResponse.badRequest(res, 'ID truyện không hợp lệ');
        }

        const novel = await Novel.findById(novelId)
            .populate('author', 'username avatar');
        if (!novel) {
            return ApiResponse.notFound(res, 'Không tìm thấy truyện');
        }
        return ApiResponse.success(res, novel, 'Lấy thông tin truyện thành công');
    } catch (error) {
        console.error('Get novel error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi lấy thông tin truyện');
    }
}

/**
 * Lấy danh sách truyện của một tác giả
 * @param req Request chứa authorId trong params
 * @param res Response trả về danh sách truyện
 */
export const getNovelsByAuthor = async (req: Request, res: Response) => {
    try {
        const authorId = req.params.authorId;
        if (!authorId || !mongoose.Types.ObjectId.isValid(authorId)) {
            return ApiResponse.badRequest(res, 'ID tác giả không hợp lệ');
        }
        const novels = await Novel.find({ author: authorId })
            .sort({ createdAt: -1 });
        return ApiResponse.success(res, novels, 'Lấy danh sách truyện thành công');
    } catch (error) {
        console.error('Get novels by author error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi lấy danh sách truyện của tác giả');
    }
}

/**
 * Lấy danh sách truyện phổ biến (dựa trên lượt xem)
 * @param req Request chứa limit (số lượng) trong query
 * @param res Response trả về danh sách truyện
 */
export const getPopularNovels = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const novels = await Novel.find()
            .sort({ views: -1 })
            .limit(limit)
            .populate('author', 'username avatar');
        return ApiResponse.success(res, novels, 'Lấy danh sách truyện phổ biến thành công');
    } catch (error) {
        console.error('Get popular novels error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi lấy danh sách truyện phổ biến');
    }
}

/**
 * Lấy danh sách các chương của một truyện
 * @param req Request chứa novelId trong params
 * @param res Response trả về danh sách chương (số chương, tiêu đề, trạng thái...)
 */
export const getChaptersByNovel = async (req: Request, res: Response) => {
    try {
        const novelId = req.params.novelId;
        if (!novelId || !mongoose.Types.ObjectId.isValid(novelId)) {
            return ApiResponse.badRequest(res, 'ID truyện không hợp lệ');
        }
        const chapters = await Chapter.find({ novelId: novelId })
            .select('chapterNumber title status publishedAt createdAt views wordCount')
            .sort({ chapterNumber: 1 });
        return ApiResponse.success(res, chapters, 'Lấy danh sách chương thành công');
    } catch (error) {
        console.error('Get chapters error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi lấy danh sách chương');
    }
}

/**
 * Lấy nội dung chi tiết của một chương
 * @param req Request chứa novelId và chapterNumber
 * @param res Response trả về nội dung chương và tăng lượt xem
 */
export const getChapterContent = async (req: Request, res: Response) => {
    try {
        const { novelId, chapterNumber } = req.params;
        if (!novelId || !mongoose.Types.ObjectId.isValid(novelId)) {
            return ApiResponse.badRequest(res, 'ID truyện không hợp lệ');
        }
        const chapter = await Chapter.findOne({
            novelId: novelId,
            chapterNumber: parseInt(chapterNumber)
        });
        if (!chapter) {
            return ApiResponse.notFound(res, 'Không tìm thấy chương');
        }

        chapter.views = (chapter.views || 0) + 1;
        await chapter.save();
        return ApiResponse.success(res, chapter, 'Lấy nội dung chương thành công');
    } catch (error) {
        console.error('Get chapter content error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi lấy nội dung chương');
    }
}
