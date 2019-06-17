import Discord from 'discord.js';

export interface Command {
  name: string;
  usage: string;
  category: string;
  description: string;
  execute(message: Discord.Message, args: string[]): void;
}

export interface UserRefs {
  id: string,
  at: string,
  name: string
}

export interface LeagueConfig {
  TO_role: UserRefs;
  organizers: UserRefs[];
  season: string;
}