import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const token = '8893184123:AAHwDFh7FtdhJdhYyZluhDKoE0fl7xC0yhw';
const bot = new TelegramBot(token, { polling: true });

const config = {
  name: "fbcreator",
  description: "Facebook Account Creator (HTTP Request)",
  usage: "/fbcreate <amount> - <password>",
  cooldown: 5,
  credits: "RIN"
};

let oks = [];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate() {
  const year = randomInt(1990, 2005);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return { day, month, year };
}

function randomName() {
  const firstNames = ["Mahi", "Tania", "Sumaiya", "Anika", "Mim", "Jannat", "Sadia", "Tasmia", "Raisa", "Nusrat", "Labiba", "Tahia", "Alex", "John", "Michael", "David", "James", "William", "Daniel", "Matthew", "Ethan", "Noah", "Liam", "Mason", "Lucas", "Oliver", "Ava", "Emma", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail", "Emily", "Elizabeth", "Sofia", "Avery", "Ella", "Scarlett", "Grace", "Chloe", "Victoria", "Riley", "Zoey", "Penelope", "Layla", "Nora", "Mila", "Aurora", "Violet", "Hannah"];
  const lastNames = ["Akter", "Khan", "Jahan", "Chowdhury", "Rahman", "Haque", "Sultana", "Begum", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Campbell", "Mitchell", "Carter", "Roberts"];
  return `${firstNames[randomInt(0, firstNames.length - 1)]} ${lastNames[randomInt(0, lastNames.length - 1)]}`;
}

function randomEmail(firstname, lastname) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = domains[randomInt(0, domains.length - 1)];
  return `${firstname.toLowerCase()}${lastname.toLowerCase()}${randomInt(100, 99999)}@${domain}`;
}

function genPassword(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(randomInt(0, chars.length - 1));
  }
  return password;
}

function getUserAgent() {
  const agents = [
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 11; vivo 1918) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 12; SM-S906N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; SM-A536E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
  ];
  return agents[randomInt(0, agents.length - 1)];
}

function extractTokens(html) {
  const lsd = html.match(/name="lsd" value="(.*?)"/);
  const jazoest = html.match(/name="jazoest" value="(.*?)"/);
  const m_ts = html.match(/name="m_ts" value="(.*?)"/);
  const reg_instance = html.match(/"reg_instance":"(.*?)"/);
  const reg_impression_id = html.match(/"reg_impression_id":"(.*?)"/);
  const logger_id = html.match(/"logger_id":"(.*?)"/);
  const fb_dtsg = html.match(/name="fb_dtsg" value="(.*?)"/);

  return {
    lsd: lsd ? lsd[1] : "0",
    jazoest: jazoest ? jazoest[1] : "0",
    m_ts: m_ts ? m_ts[1] : "0",
    reg_instance: reg_instance ? reg_instance[1] : "",
    reg_impression_id: reg_impression_id ? reg_impression_id[1] : "",
    logger_id: logger_id ? logger_id[1] : "",
    fb_dtsg: fb_dtsg ? fb_dtsg[1] : ""
  };
}

async function createFacebookAccount() {
  try {
    const jar = new CookieJar();
    const client = wrapper(axios.create({ 
      jar,
      headers: {
        'User-Agent': getUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000,
      maxRedirects: 5
    }));

    const name = randomName();
    const firstname = name.split(' ')[0];
    const lastname = name.split(' ')[1];
    const dob = randomDate();
    const email = randomEmail(firstname, lastname);
    const password = genPassword(12);

    // Step 1: Get registration page
    const homeRes = await client.get('https://www.facebook.com/r.php', {
      headers: {
        'Host': 'www.facebook.com'
      }
    });

    const tokens = extractTokens(homeRes.data);

    // Step 2: Submit registration
    const payload = {
      lsd: tokens.lsd,
      jazoest: tokens.jazoest,
      m_ts: tokens.m_ts,
      ccp: '2',
      reg_instance: tokens.reg_instance,
      submission_request: 'true',
      reg_impression_id: tokens.reg_impression_id,
      logger_id: tokens.logger_id,
      firstname: firstname,
      lastname: lastname,
      birthday_day: dob.day.toString(),
      birthday_month: dob.month.toString(),
      birthday_year: dob.year.toString(),
      reg_email__: email,
      sex: randomInt(1, 2).toString(),
      reg_passwd__: password,
      submit: 'Sign Up',
      encpass: `#PWD_BROWSER:0:${Math.floor(Date.now() / 1000)}:${password}`
    };

    const headers = {
      'Host': 'www.facebook.com',
      'Origin': 'https://www.facebook.com',
      'Referer': 'https://www.facebook.com/r.php',
      'User-Agent': getUserAgent(),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    };

    const res = await client.post(
      'https://www.facebook.com/r.php',
      new URLSearchParams(payload).toString(),
      { headers: headers }
    );

    // Check for success
    if (res.headers['set-cookie']) {
      const cookies = res.headers['set-cookie'];
      const c_user = cookies.find(c => c.includes('c_user='));
      
      if (c_user) {
        const uid = c_user.match(/c_user=(\d+)/)?.[1];
        if (uid) {
          const cookieString = cookies.join('; ');
          const result = {
            uid: uid,
            name: name,
            email: email,
            password: password,
            dob: dob,
            cookie: cookieString,
            status: "Success"
          };

          fs.appendFileSync('FB-OK.txt', `${uid}|${password}|${cookieString}\n`);
          return result;
        }
      }
    }

    // Check if account needs verification
    if (res.data.includes('confirm') || res.data.includes('checkpoint')) {
      return {
        name: name,
        email: email,
        password: password,
        status: "Needs verification"
      };
    }

    return null;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data.substring(0, 200));
    }
    return null;
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `🤖 Facebook Account Creator Bot (HTTP Request)\n\n` +
    `📌 Commands:\n` +
    `/fbcreate <amount> - <password> - Create accounts\n` +
    `/help - Show help\n` +
    `/about - About\n\n` +
    `Example: /fbcreate 5 - MyPass123`
  );
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `📖 Help:\n\n` +
    `🔹 /fbcreate <amount> - <password>\n` +
    `   Creates Facebook accounts using HTTP requests\n` +
    `   Example: /fbcreate 3 - pass123\n\n` +
    `🔹 /start - Start bot\n` +
    `🔹 /help - Show help\n` +
    `🔹 /about - About bot`
  );
});

bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `ℹ️ Facebook Account Creator Bot\n` +
    `👤 Credits: RIN\n` +
    `🛠️ Version: 4.0.0\n` +
    `📝 Uses HTTP requests (No browser)`
  );
});

bot.onText(/\/fbcreate (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1].split(' ');

  if (args.length < 3) {
    return bot.sendMessage(chatId, "❌ Usage: /fbcreate <amount> - <password>");
  }

  const amount = parseInt(args[0]);
  if (isNaN(amount) || amount <= 0 || amount > 10) {
    return bot.sendMessage(chatId, "❌ Please enter valid amount (1-10)");
  }

  if (args[1] !== '-') {
    return bot.sendMessage(chatId, "❌ Use format: /fbcreate <amount> - <password>");
  }

  const customPassword = args[2];
  let results = [];
  let success = 0;

  await bot.sendMessage(chatId, `🔄 Creating ${amount} account(s) with HTTP requests...`);

  for (let i = 0; i < amount; i++) {
    try {
      const result = await createFacebookAccount();
      
      if (result && result.uid) {
        success++;
        results.push(result);
        await bot.sendMessage(chatId, 
          `✅ Account ${i+1} created!\n` +
          `👤 ${result.name}\n` +
          `📧 ${result.email}\n` +
          `🔑 ${result.password}\n` +
          `🆔 ${result.uid}`
        );
      } else if (result && result.status === "Needs verification") {
        await bot.sendMessage(chatId, 
          `⚠️ Account ${i+1} needs verification:\n` +
          `👤 ${result.name}\n` +
          `📧 ${result.email}\n` +
          `🔑 ${result.password}`
        );
      } else {
        await bot.sendMessage(chatId, `❌ Account ${i+1} failed`);
      }
    } catch (error) {
      await bot.sendMessage(chatId, `❌ Error creating account ${i+1}`);
    }
    
    // Wait between accounts
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  if (success > 0) {
    let summary = `🎉 Created ${success} account(s):\n\n`;
    results.forEach((r, i) => {
      summary += `Account ${i+1}:\n`;
      summary += `👤 ${r.name}\n`;
      summary += `📧 ${r.email}\n`;
      summary += `🔑 ${r.password}\n`;
      summary += `🆔 ${r.uid}\n\n`;
    });
    await bot.sendMessage(chatId, summary);
  } else {
    await bot.sendMessage(chatId, "❌ No accounts were created.");
  }
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

console.log('🤖 Facebook Account Creator Bot is running...');
console.log('📝 Accounts will be saved to FB-OK.txt');
console.log('💡 Using HTTP requests (No browser required)');

export default { bot, config };
