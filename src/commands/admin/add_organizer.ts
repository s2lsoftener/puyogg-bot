import Discord from 'discord.js';
import firebase from '../../firebase';
import { UserRefs } from '../../types';


export default {
  name: 'add_organizer',
  usage: '!gg admin add_organizer [@user]',
  category: 'ADMINISTRATION',
  description: 'Apply TO role and set as TO in database.',
  async execute(message: Discord.Message, args: string[]) {
    // args[0] - <@user> - an @ ping of the desired user.
    if (args.length === 0) {
      message.reply('Insufficient parameters supplied.');
      return;
    }

    const USER = args[0];
    const USER_ID = USER.replace(/\D/g, '');

    // Check if user is a valid user in the server.
    if (!message.guild.members.has(USER_ID)) {
      message.reply('Error: You tried to give an invalid user the organizer role.');
      return;
    }

    const USER_NAME = (<Discord.GuildMember>message.guild.members.get(USER_ID)).nickname;

    // Alias league config document.
    const configDoc = firebase.db.collection('league').doc('config');

    // Get current list of organizers and TO role
    const organizers = await configDoc.get().then(doc => {
      return <UserRefs[]>doc.data()!.organizers;
    });
    const ORGANIZER_ROLE = await configDoc.get().then(doc => {
      return <string>doc.data()!.TO_role.id;
    });

    // Add the requested user to the list of tournament organizers,
    // if they're not already part of the list.
    if (organizers.some(organizer => organizer.id === USER_ID)) {
      message.reply(`${USER} is already a tournament organizer.`);
      return;
    } else {
      configDoc.set({
        organizers: organizers.push({
          id: USER_ID,
          at: USER,
          name: USER_NAME,
        }),
      }, { merge: true }).then(() => {
        message.member.addRole(ORGANIZER_ROLE);
        message.channel.send(`${USER} was successfully added as a tournament organizer.`);
      }).catch(err => {
        console.log(err);
        message.reply(`There was an error trying to add ${USER} as a tournament organizer.`);
      });
    }
  },
};