require("dotenv").config({ path: `${__dirname}/.env` });
const axios = require("axios");
const { JSDOM } = require("jsdom");
const fs = require("fs");

const URL =
  "https://www.recurse.com/applications/status?token=f1d823e12f062218";
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

(async function main() {
  try {
    const prev_status = fs.readFileSync(STATUS_FILE).toString().trim();
    const html = (await axios.get(URL)).data;
    const $ = require("cheerio").load(html);

    const current_status = $("article p").text().trim();

    if (prev_status !== current_status) {
      fs.writeFileSync(STATUS_FILE, current_status);
      sendMessage(
        `RC Application Update: <a href="${URL}">${current_status}</a>`
      );
    }
  } catch (e) {
    console.error(e);
  }
})();
