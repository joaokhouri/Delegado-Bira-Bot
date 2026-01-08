const fs = require('fs');
const path = require('path');

// Caminho relativo para a pasta config
const dbPath = path.join(__dirname, '../../config/database.json');

function carregarDB() {
    try {
        if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Erro leitura DB:', err);
        return {};
    }
}

function salvarDB(dados) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));
    } catch (err) {
        console.error('Erro escrita DB:', err);
    }
}

module.exports = {
    // Adiciona Warn
    adicionarWarn: (guildId, userId, motivo, autorTag) => {
        const db = carregarDB();
        if (!db[guildId]) db[guildId] = {};
        if (!db[guildId][userId]) db[guildId][userId] = [];

        const warn = {
            id: Date.now().toString().slice(-6),
            motivo: motivo,
            autor: autorTag,
            data: new Date().toLocaleDateString('pt-BR')
        };

        db[guildId][userId].push(warn);
        salvarDB(db);
        return warn;
    },

    // Consulta Warns
    getWarnings: (guildId, userId) => {
        const db = carregarDB();
        return (db[guildId] && db[guildId][userId]) ? db[guildId][userId] : [];
    }
};