// -- Environment stuff
import * as fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
// Prefix to expect at the beginning of bot commands
import { prefix } from './config.json';

// -- Discord Bot
import Discord from 'discord.js';

// Module augmentation to allow adding "commands" property to Discord.Client
declare module 'discord.js' {
  interface Client {
    commands: Discord.Collection<string, any>
  }
}
const client = new Discord.Client();
client.commands = new Discord.Collection();

// Load command files
const commandFiles = fs.readdirSync(path.resolve(__dirname, './commands')).filter((file: string) => file.match(/(\.js|\.ts)/));
commandFiles.forEach((file: string) => {
  const command = require(path.resolve(__dirname, `./commands/${file}`)).default;
  console.log(command);
  client.commands.set(command.name, command);
});

// Bot loaded message
client.once('ready', () => {
  console.log('Ready!');
});

// Message Handler
client.on('message', (message: Discord.Message) => {
  console.log(message.content);

  // Split message into parts.
  // !gg [command] [args...]
  const parts = message.content.split(/ +/).filter(part => part.length > 0);

  // Ignore message if !gg command was not supplied by a user
  if (parts[0] !== prefix || message.author.bot) return;

  // Check if only [!gg] was supplied.
  if (parts.length === 1) {
    message.reply('Type "!gg help" (without quotes) for help on using the puyo.gg bot\'s commands.');
    return;
  }

  const commandName = parts[1].toLowerCase();
  const args = parts.slice(2);

  // Run detected command.
  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command.');
  }
});

// -- Login Bot
client.login(process.env.BOT_TOKEN);

// -- Export client for use in other files
export { client };