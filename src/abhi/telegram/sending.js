const {arr , add} = require("./adding.js");
const axios = require("axios");
require("dotenv").config();
const token = process.env.TELEGRAM_BOT_TOKEN;

// Validate token exists on startup
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables. Check your .env file.")
}
 
async function sending (data){
    for( const id of arr){
        if(id.status == "start"){
           try{ 
             await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
              chat_id: id.chatid,
              text: data
            })
           } catch(err){
             // Don't log the full error to avoid exposing the token
             console.error(`Failed to send Telegram message: ${err.message}`)
           }
        }
    }
}

module.exports = sending;