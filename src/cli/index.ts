import { Command } from 'commander';
import readline from 'readline';
import {
  addUserCommand,
  aiCommand,
  getUserCommand,
  getUsersCommand,
  deleteUserCommand,
  populateUsersCommand
} from './commands';

const program = new Command();
let closed = false;  // Custom flag to track if readline is closed

program
  .name('github-cli')
  .description('CLI to interact with GitHub users and store in the database')
  .version('1.0.0');

/**
 * CLI command to add a GitHub user to the database.
 * @param {string} username - The GitHub username to add.
 */
program
  .command('add-user <username>')
  .description('Fetch a GitHub user and store in the database')
  .action(async (username: string) => {
    await addUserCommand(username, false);
  });

/**
 * CLI command to update an existing GitHub user in the database.
 * @param {string} username - The GitHub username to update.
 */
program
  .command('update-user <username>')
  .description('Update information of an existing user in the database')
  .action(async (username: string) => {
    await addUserCommand(username, true);
  });

/**
 * CLI command to delete a GitHub user from the database.
 * @param {string} username - The GitHub username to delete.
 */
program
  .command('delete-user <username>')
  .description('Remove an existing user from the database')
  .action(async (username: string) => {
    await deleteUserCommand(username);
  });

/**
 * CLI command to get a GitHub user by username.
 * @param {string} username - The GitHub username to retrieve.
 */
program
  .command('get-user <username>')
  .description('Get user by username')
  .action(async (username: string) => {
    await getUserCommand(username);
  });

/**
 * CLI command to get all users from the database with optional filters.
 * @param {Object} options - Filter and sort options.
 * @param {string} [options.location] - Filter users by location.
 * @param {string} [options.company] - Filter users by company.
 * @param {string} [options.language] - Filter users by programming language.
 * @param {string} [options.sort] - Sort users.
 */
program
  .command('get-users')
  .option('-l, --location <location>', 'Filter users by location')
  .option('-c, --company <company>', 'Filter users by company')
  .option('-L, --language <language>', 'Filter users by language')
  .option('-s, --sort <sort>', 'Sort users')
  .description('Get all users from the database')
  .action(async (options) => {
    await getUsersCommand(
      options.location,
      options.company,
      options.language,
      options.sort
    );
  });

/**
 * CLI command to populate the database with sample users.
 */
program
  .command('populate')
  .description('Populate users')
  .action(async () => {
    await populateUsersCommand();
  });


/**
 * CLI command to ask AI for commands based on input.
 * @param {string[]} input - The input to send to the AI.
 */
program
  .command('ai <input...>')
  .description('Ask AI for all commands')
  .action(async (input: string[]) => {
    const inputString = input.join(' ');
    await aiCommand(inputString);
  });

/**
 * CLI command to exit the program.
 */
program
  .command('exit')
  .description('Exit the CLI')
  .action(() => {
    console.log('Exiting the CLI...');
    closed = true;
    rl.close();  // Close the readline interface
  });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Repeatedly prompts for user input in the CLI.
 */
async function promptForCommand() {
  rl.question('Enter your command: ', async (commandInput) => {
    const args = commandInput.split(' ');
    
    // Check if the command is `help` to handle it manually
    if (args.includes('help') ||
      args.includes('--help') ||
      args.includes('-h')) {
      program.outputHelp();
    } else {
      await program.parseAsync(['node', 'cli.js', ...args]);
    }
    
    // Only prompt again if readline is still open
    if (!closed) {
      promptForCommand(); // Repeat the loop after the command is processed
    }
  });
}

// Start the loop
promptForCommand();
