"use strict";

let menu;

document.addEventListener("mouseup", function (e) {
  if (e.target !== menu) {
    removeMenu();
  }
});

document.addEventListener(
  "mouseup",
  debounce(function (e) {
    if (e.target !== menu) {
      drawMenu();
    } else {
      removeMenu();
    }
  }, 250)
);

document.addEventListener("contextmenu", removeMenu);
document.addEventListener("keydown", removeMenu);

window.addEventListener(
  "resize",
  debounce(function () {
    if (menu) {
      removeMenu();
    }
  }, 100)
);

async function drawMenu() {
  let selection = window.getSelection();
  let selectedText = selection.toString().trim();
  let context = getContext(selectedText);

  if (
    chrome.runtime?.id &&
    selectedText.length > 0 &&
    selection.rangeCount > 0 &&
    document.activeElement.tagName.toLowerCase() !== "input"
  ) {
    let range = selection.getRangeAt(0);
    let rect = getRect(range);

    if (menu) removeMenu();

    createMenuElement();

    let shadowRoot = menu.attachShadow({ mode: "open" });

    let shadowMenu = document.createElement("div");
    shadowMenu.setAttribute("class", "menu");
    shadowRoot.appendChild(shadowMenu);

    let sheet = new CSSStyleSheet();
    sheet.replaceSync(stylesheet);
    shadowRoot.adoptedStyleSheets = [sheet];

    let userSetActions = await getUserActions();

    for (let action of userSetActions) {
      if (
        action.active &&
        (action.context === "all" || context === action.context)
      ) {
        let item = document.createElement("span");
        item.setAttribute("class", "action");
        item.setAttribute("id", action.id);
        item.setAttribute("title", action.label);

        if (ICONS[action.id]) {
          item.innerHTML = ICONS[action.id];
        } else {
          item.innerHTML = getMenuAffordance(action.affordance, selectedText);
        }

        if (action.interactive === false) {
          item.classList.add("no-click");
        }

        shadowMenu.appendChild(item);
      }
    }

    document.body.insertBefore(menu, document.body.firstChild);

    menu.style.left = getXOffset(rect, menu.offsetWidth) + "px";
    menu.style.top = getYOffset(rect, menu.offsetHeight) + "px";

    menu.addEventListener("click", onMenuClicked);
  }
}

function getRect(range) {
  let rect = {};
  let activeEl = document.activeElement;

  if (activeEl && activeEl.tagName.toLowerCase() == "textarea") {
    let div = document.createElement("div");
    let startSpan = document.createElement("span");
    let endSpan = document.createElement("span");
    let styles = getComputedStyle(activeEl);

    for (let s of styles) {
      div.style[s] = styles[s];
    }

    // Reset margin
    div.style.margin = "none";

    document.body.appendChild(div);

    // This monstrosity finds the rect of a selection in a textarea
    let activeElPos = activeEl.getBoundingClientRect();

    div.style.position = "fixed";
    div.style.top = activeElPos.y + "px";
    div.style.left = activeElPos.x + "px";

    div.innerText = activeEl.value.substring(0, activeEl.selectionStart);
    div.appendChild(startSpan);

    let startSpanRect = startSpan.getBoundingClientRect();
    rect.top = startSpanRect.top;
    rect.left = startSpanRect.left;
    startSpan.remove();

    div.innerText = activeEl.value.substring(0, activeEl.selectionEnd);
    div.appendChild(endSpan);

    let endSpanRect = endSpan.getBoundingClientRect();

    if (endSpanRect.left < rect.left) {
      rect.width = rect.left - endSpanRect.left;
    } else {
      rect.width = endSpanRect.left - rect.left;
    }

    document.body.removeChild(div);
  } else {
    rect = range.getBoundingClientRect();
  }

  return rect;
}

function getContext(text) {
  let email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let phoneNo = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\.\/0-9]*$/g;

  if (text.match(email)) {
    return "email";
  } else if (text.match(phoneNo)) {
    return "phone";
  } else {
    return "text";
  }
}

function createMenuElement() {
  menu = document.createElement("div");
  menu.style.position = "absolute";
  menu.style.height = "auto";
  menu.style.width = "auto";
  menu.style.padding = "none";
  menu.style.margin = "none";
  menu.style.zIndex = "99999";
}

function getMenuAffordance(affordance, text) {
  let label = affordance;
  let replace = /%.+%/gi;

  if (affordance.match(replace)) {
    let match = affordance.match(replace);
    let keyword = match[0].replaceAll("%", "");

    switch (keyword) {
      case "words":
        label = countWords(text);
        break;
      case "characters":
        label = countCharacters(text);
        break;
    }
  }

  return label;
}

function getXOffset(rect, menuWidth) {
  let pixelsToLeftEdge = Math.floor(
    rect.left - (menuWidth / 2 - rect.width / 2)
  );

  let pixelsToRightEdge = Math.floor(
    window.innerWidth - rect.left - (menuWidth / 2 + rect.width / 2)
  );

  if (pixelsToLeftEdge < 16) {
    return Math.floor(
      rect.width / 2 + rect.left - menuWidth / 2 - pixelsToLeftEdge + 16
    );
  } else if (pixelsToRightEdge < 16) {
    return Math.floor(
      rect.width / 2 + rect.left - menuWidth / 2 + pixelsToRightEdge - 16
    );
  } else {
    return Math.floor(rect.width / 2 + rect.left - menuWidth / 2);
  }
}

function getYOffset(rect, menuHeight) {
  return Math.floor(rect.top + window.scrollY - menuHeight - 10);
}

async function getUserActions() {
  return await loadFromStorage("preferences", actions);
}

function removeMenu() {
  if (menu) {
    menu.remove();
    menu = null;
  }
}

function loadFromStorage(key, defaults) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(
      {
        [key]: defaults,
      },
      function (value) {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        }
        resolve(value[key]);
      }
    );
  });
}

function debounce(callback, wait) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback.apply(this, args), wait);
  };
}

async function onMenuClicked(e) {
  let selection = window.getSelection();
  let selectedText = selection.toString().trim();

  let path = event.path || (event.composedPath && event.composedPath());

  if (path) {
    executeAction(path[0].id);
  }
}

function countCharacters(text) {
  return text.length + "c";
}

function countWords(text) {
  let n = text.split(" ").filter(function (n) {
    return n != "";
  }).length;

  return n + "w";
}
