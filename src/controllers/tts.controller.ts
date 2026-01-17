import { Request, Response } from 'express';
import Chapter from '../models/Chapter';
import Novel from '../models/Novel';
import mongoose from 'mongoose';
import ApiResponse from '../utils/apiResponse';
import fs from 'fs';
import path from 'path';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

// Config TTS Service
const TTS_SERVICE_URL = process.env.TTS_SERVICE_URL || 'http://127.0.0.1:5001';

interface TTSResult {
    success: boolean;
    output_file?: string;
    audio_url?: string;
    duration?: number;
    error?: string;
}

interface BatchChapter {
    chapter_id: string;
    content: string;
}

/**
 * Upload audio file cho một chapter
 * POST /chapter/:chapterId/audio/upload
 */
export const uploadChapterAudio = async (req: Request, res: Response) => {
    try {
        const { chapterId } = req.params;

        if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
            return ApiResponse.badRequest(res, 'ID chapter không hợp lệ');
        }

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return ApiResponse.notFound(res, 'Không tìm thấy chapter');
        }

        // Kiểm tra file upload
        if (!req.file) {
            return ApiResponse.badRequest(res, 'Vui lòng upload file audio');
        }

        // Xóa file audio cũ nếu có
        if (chapter.audioUrl) {
            const oldFilePath = path.join(__dirname, '../../uploads', chapter.audioUrl.replace('/uploads/', ''));
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Cập nhật chapter với audio mới
        const audioUrl = `/uploads/audio/${req.file.filename}`;

        chapter.audioUrl = audioUrl;
        chapter.audioStatus = 'completed';
        chapter.audioSource = 'upload';
        chapter.audioGeneratedAt = new Date();

        // Lấy duration từ request nếu có
        if (req.body.duration) {
            chapter.audioDuration = parseFloat(req.body.duration);
        }

        await chapter.save();

        return ApiResponse.success(res, {
            audioUrl: chapter.audioUrl,
            audioStatus: chapter.audioStatus,
            audioDuration: chapter.audioDuration
        }, 'Upload audio thành công');

    } catch (error) {
        console.error('Upload audio error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi upload audio');
    }
};

/**
 * Generate audio cho một chapter bằng TTS
 * POST /chapter/:chapterId/audio/generate
 */
export const generateChapterAudio = async (req: Request, res: Response) => {
    try {
        const { chapterId } = req.params;

        if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
            return ApiResponse.badRequest(res, 'ID chapter không hợp lệ');
        }

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return ApiResponse.notFound(res, 'Không tìm thấy chapter');
        }

        // Kiểm tra nếu đang xử lý
        if (chapter.audioStatus === 'processing') {
            return ApiResponse.badRequest(res, 'Chapter đang được xử lý TTS');
        }

        // Cập nhật status sang processing
        chapter.audioStatus = 'processing';
        await chapter.save();

        try {
            // Gọi TTS Service
            const response = await fetch(`${TTS_SERVICE_URL}/tts/single`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: chapter.content,
                    chapter_id: chapterId,
                    novel_id: chapter.novelId.toString()
                })
            });

            const result: TTSResult = await response.json();

            if (result.success && result.output_file) {
                // Local path from TTS service (assuming locally mounted or same disk)
                const localFilename = result.output_file;
                const localPath = path.join(__dirname, '../../uploads/audio', localFilename);

                let finalAudioUrl = result.audio_url; // Default to local if upload fails

                if (process.env.UPLOADTHING_TOKEN && fs.existsSync(localPath)) {
                    try {
                        const fileBuffer = fs.readFileSync(localPath);
                        const file = new File([fileBuffer], localFilename);

                        const utResponse = await utapi.uploadFiles([file]);

                        if (utResponse[0]?.data?.url) {
                            finalAudioUrl = utResponse[0].data.url;
                            // Delete local file after successful upload
                            fs.unlinkSync(localPath);
                        }
                    } catch (utError) {
                        console.error('UploadThing upload failed:', utError);
                        // Fallback to local URL is already set
                    }
                }

                chapter.audioUrl = finalAudioUrl;
                chapter.audioStatus = 'completed';
                chapter.audioDuration = result.duration;
                chapter.audioSource = finalAudioUrl?.includes('uploadthing') ? 'uploadthing' : 'tts';
                chapter.audioGeneratedAt = new Date();
            } else {
                chapter.audioStatus = 'failed';
            }

            await chapter.save();

            if (result.success) {
                return ApiResponse.success(res, {
                    audioUrl: chapter.audioUrl,
                    audioStatus: chapter.audioStatus,
                    audioDuration: chapter.audioDuration
                }, 'Tạo audio thành công');
            } else {
                return ApiResponse.serverError(res, result.error || 'Lỗi khi tạo audio');
            }

        } catch (ttsError) {
            chapter.audioStatus = 'failed';
            await chapter.save();
            throw ttsError;
        }

    } catch (error) {
        console.error('Generate audio error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi tạo audio');
    }
};

/**
 * Generate audio hàng loạt cho nhiều chapters
 * POST /novel/:novelId/audio/batch-generate
 */
export const batchGenerateAudio = async (req: Request, res: Response) => {
    try {
        const { novelId } = req.params;
        const { chapterIds, fromChapter, toChapter } = req.body;

        if (!novelId || !mongoose.Types.ObjectId.isValid(novelId)) {
            return ApiResponse.badRequest(res, 'ID novel không hợp lệ');
        }

        const novel = await Novel.findById(novelId);
        if (!novel) {
            return ApiResponse.notFound(res, 'Không tìm thấy truyện');
        }

        let chapters;

        // Nếu có danh sách chapterIds cụ thể
        if (chapterIds && Array.isArray(chapterIds) && chapterIds.length > 0) {
            chapters = await Chapter.find({
                _id: { $in: chapterIds },
                novelId: novelId
            }).sort({ chapterNumber: 1 });
        }
        // Nếu có range từ chapter đến chapter
        else if (fromChapter !== undefined && toChapter !== undefined) {
            chapters = await Chapter.find({
                novelId: novelId,
                chapterNumber: { $gte: fromChapter, $lte: toChapter }
            }).sort({ chapterNumber: 1 });
        }
        // Mặc định lấy tất cả chapters chưa có audio
        else {
            chapters = await Chapter.find({
                novelId: novelId,
                audioStatus: { $in: ['none', 'failed'] }
            }).sort({ chapterNumber: 1 });
        }

        if (chapters.length === 0) {
            return ApiResponse.badRequest(res, 'Không có chapter nào để xử lý');
        }

        // Chuẩn bị data cho batch
        const batchChapters: BatchChapter[] = chapters.map(ch => ({
            chapter_id: ch._id.toString(),
            content: ch.content
        }));

        // Cập nhật tất cả chapters sang processing
        await Chapter.updateMany(
            { _id: { $in: chapters.map(ch => ch._id) } },
            { audioStatus: 'processing' }
        );

        // Gọi TTS Service batch
        const response = await fetch(`${TTS_SERVICE_URL}/tts/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                novel_id: novelId,
                chapters: batchChapters
            })
        });

        const result = await response.json();

        if (result.success) {
            return ApiResponse.success(res, {
                job_id: result.job_id,
                total_chapters: chapters.length,
                status_url: `/audio/batch-status/${result.job_id}`,
                message: result.message
            }, 'Đã bắt đầu xử lý batch TTS');
        } else {
            // Rollback status nếu lỗi
            await Chapter.updateMany(
                { _id: { $in: chapters.map(ch => ch._id) } },
                { audioStatus: 'none' }
            );
            return ApiResponse.serverError(res, result.error || 'Lỗi khi bắt đầu batch TTS');
        }

    } catch (error) {
        console.error('Batch generate error:', error);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
        }
        return ApiResponse.serverError(res, 'Lỗi khi xử lý batch TTS: ' + (error instanceof Error ? error.message : String(error)));
    }
};

/**
 * Hàm xử lý upload background (Fire-and-forget)
 */
const processBatchUploads = async (results: any[]) => {
    for (const result of results) {
        if (!result.chapter_id) continue;

        try {
            const chapter = await Chapter.findById(result.chapter_id);
            if (!chapter) continue;

            // Nếu đã upload xong hoặc failed thì bỏ qua
            if (chapter.audioSource === 'uploadthing' || chapter.audioStatus === 'failed') {
                continue;
            }

            if (result.success && result.output_file) {
                const localFilename = result.output_file;
                const localPath = path.join(__dirname, '../../uploads/audio', localFilename);
                let finalAudioUrl = `/uploads/audio/${localFilename}`;
                let source = 'tts';

                // Chỉ upload nếu có token và file tồn tại
                if (process.env.UPLOADTHING_TOKEN && fs.existsSync(localPath)) {
                    try {
                        const fileBuffer = fs.readFileSync(localPath);
                        const file = new File([fileBuffer], localFilename);
                        const utResponse = await utapi.uploadFiles([file]);

                        if (utResponse[0]?.data?.url) {
                            finalAudioUrl = utResponse[0].data.url;
                            source = 'uploadthing';
                            fs.unlinkSync(localPath); // Xóa file sau khi upload
                        }
                    } catch (utError) {
                        console.error(`Upload error for chapter ${chapter.chapterNumber}:`, utError);
                    }
                }

                // Cập nhật DB
                await Chapter.findByIdAndUpdate(result.chapter_id, {
                    audioUrl: finalAudioUrl,
                    audioStatus: 'completed',
                    audioDuration: result.duration,
                    audioSource: source,
                    audioGeneratedAt: new Date()
                });
            } else {
                // Đánh dấu failed nếu TTS thất bại
                await Chapter.findByIdAndUpdate(result.chapter_id, {
                    audioStatus: 'failed'
                });
            }
        } catch (err) {
            console.error(`Error processing chapter ${result.chapter_id}:`, err);
        }
    }
};

/**
 * Kiểm tra trạng thái batch job
 * GET /audio/batch-status/:jobId
 */
export const getBatchStatus = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;

        const response = await fetch(`${TTS_SERVICE_URL}/tts/status/${jobId}`);
        const result = await response.json();

        if (!result.success) {
            return ApiResponse.notFound(res, 'Không tìm thấy job');
        }

        // Nếu TTS Service đã hoàn thành, kiểm tra tiến độ Upload
        if (result.status === 'completed' && result.results) {
            // Trigger background upload (không await)
            processBatchUploads(result.results);

            // Tính toán tiến độ thực tế dựa trên DB
            const chapterIds = result.results.map((r: any) => r.chapter_id);
            const total = chapterIds.length;
            
            const completedCount = await Chapter.countDocuments({
                _id: { $in: chapterIds },
                $or: [
                    { audioSource: 'uploadthing' },
                    { audioStatus: 'failed' }
                ]
            });

            // Nếu chưa upload xong hết -> Vẫn trả về processing để Frontend tiếp tục poll
            if (completedCount < total) {
                const uploadProgress = Math.floor((completedCount / total) * 100);
                return ApiResponse.success(res, {
                    ...result,
                    status: 'processing', // Ghi đè status thành processing chừng nào chưa upload xong
                    progress: uploadProgress,
                    message: `Đang đồng bộ lên cloud: ${completedCount}/${total}`
                }, 'Đang xử lý upload');
            }

            // Nếu đã xong hết -> Trả về completed
            return ApiResponse.success(res, {
                ...result,
                status: 'completed',
                progress: 100,
                message: 'Hoàn tất xử lý và đồng bộ'
            }, 'Batch hoàn tất');
        }

        // Nếu TTS vẫn đang chạy
        return ApiResponse.success(res, result, 'Lấy trạng thái batch thành công');

    } catch (error) {
        console.error('Get batch status error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi lấy trạng thái batch');
    }
};

/**
 * Xóa audio của một chapter
 * DELETE /chapter/:chapterId/audio
 */
export const deleteChapterAudio = async (req: Request, res: Response) => {
    try {
        const { chapterId } = req.params;

        if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
            return ApiResponse.badRequest(res, 'ID chapter không hợp lệ');
        }

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return ApiResponse.notFound(res, 'Không tìm thấy chapter');
        }

        if (!chapter.audioUrl) {
            return ApiResponse.badRequest(res, 'Chapter chưa có audio');
        }

        // Xóa file audio
        const filePath = path.join(__dirname, '../../uploads', chapter.audioUrl.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Reset audio fields
        chapter.audioUrl = undefined;
        chapter.audioStatus = 'none';
        chapter.audioDuration = undefined;
        chapter.audioGeneratedAt = undefined;
        chapter.audioSource = undefined;

        await chapter.save();

        return ApiResponse.success(res, null, 'Xóa audio thành công');

    } catch (error) {
        console.error('Delete audio error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi xóa audio');
    }
};

/**
 * Lấy thông tin audio của chapter
 * GET /chapter/:chapterId/audio
 */
export const getChapterAudioInfo = async (req: Request, res: Response) => {
    try {
        const { chapterId } = req.params;

        if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
            return ApiResponse.badRequest(res, 'ID chapter không hợp lệ');
        }

        const chapter = await Chapter.findById(chapterId)
            .select('audioUrl audioStatus audioDuration audioGeneratedAt audioSource chapterNumber title');

        if (!chapter) {
            return ApiResponse.notFound(res, 'Không tìm thấy chapter');
        }

        return ApiResponse.success(res, {
            chapterId: chapter._id,
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            audioUrl: chapter.audioUrl,
            audioStatus: chapter.audioStatus,
            audioDuration: chapter.audioDuration,
            audioGeneratedAt: chapter.audioGeneratedAt,
            audioSource: chapter.audioSource
        }, 'Lấy thông tin audio thành công');

    } catch (error) {
        console.error('Get audio info error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi lấy thông tin audio');
    }
};

/**
 * Lấy danh sách audio của tất cả chapters trong novel
 * GET /novel/:novelId/audio
 */
export const getNovelAudioList = async (req: Request, res: Response) => {
    try {
        const { novelId } = req.params;

        if (!novelId || !mongoose.Types.ObjectId.isValid(novelId)) {
            return ApiResponse.badRequest(res, 'ID novel không hợp lệ');
        }

        const chapters = await Chapter.find({ novelId })
            .select('chapterNumber title audioUrl audioStatus audioDuration audioSource')
            .sort({ chapterNumber: 1 });

        const stats = {
            total: chapters.length,
            withAudio: chapters.filter(ch => ch.audioStatus === 'completed').length,
            processing: chapters.filter(ch => ch.audioStatus === 'processing').length,
            failed: chapters.filter(ch => ch.audioStatus === 'failed').length,
            none: chapters.filter(ch => ch.audioStatus === 'none').length,
            totalDuration: chapters.reduce((sum, ch) => sum + (ch.audioDuration || 0), 0)
        };

        return ApiResponse.success(res, {
            chapters,
            stats
        }, 'Lấy danh sách audio thành công');

    } catch (error) {
        console.error('Get novel audio list error:', error);
        return ApiResponse.serverError(res, 'Lỗi khi lấy danh sách audio');
    }
};

/**
 * Kiểm tra TTS Service health
 * GET /audio/health
 */
export const checkTTSHealth = async (req: Request, res: Response) => {
    try {
        const response = await fetch(`${TTS_SERVICE_URL}/health`);
        const result = await response.json();

        return ApiResponse.success(res, {
            tts_service: result,
            service_url: TTS_SERVICE_URL
        }, 'TTS Service health check');

    } catch (error) {
        return ApiResponse.serverError(res, 'TTS Service không hoạt động');
    }
};
