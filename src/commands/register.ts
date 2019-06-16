import Discord from 'discord.js';
import firebase from '../firebase';

export default {
  name: 'register',
  usage: '',
  category: 'ACCOUNT_MANAGEMENT',
  description: 'Become a member of the Puyo Discord\'s ranking system.',
  async execute(message: Discord.Message, args: string[]) {
    // If there's a third parameter and the requester has a TO role, they're trying to add
    // someone else, not themselves.
    console.log(message.member.roles);

    console.log(`Looking up user record: ${message.author.id}`);

    // Metadata variables
    let season: string;
    let config: any;

    // Set refs for readability
    let seasonRef: FirebaseFirestore.CollectionReference;

    firebase.db.collection('league').doc('config').get().then(doc => {
      config = doc.data()!;
      season = config.season;
      seasonRef = firebase.db.collection('league').doc('seasons').collection(season);
    }).then(() => {
      return seasonRef.doc('players').collection('playerlist').doc(`${message.author.id}`).get().then(data => {
        return data.exists;
      });
    }).then(exists => {
      if (exists) {
        return exists;
      } else {
        throw exists;
      }
    }).then(() => {
      message.channel.send(`<@${message.author.id}>, you're already registered.`);
    }).catch(async () => {
      const reply = <Discord.Message>(await message.channel.send(`Adding <@${message.author.id}> to the database...`));

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

      seasonRef.doc('players').collection('playerlist').doc(`${message.author.id}`).set(userData).then(() => {
        console.log(`Successfully added <@${message.author.id}> to the database.`);
        reply.edit(`<@${message.author.id}>, registration complete. Your rating will now be tracked.`);
      }).catch(err => {
        console.log(`Error adding data for ${message.author.id} to firebase.`, err);
        reply.edit(`Sorry <@${message.author.id}>, there was an error adding your information to the database.\nPlease contact a moderator.`);
      });
    });
  },
};