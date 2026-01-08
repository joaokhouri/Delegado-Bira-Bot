const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('enviar-regras')
    .setDescription('Envia as regras oficiais e o botão de verificação')
    .addRoleOption(option => option.setName('cargo').setDescription('O cargo que o membro ganha ao aceitar').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const cargo = interaction.options.getRole('cargo');

    // Verifica hierarquia
    if (cargo.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({ content: '❌ Erro: O cargo selecionado é maior ou igual ao meu. Suba meu cargo na lista do Discord!', ephemeral: true });
    }

    const rulesEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`📜 O PAPO RETO DO TERREIRO (AS REGRAS DA CASA)`)
      .setAuthor({
        name: 'Recado do Bira, o guarda da firma.',
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setDescription(
        `Salve, rapaziada! Pra nossa resenha continuar sempre da melhor qualidade, a gente precisa ter umas regras básicas de convivência. Não é pra ser chato, é só pra garantir que todo mundo curta o espaço na paz. Se liga no papo:`
      )
      .addFields(
        {
          name: '1. RESPEITO É A BASE (E NÃO SE DISCUTE)',
          value: '> Trate todo mundo bem. Qualquer tipo de preconceito, assédio ou desrespeito aqui não tem vez. Quem pisar na bola com isso, vai pra rua sem choro.',
        },
        {
          name: '2. SEM VACILO COM CONTEÚDO +18',
          value: '> Nada de postar pornografia, cenas de violência pesada (gore) ou qualquer coisa do tipo. Vamos manter o ambiente limpo.',
        },
        {
          name: '3. DEIXA A POLÊMICA LÁ FORA',
          value: '> Evitem tretas sobre política, religião e outros assuntos que só geram briga. O foco aqui é a diversão.',
        },
        {
          name: '4. NÃO POLUI O CHAT, NA MORAL',
          value: '> Nada de floodar com um monte de mensagem, marcar a galera toda sem motivo, usar CAPS LOCK pra tudo ou spammar emojis. Deixa o chat fluir.',
        },
        {
          name: '5. CADA ASSUNTO NO SEU CANTO',
          value: '> Use os canais certos pra cada papo. Quer chamar pra jogar? Use o `#procurando-grupo`. Quer usar meus comandos? Tô no `#comandos-do-bira`.',
        },
        {
          name: '6. SEM FAZER PROPAGANDA GRÁTIS',
          value: '> Divulgar sua live, seu canal ou qualquer outra coisa só com a permissão dos Admins. Link suspeito é ban na hora.',
        },
        {
          name: '7. SEM SPOILER, PELO AMOR DE DEUS',
          value: '> Acabou de sair filme, série ou jogo novo? Use as tags de spoiler: `||seu spoiler aqui||`. Ninguém aqui quer ter a surpresa estragada.',
        },
        {
          name: '8. NA LIVE, A GENTE SEGURA A ONDA',
          value: '> Quando a live do patrão estiver rolando, evite dar ordens sobre o jogo (backseat), ficar cobrando atenção ou spammando o nome dele.',
        },
        {
          name: '9. NO VOICE, SEM GRITARIA',
          value: '> Mantenha a calma nos canais de voz. Nada de estourar o áudio, usar programas pra distorcer a voz ou ficar pulando de sala em sala.',
        },
        {
          name: '10. OUVE OS MODS (E O DISCORD)',
          value: '> A palavra da moderação é a final. Respeite as decisões deles e siga também as regras do próprio Discord.',
        }
      );

    const penaltiesEmbed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('E SE VACILAR, O QUE ACONTECE?')
      .setDescription(
        'O Bira não gosta de dar bronca, mas se precisar, o procedimento é esse, sem choro:\n1. **Papo Reto:** Uma advertência na moral.\n2. **Cantinho do Castigo:** Um timeout pra você esfriar a cabeça.\n3. **Convite pra Sair:** Um kick pra você repensar seus atos.\n4. **Rua:** Banimento. Sem mais.'
      )
      .addFields({
        name: 'Viu alguém pisando na bola?',
        value: '> Tira um print e manda no privado pra qualquer @Moderador. Não tente resolver no chat geral pra não render mais treta.',
      });

    // --- O BOTÃO DE ACEITAÇÃO ---
    // Aqui está a mágica: Injetamos o ID do cargo no botão para o interactionCreate saber o que fazer
    const acceptButton = new ButtonBuilder()
      .setCustomId(`verificar_${cargo.id}`)
      .setLabel('Li e aceito as regras')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅');

    const row = new ActionRowBuilder().addComponents(acceptButton);

    try {
      await interaction.channel.send({ embeds: [rulesEmbed, penaltiesEmbed], components: [row] });
      await interaction.reply({
        content: '✅ As regras foram postadas com sucesso!',
        ephemeral: true,
      });
    } catch (error) {
      console.error('Erro ao enviar regras:', error);
      await interaction.reply({
        content: '❌ Ocorreu um erro ao tentar enviar a mensagem de regras.',
        ephemeral: true,
      });
    }
  },
};