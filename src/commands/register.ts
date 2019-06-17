import Discord from 'discord.js';
import { cleanIdString } from '../utility';
import firebase from '../firebase';
import { LeagueConfig } from '../types';

export default {
  name: 'register',
  usage: '',
  category: 'ACCOUNT_MANAGEMENT',
  description: 'Become a member of the Puyo Discord\'s ranking system.',
  async execute(message: Discord.Message, args: string[]) {
    try {
      const config = <LeagueConfig>(await firebase.db.collection('league').doc('config').get().then(doc => doc.data()!));
      const season = config.season;
      const seasonRef = firebase.db.collection('league').doc('seasons').collection(season);
      const ORGANIZER_ROLE = config.TO_role.id;

      // Check if the user submitting the command has a TO role
      const senderIsOrganizer = message.member.roles.has(ORGANIZER_ROLE);

      // If there's a third parameter and the requester has a TO role, they're trying to add
      // someone else, not themselves.
      const userToRegister = (!!args[0] && senderIsOrganizer)
        ? cleanIdString(args[0])
        : message.author.id;

      // Check if user exists as a player in the current season
      const userDoc = seasonRef.doc('players').collection('playerlist').doc(`${userToRegister}`);
      const userExists = await userDoc.get().then(data => data.exists);

      if (userExists) {
        message.channel.send(`<@${userToRegister}> is already a registered player.`);
      } else {
        const reply = <Discord.Message>(await message.channel.send(`Adding <@${userToRegister}> to the database...`));

        const userData = {
          id: message.author.id,
          avatar: message.author.avatarURL,
          tag: message.author.tag,
          createdTimestamp: message.author.createdTimestamp,
          current_rating: {
            eppc: 2000,
          },
          match_history: {},
        };

        userDoc.set(userData).then(() => {
          console.log(`Successfully added <@${message.author.id}> to the database.`);
          reply.edit(`<@${message.author.id}>, registration complete. Your rating will now be tracked.`);
        }).catch(err => {
          console.log(`Error adding data for ${message.author.id} to firebase.`, err);
          reply.edit(`Sorry <@${message.author.id}>, there was an error adding your information to the database.\nPlease contact a moderator.`);
        });
      }
    } catch (error) {
      console.log('An error occurred with this command.', error);
      message.reply('There was an error trying to process your command. Please contact a moderator.');
    }
  },
};