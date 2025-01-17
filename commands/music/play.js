const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { VoiceConnectionStatus, AudioPlayerStatus, joinVoiceChannel, getVoiceConnections } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType  } = require('@discordjs/voice');
const { createReadStream } = require('node:fs');
const ytdl = require("@distube/ytdl-core");
const playdl = require('play-dl');
const distube = require('distube');
const client = require('../../index.js');
const { YouTubeDLPlugin } = require('@distube/yt-dlp');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Joins a voice channel!')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to join')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice)
            ),

	async execute(interaction) {
		await interaction.deferReply();

        const voiceChannel = interaction.options.getChannel('channel');
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        const subscription = connection.subscribe(player);
        const resource = createAudioResource(createReadStream('./321.opus'), {
            inputType: StreamType.OggOpus,
        });
        player.play(resource);

        player.on('error', error => {
            console.error(`Error: ${error.message} with resource ${error}`);
            interaction.followUp('Error!');
        });

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('The audio player has started playing!');
        });

        player.on(AudioPlayerStatus.Idle, () => {
            interaction.followUp('Idle!');      
        });
	},
};