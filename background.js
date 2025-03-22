chrome.action.onClicked.addListener((tab) => {
    // Injeta o script content.js na aba atual
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });
});