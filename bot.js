// ==========================================
// RTF OTP BOT - Complete Bot Code
// Language: Hinglish (Proper Indian Mix)
// Database: MongoDB
// Owner: @RTFGAMMING
// ============================================

const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');

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
const MAX_SAVED_OTPS = 2000;

// Required Channels for Verification
const REQUIRED_CHANNELS = [
  { id: '@RTFGAMINGHACK0', url: 'https://t.me/RTFGAMINGHACK0' },
  { id: '@RTFGAMING1', url: 'https://t.me/RTFGAMING1' },
  { id: '@USERX1NFO', url: 'https://t.me/USERX1NFO' }
];

// ============================================
// FLAG EMOJI MAPPING
// ============================================
const FLAG_EMOJI = {
  'IN': '🇮🇳', 'US': '🇺🇸', 'UK': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
  'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'JP': '🇯🇵',
  'CN': '🇨🇳', 'BR': '🇧🇷', 'MX': '🇲🇽', 'ZA': '🇿🇦', 'NG': '🇳🇬',
  'EG': '🇪🇬', 'SA': '🇸🇦', 'AE': '🇦🇪', 'SG': '🇸🇬', 'MY': '🇲🇾',
  'ID': '🇮🇩', 'PH': '🇵🇭', 'VN': '🇻🇳', 'TH': '🇹🇭', 'KR': '🇰🇷',
  'RU': '🇷🇺', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰',
  'FI': '🇫🇮', 'PL': '🇵🇱', 'TR': '🇹🇷', 'PK': '🇵🇰', 'BD': '🇧🇩',
  'LK': '🇱🇰', 'NP': '🇳🇵', 'MM': '🇲🇲', 'KH': '🇰🇭', 'LA': '🇱🇦',
  'MN': '🇲🇳', 'UZ': '🇺🇿', 'KZ': '🇰🇿', 'AZ': '🇦🇿', 'GE': '🇬🇪',
  'AM': '🇦🇲', 'IR': '🇮🇷', 'IQ': '🇮🇶', 'IL': '🇮🇱', 'JO': '🇯🇴',
  'KW': '🇰🇼', 'LB': '🇱🇧', 'OM': '🇴🇲', 'QA': '🇶🇦', 'SY': '🇸🇾',
  'YE': '🇾🇪', 'DZ': '🇩🇿', 'MA': '🇲🇦', 'TN': '🇹🇳', 'LY': '🇱🇾',
  'KE': '🇰🇪', 'TZ': '🇹🇿', 'UG': '🇺🇬', 'GH': '🇬🇭', 'CM': '🇨🇲',
  'CI': '🇨🇮', 'ZM': '🇿🇲', 'ZW': '🇿🇼', 'BW': '🇧🇼', 'NA': '🇳🇦',
  'MZ': '🇲🇿', 'MG': '🇲🇬', 'MU': '🇲🇺', 'SC': '🇸🇨', 'FJ': '🇫🇯',
  'PG': '🇵🇬', 'NZ': '🇳🇿', 'TG': '🇹🇬'
};

function getFlagEmoji(countryCode) {
  return FLAG_EMOJI[countryCode] || '🌍';
}

// ============================================
// COUNTRY NAME MAPPING
// ============================================
const COUNTRY_MAPPING = {
  'TG': 'Togo', 'IN': 'India', 'US': 'United States',
  'UK': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
  'DE': 'Germany', 'FR': 'France', 'ES': 'Spain',
  'IT': 'Italy', 'JP': 'Japan', 'CN': 'China',
  'BR': 'Brazil', 'MX': 'Mexico', 'ZA': 'South Africa',
  'NG': 'Nigeria', 'EG': 'Egypt', 'SA': 'Saudi Arabia',
  'AE': 'UAE', 'SG': 'Singapore', 'MY': 'Malaysia',
  'ID': 'Indonesia', 'PH': 'Philippines', 'VN': 'Vietnam',
  'TH': 'Thailand', 'KR': 'South Korea', 'RU': 'Russia',
  'NL': 'Netherlands', 'SE': 'Sweden', 'NO': 'Norway',
  'DK': 'Denmark', 'FI': 'Finland', 'PL': 'Poland',
  'TR': 'Turkey', 'PK': 'Pakistan', 'BD': 'Bangladesh',
  'LK': 'Sri Lanka', 'NP': 'Nepal', 'MM': 'Myanmar',
  'KH': 'Cambodia', 'LA': 'Laos', 'MN': 'Mongolia',
  'UZ': 'Uzbekistan', 'KZ': 'Kazakhstan', 'AZ': 'Azerbaijan',
  'GE': 'Georgia', 'AM': 'Armenia', 'IR': 'Iran',
  'IQ': 'Iraq', 'IL': 'Israel', 'JO': 'Jordan',
  'KW': 'Kuwait', 'LB': 'Lebanon', 'OM': 'Oman',
  'QA': 'Qatar', 'SY': 'Syria', 'YE': 'Yemen',
  'DZ': 'Algeria', 'MA': 'Morocco', 'TN': 'Tunisia',
  'LY': 'Libya', 'KE': 'Kenya', 'TZ': 'Tanzania',
  'UG': 'Uganda', 'GH': 'Ghana', 'CM': 'Cameroon',
  'CI': 'Ivory Coast', 'ZM': 'Zambia', 'ZW': 'Zimbabwe',
  'BW': 'Botswana', 'NA': 'Namibia', 'MZ': 'Mozambique',
  'MG': 'Madagascar', 'MU': 'Mauritius', 'SC': 'Seychelles',
  'FJ': 'Fiji', 'PG': 'Papua New Guinea', 'NZ': 'New Zealand'
};

function getFullCountryName(code) {
  return COUNTRY_MAPPING[code] || code;
}

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
  credits: { type: Number, default: 3 },
  referrals: { type: Number, default: 0 },
  referredBy: { type: Number, default: null },
  customLimit: { type: Number, default: null },
  unlimitedAccess: { type: Number, default: 0 },
  unlimitedExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  lastOtpUse: { type: Date, default: null }
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
  countryCode: { type: String, required: true },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

// OTP History Schema - Only stores latest 2000
const OtpHistorySchema = new mongoose.Schema({
  number: { type: String, required: true },
  service: { type: String, required: true },
  countryCode: { type: String, required: true },
  otpCode: { type: String, required: true },
  fullText: { type: String, required: true },
  smsTimestamp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// QR Code Schema
const QRCodeSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Traffic Stats Schema
const TrafficStatsSchema = new mongoose.Schema({
  countryCode: { type: String, unique: true, required: true },
  count: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

// ============================================
// MODELS
// ============================================
const User = mongoose.model('User', UserSchema);
const Session = mongoose.model('Session', SessionSchema);
const ActiveNumber = mongoose.model('ActiveNumber', ActiveNumberSchema);
const OtpHistory = mongoose.model('OtpHistory', OtpHistorySchema);
const QRCode = mongoose.model('QRCode', QRCodeSchema);
const TrafficStats = mongoose.model('TrafficStats', TrafficStatsSchema);

// ============================================
// TELEGRAM BOT INIT
// ============================================
const bot = new Telegraf(TOKEN);

// ============================================
// HELPER FUNCTIONS
// ============================================

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
  if (!user) return DEFAULT_LIMIT;
  
  if (user.customLimit !== null && user.customLimit !== undefined) {
    return user.customLimit;
  }
  
  if (user.unlimitedAccess === 1 && user.unlimitedExpiry && new Date() < user.unlimitedExpiry) {
    return Infinity;
  }
  
  return DEFAULT_LIMIT;
}

async function safeAnswerCb(ctx, text = '', options = {}) {
  try {
    if (ctx.callbackQuery) await ctx.answerCbQuery(text, options);
  } catch (err) {}
}

async function checkChannelMembership(userId) {
  try {
    for (const channel of REQUIRED_CHANNELS) {
      try {
        const chatMember = await bot.telegram.getChatMember(channel.id, userId);
        const status = chatMember.status;
        if (status === 'left' || status === 'kicked') {
          return { success: false, channel: channel.url };
        }
      } catch (error) {
        continue;
      }
    }
    return { success: true };
  } catch (error) {
    return { success: false, channel: 'unknown' };
  }
}

function getChannelsKeyboard() {
  const buttons = REQUIRED_CHANNELS.map(channel => [
    Markup.button.url(`📢 ${channel.id}`, channel.url)
  ]);
  buttons.push([Markup.button.callback('✅ Check Again', 'check_channels')]);
  buttons.push([Markup.button.callback('🏠 Home', 'menu_main')]);
  return Markup.inlineKeyboard(buttons);
}

function getContactReplyKeyboard() {
  return Markup.keyboard([
    [Markup.button.contactRequest('📲 Telegram Contact Verify Karo')]
  ]).resize().oneTime();
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
}

// ============================================
// CHECK IF NUMBER IS USED (Based on 2000 OTP History)
// ============================================
async function isNumberUsed(number) {
  const cleanNum = cleanNumber(number);
  
  // Check in OTP History (latest 2000 records)
  const inHistory = await OtpHistory.findOne({ number: cleanNum });
  if (inHistory) return true;
  
  // Check in Active Numbers
  const active = await ActiveNumber.findOne({ number: cleanNum, status: 'active' });
  if (active) return true;
  
  return false;
}

// ============================================
// GET FRESH NUMBER
// ============================================
async function getFreshNumber(service, country, userId) {
  let attempts = 0;
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    const res = await ZelApiClient.requestNumber(service, country);
    if (!res || !res.success || !res.number) {
      return { success: false, error: 'No number available from API' };
    }
    
    const cleanNum = cleanNumber(res.number);
    
    // Check if number is already used (based on 2000 OTP history)
    const used = await isNumberUsed(cleanNum);
    if (used) {
      await ZelApiClient.releaseNumber(cleanNum);
      continue;
    }
    
    return res;
  }
  
  return { success: false, error: 'No fresh numbers available. Please try again later.' };
}

// ============================================
// SAVE OTP TO HISTORY (Latest 2000 only)
// ============================================
async function saveOtpToHistory(number, service, countryCode, otpCode, fullText, smsTimestamp) {
  try {
    const cleanNum = cleanNumber(number);
    
    // Check if OTP already exists
    const existing = await OtpHistory.findOne({
      number: cleanNum,
      fullText: fullText,
      smsTimestamp: smsTimestamp
    });
    
    if (existing) return;
    
    // Save new OTP
    await OtpHistory.create({
      number: cleanNum,
      service: service,
      countryCode: countryCode,
      otpCode: otpCode,
      fullText: fullText,
      smsTimestamp: smsTimestamp
    });
    
    // Keep only latest 2000 records
    const totalCount = await OtpHistory.countDocuments();
    if (totalCount > MAX_SAVED_OTPS) {
      const toDelete = totalCount - MAX_SAVED_OTPS;
      const oldestRecords = await OtpHistory.find()
        .sort({ createdAt: 1 })
        .limit(toDelete);
      
      for (const record of oldestRecords) {
        await OtpHistory.deleteOne({ _id: record._id });
      }
    }
    
    // Update traffic stats
    await updateTrafficStats(countryCode);
    
  } catch (error) {
    console.error('Error saving OTP:', error);
  }
}

// ============================================
// UPDATE TRAFFIC STATS
// ============================================
async function updateTrafficStats(countryCode) {
  try {
    await TrafficStats.findOneAndUpdate(
      { countryCode: countryCode },
      { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating traffic stats:', error);
  }
}

// ============================================
// GET TRAFFIC STATS (Based on 2000 OTPs)
// ============================================
async function getTrafficStats() {
  try {
    const stats = await TrafficStats.find().sort({ count: -1 });
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    
    const result = stats.map(s => ({
      countryCode: s.countryCode,
      countryName: getFullCountryName(s.countryCode),
      flag: getFlagEmoji(s.countryCode),
      count: s.count,
      percentage: total > 0 ? ((s.count / total) * 100).toFixed(1) : 0
    }));
    
    return result.slice(0, 3); // Top 3 countries
  } catch (error) {
    console.error('Error getting traffic stats:', error);
    return [];
  }
}

// ============================================
// GLOBAL OTP LOOP - Saves all OTPs to Database
// ============================================
function startGlobalOtpLoop() {
  setInterval(async () => {
    try {
      const feed = await ZelApiClient.getPublicOtpFeed(100);
      if (!Array.isArray(feed)) return;

      // Save all OTPs to database (not just active ones)
      for (const item of feed) {
        if (!Array.isArray(item) || item.length < 4) continue;
        const [service, rawNum, message, timestamp, country] = item;
        const cleanNum = cleanNumber(rawNum);
        const formattedSmsTime = getIndianTime(new Date(timestamp.replace(' ', 'T') + '+00:00'));
        
        const matchOtp = message.match(/\b\d{3}[-\s]?\d{3,4}\b|\b\d{4,8}\b/);
        const extractedCode = matchOtp ? matchOtp[0] : 'DEKHO SMS';

        // Save to OTP History (latest 2000)
        await saveOtpToHistory(
          cleanNum,
          service,
          country || 'TG',
          extractedCode,
          message,
          formattedSmsTime
        );
      }

      // Check for active numbers and send notifications
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
          
          const matchOtp = message.match(/\b\d{3}[-\s]?\d{3,4}\b|\b\d{4,8}\b/);
          const extractedCode = matchOtp ? matchOtp[0] : 'DEKHO SMS';

          // Send notification to user
          const countryName = getFullCountryName(country || userNumObj.countryCode || 'TG');
          const flag = getFlagEmoji(country || userNumObj.countryCode || 'TG');

          const text = `📬 <b>NAYA SMS/OTP AA GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n🔹 <b>Service:</b> <code>${service}</code>\n🌍 <b>Country:</b> ${flag} <code>${countryName}</code>\n📱 <b>Number:</b> <code>${formatPhone(cleanNum)}</code>\n\n🔑 <b>OTP CODE:</b> <code>${extractedCode}</code>\n\n💬 <b>Message:</b>\n<blockquote>${message}</blockquote>\n\n🕒 <b>Time:</b> <code>${formattedSmsTime}</code>\n━━━━━━━━━━━━━━━━━━━━\n<i>SMS automatically track ho raha hai.</i>`;

          const keyboard = Markup.inlineKeyboard([
            [
              Markup.button.callback('🔄 Number Change Karo', `change_${cleanNum}_${service}_${userNumObj.countryCode || 'TG'}`),
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
          
          // Deduct credit from user (only if not unlimited)
          const user = await User.findOne({ userId: userNumObj.userId });
          const hasUnlimited = user && user.unlimitedAccess === 1 && user.unlimitedExpiry && new Date() < user.unlimitedExpiry;
          
          if (!hasUnlimited && user) {
            await User.findOneAndUpdate(
              { userId: userNumObj.userId },
              { $inc: { credits: -1 } }
            );
          }
        }
      }
    } catch (err) {
      console.error('OTP Loop Error:', err);
    }
  }, 4000);
}

startGlobalOtpLoop();

// ============================================
// BOT MIDDLEWARE - Channel Check
// ============================================
bot.use(async (ctx, next) => {
  if (ctx.from && ctx.from.id !== OWNER_ID) {
    const user = await User.findOne({ userId: ctx.from.id });
    if (user && user.isSuspended) {
      return ctx.reply('🚫 <b>ACCESS BLOCK HO GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\nAapka account temporarily suspend kar diya gaya hai Owner ne.\n\nOwner se contact karo: @RTFGAMMING', { parse_mode: 'HTML' });
    }

    const channelCheck = await checkChannelMembership(ctx.from.id);
    if (!channelCheck.success) {
      const text = `⚠️ <b>CHANNEL JOIN KARO!</b>\n━━━━━━━━━━━━━━━━━━━━\nBot use karne ke liye neeche diye gaye channels ko join karna zaroori hai.\n\n📌 <b>Channels:</b>`;
      return ctx.reply(text, {
        parse_mode: 'HTML',
        ...getChannelsKeyboard()
      });
    }
  }
  return next();
});

// ============================================
// ACTION: check_channels
// ============================================
bot.action('check_channels', async (ctx) => {
  const channelCheck = await checkChannelMembership(ctx.from.id);
  if (channelCheck.success) {
    await safeAnswerCb(ctx, '✅ Saare channels join ho gaye!');
    await ctx.deleteMessage();
    return sendMainMenu(ctx);
  } else {
    await safeAnswerCb(ctx, '❌ Kuch channels abhi bhi pending hain!', { show_alert: true });
    const text = `⚠️ <b>CHANNEL JOIN KARO!</b>\n━━━━━━━━━━━━━━━━━━━━\nBot use karne ke liye neeche diye gaye channels ko join karna zaroori hai.\n\n📌 <b>Channels:</b>`;
    return ctx.editMessageText(text, {
      parse_mode: 'HTML',
      ...getChannelsKeyboard()
    });
  }
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
      Markup.button.callback('📈 Traffic Stats', 'menu_traffic')
    ],
    [
      Markup.button.callback('👤 Mera Profile', 'menu_profile'),
      Markup.button.callback('🎁 Refer & Earn', 'menu_refer')
    ],
    [
      Markup.button.callback('💰 Buy Credits', 'menu_buy_credits')
    ]
  ];

  if (userId === OWNER_ID) {
    btns.push([Markup.button.callback('👑 Owner Panel', 'menu_owner')]);
  }
  return Markup.inlineKeyboard(btns);
}

async function sendMainMenu(ctx) {
  const userId = ctx.from.id;
  const activeNums = await ActiveNumber.find({ userId, status: 'active' });
  const totalOtps = await OtpHistory.countDocuments();
  const user = await User.findOne({ userId });
  const credits = user ? user.credits : 0;
  
  const limit = await getUserMaxLimit(userId);
  const limitStr = limit === Infinity ? 'Unlimited (24 hrs)' : `${limit} Number`;
  const savedCountStr = `${activeNums.length} / ${limitStr}`;

  const text = `✨ <b>${BOT_NAME} MEIN WELCOME HAI</b> ✨\n━━━━━━━━━━━━━━━━━━━━\nNamaste <b>${ctx.from.first_name}</b> 👋\nOTP System ready hai use karne ke liye.\n\n📊 <b>ACCOUNT STATUS:</b>\n├ 🟢 <b>Server Status:</b> <code>Normal & Active</code>\n├ 📱 <b>Saved Numbers:</b> <code>${savedCountStr}</code>\n├ 📬 <b>Total OTPs in DB:</b> <code>${totalOtps} / 2000</code>\n├ 💰 <b>Credits Balance:</b> <code>${credits}</code>\n└ 🕒 <b>System Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n👇 <i>Koi bhi option select karo neeche se:</i>\n\n📌 <b>Support:</b> @RTFGAMMING`;
  
  try {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, { parse_mode: 'HTML', ...getMainMenuKeyboard(userId) });
    } else {
      await ctx.reply(text, { parse_mode: 'HTML', ...getMainMenuKeyboard(userId) });
    }
  } catch (err) {}
}

// ============================================
// BOT START
// ============================================
bot.start(async (ctx) => {
  const user = ctx.from;
  
  let existingUser = await User.findOne({ userId: user.id });
  if (!existingUser) {
    const referrerId = ctx.startPayload ? parseInt(ctx.startPayload) : null;
    
    await User.create({
      userId: user.id,
      username: user.username || null,
      firstName: user.first_name,
      credits: 3,
      referredBy: referrerId
    });

    if (referrerId && referrerId !== user.id) {
      const referrer = await User.findOne({ userId: referrerId });
      if (referrer) {
        await User.findOneAndUpdate(
          { userId: referrerId },
          { $inc: { credits: 1, referrals: 1 } }
        );
        
        const referrerUser = await bot.telegram.getChat(referrerId).catch(() => null);
        const referrerName = referrerUser ? (referrerUser.first_name || referrerUser.username || 'Unknown') : 'Unknown';
        const newUserName = user.first_name || user.username || 'Unknown';
        
        const notificationText = `📌 <b>New Referral Success!</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 <b>Referrer:</b> ${referrerName}\n👤 <b>New User:</b> ${newUserName}\n🆔 <b>Referrer ID:</b> <code>${referrerId}</code>\n🆔 <b>New User ID:</b> <code>${user.id}</code>\n⭐ <b>Credits Earned:</b> <code>1</code>\n\n📊 <b>Referrer Total Credits:</b> <code>${referrer.credits + 1}</code>\n📌 <b>Referrer Total Referrals:</b> <code>${referrer.referrals + 1}</code>`;
        
        bot.telegram.sendMessage(OWNER_ID, notificationText, { parse_mode: 'HTML' }).catch(() => {});
        bot.telegram.sendMessage(referrerId, '🎁 <b>Referral Credit Added!</b>\n━━━━━━━━━━━━━━━━━━━━\nAapke referral se ek naya user aaya hai!\n⭐ <b>+1 Credit</b>\n\nTotal Credits: <code>' + (referrer.credits + 1) + '</code>', { parse_mode: 'HTML' }).catch(() => {});
      }
    }
  }

  const channelCheck = await checkChannelMembership(user.id);
  if (!channelCheck.success) {
    const text = `⚠️ <b>CHANNEL JOIN KARO!</b>\n━━━━━━━━━━━━━━━━━━━━\nBot use karne ke liye neeche diye gaye channels ko join karna zaroori hai.\n\n📌 <b>Channels:</b>`;
    return ctx.reply(text, {
      parse_mode: 'HTML',
      ...getChannelsKeyboard()
    });
  }

  await Session.deleteOne({ userId: user.id });
  return sendMainMenu(ctx);
});

// ============================================
// CONTACT HANDLER
// ============================================
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
  
  const user = await User.findOne({ userId: ctx.from.id });
  if (!user || user.credits < 1) {
    return ctx.editMessageText(`⚠️ <b>INSUFFICIENT CREDITS!</b>\n━━━━━━━━━━━━━━━━━━━━\nAapke paas manual check karne ke liye credits nahi hain.\n\n💰 <b>Credits Needed:</b> <code>1</code>\n📌 <b>Your Balance:</b> <code>${user ? user.credits : 0}</code>\n\n🎁 Refer karo aur free credits pao!\n💰 Buy Credits se unlimited access lo!`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🎁 Refer & Earn', 'menu_refer')],
        [Markup.button.callback('💰 Buy Credits', 'menu_buy_credits')],
        [Markup.button.callback('🏠 Home', 'menu_main')]
      ])
    }).catch(() => {});
  }

  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_MANUAL_NUMBER', data: '' },
    { upsert: true }
  );

  const text = `🔍 <b>MANUAL OTP CHECK</b>\n━━━━━━━━━━━━━━━━━━━━\nJo number check karna hai wo send karo (example: <code>+919876543210</code>).\n\n⚙️ <i>System automatically 100 latest SMS scan karega aur dikhayega.</i>\n💰 <b>Cost:</b> <code>1 Credit</code>\n\n🕒 <code>${getIndianTime()}</code>`;
  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Home', 'menu_main')]]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// TEXT HANDLER
// ============================================
bot.on('text', async (ctx, next) => {
  const session = await Session.findOne({ userId: ctx.from.id });
  if (!session) return next();

  if (session.state === 'WAITING_MANUAL_NUMBER') {
    const inputNum = cleanNumber(ctx.message.text);
    if (!inputNum || inputNum.length < 7) {
      return ctx.reply('⚠️ <b>GALAT FORMAT!</b>\nSahi number daalo (sirf digits).');
    }

    const user = await User.findOne({ userId: ctx.from.id });
    if (user) {
      await User.findOneAndUpdate(
        { userId: ctx.from.id },
        { $inc: { credits: -1 } }
      );
    }

    const waitMsg = await ctx.reply('⚡ <i>Number verify ho raha hai aur SMS scan ho rahe hain...</i>', { parse_mode: 'HTML' });

    const releaseRes = await ZelApiClient.releaseNumber(inputNum);
    const isReleasedSuccess = (releaseRes && releaseRes.success === true);

    const feed = await ZelApiClient.getPublicOtpFeed(100);
    
    let foundOtps = [];
    let detectedService = 'Manual Check';
    let detectedCountry = 'TG';

    if (Array.isArray(feed)) {
      foundOtps = feed.filter(item => Array.isArray(item) && cleanNumber(item[1]) === inputNum);
      if (foundOtps.length > 0) {
        detectedService = foundOtps[0][0] || 'Manual Check';
        detectedCountry = foundOtps[0][4] || 'TG';
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

  if (session.state === 'WAITING_QR_DESCRIPTION') {
    const description = ctx.message.text.trim();
    await Session.deleteOne({ userId: ctx.from.id });
    
    const qrCode = await QRCode.findOne({ id: 'payment_qr' });
    if (qrCode) {
      await QRCode.findOneAndUpdate(
        { id: 'payment_qr' },
        { description: description }
      );
      return ctx.reply(`✅ <b>QR Code Description Updated!</b>\n━━━━━━━━━━━━━━━━━━━━\nNew Description:\n<code>${description}</code>`, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([[Markup.button.callback('👑 Owner Panel', 'menu_owner')]])
      });
    } else {
      return ctx.reply('❌ QR Code not found! Please add QR code first.', {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([[Markup.button.callback('👑 Owner Panel', 'menu_owner')]])
      });
    }
  }

  if (session.state === 'WAITING_QR_IMAGE') {
    let imageUrl = ctx.message.text.trim();
    
    if (ctx.message.photo) {
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const file = await ctx.telegram.getFile(photo.file_id);
      imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
    }

    if (!imageUrl || !imageUrl.startsWith('http')) {
      return ctx.reply('⚠️ Invalid image URL! Send a valid URL or image file.');
    }

    await QRCode.findOneAndUpdate(
      { id: 'payment_qr' },
      { 
        id: 'payment_qr',
        imageUrl: imageUrl,
        description: 'Scan QR to pay for credits'
      },
      { upsert: true }
    );
    await Session.deleteOne({ userId: ctx.from.id });

    return ctx.reply(`✅ <b>QR Code Updated!</b>\n━━━━━━━━━━━━━━━━━━━━\nImage URL: <code>${imageUrl}</code>\n\nQR code is now available for users to scan.`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Back', 'owner_manage_qr')]])
    });
  }

  if (session.state === 'WAITING_BROADCAST') {
    const message = ctx.message.text;
    const users = await User.find({ isSuspended: 0 });
    let success = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.userId, message, { parse_mode: 'HTML' });
        success++;
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        failed++;
      }
    }

    await Session.deleteOne({ userId: ctx.from.id });

    return ctx.reply(`📢 <b>Broadcast Complete!</b>\n━━━━━━━━━━━━━━━━━━━━\n✅ <b>Sent:</b> <code>${success}</code> users\n❌ <b>Failed:</b> <code>${failed}</code> users\n📌 <b>Total:</b> <code>${users.length}</code> users\n\nMessage sent to all active users.`, {
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
  const countryCode = ctx.match[3];
  const countryName = getFullCountryName(countryCode);
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
    { userId, number: cleanNum, service: serviceName, country: countryName, countryCode: countryCode, status: 'active' },
    { upsert: true }
  );
  
  await safeAnswerCb(ctx, 'Number save ho gaya!');

  const flag = getFlagEmoji(countryCode);
  const text = `✅ <b>NUMBER SAVE HO GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n📱 <b>Virtual Number:</b> <code>${formatPhone(cleanNum)}</code>\n🔹 <b>Service:</b> <code>${serviceName}</code>\n🌍 <b>Country:</b> ${flag} <code>${countryName}</code>\n\n🕒 <b>Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n💡 <i>Ab system automatically SMS detect karega aur aapko bhejega.</i>`;

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
  const credits = dbUser ? dbUser.credits : 0;
  const referrals = dbUser ? dbUser.referrals : 0;
  const hasUnlimited = dbUser && dbUser.unlimitedAccess === 1 && dbUser.unlimitedExpiry && new Date() < dbUser.unlimitedExpiry;

  let unlimitedText = '❌';
  if (hasUnlimited) {
    const expiry = dbUser.unlimitedExpiry;
    unlimitedText = `✅ (Till ${getIndianTime(expiry)})`;
  }

  const text = `👤 <b>USER PROFILE</b>\n━━━━━━━━━━━━━━━━━━━━\n🆔 <b>User ID:</b> <code>${ctx.from.id}</code>\n👤 <b>Name:</b> <code>${ctx.from.first_name}</code>\n🏷️ <b>Username:</b> @${ctx.from.username || '-'}\n📱 <b>Contact:</b> <code>${phone}</code>\n💎 <b>Status:</b> <code>${isOwner ? '👑 Owner' : 'User'}</code>\n🔒 <b>Number Limit:</b> <code>${limit === Infinity ? 'Unlimited (24 hrs)' : limit + ' Numbers'}</code>\n💰 <b>Credits:</b> <code>${credits}</code>\n🌟 <b>Total Referrals:</b> <code>${referrals}</code>\n⏳ <b>Unlimited Active:</b> <code>${unlimitedText}</code>\n\n🕒 <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n<i>Data securely store hai MongoDB mein.</i>\n\n📌 <b>Support:</b> @RTFGAMMING`;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Home', 'menu_main')]
  ]);

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

  const buttons = countries.slice(0, 10).map(item => {
    const fullName = getFullCountryName(item.name);
    const flag = getFlagEmoji(item.name);
    return [
      Markup.button.callback(`${flag} ${fullName} ── (${item.count} Stock)`, `req_${serviceName}_${item.name}`)
    ];
  });
  buttons.push([Markup.button.callback('🔙 Back to Services', 'menu_services')]);

  const text = `📦 <b>SELECT COUNTRY</b>\n━━━━━━━━━━━━━━━━━━━━\n📌 <b>Service:</b> <code>${serviceName.toUpperCase()}</code>\nNumber kis country ka chahiye?`;
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }).catch(() => {});
});

// ============================================
// ACTION: req_
// ============================================
bot.action(/^req_(.+)_(.+)$/, async (ctx) => {
  const serviceName = ctx.match[1];
  const countryCode = ctx.match[2];
  const countryName = getFullCountryName(countryCode);
  const flag = getFlagEmoji(countryCode);
  const userId = ctx.from.id;

  const user = await User.findOne({ userId });
  const hasUnlimited = user && user.unlimitedAccess === 1 && user.unlimitedExpiry && new Date() < user.unlimitedExpiry;
  
  if (!hasUnlimited) {
    if (!user || user.credits < 1) {
      await safeAnswerCb(ctx, 'Insufficient credits!', { show_alert: true });
      return ctx.editMessageText(`⚠️ <b>INSUFFICIENT CREDITS!</b>\n━━━━━━━━━━━━━━━━━━━━\nNumber lene ke liye credits chahiye.\n\n💰 <b>Credits Needed:</b> <code>1</code>\n📌 <b>Your Balance:</b> <code>${user ? user.credits : 0}</code>\n\n🎁 Refer karo aur free credits pao!\n💰 Buy Credits se unlimited access lo!`, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🎁 Refer & Earn', 'menu_refer')],
          [Markup.button.callback('💰 Buy Credits', 'menu_buy_credits')],
          [Markup.button.callback('🏠 Home', 'menu_main')]
        ])
      }).catch(() => {});
    }
  }

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
  
  // Get fresh number (not used before - checks 2000 OTP history)
  const res = await getFreshNumber(serviceName, countryCode, userId);

  if (res && res.success) {
    const rawNumber = res.number;
    const cleanNum = cleanNumber(rawNumber);
    const formattedNum = formatPhone(cleanNum);
    const reqId = res.id || '-';
    
    // Deduct credit if not unlimited
    if (!hasUnlimited) {
      await User.findOneAndUpdate(
        { userId },
        { $inc: { credits: -1 } }
      );
    }
    
    await ActiveNumber.findOneAndUpdate(
      { number: cleanNum },
      { userId, number: cleanNum, service: serviceName, country: countryName, countryCode: countryCode, status: 'active' },
      { upsert: true }
    );

    const text = `🎉 <b>NUMBER MIL GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n🔹 <b>Service:</b> <code>${serviceName}</code>\n🌍 <b>Country:</b> ${flag} <code>${countryName}</code>\n📱 <b>Number:</b> <code>${formattedNum}</code>\n🆔 <b>Order ID:</b> <code>${reqId}</code>\n✅ <b>Status:</b> <code>Fresh Number</code>\n\n🕒 <b>Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n💡 <b>Tip:</b> Ye number app mein daalo. System automatically OTP detect karega.`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('⚡ Check OTP', `otp_${cleanNum}_${serviceName}_${countryCode}`)],
      [
        Markup.button.callback('🔄 Change Number', `change_${cleanNum}_${serviceName}_${countryCode}`),
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
    const text = `❌ <b>NUMBER NAHI MILA!</b>\n━━━━━━━━━━━━━━━━━━━━\n🔹 <b>Service:</b> <code>${serviceName}</code>\n🌍 <b>Country:</b> ${flag} <code>${countryName}</code>\n⚠️ <b>Reason:</b> ${errorMsg}\n\n🕒 <code>${getIndianTime()}</code>`;
    
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
  const countryCode = ctx.match[3];
  const countryName = getFullCountryName(countryCode);
  const flag = getFlagEmoji(countryCode);

  await ZelApiClient.releaseNumber(oldCleanNum);
  await ActiveNumber.findOneAndUpdate(
    { number: oldCleanNum, userId: ctx.from.id },
    { status: 'released' }
  );

  const res = await getFreshNumber(serviceName, countryCode, ctx.from.id);

  if (res && res.success) {
    const newRawNum = res.number;
    const newCleanNum = cleanNumber(newRawNum);
    const formattedNum = formatPhone(newCleanNum);
    const reqId = res.id || '-';

    await ActiveNumber.findOneAndUpdate(
      { number: newCleanNum },
      { userId: ctx.from.id, number: newCleanNum, service: serviceName, country: countryName, countryCode: countryCode, status: 'active' },
      { upsert: true }
    );

    const text = `🔄 <b>NUMBER CHANGE HO GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n🔹 <b>Service:</b> <code>${serviceName}</code>\n🌍 <b>Country:</b> ${flag} <code>${countryName}</code>\n📱 <b>Naya Number:</b> <code>${formattedNum}</code>\n🗑️ <b>Purana Number:</b> <code>${formatPhone(oldCleanNum)}</code>\n🆔 <b>Order ID:</b> <code>${reqId}</code>\n✅ <b>Status:</b> <code>Fresh Number</code>\n\n🕒 <b>Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n💡 <i>Naya number active ho gaya hai. SMS auto-track hoga.</i>`;
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('⚡ Check OTP', `otp_${newCleanNum}_${serviceName}_${countryCode}`)],
      [
        Markup.button.callback('🔄 Change Again', `change_${newCleanNum}_${serviceName}_${countryCode}`),
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
  const countryCode = ctx.match[3] || 'TG';
  const countryName = getFullCountryName(countryCode);
  const flag = getFlagEmoji(countryCode);

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

    // Save to OTP History
    await saveOtpToHistory(cleanNum, serviceName, countryCode, extractedCode, msg, formattedSmsTime);

    text = `📬 <b>OTP MIL GAYA!</b>\n━━━━━━━━━━━━━━━━━━━━\n📱 <b>Number:</b> <code>${formatPhone(cleanNum)}</code>\n🔑 <b>OTP Code:</b> <code>${extractedCode}</code>\n\n💬 <b>Message:</b>\n<blockquote>${msg}</blockquote>\n\n🕒 <b>SMS Time:</b> <code>${formattedSmsTime}</code>\n🕒 <b>Check Time:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n<i>OTP history mein save ho gaya.</i>`;
  } else {
    text = `⏳ <b>SMS KA INTJAAR...</b>\n━━━━━━━━━━━━━━━━━━━━\n📱 <b>Number:</b> <code>${formatPhone(cleanNum)}</code>\n📌 <b>Status:</b> Abhi tak koi naya SMS nahi aaya.\n\n🕒 <b>Last Check:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n💡 <i>Refresh karo agar OTP resend kiya hai.</i>`;
  }

  const changeBtnData = (serviceName !== 'Unknown' && countryCode !== 'TG')
    ? `change_${cleanNum}_${serviceName}_${countryCode}`
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
  const limitStr = limit === Infinity ? 'Unlimited (24 hrs)' : `${limit} Slot`;

  const text = `📱 <b>MERE NUMBERS (${activeDbNumbers.length} / ${limitStr})</b>\n━━━━━━━━━━━━━━━━━━━━\nKisi bhi number pe click karo details dekhne ke liye:\n\n🕒 <code>${getIndianTime()}</code>`;
  
  const buttons = activeDbNumbers.map(item => {
    const flag = getFlagEmoji(item.countryCode);
    return [
      Markup.button.callback(`📱 ${formatPhone(item.number)} ${flag} [${item.service}]`, `otp_${item.number}_${item.service}_${item.countryCode}`)
    ];
  });
  
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
  const history = await OtpHistory.find().sort({ createdAt: -1 });
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
    const flag = getFlagEmoji(item.countryCode);
    text += `<b>${actualIndex}. ${item.service}</b> ${flag} ── <code>${formatPhone(item.number)}</code>\n├ 🔑 <b>OTP:</b> <code>${item.otpCode}</code>\n├ 💬 <code>${item.fullText}</code>\n└ 🕒 <code>${item.smsTimestamp || item.createdAt}</code>\n\n`;
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
  const history = await OtpHistory.find({ number: cleanNum }).sort({ createdAt: -1 });
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
    const flag = getFlagEmoji(item.countryCode);
    text += `<b>${actualIndex}. ${item.service}</b> ${flag}\n├ 🔑 <b>OTP:</b> <code>${item.otpCode}</code>\n├ 💬 <code>${item.fullText}</code>\n└ 🕒 <code>${item.smsTimestamp || item.createdAt}</code>\n\n`;
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
// ACTION: menu_stats
// ============================================
bot.action('menu_stats', async (ctx) => {
  await safeAnswerCb(ctx, 'Stats load ho rahe hain...');
  const stats = await ZelApiClient.getStats();

  let text = '';
  if (stats) {
    text = `📊 <b>SERVER STATUS & STATISTICS</b>\n━━━━━━━━━━━━━━━━━━━━\n📩 <b>Total Successful OTP:</b> <code>${stats.otp_count || 0}</code>\n🌍 <b>Available Countries:</b> <code>${stats.countries_count || 0}</code>\n🌐 <b>Active Services:</b> <code>${stats.services_count || 0}</code>\n📱 <b>Total Stock Available:</b> <code>${stats.available_numbers || 0}</code>\n\n🕒 <b>Updated:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n<i>System status updated successfully.</i>`;
  } else {
    text = `❌ <b>STATS LOAD NAHI HO PAYE</b>\n━━━━━━━━━━━━━━━━━━━━\nServer response nahi de raha.\n\n🕒 <code>${getIndianTime()}</code>`;
  }

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Home', 'menu_main')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// ACTION: menu_traffic
// ============================================
bot.action('menu_traffic', async (ctx) => {
  await safeAnswerCb(ctx, 'Traffic stats load ho rahe hain...');
  
  const topCountries = await getTrafficStats();
  
  let text = `📈 <b>TOP OTP TRAFFIC COUNTRIES</b>\n━━━━━━━━━━━━━━━━━━━━\n<i>Real-time OTP traffic analysis based on latest 2000 records</i>\n\n`;
  
  if (topCountries.length === 0) {
    text += `📭 <i>Abhi tak koi traffic data nahi hai.</i>\n\n`;
  } else {
    topCountries.forEach((country, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      text += `${medal} ${country.flag} <b>${country.countryName}</b>\n`;
      text += `   ├ 📊 <b>OTPs:</b> <code>${country.count}</code>\n`;
      text += `   └ 📈 <b>Percentage:</b> <code>${country.percentage}%</code>\n\n`;
    });
  }
  
  text += `━━━━━━━━━━━━━━━━━━━━\n🕒 <b>Updated:</b> <code>${getIndianTime()}</code>\n━━━━━━━━━━━━━━━━━━━━\n<i>Data based on latest ${MAX_SAVED_OTPS} OTP records.</i>`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔄 Refresh', 'menu_traffic')],
    [Markup.button.callback('🔙 Home', 'menu_main')]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// ACTION: menu_refer
// ============================================
bot.action('menu_refer', async (ctx) => {
  await safeAnswerCb(ctx, 'Referral system...');
  const user = await User.findOne({ userId: ctx.from.id });
  const credits = user ? user.credits : 0;
  const referrals = user ? user.referrals : 0;
  const botUsername = ctx.botInfo.username;

  const text = `🎁 <b>REFER & EARN</b>\n━━━━━━━━━━━━━━━━━━━━\nHar referral pe aapko <b>1 Credit</b> milega!\n\n📊 <b>Your Stats:</b>\n├ 💰 <b>Total Credits:</b> <code>${credits}</code>\n└ 🌟 <b>Total Referrals:</b> <code>${referrals}</code>\n\n🔗 <b>Your Referral Link:</b>\n<code>https://t.me/${botUsername}?start=${ctx.from.id}</code>\n\n📌 <b>How it works:</b>\n1. Share your referral link\n2. New user joins and starts bot\n3. You get <b>1 Credit</b> automatically!\n4. Credits can be used for OTP checks\n\n━━━━━━━━━━━━━━━━━━━━\n🕒 <code>${getIndianTime()}</code>`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.switchToChat('📤 Share Referral Link', `https://t.me/${botUsername}?start=${ctx.from.id}`)],
    [Markup.button.callback('🏠 Home', 'menu_main')]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// ACTION: menu_buy_credits
// ============================================
bot.action('menu_buy_credits', async (ctx) => {
  await safeAnswerCb(ctx, 'Buy Credits...');
  
  const qrCode = await QRCode.findOne({ id: 'payment_qr' });
  
  let qrText = '';
  if (qrCode) {
    qrText = `📱 <b>Scan QR Code to Pay:</b>\n<code>${qrCode.imageUrl}</code>\n\n📝 <b>Description:</b>\n${qrCode.description || 'No description'}\n\n`;
  }

  const text = `💰 <b>BUY CREDITS</b>\n━━━━━━━━━━━━━━━━━━━━\n${qrText}📌 <b>Packages:</b>\n1️⃣ <b>10 Credits</b> → ₹20\n2️⃣ <b>Unlimited (24 Hours)</b> → ₹50\n\n💳 <b>How to Buy:</b>\n1. Scan QR code above\n2. Pay the amount\n3. Send payment screenshot to @RTFGAMMING\n4. Credits will be added manually\n\n━━━━━━━━━━━━━━━━━━━━\n🕒 <code>${getIndianTime()}</code>`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📞 Contact Owner', 'contact_owner')],
    [Markup.button.callback('🏠 Home', 'menu_main')]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

bot.action('contact_owner', async (ctx) => {
  await safeAnswerCb(ctx, 'Contacting Owner...');
  const text = `📞 <b>Contact Owner</b>\n━━━━━━━━━━━━━━━━━━━━\nFor buying credits, support, or any issues:\n\n👤 <b>Owner:</b> @RTFGAMMING\n\n📌 <b>Message Format:</b>\n1. Your User ID: <code>${ctx.from.id}</code>\n2. Package you want\n3. Payment screenshot\n\n━━━━━━━━━━━━━━━━━━━━\n🕒 <code>${getIndianTime()}</code>`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.url('📩 Message Owner', 'https://t.me/RTFGAMMING')],
    [Markup.button.callback('🔙 Back', 'menu_buy_credits')]
  ]);

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
    [Markup.button.callback('💰 Add Credits', 'owner_add_credits')],
    [Markup.button.callback('💰 Remove Credits', 'owner_remove_credits')],
    [Markup.button.callback('🔴 Ban User', 'owner_ban_user')],
    [Markup.button.callback('🟢 Unban User', 'owner_unban_user')],
    [Markup.button.callback('📊 Bot Stats', 'owner_stats')],
    [Markup.button.callback('📤 Export User Data', 'owner_export_data')],
    [Markup.button.callback('📱 Manage QR Code', 'owner_manage_qr')],
    [Markup.button.callback('📢 Broadcast Message', 'owner_broadcast')],
    [Markup.button.callback('🏠 Home', 'menu_main')]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Users List
// ============================================
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
    text += `👤 <b>${u.firstName}</b> (<code>${u.userId}</code>)\n├ Status: ${status}\n├ Credits: ${u.credits}\n├ Referrals: ${u.referrals}\n└ Created: ${getIndianTime(u.createdAt)}\n\n`;

    buttons.push([Markup.button.callback(`⚙️ Manage: ${u.firstName}`, `owner_manage_${u.userId}`)]);
  });

  const navRow = [];
  if (page > 1) navRow.push(Markup.button.callback('◀️ Prev', `owner_users_${page - 1}`));
  if (page < totalPages) navRow.push(Markup.button.callback('Next ▶️', `owner_users_${page + 1}`));
  if (navRow.length > 0) buttons.push(navRow);

  buttons.push([Markup.button.callback('🔙 Back to Owner Panel', 'menu_owner')]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }).catch(() => {});
});

// ============================================
// OWNER: Manage User
// ============================================
bot.action(/^owner_manage_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);

  const targetUserId = parseInt(ctx.match[1], 10);
  const targetUser = await User.findOne({ userId: targetUserId });

  if (!targetUser) return ctx.reply('User nahi mila.');

  const text = `⚙️ <b>MANAGE USER: ${targetUser.firstName}</b>\n━━━━━━━━━━━━━━━━━━━━\n🆔 <b>User ID:</b> <code>${targetUser.userId}</code>\n📌 <b>Status:</b> ${targetUser.isSuspended ? '🔴 Suspended' : '🟢 Active'}\n💰 <b>Credits:</b> ${targetUser.credits}\n🌟 <b>Referrals:</b> ${targetUser.referrals}\n📅 <b>Joined:</b> ${getIndianTime(targetUser.createdAt)}`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback(targetUser.isSuspended ? '🟢 Activate' : '🔴 Suspend', `owner_toggle_suspend_${targetUserId}`),
      Markup.button.callback('➕ Add Credits', `owner_add_credits_user_${targetUserId}`)
    ],
    [
      Markup.button.callback('➖ Remove Credits', `owner_remove_credits_user_${targetUserId}`),
      Markup.button.callback('⏳ Unlimited 24hrs', `owner_unlimited_${targetUserId}`)
    ],
    [Markup.button.callback('🔙 Back to Users', 'owner_users_1')]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Toggle Suspend
// ============================================
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

// ============================================
// OWNER: Add Credits
// ============================================
bot.action('owner_add_credits', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);
  
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_ADD_CREDITS', data: '' },
    { upsert: true }
  );

  const text = `💰 <b>ADD CREDITS</b>\n━━━━━━━━━━━━━━━━━━━━\nSend message in format:\n<code>user_id amount</code>\n\nExample:\n<code>123456789 5</code> - Adds 5 credits to user`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Cancel', 'menu_owner')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Remove Credits
// ============================================
bot.action('owner_remove_credits', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);
  
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_REMOVE_CREDITS', data: '' },
    { upsert: true }
  );

  const text = `💰 <b>REMOVE CREDITS</b>\n━━━━━━━━━━━━━━━━━━━━\nSend message in format:\n<code>user_id amount</code>\n\nExample:\n<code>123456789 5</code> - Removes 5 credits from user`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Cancel', 'menu_owner')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Add Credits to Specific User
// ============================================
bot.action(/^owner_add_credits_user_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);
  
  const targetUserId = ctx.match[1];
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_ADD_CREDITS', data: targetUserId },
    { upsert: true }
  );

  const text = `💰 <b>ADD CREDITS FOR USER</b>\n━━━━━━━━━━━━━━━━━━━━\nUser ID: <code>${targetUserId}</code>\n\nSend the amount of credits to add:`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Cancel', `owner_manage_${targetUserId}`)]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Remove Credits from Specific User
// ============================================
bot.action(/^owner_remove_credits_user_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);
  
  const targetUserId = ctx.match[1];
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_REMOVE_CREDITS', data: targetUserId },
    { upsert: true }
  );

  const text = `💰 <b>REMOVE CREDITS FOR USER</b>\n━━━━━━━━━━━━━━━━━━━━\nUser ID: <code>${targetUserId}</code>\n\nSend the amount of credits to remove:`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Cancel', `owner_manage_${targetUserId}`)]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Unlimited Access
// ============================================
bot.action(/^owner_unlimited_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  const targetUserId = parseInt(ctx.match[1], 10);
  
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  
  await User.findOneAndUpdate(
    { userId: targetUserId },
    { 
      unlimitedAccess: 1,
      unlimitedExpiry: expiry
    }
  );
  
  await safeAnswerCb(ctx, '✅ Unlimited access granted for 24 hours!');
  
  return ctx.telegram.editMessageText(
    ctx.chat.id,
    ctx.callbackQuery.message.message_id,
    null,
    `✅ User <code>${targetUserId}</code> ko 24 hours unlimited access mil gaya!`,
    { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Back', `owner_manage_${targetUserId}`)]]) }
  );
});

// ============================================
// OWNER: Ban User
// ============================================
bot.action('owner_ban_user', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);
  
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_BAN_USER', data: '' },
    { upsert: true }
  );

  const text = `🔴 <b>BAN USER</b>\n━━━━━━━━━━━━━━━━━━━━\nSend the User ID to ban:\n\nExample: <code>123456789</code>`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Cancel', 'menu_owner')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Unban User
// ============================================
bot.action('owner_unban_user', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);
  
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_UNBAN_USER', data: '' },
    { upsert: true }
  );

  const text = `🟢 <b>UNBAN USER</b>\n━━━━━━━━━━━━━━━━━━━━\nSend the User ID to unban:\n\nExample: <code>123456789</code>`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Cancel', 'menu_owner')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Bot Stats
// ============================================
bot.action('owner_stats', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);

  const totalUsers = await User.countDocuments();
  const totalActiveNumbers = await ActiveNumber.countDocuments({ status: 'active' });
  const totalOtps = await OtpHistory.countDocuments();
  const totalActiveUsers = await User.countDocuments({ isSuspended: 0 });
  const totalBannedUsers = await User.countDocuments({ isSuspended: 1 });
  const totalCredits = await User.aggregate([{ $group: { _id: null, total: { $sum: '$credits' } } }]);
  const trafficStats = await TrafficStats.countDocuments();

  const text = `📊 <b>BOT STATISTICS</b>\n━━━━━━━━━━━━━━━━━━━━\n👥 <b>Total Users:</b> <code>${totalUsers}</code>\n🟢 <b>Active Users:</b> <code>${totalActiveUsers}</code>\n🔴 <b>Banned Users:</b> <code>${totalBannedUsers}</code>\n📱 <b>Active Numbers:</b> <code>${totalActiveNumbers}</code>\n📬 <b>Total OTPs in DB:</b> <code>${totalOtps} / ${MAX_SAVED_OTPS}</code>\n💰 <b>Total Credits:</b> <code>${totalCredits[0]?.total || 0}</code>\n📈 <b>Traffic Countries:</b> <code>${trafficStats}</code>\n\n🕒 <b>Updated:</b> <code>${getIndianTime()}</code>`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Back', 'menu_owner')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Export User Data
// ============================================
bot.action('owner_export_data', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);

  const users = await User.find().sort({ createdAt: -1 });
  
  let text = `📤 <b>USER DATA EXPORT</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
  users.forEach((u, index) => {
    text += `${index + 1}. ID: <code>${u.userId}</code> | ${u.firstName} | ${u.username || 'No username'} | Credits: ${u.credits} | Referrals: ${u.referrals} | ${u.isSuspended ? '🔴 Banned' : '🟢 Active'}\n`;
  });
  text += `\n━━━━━━━━━━━━━━━━━━━━\n📌 <b>Total Users:</b> ${users.length}`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Back', 'menu_owner')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Manage QR Code
// ============================================
bot.action('owner_manage_qr', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);

  const qrCode = await QRCode.findOne({ id: 'payment_qr' });
  const qrStatus = qrCode ? '✅ Set' : '❌ Not Set';

  const text = `📱 <b>MANAGE QR CODE</b>\n━━━━━━━━━━━━━━━━━━━━\n<b>QR Code Status:</b> ${qrStatus}\n${qrCode ? `\n📝 <b>Current Description:</b>\n${qrCode.description || 'No description'}` : ''}\n\n📌 <b>Options:</b>`;

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📤 Add/Update QR Code', 'owner_add_qr')],
    [Markup.button.callback('📝 Update Description', 'owner_update_qr_desc')],
    [Markup.button.callback('🗑️ Remove QR Code', 'owner_remove_qr')],
    [Markup.button.callback('🔙 Back to Owner Panel', 'menu_owner')]
  ]);

  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Add QR Code
// ============================================
bot.action('owner_add_qr', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);
  
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_QR_IMAGE', data: '' },
    { upsert: true }
  );

  const text = `📤 <b>ADD/UPDATE QR CODE</b>\n━━━━━━━━━━━━━━━━━━━━\nSend the QR code image URL or image file:\n\n📌 <b>Example:</b>\n<code>https://example.com/qr.png</code>\n\nOr send the image file directly.`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Cancel', 'owner_manage_qr')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Update QR Description
// ============================================
bot.action('owner_update_qr_desc', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);
  
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_QR_DESCRIPTION', data: '' },
    { upsert: true }
  );

  const text = `📝 <b>UPDATE QR DESCRIPTION</b>\n━━━━━━━━━━━━━━━━━━━━\nSend the new description for the QR code:\n\n📌 <b>Example:</b>\n<code>Pay ₹20 for 10 credits or ₹50 for unlimited</code>`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Cancel', 'owner_manage_qr')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Remove QR Code
// ============================================
bot.action('owner_remove_qr', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  
  await QRCode.deleteOne({ id: 'payment_qr' });
  await safeAnswerCb(ctx, '✅ QR Code removed!');
  
  const text = `✅ <b>QR Code Removed Successfully!</b>\n━━━━━━━━━━━━━━━━━━━━\nQR code has been removed from the system.`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Back', 'owner_manage_qr')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// OWNER: Broadcast
// ============================================
bot.action('owner_broadcast', async (ctx) => {
  if (ctx.from.id !== OWNER_ID) return;
  await safeAnswerCb(ctx);
  
  await Session.findOneAndUpdate(
    { userId: ctx.from.id },
    { userId: ctx.from.id, state: 'WAITING_BROADCAST', data: '' },
    { upsert: true }
  );

  const text = `📢 <b>BROADCAST MESSAGE</b>\n━━━━━━━━━━━━━━━━━━━━\nSend the message you want to broadcast to all users:\n\n📌 <b>Tips:</b>\n- Use HTML formatting\n- Keep it short and clear\n- Will be sent to all users`;

  const keyboard = Markup.inlineKeyboard([[Markup.button.callback('🔙 Cancel', 'menu_owner')]]);
  return ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }).catch(() => {});
});

// ============================================
// TEXT HANDLERS FOR OWNER ACTIONS
// ============================================
bot.on('text', async (ctx, next) => {
  const session = await Session.findOne({ userId: ctx.from.id });
  if (!session) return next();

  if (session.state === 'WAITING_ADD_CREDITS') {
    const parts = ctx.message.text.trim().split(' ');
    const targetUserId = session.data ? parseInt(session.data) : parseInt(parts[0]);
    const amount = session.data ? parseInt(parts[0]) : parseInt(parts[1]);

    if (isNaN(amount) || amount < 1) {
      return ctx.reply('⚠️ Invalid amount! Send a valid number.');
    }

    await User.findOneAndUpdate(
      { userId: targetUserId },
      { $inc: { credits: amount } }
    );
    await Session.deleteOne({ userId: ctx.from.id });

    return ctx.reply(`✅ <b>Credits Added!</b>\n━━━━━━━━━━━━━━━━━━━━\nUser ID: <code>${targetUserId}</code>\nAmount: <b>${amount}</b> credits\n\nNew balance updated.`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('👑 Owner Panel', 'menu_owner')]])
    });
  }

  if (session.state === 'WAITING_REMOVE_CREDITS') {
    const parts = ctx.message.text.trim().split(' ');
    const targetUserId = session.data ? parseInt(session.data) : parseInt(parts[0]);
    const amount = session.data ? parseInt(parts[0]) : parseInt(parts[1]);

    if (isNaN(amount) || amount < 1) {
      return ctx.reply('⚠️ Invalid amount! Send a valid number.');
    }

    await User.findOneAndUpdate(
      { userId: targetUserId },
      { $inc: { credits: -amount } }
    );
    await Session.deleteOne({ userId: ctx.from.id });

    return ctx.reply(`✅ <b>Credits Removed!</b>\n━━━━━━━━━━━━━━━━━━━━\nUser ID: <code>${targetUserId}</code>\nAmount: <b>${amount}</b> credits\n\nNew balance updated.`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('👑 Owner Panel', 'menu_owner')]])
    });
  }

  if (session.state === 'WAITING_BAN_USER') {
    const targetUserId = parseInt(ctx.message.text.trim());
    if (isNaN(targetUserId)) {
      return ctx.reply('⚠️ Invalid User ID! Send a valid number.');
    }

    await User.findOneAndUpdate(
      { userId: targetUserId },
      { isSuspended: 1 }
    );
    await Session.deleteOne({ userId: ctx.from.id });

    return ctx.reply(`🔴 <b>User Banned!</b>\n━━━━━━━━━━━━━━━━━━━━\nUser ID: <code>${targetUserId}</code>\n\nUser has been suspended.`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('👑 Owner Panel', 'menu_owner')]])
    });
  }

  if (session.state === 'WAITING_UNBAN_USER') {
    const targetUserId = parseInt(ctx.message.text.trim());
    if (isNaN(targetUserId)) {
      return ctx.reply('⚠️ Invalid User ID! Send a valid number.');
    }

    await User.findOneAndUpdate(
      { userId: targetUserId },
      { isSuspended: 0 }
    );
    await Session.deleteOne({ userId: ctx.from.id });

    return ctx.reply(`🟢 <b>User Unbanned!</b>\n━━━━━━━━━━━━━━━━━━━━\nUser ID: <code>${targetUserId}</code>\n\nUser is now active.`, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('👑 Owner Panel', 'menu_owner')]])
    });
  }

  return next();
});

// ============================================
// ADD PORT SUPPORT FOR RENDER
// ============================================
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
  console.log(`📊 Max OTPs in DB: ${MAX_SAVED_OTPS}`);
}).catch(err => {
  console.error('❌ Bot launch failed:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
