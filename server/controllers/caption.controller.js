import axios from 'axios';
import fs from 'fs';
import path, { dirname } from 'path';
import { uploadToAssemblyAI, requestTranscription, getTranscriptionResult } from '../utils/assemblyAi.js';
import { fileURLToPath } from 'url';
import crypto from 'crypto'; // Add this at the top for unique filenames
import { Caption } from '../models/caption.model.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const generateCaption = async (req, res) => {
  try {
    let videoUrl = req.body.videoUrl;
    if (!videoUrl && req.file) {
      videoUrl = await uploadToAssemblyAI(req.file.path);
    }
    if (!videoUrl) {
      return res.status(400).json({ error: 'No video provided' });
    }

    // Check if caption already exists in DB
    let captionDoc = await Caption.findOne({ videoUrl });
    if (captionDoc && captionDoc.status === 'completed') {
      return res.json({ text: captionDoc.text, status: 'completed' });
    }

    // If not, create or update status to processing
    if (!captionDoc) {
      captionDoc = await Caption.create({ videoUrl, status: 'processing' });
    } else {
      captionDoc.status = 'processing';
      captionDoc.text = '';
      await captionDoc.save();
    }

    // Download and upload to AssemblyAI if needed
    let assemblyUrl = videoUrl;
    if (!videoUrl.startsWith('https://cdn.assemblyai.com')) {
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      // Use a unique temp filename
      const tempFileName = `temp_video_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const tempPath = path.join(uploadsDir, tempFileName);
      const writer = fs.createWriteStream(tempPath);
      try {
        const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        assemblyUrl = await uploadToAssemblyAI(tempPath);
      } catch (downloadErr) {
        return res.status(400).json({ error: 'Failed to download video', details: downloadErr.message });
      } finally {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }

    console.log('Received videoUrl:', videoUrl);
    console.log('Assembly upload URL:', assemblyUrl);

    const transcriptId = await requestTranscription(assemblyUrl);

    console.log('Transcript ID:', transcriptId);

    // Poll for result
    let status, result;
    do {
      await new Promise((r) => setTimeout(r, 5000));
      result = await getTranscriptionResult(transcriptId);
      status = result.status;
      console.log('AssemblyAI full result:', result);
    } while (status !== 'completed' && status !== 'error');

    if (status === 'completed') {
      captionDoc.status = 'completed';
      captionDoc.text = result.text;
      await captionDoc.save();
      res.json({ text: result.text, status: 'completed' });
    } else {
      captionDoc.status = 'error';
      await captionDoc.save();
      res.status(500).json({ error: 'Transcription failed', details: result });
    }
  } catch (err) {
    // If error, update status in DB
    if (videoUrl) {
      await Caption.findOneAndUpdate({ videoUrl }, { status: 'error' });
    }
    console.error('Caption generation error:', err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

export const getCaption = async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  const { videoUrl } = req.query;
  if (!videoUrl) return res.status(400).json({ error: 'No videoUrl provided' });

  const captionDoc = await Caption.findOne({ videoUrl });
  if (!captionDoc) return res.status(404).json({ error: 'Caption not found' });
  if (captionDoc.status === 'processing') return res.json({ status: 'processing' });
  if (captionDoc.status === 'error') return res.status(500).json({ error: 'Caption generation failed' });

  res.json({ text: captionDoc.text, status: 'completed' });
};
