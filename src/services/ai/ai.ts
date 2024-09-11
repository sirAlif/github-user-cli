import { openAiClient } from '../../utils/httpClient';
import {prompts} from "./prompts";
import FormData from 'form-data';
import {GptResponse} from "../../models/models";

/**
 * Sends a text prompt to the OpenAI API and retrieves a structured response.
 *
 * This function sends a request to the OpenAI API
 *  using the provided text and a system prompt
 * to obtain a response. The response content is parsed
 *  into a structured format.
 *
 * @async
 * @function getAIResponse
 * @param {string} text - The input text to be sent to the OpenAI API.
 * @returns {Promise<GptResponse>} A promise that resolves
 *  to a `GptResponse` object containing the parsed AI response.
 *
 * @throws {Error} Throws an error if the request to the OpenAI API fails
 *  or if there is an issue with parsing the response.
 */
export async function getAIResponse(text: string): Promise<GptResponse> {
  const messages = [
    { role: "system", content: prompts },
    { role: "user", content: text }
  ];

  try {
    const response = await openAiClient.post(
      '/v1/chat/completions',
      {
        model: "gpt-4o",
        messages: messages
      }
    );
    
    let content: string = response.data.choices[0].message.content;

    // Remove JSON formatting characters if present
    content = content.replace(/^```json\n/, "").replace(/\n```$/, "");

    // Parse the content into GptResponse and return it
    return JSON.parse(content);
  } catch (error) {
    // @ts-ignore
    console.error("Error in AI Response:", error?.response?.data?.error?.message || 'Internal Server Error');
    throw new Error("Internal Server Error");
  }
}

/**
 * Transcribes an audio file using the OpenAI Whisper API.
 *
 * This function sends an audio file to the
 *  OpenAI Whisper API for transcription. The audio is
 * sent along with a prompt to transcribe the recording,
 *  and the function returns the transcripted text.
 *
 * @async
 * @function getAudioTranscript
 * @param {Buffer} audio - The audio file buffer to be transcribed.
 * @param {string} fileName - The name of the audio file.
 * @returns {Promise<string>} A promise
 *  that resolves to the transcript of the audio file.
 *
 * @throws {Error} Throws an error if the request to the Whisper API fails
 *  or if no transcript is found in the response.
 */
export async function getAudioTranscript(
  audio: Buffer,
  fileName: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', audio, fileName);
  formData.append('model', 'whisper-1');
  formData.append('prompt', 'Transcribe the following voice recording.');
  
  try {

    // Send the request to the Whisper API
    const response = await openAiClient.post(
      '/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(), // Include the multipart/form-data headers
        }
      }
    );
    
    const transcript = response.data.text;
    
    if (!transcript) {
      throw new Error('No transcript found in the response.');
    }
    
    return transcript;
  } catch (error) {
    // @ts-ignore
    console.error('Failed to transcribe audio:', error?.response?.data?.error?.message || 'Failed to transcribe audio.');
    throw new Error('Failed to transcribe audio.');
  }
}
