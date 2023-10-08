"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const controls_1 = __importDefault(require("../components/controls"));
const replyembed_1 = __importDefault(require("../components/replyembed"));
const databasehandler_1 = __importDefault(require("../handler/databasehandler"));
const data_1 = __importDefault(require("../data"));
const command = new discord_js_1.SlashCommandBuilder()
    .setName('controls')
    .setDescription('Display the controls in the specified channel!')
    .addChannelOption(channel => channel
    .addChannelTypes(discord_js_1.ChannelType.GuildText)
    .setName("channel")
    .setDescription("The channel to display the controls in")
    .setRequired(true))
    .addBooleanOption(boolean => boolean
    .setRequired(false)
    .setName("lock")
    .setDescription("Lock the channel for messages after the controls"));
async function execute(client, interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        interaction.reply({ embeds: [replyembed_1.default.build({ title: "This command can only be used inside of servers!", isError: true })] })
            .then(message => setTimeout(() => message.delete(), 3000));
        return;
    }
    const channel = interaction.options.getChannel("channel", true);
    const lockChannel = interaction.options.getBoolean("lock");
    const doc = await databasehandler_1.default.ControlsData.findOne({ guild: guildId }).exec();
    if (doc) {
        if (!doc.message) {
            interaction.reply({ embeds: [replyembed_1.default.build({ title: "Could not delete previous message", isError: true })] })
                .then(message => setTimeout(() => message.delete(), 3000));
        }
        else {
            const prevChannel = await client.channels.fetch(doc.channel || "");
            if (prevChannel?.type === discord_js_1.ChannelType.GuildText) {
                await prevChannel.messages.delete(doc.message).catch(() => {
                    interaction.reply({ embeds: [replyembed_1.default.build({ title: "Could not delete previous message", isError: true })] })
                        .then(message => setTimeout(() => message.delete(), 3000));
                });
            }
        }
    }
    const newChannel = await client.channels.fetch(channel.id);
    let message = await newChannel.send({ embeds: controls_1.default.embed, components: controls_1.default.components });
    if (!message) {
        if (interaction.replied) {
            await interaction.editReply({ embeds: [replyembed_1.default.build({ title: "Could not display controls inside of <#" + newChannel.id + ">!", isError: true })] })
                .then(message => setTimeout(() => message.delete(), 3000));
            ;
        }
        else {
            await interaction.reply({ embeds: [replyembed_1.default.build({ title: "Could not display controls inside of <#" + newChannel.id + ">!", isError: true })] })
                .then(message => setTimeout(() => message.delete(), 3000));
            ;
        }
    }
    const locked = ((lockChannel == undefined) ? (!doc?.lock ? false : doc.lock) : lockChannel);
    await databasehandler_1.default.ControlsData.updateOne({ guild: guildId }, { channel: channel.id, message: message.id, lock: locked }, { upsert: true }).exec()
        .then(() => {
        data_1.default.setLockedChannel((!locked ? undefined : newChannel.id));
        if (interaction.replied) {
            interaction.editReply({ embeds: [replyembed_1.default.build({ title: "Controls are now shown inside of <#" + newChannel.id + ">!" })] })
                .then(message => setTimeout(() => message.delete(), 3000));
            ;
        }
        else {
            interaction.reply({ embeds: [replyembed_1.default.build({ title: "Controls are now shown inside of <#" + newChannel.id + ">!" })] })
                .then(message => setTimeout(() => message.delete(), 3000));
            ;
        }
    }).catch(() => {
        if (interaction.replied) {
            interaction.editReply({ embeds: [replyembed_1.default.build({ title: "Error whilst trying to save to database. Please try again.", isError: true })] })
                .then(message => setTimeout(() => message.delete(), 3000));
            ;
        }
        else {
            interaction.reply({ embeds: [replyembed_1.default.build({ title: "Error whilst trying to save to database. Please try again.", isError: true })] })
                .then(message => setTimeout(() => message.delete(), 3000));
            ;
        }
    });
}
exports.default = {
    command: command,
    execute: execute
};
