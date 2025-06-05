const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Message handler
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;
      const message = event.message?.text;

      if (message) {
        handleUserMessage(senderId, message.trim().toLowerCase());
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

function handleUserMessage(senderId, message) {
  if (["hi", "hello", "hey"].includes(message)) {
    sendMessage(senderId, "👋 Hello! I’m your friendly bot.\nType 'menu' to see what I can do.");
  } else if (message.includes("menu")) {
    sendMessage(senderId,
      "📋 Here's what I can do:\n" +
      "- Type 'joke' to get a random joke 🤡\n" +
      "- Type 'quote' for a motivational quote 💡\n" +
      "- Type 'help' if you're stuck ❓"
    );
  } else if (message.includes("joke")) {
    sendMessage(senderId, "Why don’t skeletons fight each other? They don’t have the guts! 💀");
  } else if (message.includes("quote")) {
    sendMessage(senderId, "“The best way to get started is to quit talking and begin doing.” — Walt Disney");
  } else if (message.includes("help")) {
    sendMessage(senderId, "Type 'menu' to see the full list of commands. I’m always here to help!");
  } else {
    sendMessage(senderId, "😕 Sorry, I didn’t get that.\nType 'menu' to see what I can do.");
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
