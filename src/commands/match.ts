import Discord from 'discord.js';
import { LeagueConfig, PlayerData } from '../types';
import firebase, { configRef } from '../firebase';
import { cleanIdString } from '../utility';
const ELO = require('arpad');

export default {
  name: 'match',
  usage: '!gg match [player1] ##-## [player2] [video-link]',
  category: 'MATCHMAKING',
  description: 'Declare the results of a Puyo match',
  async execute(message: Discord.Message, args: string[]) {
    try {
      // REMINDER!!! Add check to see if player requesting this function is a valid player or TO

      if (args.length < 3) {
        message.reply('Insufficient parameters supplied.');
        return;
      }

      const config = <LeagueConfig>(await configRef.get().then(doc => doc.data()));
      const season = config.current_season;
      const seasonRef = firebase.db.collection('league').doc('seasons').collection(season);
      const playerList = (await seasonRef.doc('players').collection('players').listDocuments()).map(doc => doc.id);
      const p1 = cleanIdString(args[0]);
      const p2 = cleanIdString(args[2]);

      const setDatabaseRef = (PLAYER_ID: string): FirebaseFirestore.DocumentReference => {
        const inDiscord = message.guild.members.has(PLAYER_ID);
        const inDatabase = playerList.some(player => player === PLAYER_ID);
        if (inDiscord && inDatabase) {
          return seasonRef.doc('players').collection('players').doc(PLAYER_ID);
        } else {
          throw `<@${PLAYER_ID}> is not a valid player.`;
        }
      };

      // Assign database references
      const p1Ref = setDatabaseRef(p1);
      const p2Ref = setDatabaseRef(p2);

      // Parse the score string.
      const scoreSplit = args[1].split('-');
      console.log(scoreSplit);
      if (scoreSplit.length !== 2) {
        throw 'You submitted an invalid score.';
      }

      scoreSplit.forEach(score => {
        if (!!score.match(/\D/g)) {
          throw 'You submitted a score with non-numeric characters';
        }
      });

      const [p1Score, p2Score] = scoreSplit.map(score => parseInt(score, 10));

      // Retrieve Player Data
      const p1Data = <PlayerData>(await p1Ref.get().then(doc => doc.data()));
      const p2Data = <PlayerData>(await p2Ref.get().then(doc => doc.data()));

      const elo = new ELO();

      console.log(p1Data.current_rating);
      console.log(p2Data.current_rating);
      const p1_new_elo = elo.newRatingIfWon(p1Data.current_rating, p2Data.current_rating);
      const p2_new_elo = elo.newRatingIfLost(p2Data.current_rating, p1Data.current_rating);

      message.channel.send(`Player 1 <@${p1}>: ${p1Data.current_rating} -> ${p1_new_elo}\nPlayer 2 <@${p2}>: ${p2Data.current_rating} -> ${p2_new_elo}`);

    } catch (error) {
      console.log('Error: ' + error);
      message.channel.send('Error: ' + error);
    }
  },
};