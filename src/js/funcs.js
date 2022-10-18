"use strict";

/*************************************
Copy to Clipboard
**************************************/

async function copyToClipboard() {
  await navigator.clipboard.writeText(window.getSelection().toString().trim());
}

/*************************************
Download Text
**************************************/

async function saveTextAs() {
  let text = window.getSelection().toString().trim();
  let filename = getTitle(text);

  try {
    await downloadFile(text, filename + ".txt");
  } catch (err) {
    console.log(err);
  }
}

async function downloadFile(text, filename) {
  if (window.showSaveFilePicker) {
    let newHandle = await window.showSaveFilePicker({
      suggestedName: filename,
    });
    let writableStream = await newHandle.createWritable();
    await writableStream.write(text);
    await writableStream.close();
  } else {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    a.remove();
  }
}

function getTitle(str) {
  if (str.length <= 0) return str;
  let maxLength = 30;
  let trim = str.trim();
  let split = str.split("\n")[0];
  let substring = split.substring(0, maxLength);

  if (split.length <= maxLength || !substring.includes(" ")) {
    return substring;
  } else {
    return split.substr(0, str.lastIndexOf(" ", maxLength));
  }
}

/*************************************
Search With Youtube
**************************************/

function searchYoutube() {
  let text = window.getSelection().toString().trim();
  let encoded = encodeURIComponent(text);
  let url = "https://www.youtube.com/results?search_query=" + encoded;
  visitUrl(url, "_blank");
}

/*************************************
Speak Text
**************************************/

function speakText() {
  let text = window.getSelection().toString().trim();
  sendMessage({ msg: "speak", text: text });
}

/*************************************
Default Search
**************************************/

function defaultSearch() {
  let text = window.getSelection().toString().trim();
  sendMessage({ msg: "search", text: text });
}

/*************************************
Call Number
**************************************/

function callNumber() {
  let text = window.getSelection().toString().trim();
  let url = "tel:" + text;
  visitUrl(url, "_self");
}

/*************************************
Mailto
**************************************/

function sendEmail() {
  let text = window.getSelection().toString().trim();
  let url = "mailto:" + text;
  console.log(url);
  visitUrl(url, "_self");
}

/*************************************
Search Maps
**************************************/

function searchMaps() {
  let text = window.getSelection().toString().trim();
  let encoded = encodeURIComponent(text);
  let url = "https://www.google.com/maps/search/?api=1&query=" + encoded;
  visitUrl(url, "_blank");
}

/*************************************
Search Maps
**************************************/

function searchWikipedia() {
  let text = window.getSelection().toString().trim();
  let encoded = encodeURIComponent(text);
  let url = "https://en.wikipedia.org/w/index.php?go=Go&search=" + encoded;
  visitUrl(url, "_blank");
}
