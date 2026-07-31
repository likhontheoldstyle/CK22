import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUseragent from 'random-useragent';
import TelegramBot from 'node-telegram-bot-api';

puppeteer.use(StealthPlugin());

const token = '8893184123:AAHwDFh7FtdhJdhYyZluhDKoE0fl7xC0yhw';
const bot = new TelegramBot(token, { polling: true });

const config = {
  name: "ck22",
  description: "Create Facebook accounts (Bangladeshi girls names)",
  usage: "/cfb <number> - <password>",
  cooldown: 5,
  permissions: [0, 1, 2],
  credits: "RIN"
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate() {
  const year = randomInt(1988, 2003);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return { day, month, year };
}

function randomName() {
  const firstNames = ["Mahi", "Tania", "Sumaiya", "Anika", "Mim", "Jannat", "Sadia", "Tasmia", "Raisa", "Nusrat", "Labiba", "Tahia"];
  const lastNames = ["Akter", "Khan", "Jahan", "Chowdhury", "Rahman", "Haque", "Sultana", "Begum"];
  return `${firstNames[randomInt(0, firstNames.length - 1)]} ${lastNames[randomInt(0, lastNames.length - 1)]}`;
}

async function humanType(page, selector, text) {
  try {
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.click(selector);
    for (const char of text) {
      if (Math.random() < 0.05) {
        await page.type(selector, 'x', { delay: randomInt(100, 180) });
        await page.keyboard.press('Backspace');
      }
      await page.type(selector, char, { delay: randomInt(100, 180) });
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

async function createFacebookAccount(name, dob, email, password) {
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

  let uid = null;

  try {
    const page = await browser.newPage();
    await page.setUserAgent(randomUseragent.getRandom() || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.setViewport({ width: 1920, height: 1080 });
    await page.emulateTimezone('Asia/Dhaka');
    
    await page.goto('https://www.facebook.com/r.php', { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });

    await page.waitForSelector('form[method="post"]', { timeout: 30000 });
    await humanMove(page);
    
    await humanType(page, 'input[name="firstname"]', name.split(' ')[0]);
    await humanType(page, 'input[name="lastname"]', name.split(' ')[1]);
    await humanType(page, 'input[name="reg_email__"]', email);
    await humanType(page, 'input[name="reg_passwd__"]', password);
    
    await page.select('select[name="birthday_day"]', dob.day.toString());
    await page.select('select[name="birthday_month"]', dob.month.toString());
    await page.select('select[name="birthday_year"]', dob.year.toString());

    const genderSelector = ['input[value="1"]', 'input[value="2"]'][randomInt(0, 1)];
    await page.click(genderSelector);
    await humanMove(page);
    
    await page.click('button[name="websubmit"]');
    await new Promise(resolve => setTimeout(resolve, randomInt(8000, 12000)));

    const currentUrl = page.url();
    if (currentUrl.includes('confirm') || currentUrl.includes('checkpoint')) {
      const cookies = await page.cookies();
      const c_user = cookies.find(c => c.name === 'c_user');
      if (c_user) uid = c_user.value;
      return { email, password, name, dob, uid, status: "Account created, needs verification" };
    }

    const cookies = await page.cookies();
    const c_user = cookies.find(c => c.name === 'c_user');
    if (c_user) uid = c_user.value;

    return { email, password, name, dob, uid, status: "Account created" };
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
    `🤖 Welcome to Facebook Account Creator Bot!\n\n` +
    `📌 Commands:\n` +
    `/cfb <number> - <password> - Create Facebook accounts\n` +
    `/help - Show this message\n` +
    `/about - About this bot\n\n` +
    `Example: /cfb 5 - MyPass123`
  );
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    `📖 Help Menu:\n\n` +
    `🔹 /cfb <number> - <password>\n` +
    `   Creates Facebook accounts with Bangladeshi girls names\n` +
    `   Example: /cfb 3 - pass123\n\n` +
    `🔹 /start - Start the bot\n` +
    `🔹 /help - Show this help\n` +
    `🔹 /about - About this bot`
  );
});

bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 
    `ℹ️ About Bot:\n\n` +
    `📱 Facebook Account Creator Bot\n` +
    `👤 Credits: RIN\n` +
    `🛠️ Version: 1.0.0\n` +
    `📝 Description: Creates Facebook accounts with human-like behavior`
  );
});

bot.onText(/\/cfb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1].split(' ');
  
  if (args.length < 3) {
    return bot.sendMessage(chatId, "❌ Usage: /cfb <number> - <password>");
  }

  const numberCount = parseInt(args[0]);
  if (isNaN(numberCount) || numberCount <= 0) {
    return bot.sendMessage(chatId, "❌ Please enter a valid number.");
  }

  if (args[1] !== '-') {
    return bot.sendMessage(chatId, "❌ Use format: /cfb <number> - <password>");
  }

  const password = args[2];
  let results = [];
  
  await bot.sendMessage(chatId, `🔄 Starting to create ${numberCount} account(s)...`);

  for (let i = 0; i < numberCount; i++) {
    const name = randomName();
    const dob = randomDate();
    const email = `${name.split(' ')[0].toLowerCase()}${randomInt(100, 999)}${randomInt(1000, 9999)}@gmail.com`;

    await bot.sendMessage(chatId, `🔄 Creating account ${i + 1} with email: ${email}`);

    try {
      const createResult = await createFacebookAccount(name, dob, email, password);
      if (!createResult) {
        await bot.sendMessage(chatId, `❌ Failed to create account ${i + 1}`);
        continue;
      }

      results.push(createResult);
      await bot.sendMessage(chatId, `✅ Account ${i + 1} created successfully!`);
    } catch (error) {
      console.error(`Account ${i+1} creation error:`, error);
      await bot.sendMessage(chatId, `❌ Error creating account ${i + 1}`);
    }
  }

  if (!results.length) {
    return bot.sendMessage(chatId, "❌ No accounts were created.");
  }

  let summary = `🎉 Created ${results.length} account(s):\n\n`;
  results.forEach((r, i) => {
    summary += `Account ${i + 1}:\n`;
    summary += `👤 ${r.name}\n📧 ${r.email}\n🔑 ${r.password}\n🎂 ${r.dob.day}/${r.dob.month}/${r.dob.year}\n🆔 ${r.uid || 'Not available'}\n📌 ${r.status}\n\n`;
  });

  await bot.sendMessage(chatId, summary);
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

console.log('🤖 Facebook Account Creator Bot is running...');

export default { bot, config };
