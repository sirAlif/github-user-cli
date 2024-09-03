import { Command } from 'commander';
import {
  addUserCommand,
  getUserCommand,
  getUsersCommand,
  deleteUserCommand,
} from './commands';

const program = new Command();

program
  .name('github-cli')
  .description('CLI to interact with GitHub users and store in the database')
  .version('1.0.0');

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

program.parse(process.argv);
