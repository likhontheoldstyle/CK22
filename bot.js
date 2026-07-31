import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const token = '8893184123:AAHwDFh7FtdhJdhYyZluhDKoE0fl7xC0yhw';
const bot = new TelegramBot(token, { polling: true });

const config = {
  name: "fbcreator",
  description: "Facebook Account Creator",
  usage: "/fbcreate <amount> - <password>",
  cooldown: 5,
  credits: "RIN"
};

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
    "Mozilla/5.0 (Linux; Android 13; SM-A536E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  ];
  return agents[randomInt(0, agents.length - 1)];
}

async function humanType(page, selector, text) {
  try {
    await page.waitForSelector(selector, { timeout: 15000 });
    await page.click(selector);
    for (const char of text) {
      if (Math.random() < 0.05) {
        await page.type(selector, 'x', { delay: randomInt(80, 150) });
        await page.keyboard.press('Backspace');
      }
      await page.type(selector, char, { delay: randomInt(80, 150) });
    }
  } catch (error) {
    console.error('HumanType error:', error);
    throw error;
  }
}

async function humanMove(page) {
  await page.mouse.move(randomInt(0, 500), randomInt(0, 500));
  await page.mouse.move(randomInt(0, 800), randomInt(0, 800), { steps: randomInt(5, 15) });
  await page.evaluate(() => window.scrollBy(0, Math.random() * 200));
  await new Promise(resolve => setTimeout(resolve, randomInt(500, 1500)));
}

async function createFacebookAccount() {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  let result = null;

  try {
    const page = await browser.newPage();
    await page.setUserAgent(getUserAgent());
    await page.setViewport({ width: 1920, height: 1080 });
    await page.emulateTimezone('Asia/Dhaka');

    const name = randomName();
    const firstname = name.split(' ')[0];
    const lastname = name.split(' ')[1];
    const dob = randomDate();
    const email = randomEmail(firstname, lastname);
    const password = genPassword(12);

    await page.goto('https://m.facebook.com/reg/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await page.waitForSelector('form[method="post"]', { timeout: 30000 });
    await humanMove(page);

    await humanType(page, 'input[name="firstname"]', firstname);
    await humanType(page, 'input[name="lastname"]', lastname);
    await humanType(page, 'input[name="reg_email__"]', email);
    await humanType(page, 'input[name="reg_passwd__"]', password);

    await page.select('select[name="birthday_day"]', dob.day.toString());
    await page.select('select[name="birthday_month"]', dob.month.toString());
    await page.select('select[name="birthday_year"]', dob.year.toString());

    const genderSelector = ['input[value="1"]', 'input[value="2"]'][randomInt(0, 1)];
    await page.click(genderSelector);

    await humanMove(page);
    await page.click('button[name="websubmit"]');

    await new Promise(resolve => setTimeout(resolve, randomInt(8000, 15000)));

    const cookies = await page.cookies();
    const c_user = cookies.find(c => c.name === 'c_user');
    
    if (c_user) {
      const uid = c_user.value;
      const cookieString = cookies.map(c => `${c.name}=${c.value}`).join(';');
      
      result = {
        uid: uid,
        name: name,
        email: email,
        password: password,
        dob: dob,
        cookie: cookieString,
        status: "Success"
      };

      const logData = `${uid}|${password}|${cookieString}\n`;
      fs.appendFileSync('FB-OK.txt', logData);
      
      console.log(`✅ Created: ${uid} | ${email}`);
    } else {
      result = {
        name: name,
        email: email,
        password: password,
        status: "Failed - No UID found"
      };
    }

    return result;
  } catch (error) {
    console.error('Create account error:', error);
    return null;
  } finally {
    await browser.close();
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    `🤖 Facebook Account Creator Bot\n\n` +
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
    `   Creates Facebook accounts\n` +
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
    `🛠️ Version: 2.0.0\n` +
    `📝 Creates accounts with human-like behavior`
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

  await bot.sendMessage(chatId, `🔄 Creating ${amount} account(s)...`);

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
      } else {
        await bot.sendMessage(chatId, `❌ Account ${i+1} failed`);
      }
    } catch (error) {
      await bot.sendMessage(chatId, `❌ Error creating account ${i+1}`);
    }
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

export default { bot, config };
