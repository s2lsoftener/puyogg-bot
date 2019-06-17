import Discord from 'discord.js';
import firebase, { configRef } from '../firebase';
import { UserRefs, LeagueConfig } from '../types';

export default {
  name: 'new_season',
  usage: '!gg new_season [season name]',
  category: 'TOURNAMENT_ORGANIZATION',
  description: 'Set the season for the league.',
  async execute(message: Discord.Message, args: string[]) {
    if (args.length === 0) {
      message.reply('Insufficient parameters supplied.');
      return;
    }

    const config = await configRef.get().then(doc => <LeagueConfig>doc.data()!);
    const newSeason = args[0];

    // Check if the user has the organizer role.
    if (!message.member.roles.has(config.TO_role.id)) {
      message.reply('You can\'t use this command because you\'re not a tournament organizer.');
      return;
    }

    // Check if the season already exists.
    const seasonList = (await firebase.db.collection('league').doc('seasons').listCollections()).map(season => season.id);
    console.log(seasonList);

    if (seasonList.some(season => season === newSeason)) {
      message.reply('This season already exists.');
      return;
    } else {
      message.channel.send(`Season ${newSeason} does not yet exist.`);
      firebase.db.collection('league').doc('seasons').collection(newSeason).doc('metadata')
        .set({ created: message.createdTimestamp })
        .then(() => {
          message.channel.send(`Created a new season with name ${newSeason} with timestamp ${message.createdTimestamp}`);
        })
        .then(() => {
          return configRef.set({
            current_season: newSeason,
          }, { merge: true });
        })
        .then(() => {
          message.channel.send(`Set the current season to ${newSeason}`);
        });
    }
  },
};