import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv'

dotenv.config({})

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

console.log('API KEY:', process.env.ASSEMBLYAI_API_KEY, process.env.ASSEMBLYAI_API_KEY.length);

export const uploadToAssemblyAI = async (filePath) => {
    const response = await axios({
        method: 'post', 
        url: 'https://api.assemblyai.com/v2/upload', 
        headers: { authorization: ASSEMBLYAI_API_KEY }, 
        data: fs.createReadStream(filePath), 
        maxContentLength: Infinity, 
        maxBodyLength: Infinity, 
    });
    console.log('AssemblyAI upload response:', response.data);
    return response.data.upload_url;
}

export const requestTranscription = async (audioUrl) => {
    const response = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        { audio_url: audioUrl },
        {
            headers: {
                authorization: ASSEMBLYAI_API_KEY
            }
        }
    );
    return response.data.id;
}

export const getTranscriptionResult = async (transcriptId) => {
    const response = await axios({
        method: 'get',
        url: `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        headers: { authorization: ASSEMBLYAI_API_KEY },
    })
    return response.data;
} 