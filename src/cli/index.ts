import { Command } from 'commander';
import readline from 'readline';
import {
  addUserCommand,
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

// Define all your commands here
program
  .command('add-user <username>')
  .description('Fetch a GitHub user and store in the database')
  .action(async (username: string) => {
    await addUserCommand(username, false);
  });

program
  .command('update-user <username>')
  .description('Update information of an existing user in the database')
  .action(async (username: string) => {
    await addUserCommand(username, true);
  });

program
  .command('delete-user <username>')
  .description('Remove an existing user from the database')
  .action(async (username: string) => {
    await deleteUserCommand(username);
  });

program
  .command('get-user <username>')
  .description('Get user by username')
  .action(async (username: string) => {
    await getUserCommand(username);
  });

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

program
  .command('populate')
  .description('Populate users')
  .action(async () => {
    await populateUsersCommand();
  });

program
  .command('exit')
  .description('Exit the CLI')
  .action(() => {
    console.log('Exiting the CLI...');
    closed = true;
    rl.close();  // Close the readline interface
  });

// Function to repeatedly prompt for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
