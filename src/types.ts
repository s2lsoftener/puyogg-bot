import Discord from 'discord.js';

export interface Command {
  name: string;
  usage: string;
  category: string;
  description: string;
  execute(message: Discord.Message, args: string[]): void;
}