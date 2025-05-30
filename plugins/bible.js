const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: 'bible',
  alias: ['verse', 'biblia', 'bibleverse', 'chapter', 'search'],
  desc: 'Get a Bible verse or chapter in English (King James Version)',
  category: 'biblia',
  filename: __filename
}, async (m, text, match, { args, reply, sendFile }) => {
  try {
    if (args.length === 0) {
      return reply('❎ Please provide a reference or keyword. Example: `bible John 3:16` or `bible John 3` for a chapter.');
    }

    const query = args.join(' ');
    const apiUrl = `https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.verse || !data.text) {
      return reply('❎ Reference not found. Please check your input.');
    }

    const reference = data.reference;
    const verseText = data.text.trim();

    const isVerse = query.includes(':');
    const caption = isVerse
      ? `╭━━〔 📖 *BIBLE* 〕━━\n\n*${reference}*\n\n${verseText}\n\n╰━━POWERED BY MEGALODON-MD━━━`
      : `╭━━〔 📖 *CHAPTER* 〕━━\n\n*${reference}*\n\n${verseText}\n\n╰━━━POWERED BY MEGALODON-MD━━━`;

    if (verseText.length < 4000) {
      return reply(caption);
    } else {
      // Génère un fichier texte temporaire
      const fileName = `${reference.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      const filePath = path.join(__dirname, '..', 'temp', fileName);

      // Crée le dossier 'temp' s'il n'existe pas
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      fs.writeFileSync(filePath, `${reference}\n\n${verseText}`);

      await sendFile(m.chat, filePath, fileName, `📖 *${reference}* (Full Chapter)\n\nFile generated by MEGALODON-MD`);

      // Supprime le fichier après l'envoi
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(err);
    reply('❎ An error occurred. Please try again later.');
  }
});
