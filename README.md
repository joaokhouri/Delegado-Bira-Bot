# 👮🏽‍♂️ Bira Bot - O Porteiro do Discord

> "QAP, Total e Operante!"

O **Bira** é um bot de moderação e segurança focado em transparência e eficiência. Desenvolvido com **Discord.js v14**, ele possui um sistema robusto de logs, tribunal para desbanimentos e proteção automática contra discursos de ódio.

## ✨ Funcionalidades (Fase 1: Segurança & Moderação)

### 🛡️ Segurança Automatizada (Auto-Mod)
O Bira vigia o chat 24/7.
- **Tolerância Zero:** Detecção e remoção imediata de discurso de ódio e simbologia proibida.
- **Anti-Link:** Bloqueia links suspeitos (permite apenas YouTube, Twitch, Spotify, etc).
- **Anti-Spam:** Detecta repetição rápida de mensagens e aplica silenciamento (timeout) automático.
- **Logs Automáticos:** Cria automaticamente o canal `#⛔┃bira-logs` para registrar infrações.

### ⚖️ Sistema Judiciário (Tribunal)
Transparência total nas punições.
- **/unban:** Inicia um processo de votação pública para a Staff decidir se aceita o retorno de um membro banido.
- **Logs de Decisão:** Registra quem aprovou ou negou o desbanimento.

### 🔨 Ferramentas de Moderação
- **/warn:** Aplica advertências (salvas em banco de dados local) e avisa o usuário na DM.
- **/warnings:** Consulta a "ficha criminal" (histórico de warns) de um usuário.
- **/ban & /expulsar:** Punições com registro em log e embed formatado.
- **/castigo:** Aplica Timeout (silenciamento) temporário.
- **/limpar:** Faxina no chat (apaga até 100 mensagens).
- **/trancar & /destrancar:** Sistema de Lockdown para emergências.

### 🧠 Personalidade & Logs
- **Personalidade:** O Bira responde a "Bom dia", "Café" e interage com o dono.
- **Logger Completo:** Registra mensagens apagadas, editadas, saídas de membros e uso de comandos administrativos.

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js (v16 ou superior)
- Conta no Discord Developer Portal

### Instalação

1. Clone o repositório:
```bash
git clone [https://github.com/SEU_USUARIO/bira-bot.git](https://github.com/SEU_USUARIO/bira-bot.git)
cd bira-bot