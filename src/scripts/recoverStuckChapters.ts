
import 'dotenv/config';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { UTApi } from 'uploadthing/server';
import Chapter from '../models/Chapter';
import { connectDB } from '../config/database';

const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
const UPLOADS_DIR = path.join(__dirname, '../../uploads/audio');

const recoverStuckChapters = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDB();
        
        console.log('🔍 Scanning for stuck "processing" chapters...');
        // Find chapters stuck in processing
        const stuckChapters = await Chapter.find({
            audioStatus: 'processing'
        });

        console.log(`Found ${stuckChapters.length} chapters stuck in processing.`);

        if (stuckChapters.length === 0) {
            console.log('🎉 No stuck chapters found.');
            process.exit(0);
        }

        // Get all files in uploads directory
        if (!fs.existsSync(UPLOADS_DIR)) {
            console.error(`❌ Uploads directory not found: ${UPLOADS_DIR}`);
            process.exit(1);
        }

        const files = fs.readdirSync(UPLOADS_DIR);
        console.log(`📂 Found ${files.length} files in uploads directory.`);

        let recoveredCount = 0;
        let failedCount = 0;
        let resetCount = 0;

        for (const chapter of stuckChapters) {
            console.log(`\nChecking Chapter ${chapter.chapterNumber} (ID: ${chapter._id})...`);
            
            // Look for file ending with _{chapterId}.mp3 or _{chapterId}.wav
            const matchedFile = files.find(f => f.includes(`_${chapter._id}.mp3`) || f.includes(`_${chapter._id}.wav`));

            if (matchedFile) {
                console.log(`✅ Found orphan file: ${matchedFile}`);
                const localAbsolutePath = path.join(UPLOADS_DIR, matchedFile);

                try {
                    console.log('☁️ Uploading to UploadThing...');
                    const fileBuffer = fs.readFileSync(localAbsolutePath);
                    const file = new File([fileBuffer], matchedFile);

                    const uploadResponse = await utapi.uploadFiles([file]);

                    if (uploadResponse[0]?.data?.url) {
                        const newUrl = uploadResponse[0].data.url;
                        console.log(`✅ Upload success: ${newUrl}`);

                        // Update Database
                        chapter.audioUrl = newUrl;
                        chapter.audioSource = 'uploadthing';
                        chapter.audioStatus = 'completed';
                        chapter.audioGeneratedAt = new Date();
                        await chapter.save();
                        console.log('💾 Database updated.');

                        // Delete local file
                        fs.unlinkSync(localAbsolutePath);
                        console.log('🗑️ Local file deleted.');
                        
                        recoveredCount++;
                    } else {
                        console.error('❌ Upload failed:', uploadResponse[0]?.error);
                        failedCount++;
                    }
                } catch (error) {
                    console.error('❌ Error processing file:', error);
                    failedCount++;
                }
            } else {
                console.warn('⚠️ No matching file found. Resetting status to failed.');
                chapter.audioStatus = 'failed';
                await chapter.save();
                resetCount++;
            }
        }

        console.log('\n==========================================');
        console.log(`🎉 Recovery Complete!`);
        console.log(`✅ Recovered & Uploaded: ${recoveredCount}`);
        console.log(`⚠️ Reset to Failed: ${resetCount}`);
        console.log(`❌ Upload Errors: ${failedCount}`);
        console.log('==========================================');

        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
};

recoverStuckChapters();
