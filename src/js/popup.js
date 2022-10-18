"use strict";

import * as storage from "./storage.js";

let listNavItems;
let navIndex;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await renderList();
  setupNavigation();
  setupListeners();
}

async function renderList() {
  let list = document.getElementById("list");
  let userActions = await getUserActions();

  for (let action of userActions) {
    let li = document.createElement("li");
    li.innerText = action.label;
    li.id = action.id;
    li.classList.add("item", "nav-index");

    if (action.active) {
      li.classList.add("checked");
    }

    list.appendChild(li);
  }
}

async function getUserActions() {
  let userActions = await storage.load("preferences", actions);

  // Add any new actions
  for (let action of actions) {
    let found = userActions.find((x) => x.id === action.id);

    if (!found) {
      userActions.push(found);
      await storage.save("preferences", userActions);
    }
  }

  // Remove any deprecated actions
  for (let action of userActions) {
    let found = actions.find((x) => x.id === action.id);

    if (!found) {
      let filtered = userActions.filter(function (x) {
        return x.id != action.id;
      });
      await storage.save("preferences", filtered);
    }
  }

  return userActions;
}

function setupListeners() {
  let navItems = document.querySelectorAll(".nav-index");

  for (let item of navItems) {
    item.addEventListener("click", onNavItemClicked);
  }

  document.addEventListener("keydown", documentOnKeydown, false);
  document.addEventListener("mouseout", documentOnMouseout, false);
}

async function onNavItemClicked(e) {
  let target = e.target;
  let value = target.dataset.value;
  let userActions = await storage.load("preferences", actions);

  let newUserActions = userActions.map((obj) => {
    if (obj.id === target.id) {
      if (target.classList.contains("checked")) {
        target.classList.remove("checked");
        return { ...obj, active: false };
      } else {
        target.classList.add("checked");
        return { ...obj, active: true };
      }
    }

    return obj;
  });

  await storage.save("preferences", newUserActions);
}

function documentOnKeydown(e) {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    navigateDirection(e);
  } else if (e.key === "Enter") {
    clickSelectedItem();
  }
}

function documentOnMouseout(e) {
  removeAllSelections();
  navIndex = null;
}

function setupNavigation() {
  listNavItems = document.querySelectorAll(".nav-index");

  for (let [i, item] of listNavItems.entries()) {
    item.addEventListener(
      "mouseover",
      function (e) {
        removeAllSelections();
        navIndex = null;
        this.classList.add("selected");
        navIndex = i;
      },
      false
    );
  }
}

function navigateDirection(e) {
  e.preventDefault();

  switch (e.key) {
    case "ArrowDown":
      setNavIndex();
      navigateListDown();
      break;
    case "ArrowUp":
      setNavIndex();
      navigateListUp();
      break;
  }

  if (navIndex <= 0) scrollToTop();
  if (navIndex >= listNavItems.length - 1) scrollToBottom();

  listNavItems[navIndex].classList.add("selected");
  listNavItems[navIndex].scrollIntoView({ block: "nearest" });
}

function setNavIndex() {
  if (!navIndex) {
    navIndex = 0;
  }
}

function navigateListDown() {
  if (listNavItems[navIndex].classList.contains("selected")) {
    listNavItems[navIndex].classList.remove("selected");
    navIndex !== listNavItems.length - 1 ? navIndex++ : listNavItems.length - 1;
  } else {
    navIndex = 0;
  }
}

function navigateListUp() {
  if (listNavItems[navIndex].classList.contains("selected")) {
    listNavItems[navIndex].classList.remove("selected");
    navIndex !== 0 ? navIndex-- : 0;
  } else {
    navIndex = listNavItems.length - 1;
  }
}

function clickItemByIndex(index) {
  removeAllSelections();
  let el = listNavItems[index];

  if (el) {
    navIndex = index;
    el.click();
  }
}

function clickSelectedItem(e) {
  let el = listNavItems[navIndex];
  el.click();
}

function removeAllSelections() {
  for (let item of listNavItems) {
    item.classList.remove("selected");
  }
}

function scrollToTop() {
  window.scrollTo(0, 0);
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}
