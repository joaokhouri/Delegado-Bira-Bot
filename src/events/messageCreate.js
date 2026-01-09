const { Events, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logEvento } = require('../services/logger');

// =====================================================
// ⚙️ CONFIGURAÇÕES
// =====================================================
const LINKS_PERMITIDOS = [
    'youtube.com', 'youtu.be', 'twitch.tv', 'discord.com', 'discord.gg', 
    'tenor.com', 'imgur.com', 'spotify.com'
];
const TERMOS_GRAVES = ['suastica', 
    'nigger', 
    'nazis', 
    'hitler', 
    'crioulo',       // Geralmente usado de forma pejorativa
    'preto imundo',  // Frase composta para evitar banir a cor 'preto'
]
const SPAM_MAP = new Map();

// Chance dele responder gírias do dicionário (0.35 = 35%)
const CHANCE_DE_FALAR = 0.35; 

// =====================================================
// 🧠 DICIONÁRIO DO BIRA (Gírias e Respostas Fixas)
// =====================================================
// Obs: Removi 'bom dia' daqui para usar o sistema inteligente de horário lá embaixo
const PERSONALIDADE = {
    // --- Gírias ---
    'pix': ['Opa, minha chabe é bira@paialipio.com.br.', 'Dinheiro na mão, calcinha no chão... digo, contas em dia!'],
    'padrao fifa': 'Aí você disse tudo. Qualidade internacional.',
    'na manteiga': 'Você disse... pipoca ?',
    'apaga': ['Apaga que dá tempo, guerreiro...', 'Se ninguém viu, não aconteceu. 🫣'],
    'deu ruim': 'Azedou o pé do frango ai?',
    'sextou': ['Dia de maldade!', 'Aleluia! Cerveja gelada e Tim Maia na caixa.'],
    
    // --- Rivalidades ---
    'loritta': ['Essa aí é patricinha, quero ver aguentar um turno de 12h na portaria.', 'Respeito a colega, mas o bigode aqui impõe mais moral.'],
    'mee6': ['Gringo metido a besta. Aqui é Brasil, rapaz!'],

    // --- Clima ---
    'calor': ['Tá louco, o asfalto tá fritando ovo hoje.', 'Ventilador da guarita não tá dando conta.', 'Hoje só uma gelada pra molhar as palavras.'],
    'frio': ['Esfriou, hein? Bota o jaco que o vento tá cortando.', 'Tempo bom pra café e pão de queijo.'],
    'chuva': ['E eu esqueci o guarda-chuva... vai molhar o chão do hall todo!', 'Cuidado na pista, tá escorregando.'],

    // --- Clássicos ---
    'delegado': 'Tô na escuta, chefe. Qual é a ocorrência?',
    'obrigado bira': 'Tamo junto, campeão. Precisando, é só chamar no rádio.',
    'tim maia': ['👑 Tim Maia é rei! O Síndico do Brasil.', '🎵 *Ah! Se o mundo inteiro me pudesse ouvir...*', 'Quem não dança segura a criança! 🎷'],
    'café': ['Aceito, hein? Sem açúcar, por favor.', '☕ Opa, senti o cheiro daqui!'],
    
    // 'bira' fica aqui para garantir resposta se falarem o nome sem marcar @
    'bira': ['Eu mesmo.', 'Diga lá, chefia.', '👀 Tô na escuta.', 'Opa!'],

    // --- Reações (Emojis) ---
    'amo esse server': { type: 'react', value: '❤️' },
    'kkkk': { type: 'react', value: '😂' },
    'haha': { type: 'react', value: '😂' },
    'obrigado': { type: 'react', value: '🙏' },
    'brabo': { type: 'react', value: '🔥' },
    'f': { type: 'react', value: '😔' },
    'cerveja': { type: 'react', value: '🍺' },
};

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        const conteudo = message.content.toLowerCase();
        const isAdmin = message.member.permissions.has(PermissionFlagsBits.ManageMessages);

        // 1. SEGURANÇA (Sempre ativo, 100% das vezes)
        if (TERMOS_GRAVES.some(termo => conteudo.includes(termo))) return tratarCrime(message);
        if (!isAdmin) {
            if (/(https?:\/\/[^\s]+)/g.test(conteudo) && !LINKS_PERMITIDOS.some(dom => conteudo.includes(dom))) return tratarLinkProibido(message);
            if (verificarSpam(message)) return;
        }

        // 2. SOCIALIZAÇÃO (Com as lógicas recuperadas!)
        await socializar(message, conteudo);
    },
};

// --- FUNÇÕES AUXILIARES ---
async function tratarCrime(message) { 
    try { await message.delete(); message.channel.send({ embeds: [new EmbedBuilder().setColor(0x8B0000).setTitle('🚨 SEGURANÇA').setDescription(`Conteúdo proibido de ${message.author}.`)] }).then(m=>setTimeout(()=>m.delete(),10000)); logEvento(message.client, message.guild, 'Crime', '🚨 Grave', `User: ${message.author.tag}`, [], 0x8B0000); } catch(e){} 
}
async function tratarLinkProibido(message) { 
    try { await message.delete(); message.channel.send(`🚫 ${message.author}, sem link estranho!`).then(m=>setTimeout(()=>m.delete().catch(()=>{}),5000)); } catch(e){} 
}
function verificarSpam(message) {
    const id = message.author.id; const now = Date.now();
    if (!SPAM_MAP.has(id)) { SPAM_MAP.set(id, { count: 1, last: now }); return false; }
    const dados = SPAM_MAP.get(id);
    if (now - dados.last < 2500) dados.count++; else dados.count = 1;
    dados.last = now; SPAM_MAP.set(id, dados);
    if (dados.count >= 6) { 
        if (dados.count === 6) { message.channel.send(`📢 ${message.author}, spam detectado! 1 min de castigo.`); message.member.timeout(60000).catch(()=>{}); }
        return true; 
    }
    return false;
}

async function socializar(message, texto) {
    // 1. Prioridade MÁXIMA: Menção ao Bot (@Bira)
    // Responde SEMPRE (100% de chance)
    if (message.mentions.users.has(message.client.user.id)) {
        const respostasBira = [

            'Chamou o pai? 👮🏽‍♂️',
            'Tô de olho aqui nas câmeras, pode falar.',
            'Fala tu, meu nobre.',
            'Se for pra pedir dinheiro, o caixa fechou.',
            'Presente!',
        ];
        return message.reply(respostasBira[Math.floor(Math.random() * respostasBira.length)]);
    }

    // 2. Inteligência Temporal (Relógio Biológico)
    const horaAgora = parseInt(new Date().toLocaleString("pt-BR", { hour: 'numeric', hour12: false, timeZone: "America/Sao_Paulo" }));
    
    // A. Hora do Almoço (11h às 13h)
    if (horaAgora >= 11 && horaAgora <= 13 && Math.random() < CHANCE_DE_FALAR) {
        if (texto.match(/\b(fome|almoço|comer|rango|bóia)\b/)) {
            const respostasAlmoco = [
                'Ih, to sentindo o cheiro da marmita daqui. É bife acebolado?',
                'Pausa pro rango! A guarita tá fechada pra almoço (brincadeira).',
                'Saco vazio não para em pé. Vai lá encher o tanque, guerreiro.',
            ];
            await message.reply(respostasAlmoco[Math.floor(Math.random() * respostasAlmoco.length)]);
            return;
        }
    }

    // B. Madrugada (00h às 05h)
    if (horaAgora >= 0 && horaAgora <= 5) {
        // Chance baixa (10%) pra não ser chato, mas existe
        if (Math.random() < 0.1) { 
            const respostasMadruga = [
                'Madrugadão, hein? Vai dormir que eu cuido da segurança aqui.',
                'Coruja ou zumbi? O turno da noite é só meu, chefia.',
                'Liga no corujão ai, ta passando um filmaço do Denzel Washington'
            ];
            await message.reply(respostasMadruga[Math.floor(Math.random() * respostasMadruga.length)]);
            return;
        }
    }

    // 3. VIP Puxa-Saco (Recuperado!)
    const ehVIP = message.member.roles.cache.some(r => ['VIP', 'Patrão', 'Subscriber', 'Booster'].some(nome => r.name.includes(nome)));
    // 5% de chance de elogiar o patrão do nada
    if (ehVIP && Math.random() < 0.05) {
        message.channel.send(['Falou tudo, chefia! 👏', 'Concordo com o patrão.', '👑', 'Sábias palavras.'].sort(() => 0.5 - Math.random())[0]);
    }

    // 4. Busca no Dicionário (Com filtro de chance pra não ser chato)
    for (const [gatilho, resposta] of Object.entries(PERSONALIDADE)) {
        if (texto.includes(gatilho)) {
            
            // SE a palavra NÃO for o nome dele "bira" (que deve responder sempre)
            // E o dado cair num número alto... ele fica quieto.
            if (gatilho !== 'bira' && Math.random() > CHANCE_DE_FALAR) {
                continue; 
            }

            if (resposta.type === 'react') {
                try { await message.react(resposta.value); return; } catch (e) { return; }
            }
            if (Array.isArray(resposta)) {
                await message.reply(resposta[Math.floor(Math.random() * resposta.length)]);
                return;
            }
            if (typeof resposta === 'string') {
                await message.reply(resposta);
                return;
            }
        }
    }

    // 5. Bom Dia / Boa Tarde / Boa Noite (Recuperado!)
    // Esse fica por último e sem chance aleatória (ou com, se preferir). 
    // Como é educação, vou deixar 100% se alguém falar explicitamente, ou você pode por CHANCE_DE_FALAR no if.
    if (texto.match(/\b(bom dia|boa tarde|boa noite)\b/)) {
        let resp = '';
        if (horaAgora >= 5 && horaAgora < 12) resp = 'Bom dia, guerreiro! Café tá pronto.';
        else if (horaAgora >= 12 && horaAgora < 18) resp = 'Boa tarde! Tudo tranquilo?';
        else resp = 'Boa noite. Portão tá fechado, mas eu tô de olho.';
        
        await message.reply(resp);
    }
}