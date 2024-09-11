import request from 'supertest';
import {
  addUserCommand,
  deleteUserCommand,
  getUserCommand,
  getUsersCommand,
  aiCommand,
  populateUsersCommand
} from '../cli/commands';
import { getAudioTranscript } from '../services/ai/ai';
import { app, server } from '../server';

jest.mock('../cli/commands');
jest.mock('../services/ai/ai');

const mockAddUserCommand = addUserCommand as jest.Mock;
const mockDeleteUserCommand = deleteUserCommand as jest.Mock;
const mockGetUserCommand = getUserCommand as jest.Mock;
const mockGetUsersCommand = getUsersCommand as jest.Mock;
const mockAiCommand = aiCommand as jest.Mock;
const mockPopulateUsersCommand = populateUsersCommand as jest.Mock;
const mockGetAudioTranscript = getAudioTranscript as jest.Mock;


const USERNAME = process.env.WEB_USER || 'yourusername';
const PASSWORD = process.env.WEB_PASSWORD || 'yourpassword';

// Helper function to get the Authorization header
const getAuthHeader = () => {
  const base64Credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
  return `Basic ${base64Credentials}`;
};

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(done => {
    server.close(done);
  });
  
  describe('POST /user', () => {
    it('should add a user successfully', async () => {
      mockAddUserCommand.mockResolvedValue({ error: null });
      const response = await request(app)
        .post('/user')
        .set('Authorization', getAuthHeader())
        .send({ username: 'octocat' });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User octocat added successfully.');
    });
    
    it('should return 400 for missing username', async () => {
      const response = await request(app)
        .post('/user')
        .set('Authorization', getAuthHeader())
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid or missing username.');
    });
    
    it('should return 500 if addUserCommand fails', async () => {
      mockAddUserCommand.mockResolvedValue({ error: 'Failed to add user' });
      const response = await request(app)
        .post('/user')
        .set('Authorization', getAuthHeader())
        .send({ username: 'octocat' });
      expect(response.status).toBe(500);
      expect(response.body.error)
        .toBe('Failed to add user, check logs for details.');
    });
  });
  
  describe('PUT /user', () => {
    it('should update a user successfully', async () => {
      mockAddUserCommand.mockResolvedValue({ error: null });
      const response = await request(app)
        .put('/user')
        .set('Authorization', getAuthHeader())
        .send({ username: 'octocat' });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User octocat updated successfully.');
    });
    
    it('should return 401 for missing authorization', async () => {
      const response = await request(app).put('/user').send({});
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authorization header is missing');
    });
    
    it('should return 404 if user not found', async () => {
      mockAddUserCommand.mockResolvedValue({ error: 'User not found' });
      const response = await request(app)
        .put('/user')
        .set('Authorization', getAuthHeader())
        .send({ username: 'octocat' });
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found.');
    });
    
    it('should return 500 if addUserCommand fails', async () => {
      mockAddUserCommand.mockResolvedValue({ error: 'Failed to update user' });
      const response = await request(app)
        .put('/user')
        .set('Authorization', getAuthHeader())
        .send({ username: 'octocat' });
      expect(response.status).toBe(500);
      expect(response.body.error)
        .toBe('Failed to update user, check logs for details.');
    });
  });
  
  describe('DELETE /user/:username', () => {
    it('should delete a user successfully', async () => {
      mockDeleteUserCommand.mockResolvedValue({ error: null });
      const response = await request(app)
        .delete('/user/octocat')
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User octocat deleted successfully.');
    });
    
    it('should return 404 if user not found', async () => {
      mockDeleteUserCommand.mockResolvedValue({ error: 'User not found' });
      const response = await request(app)
        .delete('/user/octocat')
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found.');
    });
    
    it('should return 500 if deleteUserCommand fails', async () => {
      mockDeleteUserCommand.mockResolvedValue(
        { error: 'Failed to delete user' }
      );
      const response = await request(app)
        .delete('/user/octocat')
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(500);
      expect(response.body.error)
        .toBe('Failed to delete user, check logs for details.');
    });
  });
  
  describe('GET /user/:username', () => {
    it('should get user details successfully', async () => {
      mockGetUserCommand.mockResolvedValue({
        error: null, data: { username: 'octocat', name: 'The Octocat' }
      });
      const response = await request(app)
        .get('/user/octocat')
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(200);
      expect(response.body.username).toBe('octocat');
      expect(response.body.name).toBe('The Octocat');
    });
    
    it('should return 404 if user not found', async () => {
      mockGetUserCommand.mockResolvedValue({ error: 'User not found' });
      const response = await request(app)
        .get('/user/octocat')
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found.');
    });
    
    it('should return 500 if getUserCommand fails', async () => {
      mockGetUserCommand.mockResolvedValue(
        { error: 'Failed to retrieve user' }
      );
      const response = await request(app)
        .get('/user/octocat')
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(500);
      expect(response.body.error)
        .toBe('Failed to retrieve user, check logs for details.');
    });
  });
  
  describe('GET /users', () => {
    it('should get list of users successfully', async () => {
      mockGetUsersCommand.mockResolvedValue(
        { error: null, data: [{ username: 'octocat' }]
        });
      const response = await request(app)
        .get('/users')
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].username).toBe('octocat');
    });
    
    it('should return 500 if getUsersCommand fails', async () => {
      mockGetUsersCommand
        .mockResolvedValue({ error: 'Failed to retrieve users' });
      const response = await request(app)
        .get('/users')
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(500);
      expect(response.body.error)
        .toBe('Failed to retrieve users, check logs for details.');
    });
  });
  
  describe('POST /populate', () => {
    it('should populate users successfully', async () => {
      mockPopulateUsersCommand.mockResolvedValue(
        { message: 'Populate users finished successfully.' }
      );
      const response = await request(app)
        .post('/populate')
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(200);
      expect(response.body.message)
        .toBe('Populate users finished successfully.');
    });
    
    it('should return 500 if populateUsersCommand fails', async () => {
      mockPopulateUsersCommand
        .mockResolvedValue({ error: 'Failed to populate users' });
      const response = await request(app)
        .post('/populate')
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(500);
      expect(response.body.error)
        .toBe('Populate users failed, check logs for details.');
    });
  });
  
  describe('POST /ai/text', () => {
    it('should execute AI command successfully', async () => {
      mockAiCommand.mockResolvedValue(
        { error: null, data: [{ username: 'octocat' }]
        });
      const response = await request(app)
        .post('/ai/text')
        .set('Authorization', getAuthHeader())
        .send({ text: 'Get users in San Francisco who use JavaScript' });
      expect(response.status).toBe(200);
      expect(response.body.data[0].username).toBe('octocat');
    });
    
    it('should return 400 for missing text', async () => {
      const response = await request(app)
        .post('/ai/text').send({})
        .set('Authorization', getAuthHeader());
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid or missing text.');
    });
    
    it('should return 500 if aiCommand fails', async () => {
      mockAiCommand.mockResolvedValue(
        { error: 'Failed to execute AI command'
        });
      const response = await request(app)
        .post('/ai/text')
        .set('Authorization', getAuthHeader())
        .send({ text: 'Get users' });
      expect(response.status).toBe(500);
      expect(response.body.error)
        .toBe('Failed to execute AI command, check logs for details.');
    });
  });
  
  describe('POST /ai/voice', () => {
    it('should execute AI voice command successfully', async () => {
      mockGetAudioTranscript.mockResolvedValue('transcript');
      mockAiCommand.mockResolvedValue(
        { error: null, data: [{ username: 'octocat' }]
        });
      const response = await request(app)
        .post('/ai/voice')
        .set('Authorization', getAuthHeader())
        .attach('file', Buffer.from('audio'), 'audio.wav');
      expect(response.status).toBe(200);
      expect(response.body.data[0].username).toBe('octocat');
    });
    
    it('should return 500 if aiCommand fails', async () => {
      mockGetAudioTranscript.mockResolvedValue('transcript');
      mockAiCommand
        .mockResolvedValue({ error: 'Failed to execute AI command' });
      const response = await request(app)
        .post('/ai/voice')
        .set('Authorization', getAuthHeader())
        .attach('file', Buffer.from('audio'), 'audio.wav');
      expect(response.status).toBe(500);
      expect(response.body.error)
        .toBe('Failed to execute AI command, check logs for details.');
    });
  });
});
