"use strict";

function executeAction(actionId) {
  switch (actionId) {
    case "copy":
      copyToClipboard();
      break;
    case "download":
      saveTextAs();
      break;
    case "youtube":
      searchYoutube();
      break;
    case "speak":
      speakText();
      break;
    case "search":
      defaultSearch();
      break;
    case "call":
      callNumber();
      break;
    case "email":
      sendEmail();
      break;
    case "maps":
      searchMaps();
      break;
    case "wikipedia":
      searchWikipedia();
      break;
  }
}

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
}

function visitUrl(url, target) {
  let a = document.createElement("a");
  a.href = url;
  a.target = target;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
