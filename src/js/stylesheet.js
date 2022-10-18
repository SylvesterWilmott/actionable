"use strict";

let stylesheet = `
.menu {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: #191919;
  height: 28px;
  line-height: 28px;
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
  user-select: none;
}

.action {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  line-height: 28px;
  color: #ffffff;
  padding: 0 10px;
  border-left: 0.5px solid #555555;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
    "Helvetica Neue", Arial, sans-serif;
}

.action svg {
  pointer-events: none;
  fill: #ffffff;
}

.action:first-child {
  border: none;
}

.action:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action:active {
  background: rgba(255, 255, 255, 0.2);
}

.no-click {
  pointer-events: none;
  color: #AAAAAA;
}

`;
