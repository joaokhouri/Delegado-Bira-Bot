# 👮🏽‍♂️ Bira - O Porteiro do Condomínio

> *"QAP? Total e Operante. Crachá tá em dia?"*

O **Bira** é um bot de Discord focado em **Moderação e Entretenimento**, com a personalidade de um porteiro de condomínio gente boa, mas severo quando precisa. Ele curte Tim Maia, samba de raiz, tomar café e manter a ordem no servidor.

---

## 🚀 Funcionalidades

### 🛡️ Segurança (A Guarita)
* **Anti-Spam Inteligente:** Detecta quem manda mensagens rápido demais e aplica timeout.
* **Anti-Link:** Bloqueia links suspeitos, permitindo apenas domínios confiáveis (YouTube, Twitch, Discord, Spotify).
* **Filtro de Ódio:** Tolerância zero para termos racistas ou ofensivos (Ban/Delete imediato).
* **Logs de Auditoria:** Tudo o que acontece é registrado.

### 👋 Portaria (Boas-vindas e Saída)
* **Recepção:** Dá boas-vindas aos novos moradores com frases aleatórias.
* **Saída Inteligente:** Detecta se o membro saiu por conta própria, foi expulso (Kick) ou banido, e avisa no chat com a mensagem apropriada.

### 🔨 Moderação
* **/banir & /expulsar:** Comandos clássicos.
* **/castigo & /warn:** Sistema de avisos (com DM automática) e timeouts.
* **/limpar:** Apaga mensagens em massa.
* **Painel de Verificação:** Botão para liberar acesso aos canais.
* **Tribunal de Desbanimento:** Sistema onde a Staff vota para perdoar ou manter um banimento.

### 🎉 Diversão e Social (A Resenha)
* **Chatbot Natural:** Responde a "Bom dia", "Obrigado", "Sextou" e reage a risadas.
* **Tim Maia:** Se falar do síndico (Tim Maia), o Bira canta.
* **/duvida:** O Bira tira suas dúvidas com a sabedoria da portaria.
* **/carteirada:** (Exclusivo VIPs) Mostra quem é que manda e paga as contas do prédio.
* **Status Rotativo:** O Bira muda o status a cada 3 minutos (Ouvindo jogo, tomando café, vigiando o chat).

### 📢 Admin e Utilidades
* **/falar:** Envia uma mensagem no chat usando o bot (via Modal).
* **/live:** Divulga lives da Twitch com um embed personalizado e menção.
* **/avatar:** Mostra a foto de perfil em alta qualidade.

---

## 🛠️ Instalação e Configuração

### Pré-requisitos
* Node.js (v16.9.0 ou superior)
* Conta no Portal de Desenvolvedor do Discord

### 1. Clonar e Instalar
```bash
git clone [https://github.com/SEU_USUARIO/bira-bot.git](https://github.com/SEU_USUARIO/bira-bot.git)
cd bira-bot
npm install