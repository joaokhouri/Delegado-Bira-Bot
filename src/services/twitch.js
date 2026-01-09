const axios = require('axios');
require('dotenv').config();

// Memória para não repetir o aviso
let isLive = false;
let accessToken = null;

async function getTwitchAccessToken() {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });
        accessToken = response.data.access_token;
        return accessToken;
    } catch (error) {
        console.error('❌ Erro ao pegar token da Twitch (Verifique o .env):', error.message);
        return null;
    }
}

async function checkStream(client) {
    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CHANNEL_NAME) return;

    // Se não tiver token, pega um novo
    if (!accessToken) await getTwitchAccessToken();

    const streamer = process.env.TWITCH_CHANNEL_NAME;

    try {
        const response = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${streamer}`, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const stream = response.data.data[0]; // Pega dados da live se estiver ON

        if (stream) {
            // --- ESTÁ ONLINE! ---
            if (!isLive) {
                isLive = true;
                console.log(`🟣 ${streamer} entrou ao vivo!`);

                const canalAvisos = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
                
                if (canalAvisos) {
                    // Embed simples e direto
                    const { EmbedBuilder } = require('discord.js');
                    const embed = new EmbedBuilder()
                        .setColor(0x9146FF)
                        .setTitle(`🚨 O CHEFE TÁ ON!`)
                        .setURL(`https://twitch.tv/${streamer}`)
                        .setDescription(`**${stream.user_name}** abriu a portaria!\n\n🎮 **Jogo:** ${stream.game_name}\n📝 **Título:** ${stream.title}`)
                        .setImage(stream.thumbnail_url.replace('{width}', '1280').replace('{height}', '720') + `?t=${Date.now()}`) // Cache breaker na thumb
                        .setTimestamp();

                    canalAvisos.send({ content: '@everyone 📢 **LIVE ON!** Corre lá!', embeds: [embed] });
                }
            }
        } else {
            // --- ESTÁ OFFLINE ---
            if (isLive) {
                console.log(`🔴 ${streamer} fechou a live.`);
                isLive = false; // Reseta para avisar na próxima
            }
        }

    } catch (error) {
        if (error.response && error.response.status === 401) {
            accessToken = null; // Token venceu, pega outro na próxima
        }
    }
}

module.exports = { checkStream };