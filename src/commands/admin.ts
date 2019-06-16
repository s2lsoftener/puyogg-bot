import fs from 'fs';
import path from 'path';
import Discord from 'discord.js';
import { Command } from '../types';

const adminCommands = new Discord.Collection();
const commandFiles = fs.readdirSync(path.resolve(__dirname, './admin')).filter((file: string) => file.match(/(\.js|\.ts)/));
commandFiles.forEach((file: string) => {
  const command = require(path.resolve(__dirname, `./admin/${file}`)).default;
  adminCommands.set(command.name, command);
});

export default {
  name: 'admin',
  usage: '!gg admin ...',
  category: 'ADMINISTRATION',
  description: 'Perform many admin commands',
  async execute(message: Discord.Message, args: string[]) {
    // Only execute if the user requesting this command has an admin permission.
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      message.reply('Sorry, you don\'t have permission to use that command.');
      return;
    }

    // Don't execute if insufficient parameters supplied.
    if (args.length === 0) {
      message.reply('Insufficient parameters supplied.');
      return;
    }

    // Alias the commandName and nextArgs to pass
    const commandName = args[0].toLowerCase();
    const nextArgs = args.slice(1);

    // Check if the admin user tried to use a known command.
    if (!adminCommands.has(commandName)) {
      message.reply('Error. You tried to use an unknown command.');
      return;
    }

    // Run the given admin command
    const command = <Command>adminCommands.get(commandName);
    try {
      command.execute(message, nextArgs);
    } catch (error) {
      console.log(error);
      message.reply('There was an error trying to execute your command.');
    }
  },
};