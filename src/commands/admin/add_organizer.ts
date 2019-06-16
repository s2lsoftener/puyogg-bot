import Discord from 'discord.js';
import firebase from '../../firebase';
import { database } from 'firebase-admin';

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

    // Alias league config document.
    const configDoc = firebase.db.collection('league').doc('config');

    const organizers = await configDoc.get().then(doc => {
      return <string[]>doc.data()!.organizers;
    });

    if (organizers.includes(USER)) {
      message.reply(`${USER} is already a tournament organizer.`);
    } else {
      message.reply(`${USER} is not yet a tournament organizer.`);
    }
  },
};