import { getAIResponse, getAudioTranscript } from '../ai';
import { openAiClient } from '../../../utils/httpClient';

// Mock the openAiClient
jest.mock('../../../utils/httpClient', () => ({
  openAiClient: {
    post: jest.fn()
  }
}));

describe('API Functions', () => {
  describe('getAIResponse', () => {
    it('should return a parsed GptResponse when API call is successful',
      async () => {
        const mockResponse = {
          data: {
            choices: [{
              message: {
                content: JSON.stringify({ text: 'mock response' })
              }
            }]
          }
        };
      
        (openAiClient.post as jest.Mock).mockResolvedValue(mockResponse);
      
        const result = await getAIResponse('Test prompt');
      
        expect(result).toEqual({ text: 'mock response' });
      });
    
    it('should throw an error when API call fails', async () => {
      (openAiClient.post as jest.Mock)
        .mockRejectedValue(new Error('API error'));
      
      await expect(getAIResponse('Test prompt'))
        .rejects.toThrow('Internal Server Error');
    });
  });
  
  describe('getAudioTranscript', () => {
    it('should return a transcript when API call is successful', async () => {
      const mockResponse = {
        data: {
          text: 'mock transcript'
        }
      };
      
      (openAiClient.post as jest.Mock).mockResolvedValue(mockResponse);
      
      const mockAudioBuffer = Buffer.from('mock audio data');
      const fileName = 'test.mp3';
      
      const result = await getAudioTranscript(mockAudioBuffer, fileName);
      
      expect(result).toBe('mock transcript');
    });
    
    it('should throw an error when API call fails', async () => {
      (openAiClient.post as jest.Mock)
        .mockRejectedValue(new Error('API error'));
      
      const mockAudioBuffer = Buffer.from('mock audio data');
      const fileName = 'test.mp3';
      
      await expect(getAudioTranscript(mockAudioBuffer, fileName))
        .rejects.toThrow('Failed to transcribe audio.');
    });
  });
});
