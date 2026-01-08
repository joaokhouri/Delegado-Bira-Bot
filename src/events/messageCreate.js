const { Events, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logEvento } = require('../services/logger');

// --- CONFIGURAÇÕES DO CÉREBRO ---
const LINKS_PERMITIDOS = ['youtube.com', 'youtu.be', 'twitch.tv', 'spotify.com', 'discord.com', 'tenor.com', 'imgur.com'];
const TERMOS_GRAVES = ['suastica', 'kkk', 'nigger']; // Adicione termos de ódio aqui
const spamMap = new Map();

// --- PERSONALIDADE ---
const RESPOSTAS = {
    bomdia: ['Bom dia, chefia! ☕', 'Dia! Bora pra luta.', 'Opa! Café tá na mesa.'],
    bira: ['Chamou o pai? 👮🏽‍♂️', 'QAP, Total e Operante.', 'Fala tu, meu nobre.'],
    musica: ['Tim Maia é rei! 👑', 'Quem não dança segura a criança! 🎷']
};

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot) return;

        const conteudo = message.content.toLowerCase();
        const isAdmin = message.member.permissions.has(PermissionFlagsBits.ManageMessages);

        // 1. TOLERÂNCIA ZERO (Crimes de Ódio) - Roda para todos
        if (TERMOS_GRAVES.some(termo => conteudo.includes(termo))) {
            return tratarCrime(message);
        }

        // 2. VERIFICAÇÃO DE ROTINA (Ignora Admins)
        if (!isAdmin) {
            // A. Anti-Link
            const temLink = /(https?:\/\/[^\s]+)/g.test(conteudo);
            if (temLink) {
                const linkProibido = !LINKS_PERMITIDOS.some(dom => conteudo.includes(dom));
                if (linkProibido) return tratarLinkProibido(message);
            }

            // B. Anti-Spam
            if (verificarSpam(message)) return;
        }

        // 3. SOCIALIZAÇÃO (Se passou pela segurança)
        await socializar(message, conteudo);
    },
};

// --- FUNÇÕES AUXILIARES ---

async function tratarCrime(message) {
    try {
        await message.delete();
        const embed = new EmbedBuilder().setColor(0x8B0000).setTitle('🚨 SEGURANÇA MÁXIMA').setDescription(`Conteúdo proibido detectado de ${message.author}.`);
        message.channel.send({ embeds: [embed] });
        
        await logEvento(message.client, message.guild, 'Crime de Ódio', '🚨 Infração Grave', `Autor: ${message.author.tag}\nMsg: ||${message.content}||`, [], 0x8B0000);
    } catch (e) {}
}

async function tratarLinkProibido(message) {
    try {
        await message.delete();
        const msg = await message.channel.send(`🚫 ${message.author}, sem panfletagem de links estranhos!`);
        setTimeout(() => msg.delete().catch(()=>{}), 5000);

        await logEvento(message.client, message.guild, 'Anti-Link', '🔗 Link Bloqueado', `Autor: ${message.author.tag}\nLink: ${message.content}`, [], 0xFFA500);
    } catch (e) {}
}

function verificarSpam(message) {
    const id = message.author.id;
    const now = Date.now();
    
    if (!spamMap.has(id)) {
        spamMap.set(id, { count: 1, last: now });
        return false;
    }

    const dados = spamMap.get(id);
    if (now - dados.last < 2000) dados.count++;
    else dados.count = 1;
    
    dados.last = now;
    spamMap.set(id, dados);

    if (dados.count >= 5) {
        if (dados.count === 5) {
            message.channel.send(`📢 ${message.author}, para de tocar a campainha! (Spam detectado)`);
            message.member.timeout(60000).catch(()=>{});
            logEvento(message.client, message.guild, 'Anti-Spam', '📢 Spam', `Autor: ${message.author.tag} mutado por 60s.`, [], 0xFFFF00);
        }
        return true;
    }
    return false;
}

async function socializar(message, texto) {
    if (texto.includes('bira')) {
        const resp = RESPOSTAS.bira[Math.floor(Math.random() * RESPOSTAS.bira.length)];
        message.reply(resp);
    }
    if (texto.match(/\b(bom dia|boa tarde|boa noite)\b/)) {
        const resp = RESPOSTAS.bomdia[Math.floor(Math.random() * RESPOSTAS.bomdia.length)];
        message.reply(resp);
    }
    if (texto.includes('tim maia')) message.reply(RESPOSTAS.musica[0]);
    if (texto.includes('café') || texto.includes('cafe')) message.react('☕');
}