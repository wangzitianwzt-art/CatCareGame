// Background Service Worker for Chrome Extension
// This file handles background tasks and events

chrome.runtime.onInstalled.addListener(() => {
  console.log("Cat Care Plugin installed!");
});

chrome.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: any) => {
  if (request.action === "getGameState") {
    chrome.storage.local.get("gameState", (result: any) => {
      sendResponse(result.gameState);
    });
    return true; // Will respond asynchronously
  }
});
