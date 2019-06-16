import Discord from 'discord.js';
import firebase from '../../firebase';

export default {
  name: 'organizer_role',
  usage: '!gg admin organizer_role [@role]',
  category: 'ADMINISTRATION',
  description: 'Set the role for Tournament Organizers',
  execute(message: Discord.Message, args: string[]) {
    // args[0] - <&@12345...> identifier of TO Role
    if (args.length === 0) {
      message.reply('Insufficient parameters supplied.');
      return;
    }

    // -- Check if the supplied TO Role exists in the server.
    // Strip <@& .... > characters from role string.
    // /D/g - strip all non-numeric characters.
    const role = args[0].replace(/\D/g, '');
    if (message.guild.roles.has(role)) {
      firebase.db.collection('league').doc('config').set({
        TO_role: {
          id: role,
          at: args[0],
          name: message.guild.roles.get(role)!.name,
        },
      }, { merge: true }).then(() => {
        message.channel.send(`Set ${args[0]} as the TO role.`);
      });
    }
  },
};