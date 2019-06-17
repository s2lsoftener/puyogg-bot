import Discord from 'discord.js';
import { configRef } from '../../firebase';
import { UserRefs } from '../../types';

export default {
  name: 'list_organizers',
  usage: '!gg admin list_organizers',
  category: 'ADMINISTRATION',
  description: 'List the current tournament organizers.',
  async execute(message: Discord.Message, args: string[]) {
    const organizers = <UserRefs[]>(await configRef.get().then(doc => doc.data()!.organizers));

    const organizerString = organizers.map(organizer => organizer.at).join(', ');

    message.channel.send(`Current tournament organizers: ${organizerString}`);
  },
};
