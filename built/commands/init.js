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
    name: 'init',
    usage: '!gg init [@TO role]',
    category: 'ADMINISTRATION',
    description: 'Configure the puyo.gg bot for use on the server.',
    execute(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            // Only execute if the user requesting this command has an admin permission.
            if (!message.member.hasPermission('ADMINISTRATOR')) {
                message.reply('Sorry, you don\'t have permission to use that command.');
                return;
            }
            // Set the identity of the TO role in the database.
            firebase_1.default.db.collection('league').doc('config').set({
                TO_role: args[0],
            }, { merge: true }).then(() => {
                message.channel.send(`Set ${args[0]} as the TO role.`);
            });
        });
    },
};
