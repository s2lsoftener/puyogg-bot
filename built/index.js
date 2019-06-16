"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// -- Environment stuff
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Prefix to expect at the beginning of bot commands
const config_json_1 = require("./config.json");
// -- Discord Bot
const discord_js_1 = __importDefault(require("discord.js"));
const client = new discord_js_1.default.Client();
exports.client = client;
client.commands = new discord_js_1.default.Collection();
// Load command files
const commandFiles = fs_1.default.readdirSync(path_1.default.resolve(__dirname, './commands')).filter((file) => file.endsWith('.js'));
commandFiles.forEach((file) => {
    const command = require(path_1.default.resolve(__dirname, `./commands/${file}`));
    client.commands.set(command.name, command);
});
// Bot loaded message
client.once('ready', () => {
    console.log('Ready!');
});
// Message Handler
client.on('message', (message) => {
    console.log(message.content);
    // Split message into parts.
    // !gg [command] [args...]
    const parts = message.content.split(/ +/).filter(part => part.length > 0);
    // Ignore message if !gg command was not supplied by a user
    if (parts[0] !== config_json_1.prefix || message.author.bot)
        return;
    // Check if only [!gg] was supplied.
    if (parts.length === 1) {
        message.reply('Type "!gg help" (without quotes) for help on using the puyo.gg bot\'s commands.');
        return;
    }
    const commandName = parts[1].toLowerCase();
    const args = parts.slice(2);
    // Run detected command.
    if (!client.commands.has(commandName))
        return;
    const command = client.commands.get(commandName);
    try {
        command.execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command.');
    }
});
// -- Login Bot
client.login(process.env.BOT_TOKEN);
