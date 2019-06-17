import Discord from 'discord.js';
import firebase, { configRef } from '../firebase';
import { LeagueConfig } from '../types';
import { cleanIdString } from '../utility';

export default {
  name: 'register',
  usage: '',
  category: 'ACCOUNT_MANAGEMENT',
  description: 'Become a member of the Puyo Discord\'s ranking system.',
  async execute(message: Discord.Message, args: string[]) {
    const config = <LeagueConfig>(await configRef.get().then(doc => doc.data()));
    const season = config.current_season;
    const seasonRef = firebase.db.collection('league').doc('seasons').collection(season);

    // Check if sender is organizer
    const senderIsOrganizer = message.member.roles.has(config.TO_role.id);

    // If there's a third parameter and the requester has a TO role, they're trying to add
    // someone else, not themselves.
    const userToRegister = (!!args[0] && senderIsOrganizer)
      ? cleanIdString(args[0])
      : message.author.id;

    // Check if the userToRegister is already a player in the current season
    const playerList = (await seasonRef.doc('players').collection('players').listDocuments()).map(doc => doc.id);
    if (playerList.some(player => player === userToRegister)) {
      message.reply(`The requested user <@${userToRegister}> already exists as a player this season.`);
    } else {
      const member = <Discord.GuildMember>message.guild.members.get(userToRegister);

      const userData = {
        id: userToRegister,
        avatar: member.user.avatarURL,
        tag: member.user.tag,
        createdTimestamp: message.author.createdTimestamp,
        current_rating: 2000,
        match_history: {},
      };

      seasonRef.doc('players').collection('players').doc(userToRegister).set(userData).then(() => {
        message.reply(`Successfully added <@${userToRegister}> to the database as a player.`);
      });
    }
  },
};