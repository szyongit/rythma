"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const replyembed_1 = __importDefault(require("../components/replyembed"));
const databasehandler_1 = __importDefault(require("../handler/databasehandler"));
const command = new discord_js_1.SlashCommandBuilder()
    .setName('playtime')
    .setDescription('Shows the total playtime for this guild!');
async function execute(client, interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "This command can only be used inside of servers!", isError: true })] })
            .then((message) => setTimeout(() => message.delete().catch(() => { }), 5000));
        return;
    }
    const doc = await databasehandler_1.default.PlayTime.find({}).exec();
    const guildDoc = doc.find((document) => document.guild === interaction.guildId);
    if (!guildDoc) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "Rythma has not played yet!", isError: true })], ephemeral: true });
        return;
    }
    const leaderBoard = [];
    const now = Date.now();
    doc.forEach((document) => {
        const isPlaying = document.playing === true;
        const time = (document.time || 0) + (isPlaying ? (now - (document.lastStart || now)) : 0);
        leaderBoard.push({ guild: document.guild, time: time });
    });
    leaderBoard.sort((a, b) => b.time - a.time);
    const rank = leaderBoard.findIndex((element) => element.guild === interaction.guildId) + 1;
    const time = leaderBoard[rank - 1].time;
    const guildThumbnail = interaction.guild?.iconURL({ size: 128 }) || client.user?.avatarURL({ size: 128 });
    const appendix = (rank === 1 ? ":first_place:" : (rank === 2 ? ":second_place:" : (rank === 3 ? "third_place" : "")));
    interaction.reply({ embeds: [replyembed_1.default.build({
                title: interaction.guild?.name || "Guild",
                message: `Playtime:\n${(Math.floor(time / 1000 / 60 / 60 / 24))} Days, ${((Math.floor(time / 1000 / 60 / 60) % 60))} Hours, ${((Math.floor(time / 1000 / 60) % 60))} Minutes, ${(Math.floor((time / 1000) % 60))} Seconds
        \n${appendix} This server is #${rank} out of all servers! ${appendix}`,
                thumbnailURL: guildThumbnail
            })] }).then((message) => {
        setTimeout(() => message.delete().catch(() => { }), 5000);
    });
}
exports.default = {
    command: command,
    execute: execute
};
