require("dotenv").config({ path: `${__dirname}/.env` });
const axios = require("axios");
const { JSDOM } = require("jsdom");
const fs = require("fs");

const URL = "https://www.iiitd.ac.in/admission/btech/2022";
const STATUS_FILE = `${__dirname}/status`;
const API_URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

async function sendMessage(msg) {
  try {
    await axios.post(API_URL, {
      chat_id: process.env.CHAT_ID,
      text: msg,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  } catch (e) {
    console.error(e);
  }
}

function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

(async function main() {
  try {
    const prev_notifications = JSON.parse(fs.readFileSync(STATUS_FILE).toString().trim());
    const html = (await axios.get(URL)).data;
    const $ = require("cheerio").load(html);

    const notifications = $("#node-628 > div > div > div.field-item.even > div.row.margin-top-20 > div:nth-child(2) > div > div:nth-child(6) > div p")
      .map((i, el) => $(el).text())
      .toArray()
      .filter(x => x.startsWith('»'))
      .map(x => x.slice(2));

    console.log({prev_notifications, notifications, eq: arrayEquals(prev_notifications, notifications)});
    if(!arrayEquals(prev_notifications, notifications)) {
      fs.writeFileSync(STATUS_FILE, JSON.stringify(notifications));
      const new_notifications = notifications.filter(x => !prev_notifications.includes(x));
      sendMessage(`IIITD Website Updated: <a href="${URL}">${new_notifications.join('         ')}</a>`);
    }

    // if (prev_status !== current_status) {
    //   fs.writeFileSync(STATUS_FILE, current_status);
    //   sendMessage(
    //     `RC Application Update: <a href="${URL}">${current_status}</a>`
    //   );
    // }
  } catch (e) {
    console.error(e);
  }
})();
