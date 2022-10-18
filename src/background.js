"use strict";

chrome.runtime.onMessage.addListener(onMessageReceived);

function onMessageReceived(message, sender, sendResponse) {
  switch (message.msg) {
    case "speak":
      chrome.tts.speak(message.text);
      break;
    case "search":
      chrome.search.query({ disposition: "NEW_TAB", text: message.text });
      break;
  }

  sendResponse();
}
