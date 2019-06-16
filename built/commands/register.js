"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = __importDefault(require("../firebase"));
module.exports = {
    name: 'register',
    usage: '',
    category: 'ACCOUNT_MANAGEMENT',
    description: 'Become a member of the Puyo Discord\'s ranking system.',
    execute(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            // If there's a third parameter and the requester has a TO role, they're trying to add
            // someone else, not themselves.
            console.log(message.member.roles);
            console.log(`Looking up user record: ${message.author.id}`);
            // Metadata variables
            let season;
            let config;
            // Set refs for readability
            let seasonRef;
            firebase_1.default.db.collection('league').doc('config').get().then(doc => {
                config = doc.data();
                season = config.season;
                seasonRef = firebase_1.default.db.collection('league').doc('seasons').collection(season);
            }).then(() => {
                return seasonRef.doc('players').collection('playerlist').doc(`${message.author.id}`).get().then(data => {
                    return data.exists;
                });
            }).then(exists => {
                if (exists) {
                    return exists;
                }
                else {
                    throw exists;
                }
            }).then(() => {
                message.channel.send(`<@${message.author.id}>, you're already registered.`);
            }).catch(() => __awaiter(this, void 0, void 0, function* () {
                const reply = (yield message.channel.send(`Adding <@${message.author.id}> to the database...`));
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
            }));
        });
    },
};
