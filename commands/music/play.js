const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const { exec } = require('child_process');
const { createReadStream } = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song!')
        .addStringOption((option) => 
            option
                .setName('link')
                .setDescription('link to yt video')
                .setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();
        // get link from command
        const link = interaction.options.getString('link');
        // download opus file from link with yt-dlp
        await executeBatFile(link);

        // get Voice Channel
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply('You need to be in a voice channel to use this command!');
            return;
        }
        // join Voice Channel
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        // create Audio Player
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        // subscribe Player to connection
        connection.subscribe(player);
        // extract id form link
        const id = getYouTubeVideoId(link);
        // create Audio resource from local file
        const resource = createAudioResource(createReadStream('./commands/music/songs/' + id + '.opus'), {
            inputType: StreamType.Arbitrary,
        });
        // play resource
        player.play(resource);
        // disconnect when finishing song
        player.on(AudioPlayerStatus.Idle, () => {
            interaction.followUp('Idle!');      
        });
	},
};

async function executeBatFile(url) {
    const batFilePath = path.join(__dirname, 'yt-download.bat');

    return new Promise((resolve, reject) => {
        const runnableScript = exec(`${batFilePath} ${url}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error); // Reject the promise if there's an error
                return;
            }
            console.log(stdout);
            console.error(stderr);
            resolve(); // Resolve the promise once the batch file finishes
        });
    });
}

function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null; // Return the ID if matched, otherwise null
}