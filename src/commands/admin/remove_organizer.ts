import Discord from 'discord.js';
import { configRef } from '../../firebase';
import { UserRefs } from '../../types';

export default {
  name: 'remove_organizer',
  usage: '!gg admin remove_organizer [@user]',
  category: 'ADMINISTRATION',
  description: 'Remove TO role from user and in database.',
  async execute(message: Discord.Message, args: string[]) {
    if (args.length === 0) {
      message.reply('Insufficient parameters supplied.');
      return;
    }

    const USER = args[0];
    const USER_ID = USER.replace(/\D/g, '');

    // Check if user is a valid user in the server.
    if (!message.guild.members.has(USER_ID)) {
      message.reply('Error: You tried to remove an invalid user.');
      return;
    }

    // Get current list of organizers
    const organizers = await configRef.get().then(doc => {
      return <UserRefs[]>doc.data()!.organizers;
    });
    const ORGANIZER_ROLE = await configRef.get().then(doc => {
      return <string>doc.data()!.TO_role.id;
    });

    // Remove requested user from the list of tournament organizers.
    const removalIndex = organizers.map(user => user.id).indexOf(USER_ID);
    if (removalIndex === -1) {
      message.reply(`${USER} is not a tournament organizer.`);
    } else {
      organizers.splice(removalIndex, 1);
      (<Discord.GuildMember>message.guild.members.get(USER_ID)).removeRole(ORGANIZER_ROLE);
      configRef.set({
        organizers: organizers,
      }, { merge: true }).then(() => {
        message.channel.send(`Successfully removed ${USER} as a tournament organizer.`);
      }).catch(err => {
        console.log(err);
        message.reply(`There was an error trying to remove ${USER} as a tournament organizer.`);
      });
    }
  },
};