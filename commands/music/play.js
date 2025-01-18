const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { VoiceConnectionStatus, AudioPlayerStatus, joinVoiceChannel, getVoiceConnections } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType  } = require('@discordjs/voice');
const { createReadStream, createWriteStream } = require('node:fs');
const playdl = require('play-dl');
const ytdl = require("@distube/ytdl-core");
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const url = "https://www.youtube.com/watch?v=DiUGv1vsuSU";

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
            )
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The url to play')),

	async execute(interaction) {
        await executeBatFile(url);

        const url2 = interaction.options;
        console.log(url2);

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

        const FileName = "123.opus";
        const resource = createAudioResource(createReadStream('./commands/music/songs/' + FileName), {
            inputType: StreamType.Arbitrary,
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

async function executeBatFile(url){
    // Path to your batch file
    const batFilePath = path.join(__dirname, 'yt-download.bat');
    // console.log(batFilePath);

    var runnableScript = exec(`${batFilePath} ${url}`,
        (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });



    return 1;
}