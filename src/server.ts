import express, { Request, Response } from 'express';
import { basicAuthMiddleware } from './middleware/authMiddleware';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import {
  addUserCommand,
  deleteUserCommand,
  getUserCommand,
  getUsersCommand,
  aiCommand,
  populateUsersCommand
} from './cli/commands';
import { getAudioTranscript } from "./services/ai/ai";

const app = express();
const upload = multer();
const port = process.env.HTTP_PORT || 6789;

app.use(express.json());
app.use(basicAuthMiddleware);

// Swagger setup
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GitHub Users Web Server API',
      version: '1.0.0',
      description: 'API documentation for the GitHub Users project routes',
    },
  },
  apis: ['./src/server.ts'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Add a GitHub user to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: octocat
 *     responses:
 *       200:
 *         description: User added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User octocat added successfully."
 *       400:
 *         description: Bad request, missing or invalid username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing username."
 *       401:
 *         description: Unauthorized, missing or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authorization header is missing or invalid."
 *       500:
 *         description: Failed to add user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to add user, check logs for details."
 */
app.post('/user', async (req: Request, res: Response) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Invalid or missing username.' });
  }
  
  try {
    const result = await addUserCommand(username, false);
    if (result.error) {  // Check for error in the structured response
      return res.status(500).json({
        error: "Failed to add user, check logs for details."
      });
    }
    
    res.status(200).json({ message: `User ${username} added successfully.` });
  } catch (error) {
    res.status(500).json({
      error: "Failed to add user, check logs for details."
    });
  }
});

/**
 * @swagger
 * /user:
 *   put:
 *     summary: Update a GitHub user in the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: octocat
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User octocat updated successfully."
 *       400:
 *         description: Bad request, missing or invalid username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing username."
 *       401:
 *         description: Unauthorized, missing or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authorization header is missing or invalid."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Failed to update user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update user, check logs for details."
 */
app.put('/user', async (req: Request, res: Response) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Invalid or missing username.' });
  }
  
  try {
    const result = await addUserCommand(username, true);
    if (result.error) {
      if (result.error.toLowerCase().includes('not found') ||
        result.error.includes('No data') ||
        result.error.includes('Failed to fetch GitHub user') ) {
        return res.status(404).json({ error: "User not found." });
      }
      return res.status(500).json({
        error: "Failed to update user, check logs for details."
      });
    }
    
    res.status(200).json({ message: `User ${username} updated successfully.` });
  } catch (error) {
    res.status(500).json({
      error: "Failed to update user, check logs for details."
    });
  }
});

/**
 * @swagger
 * /user/{username}:
 *   delete:
 *     summary: Delete a GitHub user from the database
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The GitHub username to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User octocat deleted successfully."
 *       400:
 *         description: Bad request, missing or invalid username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing username."
 *       401:
 *         description: Unauthorized, missing or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authorization header is missing or invalid."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Failed to delete user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to delete user, check logs for details."
 */
app.delete('/user/:username', async (req: Request, res: Response) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ error: 'Invalid or missing username.' });
  }
  
  try {
    const result = await deleteUserCommand(username);
    if (result.error) {
      if (result.error.includes('not found')) {
        return res.status(404).json({ error: "User not found." });
      }
      return res.status(500).json({
        error: "Failed to delete user, check logs for details."
      });
    }
    
    res.status(200).json({ message: `User ${username} deleted successfully.` });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete user, check logs for details."
    });
  }
});

/**
 * @swagger
 * /user/{username}:
 *   get:
 *     summary: Get a GitHub user from the database
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The GitHub username to find
 *     responses:
 *       200:
 *         description: Information of a GitHub user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: octocat
 *                 name:
 *                   type: string
 *                   example: The Octocat
 *                 bio:
 *                   type: string
 *                   example: GitHub mascot and models
 *                 location:
 *                   type: string
 *                   example: San Francisco
 *                 company:
 *                   type: string
 *                   example: GitHub
 *                 followers:
 *                   type: integer
 *                   example: 1000
 *                 following:
 *                   type: integer
 *                   example: 200
 *                 languages:
 *                   type: string
 *                   example: JavaScript, TypeScript
 *
 *       400:
 *         description: Bad request, missing or invalid username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing username."
 *       401:
 *         description: Unauthorized, missing or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authorization header is missing or invalid."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Failed to retrieve user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve user."
 */
app.get('/user/:username', async (req: Request, res: Response) => {
  const { username } = req.params;
  
  if (!username) {
    return res.status(400).json({ error: 'Invalid or missing username.' });
  }
  
  try {
    const result = await getUserCommand(username);
    
    if (result.error) {
      if (result.error.includes('not found')) {
        return res.status(404).json({ error: "User not found." });
      }
      return res.status(500).json({
        error: "Failed to retrieve user, check logs for details."
      });
    }
    
    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve user, check logs for details."
    });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of GitHub users from the database
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by programming language
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [username, location, company, followers, following]
 *         description: Sort by a specific field
 *     responses:
 *       200:
 *         description: A list of GitHub users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     example: octocat
 *                   name:
 *                     type: string
 *                     example: The Octocat
 *                   bio:
 *                     type: string
 *                     example: GitHub mascot and models
 *                   location:
 *                     type: string
 *                     example: San Francisco
 *                   company:
 *                     type: string
 *                     example: GitHub
 *                   followers:
 *                     type: integer
 *                     example: 1000
 *                   following:
 *                     type: integer
 *                     example: 200
 *                   languages:
 *                     type: string
 *                     example: JavaScript, TypeScript
 *       401:
 *         description: Unauthorized, missing or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authorization header is missing or invalid."
 *       500:
 *         description: Failed to retrieve users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve users."
 */
app.get('/users', async (req: Request, res: Response) => {
  const { location, company, language, sort } = req.query;
  
  try {
    const result = await getUsersCommand(
      location?.toString(),
      company?.toString(),
      language?.toString(),
      sort?.toString()
    );
    
    if (result.error) {
      return res.status(500).json({
        error: "Failed to retrieve users, check logs for details."
      });
    }
    
    res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve users, check logs for details."
    });
  }
});

/**
 * @swagger
 * /populate:
 *   post:
 *     summary: Populate users into the database
 *     responses:
 *       200:
 *         description: Populate users was successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Populate users finished successfully."
 *       401:
 *         description: Unauthorized, missing or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authorization header is missing or invalid."
 *       500:
 *         description: Failed to populate users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Populate users failed, check logs for details."
 */
app.post('/populate', async (req: Request, res: Response) => {
  try {
    const result = await populateUsersCommand();
    
    if (result.error) {
      return res.status(500).json({
        error: "Populate users failed, check logs for details."
      });
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Populate users failed, check logs for details."
    });
  }
});

/**
 * @swagger
 * /ai/text:
 *   post:
 *     summary: Execute an AI-based command
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Get users in San Francisco who use JavaScript"
 *     responses:
 *       200:
 *         description: AI command executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       name:
 *                         type: string
 *                       bio:
 *                         type: string
 *                       location:
 *                         type: string
 *                       company:
 *                         type: string
 *                       followers:
 *                         type: integer
 *                       following:
 *                         type: integer
 *                       languages:
 *                         type: string
 *       400:
 *         description: Bad request, missing or invalid text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing text."
 *       401:
 *         description: Unauthorized, missing or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authorization header is missing or invalid."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Failed to execute AI command
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to execute AI command."
 */
app.post('/ai/text', async (req: Request, res: Response) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Invalid or missing text.' });
  }
  
  try {
    const result = await aiCommand(text);
    
    if (result.error) {
      if (result.error.includes('not found')) {
        return res.status(404).json({ error: "User not found." });
      }
      return res.status(500).json({
        error: "Failed to execute AI command, check logs for details."
      });
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to execute AI command, check logs for details."
    });
  }
});

/**
 * @swagger
 * /ai/voice:
 *   post:
 *     summary: Execute an AI-based voice command
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: audio
 *         type: file
 *         required: true
 *         description: The audio file of the command
 *     responses:
 *       200:
 *         description: AI voice command executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       name:
 *                         type: string
 *                       bio:
 *                         type: string
 *                       location:
 *                         type: string
 *                       company:
 *                         type: string
 *                       followers:
 *                         type: integer
 *                       following:
 *                         type: integer
 *                       languages:
 *                         type: string
 *       400:
 *         description: Bad request, missing or invalid audio file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Audio file is required."
 *       401:
 *         description: Unauthorized, missing or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Authorization header is missing or invalid."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Failed to execute AI command
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to execute AI voice command."
 */
app.post('/ai/voice', upload.single('file'),
  async (req: Request, res: Response) => {
    const audioFile = req.file;
  
    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }
  
    try {
      const transcript = await getAudioTranscript(
        audioFile.buffer,
        audioFile.originalname
      )
      
      console.log(transcript);
      
      const result = await aiCommand(transcript);
      
      if (result.error) {
        if (result.error.includes('not found')) {
          return res.status(404).json({ error: "User not found." });
        }
        return res.status(500).json({
          error: "Failed to execute AI command, check logs for details."
        });
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Failed to execute AI voice command:', error);
      res.status(500).json({
        error: 'Failed to execute AI voice command, check logs for details.'
      });
    }
  });

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`API docs available at http://localhost:${port}/api-docs`);
});

export { app, server }