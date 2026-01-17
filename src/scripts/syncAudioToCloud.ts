
import 'dotenv/config';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { UTApi } from 'uploadthing/server';
import Chapter from '../models/Chapter';
import { connectDB } from '../config/database';

const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });

const syncAudioToCloud = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDB();
        
        console.log('🔍 Scanning for local audio files...');
        // Find chapters with local audio paths
        const chapters = await Chapter.find({
            audioUrl: { $regex: /^\/uploads\// },
            audioStatus: 'completed'
        });

        console.log(`Found ${chapters.length} chapters with local audio.`);

        let successCount = 0;
        let failCount = 0;
        let missingFileCount = 0;

        for (const chapter of chapters) {
            const localRelativePath = chapter.audioUrl;
            if (!localRelativePath) continue;

            const localAbsolutePath = path.join(__dirname, '../../uploads', localRelativePath.replace('/uploads/', ''));
            
            console.log(`\nProcessing Chapter ${chapter.chapterNumber}: ${chapter.title}`);
            console.log(`Local Path: ${localAbsolutePath}`);

            if (fs.existsSync(localAbsolutePath)) {
                try {
                    console.log('☁️ Uploading to UploadThing...');
                    const fileBuffer = fs.readFileSync(localAbsolutePath);
                    const file = new File([fileBuffer], path.basename(localAbsolutePath));

                    const uploadResponse = await utapi.uploadFiles([file]);

                    if (uploadResponse[0]?.data?.url) {
                        const newUrl = uploadResponse[0].data.url;
                        console.log(`✅ Upload success: ${newUrl}`);

                        // Update Database
                        chapter.audioUrl = newUrl;
                        chapter.audioSource = 'uploadthing';
                        await chapter.save();
                        console.log('💾 Database updated.');

                        // Delete local file
                        fs.unlinkSync(localAbsolutePath);
                        console.log('🗑️ Local file deleted.');
                        
                        successCount++;
                    } else {
                        console.error('❌ Upload failed:', uploadResponse[0]?.error);
                        failCount++;
                    }
                } catch (error) {
                    console.error('❌ Error processing file:', error);
                    failCount++;
                }
            } else {
                console.warn('⚠️ Local file not found!');
                missingFileCount++;
            }
        }

        console.log('\n==========================================');
        console.log(`🎉 Sync Complete!`);
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`⚠️ Missing Files: ${missingFileCount}`);
        console.log('==========================================');

        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
};

syncAudioToCloud();
