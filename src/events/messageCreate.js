const { Events, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { logEvento } = require('../services/logger');

// =====================================================
// 🛡️ CONFIGURAÇÕES DE SEGURANÇA
// =====================================================
const LINKS_PERMITIDOS = [
    'youtube.com', 'youtu.be', 
    'twitch.tv', 
    'discord.com', 'discord.gg', 
    'tenor.com', 'imgur.com', 
    'spotify.com', 'open.spotify.com'
];

// Termos que geram banimento/deleção imediata (Tolerância Zero)
const TERMOS_GRAVES = ['suastica', 'nigger', 'nazis']; 
const spamMap = new Map();

// =====================================================
// 🧠 PERSONALIDADE DO BIRA (RESPOSTAS E REAÇÕES)
// =====================================================
const PERSONALIDADE = {
    // --- Respostas de Texto Simples ---
    'delegado': 'Tô na escuta, meu nobre. Qual é a ocorrência?',
    'obrigado bira': 'Tamo junto, campeão. Precisando, é só chamar no rádio.',
    'valeu bira': 'É nóis. QAP Total.',

    // --- Respostas Aleatórias (Listas) ---
    'boa noite': [
        'Boa noite, rapaziada. Bira iniciando a ronda noturna. Juízo, hein?',
        'Noite. Qualquer coisa, é só chamar no rádio. Câmbio, desligo.',
        'Fechando o expediente por hoje... mentira, tô de olho 24/7. Boa noite!',
        'Descansar que amanhã o dia é longo. Fui!',
    ],
    'bom dia': [
        'Bom dia, bom dia! Bora que hoje o serviço tá puxado.',
        'Café na mão e olho no monitor. Bom dia, galera.',
        'Quem acordou, acordou. Quem não acordou, acorda aí! O Bira já tá na ativa.',
        'Bom dia, campeão! Já tô de pé desde as cinco.',
        'Dia! Crachá tá em dia?',
    ],
    'boa tarde': [
        'Boa tarde! Almoçou bem?',
        'Opa, tarde. O turno tá tranquilo por enquanto.',
        'Salve! Tudo nos conformes?',
    ],
    'salve': [
        'Salve, bigode! Tudo em paz por aí?',
        'Salvado! Mantendo a ordem por aqui.',
        'Salve! Chegou na hora certa pro café da guarita.',
    ],
    'e ai bira': [
        'Opa, firmeza?', 
        'Na escuta, campeão.', 
        'Fala, chefe. Tudo tranquilo?'
    ],
    'roubo': [
        'Opa, opa! Calma aí. Acusação de roubo é séria. Apresente as provas no canal competente.',
        'Registrando a ocorrência de "suposto 171". A corregedoria vai apurar.',
        'Sem tumulto na minha área! Resolvam isso no x1, na moral.',
    ],
    'triste': [
        'Calma, campeão. Bota uma música aí pra animar.',
        'Fica assim não, amigão. O patrão já errou jogada pior que essa.',
        'Quer um café? Dizem que ajuda a resolver 90% dos problemas.',
    ],
    'bira me ajuda': [
        'Opa, qual é a emergência? Se for comando, usa o `/comandos` (ou `/ajuda`). Se for problema, chame um administrador.',
        'Tô aqui pra isso, campeão. Manda a braba.',
        '190 do Bira, qual a ocorrência?',
    ],
    'esse bot': [
        'Bot? Eu sou concursado, amigão. Respeita a firma.',
        'Tô ouvindo você falar de mim aí... 👀',
        'Bot não, "Agente de Segurança Cibernética".',
    ],
    'tim maia': [
        '👑 Tim Maia é rei! O Síndico do Brasil.',
        '🎵 *Ah! Se o mundo inteiro me pudesse ouvir...*',
        'Quem não dança segura a criança! 🎷',
    ],
    'sextou': [
        'Dia de maldade! Mas sem quebrar o salão de festas, hein.',
        'Aleluia! Fim de semana tá aí.',
        'Sextou com S de: Só saio da portaria arrastado.',
    ],
    'café': [
        'Aceito, hein? Sem açúcar, por favor.',
        '☕ Opa, senti o cheiro daqui!',
        'Café é vida. O combustível da portaria.',
    ],

    // --- Reações com Emoji (Sem Texto) ---
    'amo esse server': { type: 'react', value: '❤️' },
    'kkkk': { type: 'react', value: '😂' },
    'haha': { type: 'react', value: '😂' },
    'obrigado': { type: 'react', value: '🙏' },
    'parabéns': { type: 'react', value: '🎉' },
    'brabo': { type: 'react', value: '🔥' },
    'f': { type: 'react', value: '😔' },
    'top': { type: 'react', value: '👍' },
    'rip': { type: 'react', value: '💀' },
    'cerveja': { type: 'react', value: '🍺' },
};

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        // Ignora bots e DMs
        if (message.author.bot || !message.guild) return;

        const conteudo = message.content.toLowerCase();
        
        // Verifica se é Admin/Mod (Permissão de Gerenciar Mensagens)
        const isAdmin = message.member.permissions.has(PermissionFlagsBits.ManageMessages);

        // =====================================================
        // 1. TOLERÂNCIA ZERO (Crimes de Ódio)
        // =====================================================
        if (TERMOS_GRAVES.some(termo => conteudo.includes(termo))) {
            return tratarCrime(message);
        }

        // =====================================================
        // 2. VERIFICAÇÃO DE ROTINA (Segurança)
        // =====================================================
        if (!isAdmin) {
            // A. Anti-Link
            const temLink = /(https?:\/\/[^\s]+)/g.test(conteudo);
            if (temLink) {
                const linkPermitido = LINKS_PERMITIDOS.some(dom => conteudo.includes(dom));
                if (!linkPermitido) return tratarLinkProibido(message);
            }

            // B. Anti-Spam
            if (verificarSpam(message)) return;
        }

        // =====================================================
        // 3. SOCIALIZAÇÃO (Personalidade)
        // =====================================================
        await socializar(message, conteudo);
    },
};

// --- FUNÇÕES AUXILIARES ---

async function tratarCrime(message) {
    try {
        await message.delete();
        const embed = new EmbedBuilder()
            .setColor(0x8B0000)
            .setTitle('🚨 SEGURANÇA MÁXIMA')
            .setDescription(`Conteúdo estritamente proibido detectado de ${message.author}.`);
        
        message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(()=>{}), 10000));
        
        await logEvento(message.client, message.guild, 'Crime de Ódio', '🚨 Infração Grave', `Autor: ${message.author.tag}\nMsg Oculta: ||${message.content}||`, [], 0x8B0000);
    } catch (e) { console.error(e); }
}

async function tratarLinkProibido(message) {
    try {
        await message.delete();
        const msg = await message.channel.send(`🚫 ${message.author}, sem panfletagem de links estranhos aqui!`);
        setTimeout(() => msg.delete().catch(()=>{}), 5000);

        await logEvento(message.client, message.guild, 'Anti-Link', '🔗 Link Bloqueado', `Autor: ${message.author.tag}\nLink Tentado: ${message.content}`, [], 0xFFA500);
    } catch (e) { console.error(e); }
}

function verificarSpam(message) {
    const id = message.author.id;
    const now = Date.now();
    
    if (!spamMap.has(id)) {
        spamMap.set(id, { count: 1, last: now });
        return false;
    }

    const dados = spamMap.get(id);
    if (now - dados.last < 2500) {
        dados.count++;
    } else {
        dados.count = 1;
    }
    
    dados.last = now;
    spamMap.set(id, dados);

    if (dados.count >= 6) { // Aumentei para 6 pra não ser chato
        if (dados.count === 6) {
            message.channel.send(`📢 ${message.author}, para de tocar a campainha! Tá achando que é festa? (Timeout de 1min)`);
            message.member.timeout(60 * 1000, 'Spamming no chat').catch(()=>{});
            logEvento(message.client, message.guild, 'Anti-Spam', '📢 Spam Detectado', `Autor: ${message.author.tag} mutado por 60s.`, [], 0xFFFF00);
        }
        return true;
    }
    return false;
}

async function socializar(message, texto) {
    // --- NOVO: MODO PUXA-SACO (VIPs) ---
    // Verifica se tem cargo com nome VIP, Subscriber ou Booster
    const ehVIP = message.member.roles.cache.some(r => ['Twitch Subscriber', 'VIP', 'Server Booster'].includes(r.name));
    
    // 5% de chance de elogiar o VIP do nada (0.05)
    if (ehVIP && Math.random() < 0.05) {
        const elogios = [
            'Falou tudo, chefia! 👏',
            'Esse aí é o orgulho da firma.',
            'Concordo com o patrão.',
            'Sábias palavras.'
        ];
        // Envia e NÃO dá return, pra ele continuar checando outras respostas
        message.channel.send(elogios[Math.floor(Math.random() * elogios.length)]);
    }
    // 1. Prioridade: Menção ao Bot (@Bira)
    if (message.mentions.users.has(message.client.user.id)) {
        const respostasBira = [
            'QAP? Total e Operante.',
            'Chamou o pai? 👮🏽‍♂️',
            'Tô de olho aqui nas câmeras, pode falar.',
            'Fala tu, meu nobre.',
            'Se for pra pedir dinheiro, o caixa fechou.',
            'Presente!',
        ];
        return message.reply(respostasBira[Math.floor(Math.random() * respostasBira.length)]);
    }

    // 2. Busca Inteligente no Dicionário
    // Itera sobre cada chave do objeto PERSONALIDADE
    for (const [gatilho, resposta] of Object.entries(PERSONALIDADE)) {
        
        // Se a mensagem contém o gatilho
        if (texto.includes(gatilho)) {
            
            // CASO A: Objeto de Reação ({ type: 'react', value: '😂' })
            if (resposta.type === 'react') {
                try {
                    await message.react(resposta.value);
                    return; // Reage e sai (não responde texto)
                } catch (e) { return; }
            }

            // CASO B: Lista de Respostas (Array) - Sorteia uma
            if (Array.isArray(resposta)) {
                const escolhida = resposta[Math.floor(Math.random() * resposta.length)];
                await message.reply(escolhida);
                return; // Responde e sai
            }

            // CASO C: Texto Simples (String)
            if (typeof resposta === 'string') {
                await message.reply(resposta);
                return; // Responde e sai
            }
        }
    }
}