// ============================================
// RTF OTP BOT - Complete Bot Code
// Language: Hinglish (Proper Indian Mix)
// Database: MongoDB
// Owner: @RTFGAMMING
// ============================================

const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const mongoose = require('mongoose');

// ============================================
// CONFIGURATION
// ============================================
const TOKEN = "8682647531:AAHuY8Kgl5k8Jw_0CPYhrFzSaTGqoEjdX3o";
const OWNER_ID = 6346250222;
const BOT_NAME = 'RTF OTP BOT';
const DEFAULT_LIMIT = 3;
const ZELAPI_BASE_URL = 'https://smsku.zelapi.eu.cc';
const MONGODB_URL = "mongodb+srv://sahajada07:Sahajada123@cluster0.vynn0ht.mongodb.net/?appName=Cluster0";
const PORT = process.env.PORT || 3000;

// ============================================
// MONGODB CONNECTION
// ============================================
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB Connected Successfully!');
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

// ============================================
// MONGODB SCHEMAS
// ============================================

// User Schema
const UserSchema = new mongoose.Schema({
  userId: { type: Number, unique: true, required: true },
  username: { type: String, default: null },
  firstName: { type: String, required: true },
  phoneNumber: { type: String, default: null },
  isSuspended: { type: Number, default: 0 },
  customLimit: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Session Schema
const SessionSchema = new mongoose.Schema({
  userId: { type: Number, unique: true, required: true },
  state: { type: String, default: '' },
  data: { type: String, default: '' }
});

// Active Numbers Schema
const ActiveNumberSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  number: { type: String, unique: true, required: true },
  service: { type: String, required: true },
  country: { type: String, required: true },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// OTP History Schema
const OtpHistorySchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  number: { type: String, required: true },
  service: { type: String, required: true },
  otpCode: { type: String, required: true },
  fullText: { type: String, required: true },
  smsTimestamp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ============================================
// MODELS
// ============================================
const User = mongoose.model('User', UserSchema);
const Session = mongoose.model('Session', SessionSchema);
const ActiveNumber = mongoose.model('ActiveNumber', ActiveNumberSchema);
const OtpHistory = mongoose.model('OtpHistory', OtpHistorySchema);

// ============================================
// TELEGRAM BOT INIT
// ============================================
const bot = new Telegraf(TOKEN);

// ============================================
// HELPER FUNCTIONS
// ============================================

// Indian Time Format (IST)
function getIndianTime(dateObj = new Date()) {
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const parts = Object.fromEntries(formatter.formatToParts(dateObj).map(p => [p.type, p.value]));
  const ampm = parts.dayPeriod || '';
  return `${parts.hour}:${parts.minute}:${parts.second} ${ampm} • ${parts.day}/${parts.month}/${parts.year}`;
}

function cleanNumber(rawNumber) {
  return String(rawNumber).replace(/\D/g, '');
}

function formatPhone(rawNumber) {
  if (!rawNumber) return '-';
  let cleaned = cleanNumber(rawNumber);
  if (!cleaned.startsWith('+')) cleaned = '+' + cleaned;
  
  if (cleaned.startsWith('+91')) {
    return cleaned.replace(/^(\+91)(\d{5})(\d{5})$/, '$1 $2-$3');
  }
  if (cleaned.startsWith('+62')) {
    return cleaned.replace(/^(\+62)(\d{3})(\d{4})(\d{3,4})$/, '$1 $2-$3-$4');
  }
  if (cleaned.startsWith('+1')) {
    return cleaned.replace(/^(\+1)(\d{3})(\d{3})(\d{4})$/, '$1 ($2) $3-$4');
  }
  if (cleaned.length > 10) {
    return cleaned.replace(/^(\+\d{1,3})(\d{3,4})(\d{4,8})$/, '$1 $2-$3');
  }
  return cleaned;
}

async function getUserMaxLimit(userId) {
  if (userId === OWNER_ID) return Infinity;
  const user = await User.findOne({ userId });
  if (user && user.customLimit !== null && user.customLimit !== undefined) {
    return user.customLimit;
  }
  return DEFAULT_LIMIT;
}

async function safeAnswerCb(ctx, text = '', options = {}) {
  try {
    if (ctx.callbackQuery) await ctx.answerCbQuery(text, options);
  } catch (err) {}
}

// ============================================
// ZELAPI CLIENT
// ============================================
class ZelApiClient {
  static async getServices() {
    try {
      const res = await axios.get(`${ZELAPI_BASE_URL}/api/services`, { timeout: 10000 });
      return (res.status === 200 && res.data && res.data.success) ? res.data.services : null;
    } catch { return null; }
  }

  static async getCountries(service) {
    try {
      const res = await axios.get(`${ZELAPI_BASE_URL}/api/countries`, { params: { service }, timeout: 10000 });
      return (res.status === 200 && res.data && res.data.success) ? res.data.countries : null;
    } catch { return null; }
  }

  static async requestNumber(service, country) {
    try {
      const res = await axios.post(`${ZELAPI_BASE_URL}/api/request_number`, { service, country }, { timeout: 10000 });
      return (res.status === 200 || res.status === 201) ? res.data : null;
    } catch { return null; }
  }

  static async releaseNumber(number) {
    try {
      const cleanNum = cleanNumber(number);
      const res = await axios.post(`${ZELAPI_BASE_URL}/api/release_number`, { number: cleanNum }, { timeout: 10000 });
      return (res.status === 200 && res.data) ? res.data : null;
    } catch { return null; }
  }

  static async getPublicOtpFeed(count = 100) {
    try {
      const res = await axios.get(`${ZELAPI_BASE_URL}/api/otp`, { params: { count }, timeout: 10000 });
      return res.status === 200 ? res.data : null;
    } catch { return null; }
  }

  static async getStats() {
    try {
      const res = await axios.get(`${ZELAPI_BASE_URL}/api/stats/detailed`, {
        params: { period: 'daily' },
        timeout: 10000
      });
      return res.status === 200 ? res.data : null;
    } catch { return null; }
  }

  static async requestUniqueNumber(service, country, userId, excludeNumber = null) {
    let attempts = 0;
    const maxAttempts = 5;

    const activeNumbers = await ActiveNumber.find({ userId, status: 'active' });
    let userActiveNumbers = activeNumbers.map(item => cleanNumber(item.number));
    if (excludeNumber) {
      userActiveNumbers.push(cleanNumber(excludeNumber));
    }

    while (attempts < maxAttempts) {
      attempts++;
      const res = await this.requestNumber(service, country);
      if (!res || !res.success || !res.number) {
        return { success: false, error: res?.error || 'Stock khatam ho gaya ya API mein problem hai.' };
      }

      const cleanNum = cleanNumber(res.number);

      if (userActiveNumbers.includes(cleanNum)) {
        await this.releaseNumber(cleanNum);
        continue;
      }

      return res;
    }

    return { success: false, error: 'Same number baar baar aa raha hai. Thodi der baad try karo.' };
  }
}

// ============================================
// GLOBAL OTP LOOP
// ============================================
function startGlobalOtpLoop() {
  setInterval(async () => {
    try {
      const feed = await ZelApiClient.getPublicOtpFeed(100);
      if (!Array.isArray(feed)) return;

      const activeNumbers = await ActiveNumber.find({ status: 'active' });
      if (!activeNumbers || activeNumbers.length === 0) return;

      const activeMap = new Map();
      activeNumbers.forEach(item => activeMap.set(cleanNumber(item.number), item));

      for (const item of feed) {
        if (!Array.isArray(item) || item.length < 4) continue;
        const [service, rawNum, message, timestamp, country] = item;
        const cleanNum = cleanNumber(rawNum);

        if (activeMap.has(cleanNum)) {
          const userNumObj = activeMap.get(cleanNum);
          const formattedSmsTime = getIndianTime(new Date(timestamp.replace(' ', 'T') + '+00:00'));
          
          const existingOtp = await OtpHistory.findOne({
            number: cleanNum,
            fullText: message,
            smsTimestamp: formattedSmsTime
          });

          if (!existingOtp) {
            const matchOtp = message.match(/\b\d{3}[-\s]?\d{3,4}\b|\b\d{4,8}\b/);
            const extractedCode = matchOtp ? matchOtp[0] : 'DEKHO SMS';

            await OtpHistory.create({
              userId: userNumObj.userId,
              number: cleanNum,
              service: service,
              otpCode: extractedCode,
              fullText: message,
              smsTimestamp: formattedSmsTime
            });

            const text = `📬 <b>NAYA SMS/OTP AA GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n🔹 <b>Service:</b> <code>${service}</code>\n🌍 <b>Country:</b> <code>${country || userNumObj.country}</code>\n📱 <b>Number:</b> <code>${formatPhone(cleanNum)}</code>\n\n🔑 <b>OTP CODE:</b> <code>${extractedCode}</code>\n\n💬 <b>Message:</b>\n<blockquote>${message}</blockquote>\n\n🕒 <b>Time:</b> <code>${formattedSmsTime}</code>\n━━━━━━━━━━━━━━━━━━━━\n<i>SMS automatically track ho raha hai.</i>`;

            const keyboard = Markup.inlineKeyboard([
              [
                Markup.button.callback('🔄 Number Change Karo', `change_${cleanNum}_${service}_${userNumObj.country || 'Default'}`),
                Markup.button.callback('🗑️ Number Chhodo', `rel_${cleanNum}_${service}`)
              ],
              [
                Markup.button.callback('📜 Is Number Ka History', `history_num_${cleanNum}`),
                Markup.button.callback('📱 Mere Numbers', 'menu_my_numbers')
              ],
              [
                Markup.button.callback('🌐 Services', 'menu_services'),
                Markup.button.callback('🏠 Home', 'menu_main')
              ]
            ]);

            bot.telegram.sendMessage(userNumObj.userId, text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
          }
        }
      }
    } catch (err) {}
  }, 4000);
}

startGlobalOtpLoop();

// ============================================
// BOT MIDDLEWARE
// ============================================
bot.use(async (ctx, next) => {
  if (ctx.from) {
    const user = await User.findOne({ userId: ctx.from.id });
    if (user && user.isSuspended && ctx.from.id !== OWNER_ID) {
      return ctx.reply('🚫 <b>ACCESS BLOCK HO GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\nAapka account temporarily suspend kar diya gaya hai Owner ne.\n\nOwner se contact karo: @RTFGAMMING', { parse_mode: 'HTML' });
    }
  }
  return next();
});

// ============================================
// MENU FUNCTIONS
// ============================================
function getMainMenuKeyboard(userId) {
  const btns = [
    [
      Markup.button.callback('🌐 Number Lo / Lease Karo', 'menu_services'),
      Markup.button.callback('📱 Mere Active Numbers', 'menu_my_numbers')
    ],
    [
      Markup.button.callback('🔍 Manual OTP Check Karo', 'menu_manual_check'),
      Markup.button.callback('📜 OTP History', 'menu_history_global')
    ],
    [
      Markup.button.callback('📊 Server Status', 'menu_stats'),
      Markup.button.callback('👤 Mera Profile', 'menu_profile')
    ]
  ];

  if (userId === OWNER_ID) {
    btns.push([Markup.button.callback('👑 Owner Panel', 'menu_owner')]);
  }
  return Markup.inlineKeyboard(btns);
}

function getContactReplyKeyboard() {
  return Markup.keyboard([
    [Markup.button.contactRequest('📲 Telegram Contact Verify Karo')]
  ]).resize().oneTime();
}

async function sendMainMenu(ctx) {
  const userId = ctx.from.id;
  const activeNums = await ActiveNumber.find({ userId, status: 'active' });
  const totalOtps = await OtpHistory.countDocuments({ userId });
  
  const limit = await getUserMaxLimit(userId);
  const limitStr = limit === Infinity ? 'Unlimited' : `${limit} Number`;
  const savedCountStr = `${activeNums.length} / ${limitStr}`;

  const text = `✨ <b>${BOT_NAME} MEIN WELCOME HAI</b> ✨\n━━━━━━━━━━━━━━━━━━━━\nNamaste <b>${ctx.from.first_name}</b> 👋\nOTP System ready hai use karne ke liye.\n\n📊 <b>ACCOUNT STATUS:</b>\n├ 🟢 <b>Server Status:</b> <code>Normal & Active</code>\n├ 📱 <b>Saved Numbers:</b> <code>${savedCountStr}</code>\n├ 📬 <b>Total OTP Received:</b> <code>${totalOtps} Messages</code>\n└ 🕒 <b>System Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n👇 <i>Koi bhi option select karo neeche se:</i>\n\n📌 <b>Support:</b> @RTFGAMMING`;
  
  try {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, { parse_mode: 'HTML', ...getMainMenuKeyboard(userId) });
    } else {
      await ctx.reply(text, { parse_mode: 'HTML', ...getMainMenuKeyboard(userId) });
    }
  } catch (err) {}
}

// ============================================
// BOT COMMANDS
// ============================================
bot.start(async (ctx) => {
  const user = ctx.from;
  
  let existingUser = await User.findOne({ userId: user.id });
  if (!existingUser) {
    await User.create({
      userId: user.id,
      username: user.username || null,
      firstName: user.first_name,
      phoneNumber: null
    });
  }

  const dbUser = await User.findOne({ userId: user.id });

  if (!dbUser || !dbUser.phoneNumber) {
    await Session.findOneAndUpdate(
      { userId: user.id },
      { userId: user.id, state: 'WAITING_CONTACT', data: '' },
      { upsert: true }
    );
    
    const text = `👋 <b>Namaste, ${user.first_name}!</b>\n━━━━━━━━━━━━━━━━━━━━\n<b>${BOT_NAME}</b> mein aapka swagat hai.\n\nSecurity ke liye, please apna Telegram contact number verify karo.\n\n🕒 <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n👇 <i>Neeche green button dabao contact share karne ke liye:</i>`;
    return ctx.reply(text, { parse_mode: 'HTML', ...getContactReplyKeyboard() });
  }

  await Session.deleteOne({ userId: user.id });
  return sendMainMenu(ctx);
});

bot.on('contact', async (ctx) => {
  const session = await Session.findOne({ userId: ctx.from.id });
  const contact = ctx.message.contact;

  if (session && session.state === 'WAITING_CONTACT') {
    if (contact.user_id !== ctx.from.id) {
      return ctx.reply('⚠️ <b>VERIFICATION FAIL!</b>\nJo contact share kiya hai wo aapka nahi hai. Green button use karo.', {
        parse_mode: 'HTML',
        ...getContactReplyKeyboard()
      });
    }

    await User.findOneAndUpdate(
      { userId: ctx.from.id },
      { 
        phoneNumber: contact.phone_number,
        username: ctx.from.username || null,
        firstName: ctx.from.first_name
      },
      { upsert: true }
    );
    
    await Session.deleteOne({ userId: ctx.from.id });

    await ctx.reply(`✅ <b>VERIFICATION SUCCESS!</b>\n━━━━━━━━━━━━━━━━━━━━\n📱 <b>Number:</b> <code>${formatPhone(contact.phone_number)}</code>\n🕒 <b>Time:</b> <code>${getIndianTime()}</code>\n\nAb aap saare features use kar sakte ho.`, {
      parse_mode: 'HTML',
      ...Markup.removeKeyboard()
    });

    return sendMainMenu(ctx);
  }
});

// ============================================
// ACTION: menu_main
// ============================================
bot.action('menu_main', async (ctx) => {
  await Session.deleteOne({ userId: ctx.from.id });
  await safeAnswerCb(ctx, 'Dashboard load ho raha hai...');
  return sendMainMenu(ctx);
});

// ============================================
// ACTION: menu_manual_check
// ============================================
bot.action('menu_manual_check', async (ctx) => {
  await safeAnswerCb(ctx, 'Manual Check Mode...');
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_MANUAL_NUMBER', data: '' },
    { upsert: true }
  );

  const text = `🔍 <b>MANUAL OTP CHECK</b>\n━━━━━━━━━━━━━━━━━━━━\nJo number check karna hai wo send karo (example: <code>+919876543210</code>).\n\n⚙️ <i>System automatically 100 latest SMS scan karega aur dikhayega.</i>\n\n🕒 <code>${getIndianTime()}</code>`;
  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Home', 'menu_main')]]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

bot.on('text', async (ctx, next) => {
  const session = await Session.findOne({ userId: ctx.from.id });
  if (!session) return next();

  if (session.state === 'WAITING_MANUAL_NUMBER') {
    const inputNum = cleanNumber(ctx.message.text);
    if (!inputNum || inputNum.length < 7) {
      return ctx.reply('⚠️ <b>GALAT FORMAT!</b>\nSahi number daalo (sirf digits).');
    }

    const waitMsg = await ctx.reply('⚡ <i>Number verify ho raha hai aur SMS scan ho rahe hain...</i>', { parse_mode: 'HTML' });

    const releaseRes = await ZelApiClient.releaseNumber(inputNum);
    const isReleasedSuccess = (releaseRes && releaseRes.success === true);

    const feed = await ZelApiClient.getPublicOtpFeed(100);
    
    let foundOtps = [];
    let detectedService = 'Manual Check';
    let detectedCountry = 'Global';

    if (Array.isArray(feed)) {
      foundOtps = feed.filter(item => Array.isArray(item) && cleanNumber(item[1]) === inputNum);
      if (foundOtps.length > 0) {
        detectedService = foundOtps[0][0] || 'Manual Check';
        detectedCountry = foundOtps[0][4] || 'Global';
      }
    }

    await Session.deleteOne({ userId: ctx.from.id });

    let text = `🔍 <b>NUMBER CHECK RESULT</b>\n━━━━━━━━━━━━━━━━━━━━\n📱 <b>Number:</b> <code>${formatPhone(inputNum)}</code>\n📡 <b>Release Status:</b> ${isReleasedSuccess ? '🟢 Ready Hai' : '🔴 Ready Nahi Hai'}\n\n`;

    if (foundOtps.length > 0) {
      text += `📬 <b>Mile (${foundOtps.length}) SMS/OTP:</b>\n\n`;
      foundOtps.slice(0, 5).forEach((otp, idx) => {
        const formattedTime = getIndianTime(new Date(otp[3].replace(' ', 'T') + '+00:00'));
        text += `<b>${idx + 1}. ${otp[0]}</b> (<code>${formattedTime}</code>)\n└ 💬 <code>${otp[2]}</code>\n\n`;
      });
    } else {
      text += `📭 <i>Is number ke liye koi OTP nahi mila latest 100 logs mein.</i>\n\n`;
    }

    const buttons = [];

    if (isReleasedSuccess) {
      text += `💡 <b>Option:</b>\nYe number valid hai! Isko apne active numbers mein add kar sakte ho taaki system auto-track kare.`;
      buttons.push([Markup.button.callback('➕ Save to My Numbers', `add_manual_${inputNum}_${detectedService}_${detectedCountry}`)]);
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━\n🕒 <code>${getIndianTime()}</code>`;

    buttons.push([
      Markup.button.callback('🔍 Check Another Number', 'menu_manual_check'),
      Markup.button.callback('🏠 Home', 'menu_main')
    ]);

    await ctx.telegram.deleteMessage(ctx.chat.id, waitMsg.message_id).catch(() => {});
    return ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  }

  if (session.state === 'WAITING_USER_LIMIT') {
    const targetUserId = parseInt(session.data);
    const newLimit = parseInt(ctx.message.text.trim(), 10);

    if (isNaN(newLimit) || newLimit < 1) {
      return ctx.reply('⚠️ Sahi limit number daalo (minimum 1)!');
    }

    await User.findOneAndUpdate(
      { userId: targetUserId },
      { customLimit: newLimit }
    );
    
    await Session.deleteOne({ userId: ctx.from.id });

    return ctx.reply(`✅ <b>Limit Update Ho Gaya!</b>\nUser ID: <code>${targetUserId}</code>\nNaya Limit: <b>${newLimit} Numbers</b>`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('👑 Owner Panel', 'menu_owner')]])
    });
  }

  return next();
});

// ============================================
// ACTION: add_manual
// ============================================
bot.action(/^add_manual_([0-9]+)_(.+)_(.+)$/, async (ctx) => {
  const cleanNum = cleanNumber(ctx.match[1]);
  const serviceName = ctx.match[2];
  const countryName = ctx.match[3];
  const userId = ctx.from.id;

  const activeNums = await ActiveNumber.find({ userId, status: 'active' });
  const maxLimit = await getUserMaxLimit(userId);

  if (activeNums.length >= maxLimit) {
    await safeAnswerCb(ctx, 'Number slot full hai!', { show_alert: true });
    return ctx.editMessageText(`⚠️ <b>SLOT FULL!</b>\n━━━━━━━━━━━━━━━━━━━━\nAapka maximum save limit: <b>${maxLimit} numbers</b>.\nPehle koi number release karo.`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📱 Manage Numbers', 'menu_my_numbers')],
        [Markup.button.callback('🏠 Home', 'menu_main')]
      ])
    }).catch(() => {});
  }

  await ActiveNumber.findOneAndUpdate(
    { number: cleanNum },
    { userId, number: cleanNum, service: serviceName, country: countryName, status: 'active' },
    { upsert: true }
  );
  
  await safeAnswerCb(ctx, 'Number save ho gaya!');

  const text = `✅ <b>NUMBER SAVE HO GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n📱 <b>Virtual Number:</b> <code>${formatPhone(cleanNum)}</code>\n🔹 <b>Service:</b> <code>${serviceName}</code>\n🌍 <b>Country:</b> <code>${countryName}</code>\n\n🕒 <b>Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n💡 <i>Ab system automatically SMS detect karega aur aapko bhejega.</i>`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📱 My Numbers', 'menu_my_numbers')],
    [Markup.button.callback('🏠 Home', 'menu_main')]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// ACTION: menu_profile
// ============================================
bot.action('menu_profile', async (ctx) => {
  await safeAnswerCb(ctx, 'Profile load ho raha hai...');
  const dbUser = await User.findOne({ userId: ctx.from.id });
  const phone = (dbUser && dbUser.phoneNumber) ? formatPhone(dbUser.phoneNumber) : 'Not Verified';
  const limit = await getUserMaxLimit(ctx.from.id);
  const isOwner = (ctx.from.id === OWNER_ID);

  const text = `👤 <b>USER PROFILE</b>\n━━━━━━━━━━━━━━━━━━━━\n🆔 <b>User ID:</b> <code>${ctx.from.id}</code>\n👤 <b>Name:</b> <code>${ctx.from.first_name}</code>\n🏷️ <b>Username:</b> @${ctx.from.username || '-'}\n📱 <b>Contact:</b> <code>${phone}</code>\n💎 <b>Status:</b> <code>${isOwner ? '👑 Owner' : 'User'}</code>\n🔒 <b>Number Limit:</b> <code>${limit === Infinity ? 'Unlimited' : limit + ' Numbers'}</code>\n\n🕒 <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n<i>Data securely store hai MongoDB mein.</i>\n\n📌 <b>Support:</b> @RTFGAMMING`;
  
  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Home', 'menu_main')]]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// ACTION: menu_services
// ============================================
bot.action('menu_services', async (ctx) => {
  await safeAnswerCb(ctx, 'Services load ho rahi hain...');
  const services = await ZelApiClient.getServices();

  if (!services || services.length === 0) {
    return ctx.editMessageText(`❌ <b>Services Down Hain</b>\n━━━━━━━━━━━━━━━━━━━━\nAPI server se connect nahi ho pa raha. Thodi der baad try karo.\n\n🕒 <code>${getIndianTime()}</code>`, Markup.inlineKeyboard([
      [Markup.button.callback('🏠 Home', 'menu_main')]
    ]), { parse_mode: 'HTML' }).catch(() => {});
  }

  const buttons = services.slice(0, 10).map(item => [
    Markup.button.callback(`🔹 ${item.name} ── (${item.count} Stock)`, `svc_${item.name}`)
  ]);
  buttons.push([Markup.button.callback('🏠 Home', 'menu_main')]);

  const text = `🌐 <b>SELECT SERVICE / APP</b>\n━━━━━━━━━━━━━━━━━━━━\nJis app ka number chahiye usko select karo:`;

  return ctx.editMessageText(text, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(buttons)
  }).catch(() => {});
});

// ============================================
// ACTION: svc_
// ============================================
bot.action(/^svc_(.+)$/, async (ctx) => {
  const serviceName = ctx.match[1];
  await safeAnswerCb(ctx, `Countries load ho rahe hain ${serviceName}...`);
  const countries = await ZelApiClient.getCountries(serviceName);

  if (!countries || countries.length === 0) {
    return ctx.editMessageText(`❌ <b>Country Stock Khatam</b>\n━━━━━━━━━━━━━━━━━━━━\n<b>${serviceName}</b> ke liye koi country available nahi hai.\n\n🕒 <code>${getIndianTime()}</code>`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Back to Services', 'menu_services')]])
    }).catch(() => {});
  }

  const buttons = countries.slice(0, 10).map(item => [
    Markup.button.callback(`🏳️ ${item.name} ── (${item.count} Stock)`, `req_${serviceName}_${item.name}`)
  ]);
  buttons.push([Markup.button.callback('🔙 Back to Services', 'menu_services')]);

  const text = `📦 <b>SELECT COUNTRY</b>\n━━━━━━━━━━━━━━━━━━━━\n📌 <b>Service:</b> <code>${serviceName.toUpperCase()}</code>\nNumber kis country ka chahiye?`;
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }).catch(() => {});
});

// ============================================
// ACTION: req_
// ============================================
bot.action(/^req_(.+)_(.+)$/, async (ctx) => {
  const serviceName = ctx.match[1];
  const countryName = ctx.match[2];
  const userId = ctx.from.id;

  const activeNums = await ActiveNumber.find({ userId, status: 'active' });
  const maxLimit = await getUserMaxLimit(userId);

  if (activeNums.length >= maxLimit) {
    await safeAnswerCb(ctx, 'Number slot full hai!', { show_alert: true });
    return ctx.editMessageText(`⚠️ <b>SLOT FULL!</b>\n━━━━━━━━━━━━━━━━━━━━\nMaximum <b>${maxLimit} numbers</b> save kar sakte ho.\nPehle koi number release karo.`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📱 My Numbers', 'menu_my_numbers')],
        [Markup.button.callback('🏠 Home', 'menu_main')]
      ])
    }).catch(() => {});
  }

  await safeAnswerCb(ctx, 'Number book ho raha hai...');
  const res = await ZelApiClient.requestUniqueNumber(serviceName, countryName, userId);

  if (res && res.success) {
    const rawNumber = res.number;
    const cleanNum = cleanNumber(rawNumber);
    const formattedNum = formatPhone(cleanNum);
    const reqId = res.id || '-';
    
    await ActiveNumber.findOneAndUpdate(
      { number: cleanNum },
      { userId, number: cleanNum, service: serviceName, country: countryName, status: 'active' },
      { upsert: true }
    );

    const text = `🎉 <b>NUMBER MIL GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n🔹 <b>Service:</b> <code>${serviceName}</code>\n🌍 <b>Country:</b> <code>${countryName}</code>\n📱 <b>Number:</b> <code>${formattedNum}</code>\n🆔 <b>Order ID:</b> <code>${reqId}</code>\n\n🕒 <b>Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n💡 <b>Tip:</b> Ye number app mein daalo. System automatically OTP detect karega.`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('⚡ Check OTP', `otp_${cleanNum}_${serviceName}_${countryName}`)],
      [
        Markup.button.callback('🔄 Change Number', `change_${cleanNum}_${serviceName}_${countryName}`),
        Markup.button.callback('🗑️ Release Number', `rel_${cleanNum}_${serviceName}`)
      ],
      [
        Markup.button.callback('📜 Number History', `history_num_${cleanNum}`),
        Markup.button.callback('📱 My Numbers', 'menu_my_numbers')
      ],
      [
        Markup.button.callback('🌐 Other Services', 'menu_services'),
        Markup.button.callback('🏠 Home', 'menu_main')
      ]
    ]);
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
  } else {
    const errorMsg = (res && res.error) ? res.error : 'Stock khatam ho gaya ya server down hai.';
    const text = `❌ <b>NUMBER NAHI MILA!</b>\n━━━━━━━━━━━━━━━━━━━━\n🔹 <b>Service:</b> <code>${serviceName}</code>\n🌍 <b>Country:</b> <code>${countryName}</code>\n⚠️ <b>Reason:</b> ${errorMsg}\n\n🕒 <code>${getIndianTime()}</code>`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Try Other Country', `svc_${serviceName}`)],
      [Markup.button.callback('🏠 Home', 'menu_main')]
    ]);
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
  }
});

// ============================================
// ACTION: change_
// ============================================
bot.action(/^change_(.+)_(.+)_(.+)$/, async (ctx) => {
  await safeAnswerCb(ctx, 'Number change ho raha hai...');
  const oldRawNum = ctx.match[1];
  const oldCleanNum = cleanNumber(oldRawNum);
  const serviceName = ctx.match[2];
  const countryName = ctx.match[3];

  await ZelApiClient.releaseNumber(oldCleanNum);
  await ActiveNumber.findOneAndUpdate(
    { number: oldCleanNum, userId: ctx.from.id },
    { status: 'released' }
  );

  const res = await ZelApiClient.requestUniqueNumber(serviceName, countryName, ctx.from.id, oldCleanNum);

  if (res && res.success) {
    const newRawNum = res.number;
    const newCleanNum = cleanNumber(newRawNum);
    const formattedNum = formatPhone(newCleanNum);
    const reqId = res.id || '-';

    await ActiveNumber.findOneAndUpdate(
      { number: newCleanNum },
      { userId: ctx.from.id, number: newCleanNum, service: serviceName, country: countryName, status: 'active' },
      { upsert: true }
    );

    const text = `🔄 <b>NUMBER CHANGE HO GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n🔹 <b>Service:</b> <code>${serviceName}</code>\n🌍 <b>Country:</b> <code>${countryName}</code>\n📱 <b>Naya Number:</b> <code>${formattedNum}</code>\n🗑️ <b>Purana Number:</b> <code>${formatPhone(oldCleanNum)}</code>\n🆔 <b>Order ID:</b> <code>${reqId}</code>\n\n🕒 <b>Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n💡 <i>Naya number active ho gaya hai. SMS auto-track hoga.</i>`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('⚡ Check OTP', `otp_${newCleanNum}_${serviceName}_${countryName}`)],
      [
        Markup.button.callback('🔄 Change Again', `change_${newCleanNum}_${serviceName}_${countryName}`),
        Markup.button.callback('🗑️ Release', `rel_${newCleanNum}_${serviceName}`)
      ],
      [
        Markup.button.callback('📜 History', `history_num_${newCleanNum}`),
        Markup.button.callback('📱 My Numbers', 'menu_my_numbers')
      ],
      [
        Markup.button.callback('🌐 Services', 'menu_services'),
        Markup.button.callback('🏠 Home', 'menu_main')
      ]
    ]);
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
  } else {
    const errorMsg = (res && res.error) ? res.error : 'Stock khatam.';
    const text = `⚠️ <b>DHYAAN DO!</b>\n━━━━━━━━━━━━━━━━━━━━\nPurana number <code>${formatPhone(oldCleanNum)}</code> release ho gaya, par naya number nahi mila.\n\n⚠️ <b>Reason:</b> ${errorMsg}\n🕒 <code>${getIndianTime()}</code>`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🌐 Buy New Number', 'menu_services')],
      [Markup.button.callback('🏠 Home', 'menu_main')]
    ]);
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
  }
});

// ============================================
// ACTION: otp_
// ============================================
bot.action(/^otp_([^_]+)(?:_(.+)_(.+))?$/, async (ctx) => {
  const rawNum = ctx.match[1];
  const cleanNum = cleanNumber(rawNum);
  const serviceName = ctx.match[2] || 'Unknown';
  const countryName = ctx.match[3] || 'Unknown';

  await safeAnswerCb(ctx, 'SMS check ho raha hai...');
  
  await ZelApiClient.releaseNumber(cleanNum);
  const feed = await ZelApiClient.getPublicOtpFeed(100);

  let otpFound = null;
  if (Array.isArray(feed)) {
    otpFound = feed.find(item => Array.isArray(item) && cleanNumber(item[1]) === cleanNum);
  }

  let text = '';
  if (otpFound) {
    const msg = otpFound[2];
    const timestamp = otpFound[3];
    const formattedSmsTime = getIndianTime(new Date(timestamp.replace(' ', 'T') + '+00:00'));
    const matchOtp = msg.match(/\b\d{3}[-\s]?\d{3,4}\b|\b\d{4,8}\b/);
    const extractedCode = matchOtp ? matchOtp[0] : 'DEKHO SMS';

    const existingOtp = await OtpHistory.findOne({
      number: cleanNum,
      fullText: msg,
      smsTimestamp: formattedSmsTime
    });

    if (!existingOtp) {
      await OtpHistory.create({
        userId: ctx.from.id,
        number: cleanNum,
        service: serviceName,
        otpCode: extractedCode,
        fullText: msg,
        smsTimestamp: formattedSmsTime
      });
    }

    text = `📬 <b>OTP MIL GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n📱 <b>Number:</b> <code>${formatPhone(cleanNum)}</code>\n🔑 <b>OTP Code:</b> <code>${extractedCode}</code>\n\n💬 <b>Message:</b>\n<blockquote>${msg}</blockquote>\n\n🕒 <b>SMS Time:</b> <code>${formattedSmsTime}</code>\n🕒 <b>Check Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n<i>OTP history mein save ho gaya.</i>`;
  } else {
    text = `⏳ <b>SMS KA INTJAAR...</b>\n━━━━━━━━━━━━━━━━━━━━\n📱 <b>Number:</b> <code>${formatPhone(cleanNum)}</code>\n📌 <b>Status:</b> Abhi tak koi naya SMS nahi aaya.\n\n🕒 <b>Last Check:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n💡 <i>Refresh karo agar OTP resend kiya hai.</i>`;
  }

  const changeBtnData = (serviceName !== 'Unknown' && countryName !== 'Unknown')
    ? `change_${cleanNum}_${serviceName}_${countryName}`
    : null;

  const row2 = [];
  if (changeBtnData) row2.push(Markup.button.callback('🔄 Change Number', changeBtnData));
  row2.push(Markup.button.callback('🗑️ Release', `rel_${cleanNum}_${serviceName}`));

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔄 Refresh OTP', ctx.match[0])],
    row2,
    [
      Markup.button.callback('📜 Number History', `history_num_${cleanNum}`),
      Markup.button.callback('📱 My Numbers', 'menu_my_numbers')
    ],
    [
      Markup.button.callback('🌐 Services', 'menu_services'),
      Markup.button.callback('🏠 Home', 'menu_main')
    ]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// ACTION: rel_
// ============================================
bot.action(/^rel_([^_]+)(?:_(.+))?$/, async (ctx) => {
  await safeAnswerCb(ctx, 'Number release ho raha hai...');
  const rawNum = ctx.match[1];
  const cleanNum = cleanNumber(rawNum);
  const serviceName = ctx.match[2] || 'Service';

  await ZelApiClient.releaseNumber(cleanNum);
  await ActiveNumber.findOneAndUpdate(
    { number: cleanNum, userId: ctx.from.id },
    { status: 'released' }
  );

  const text = `🗑️ <b>NUMBER RELEASE HO GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n📱 <b>Number:</b> <code>${formatPhone(cleanNum)}</code>\n🔹 <b>Service:</b> <code>${serviceName}</code>\n\n🕒 <b>Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n<i>Number wapas pool mein chala gaya. Ab tracking band ho gayi.</i>`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📱 My Active Numbers', 'menu_my_numbers')],
    [Markup.button.callback('🌐 Buy New Number', 'menu_services')],
    [Markup.button.callback('🏠 Home', 'menu_main')]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// ACTION: menu_my_numbers
// ============================================
bot.action('menu_my_numbers', async (ctx) => {
  await safeAnswerCb(ctx, 'Numbers load ho rahe hain...');
  const activeDbNumbers = await ActiveNumber.find({ userId: ctx.from.id, status: 'active' });

  if (!activeDbNumbers || activeDbNumbers.length === 0) {
    const text = `📭 <b>KOI NUMBER NAHI HAI</b>\n━━━━━━━━━━━━━━━━━━━━\nAbhi tak aapne koi number save nahi kiya.\n\n🕒 <code>${getIndianTime()}</code>`;
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🌐 Buy / Lease Number', 'menu_services')],
      [Markup.button.callback('🏠 Home', 'menu_main')]
    ]);
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
  }

  const limit = await getUserMaxLimit(ctx.from.id);
  const limitStr = limit === Infinity ? 'Unlimited' : `${limit} Slot`;

  const text = `📱 <b>MERE NUMBERS (${activeDbNumbers.length} / ${limitStr})</b>\n━━━━━━━━━━━━━━━━━━━━\nKisi bhi number pe click karo details dekhne ke liye:\n\n🕒 <code>${getIndianTime()}</code>`;
  
  const buttons = activeDbNumbers.map(item => [
    Markup.button.callback(`📱 ${formatPhone(item.number)} ── [${item.service}]`, `otp_${item.number}_${item.service}_${item.country}`)
  ]);
  
  buttons.push([
    Markup.button.callback('📜 OTP History', 'menu_history_global'),
    Markup.button.callback('🌐 Buy More', 'menu_services')
  ]);
  buttons.push([Markup.button.callback('🏠 Home', 'menu_main')]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }).catch(() => {});
});

// ============================================
// ACTION: menu_history_global
// ============================================
bot.action(/^menu_history_global(?:_(\d+))?$/, async (ctx) => {
  await safeAnswerCb(ctx, 'History load ho rahi hai...');
  const page = parseInt(ctx.match[1] || '1', 10);
  const perPage = 20;
  const history = await OtpHistory.find({ userId: ctx.from.id }).sort({ createdAt: -1 });
  const totalPages = Math.ceil(history.length / perPage) || 1;
  const sliceHistory = history.slice((page - 1) * perPage, page * perPage);

  if (!history || history.length === 0) {
    const text = `📜 <b>OTP HISTORY KHALI HAI</b>\n━━━━━━━━━━━━━━━━━━━━\nAbhi tak koi OTP receive nahi hua.\n\n🕒 <code>${getIndianTime()}</code>`;
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📱 My Numbers', 'menu_my_numbers')],
      [Markup.button.callback('🏠 Home', 'menu_main')]
    ]);
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
  }

  let text = `📜 <b>OTP HISTORY (Page ${page}/${totalPages})</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
  sliceHistory.forEach((item, index) => {
    const actualIndex = ((page - 1) * perPage) + index + 1;
    text += `<b>${actualIndex}. ${item.service}</b> ── <code>${formatPhone(item.number)}</code>\n├ 🔑 <b>OTP:</b> <code>${item.otpCode}</code>\n├ 💬 <code>${item.fullText}</code>\n└ 🕒 <code>${item.smsTimestamp || item.createdAt}</code>\n\n`;
  });
  text += `━━━━━━━━━━━━━━━━━━━━\n🕒 <code>${getIndianTime()}</code>`;

  const buttons = [];
  const navRow = [];
  if (page > 1) navRow.push(Markup.button.callback('◀️ Previous', `menu_history_global_${page - 1}`));
  if (page < totalPages) navRow.push(Markup.button.callback('Next ▶️', `menu_history_global_${page + 1}`));
  if (navRow.length > 0) buttons.push(navRow);

  buttons.push([Markup.button.callback('📱 My Numbers', 'menu_my_numbers'), Markup.button.callback('🌐 Services', 'menu_services')]);
  buttons.push([Markup.button.callback('🏠 Home', 'menu_main')]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }).catch(() => {});
});

// ============================================
// ACTION: history_num_
// ============================================
bot.action(/^history_num_([0-9]+)(?:_(\d+))?$/, async (ctx) => {
  await safeAnswerCb(ctx, 'Number history load ho rahi hai...');
  const cleanNum = cleanNumber(ctx.match[1]);
  const page = parseInt(ctx.match[2] || '1', 10);
  const perPage = 20;
  const history = await OtpHistory.find({ userId: ctx.from.id, number: cleanNum }).sort({ createdAt: -1 });
  const totalPages = Math.ceil(history.length / perPage) || 1;
  const sliceHistory = history.slice((page - 1) * perPage, page * perPage);

  if (!history || history.length === 0) {
    const text = `📜 <b>NO OTP HISTORY FOR: <code>${formatPhone(cleanNum)}</code></b>\n━━━━━━━━━━━━━━━━━━━━\nIs number pe abhi tak koi OTP nahi aaya.\n\n🕒 <code>${getIndianTime()}</code>`;
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Back to Numbers', 'menu_my_numbers')],
      [Markup.button.callback('🏠 Home', 'menu_main')]
    ]);
    return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
  }

  let text = `📜 <b>HISTORY: <code>${formatPhone(cleanNum)}</code> (${page}/${totalPages})</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
  sliceHistory.forEach((item, index) => {
    const actualIndex = ((page - 1) * perPage) + index + 1;
    text += `<b>${actualIndex}. ${item.service}</b>\n├ 🔑 <b>OTP:</b> <code>${item.otpCode}</code>\n├ 💬 <code>${item.fullText}</code>\n└ 🕒 <code>${item.smsTimestamp || item.createdAt}</code>\n\n`;
  });
  text += `━━━━━━━━━━━━━━━━━━━━\n🕒 <code>${getIndianTime()}</code>`;

  const buttons = [];
  const navRow = [];
  if (page > 1) navRow.push(Markup.button.callback('◀️ Previous', `history_num_${cleanNum}_${page - 1}`));
  if (page < totalPages) navRow.push(Markup.button.callback('Next ▶️', `history_num_${cleanNum}_${page + 1}`));
  if (navRow.length > 0) buttons.push(navRow);

  buttons.push([Markup.button.callback('🔙 Back to Numbers', 'menu_my_numbers')]);
  buttons.push([Markup.button.callback('🏠 Home', 'menu_main')]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }).catch(() => {});
});

// ============================================
// ACTION: menu_stats - FIXED VERSION
// ============================================
bot.action('menu_stats', async (ctx) => {
  await safeAnswerCb(ctx, 'Stats load ho rahe hain...');
  const stats = await ZelApiClient.getStats();

  let text = '';
  if (stats) {
    text = `📊 <b>SERVER STATUS & STATISTICS</b>\n━━━━━━━━━━━━━━━━━━━━\n📩 <b>Total Successful OTP:</b> <code>${stats.otp_count || 0}</code>\n🌍 <b>Available Countries:</b> <code>${stats.countries_count || 0}</code>\n🌐 <b>Active Services:</b> <code>${stats.services_count || 0}</code>\n📱 <b>Total Stock Available:</b> <code>${stats.available_numbers || 0}</code>\n\n🕒 <b>Updated:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n<i>Data directly ZELAPI server se aa raha hai.</i>`;
  } else {
    text = `❌ <b>STATS LOAD NAHI HO PAYE</b>\n━━━━━━━━━━━━━━━━━━━━\nServer response nahi de raha.\n\n🕒 <code>${getIndianTime()}</code>`;
  }

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Home', 'menu_main')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER PANEL
// ============================================
bot.action('menu_owner', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);

  const text = `👑 <b>OWNER CONTROL PANEL</b>\n━━━━━━━━━━━━━━━━━━━━\nKya karna hai select karo:\n\n📌 <b>Developer:</b> @RTFGAMMING`;
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('👥 Users List & Manage', 'owner_users_1')],
    [Markup.button.callback('🏠 Home', 'menu_main')]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

bot.action(/^owner_users_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);

  const page = parseInt(ctx.match[1], 10);
  const users = await User.find().sort({ createdAt: -1 });
  const perPage = 5;
  const totalPages = Math.ceil(users.length / perPage) || 1;
  const sliceUsers = users.slice((page - 1) * perPage, page * perPage);

  let text = `👥 <b>USERS LIST (${page}/${totalPages})</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
  const buttons = [];

  sliceUsers.forEach(u => {
    const status = u.isSuspended ? '🔴 Suspended' : '🟢 Active';
    const limit = u.userId === OWNER_ID ? '∞' : (u.customLimit ?? DEFAULT_LIMIT);
    text += `👤 <b>${u.firstName}</b> (<code>${u.userId}</code>)\n├ Status: ${status}\n└ Limit: ${limit} Numbers\n\n`;

    buttons.push([Markup.button.callback(`⚙️ Manage: ${u.firstName}`, `owner_manage_${u.userId}`)]);
  });

  const navRow = [];
  if (page > 1) navRow.push(Markup.button.callback('◀️ Prev', `owner_users_${page - 1}`));
  if (page < totalPages) navRow.push(Markup.button.callback('Next ▶️', `owner_users_${page + 1}`));
  if (navRow.length > 0) buttons.push(navRow);

  buttons.push([Markup.button.callback('🔙 Back to Owner Panel', 'menu_owner')]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }).catch(() => {});
});

bot.action(/^owner_manage_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);

  const targetUserId = parseInt(ctx.match[1], 10);
  const targetUser = await User.findOne({ userId: targetUserId });

  if (!targetUser) return ctx.reply('User nahi mila.');

  const text = `⚙️ <b>MANAGE USER: ${targetUser.firstName}</b>\n━━━━━━━━━━━━━━━━━━━━\n🆔 <b>User ID:</b> <code>${targetUser.userId}</code>\n📌 <b>Status:</b> ${targetUser.isSuspended ? '🔴 Suspended' : '🟢 Active'}\n🔒 <b>Custom Limit:</b> <code>${targetUser.customLimit ?? 'Default (' + DEFAULT_LIMIT + ')'}</code>`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback(targetUser.isSuspended ? '🟢 Activate Account' : '🔴 Suspend', `owner_toggle_suspend_${targetUserId}`),
      Markup.button.callback('✏️ Set Limit', `owner_set_limit_${targetUserId}`)
    ],
    [Markup.button.callback('🔙 Back to Users', 'owner_users_1')]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

bot.action(/^owner_toggle_suspend_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  const targetUserId = parseInt(ctx.match[1], 10);
  const targetUser = await User.findOne({ userId: targetUserId });

  if (targetUser) {
    const newStatus = targetUser.isSuspended ? 0 : 1;
    await User.findOneAndUpdate(
      { userId: targetUserId },
      { isSuspended: newStatus }
    );
    await safeAnswerCb(ctx, `Status update ho gaya!`);
  }

  return ctx.telegram.editMessageText(
    ctx.chat.id,
    ctx.callbackQuery.message.message_id,
    null,
    `✅ ID <code>${targetUserId}</code> ka status update ho gaya.`,
    { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Back', `owner_manage_${targetUserId}`)]]) }
  );
});

bot.action(/^owner_set_limit_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);

  const targetUserId = parseInt(ctx.match[1], 10);
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_USER_LIMIT', data: String(targetUserId) },
    { upsert: true }
  );

  const text = `✏️ <b>SET NUMBER LIMIT</b>\n━━━━━━━━━━━━━━━━━━━━\nUser ID <code>${targetUserId}</code> ke liye kitne numbers ki limit chahiye? Number daalo:`;
  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Cancel', `owner_manage_${targetUserId}`)]]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// ADD PORT SUPPORT FOR RENDER
// ============================================
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`${BOT_NAME} is running! 🤖`);
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ============================================
// ERROR HANDLER
// ============================================
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err.message);
});

// ============================================
// LAUNCH BOT
// ============================================
bot.launch().then(() => {
  console.log(`✅ ${BOT_NAME} is running!`);
  console.log(`👑 Owner ID: ${OWNER_ID}`);
  console.log(`📌 Support: @RTFGAMMING`);
  console.log(`🌐 Web: http://localhost:${PORT}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
