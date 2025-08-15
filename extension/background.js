// SPDX-License-Identifier: zlib-acknowledgement
// Copyright (c) 2025 @thejjw

// Supported sites for IP annotation
const SUPPORTED_SITES = [
  'https://gall.dcinside.com/*',
  'https://mlbpark.donga.com/*',
  'https://namu.wiki/*',
  'https://arca.live/*'
];

chrome.runtime.onInstalled.addListener(() => {
  console.log('IP Country Annotator extension installed.');
  
  // Create parent context menu item
  chrome.contextMenus.create({
    id: 'ip-annotator-parent',
    title: 'IP Country Annotator',
    contexts: ['page'],
    documentUrlPatterns: SUPPORTED_SITES
  });
  
  // Create child menu items under the parent
  chrome.contextMenus.create({
    id: 'apply-ip-analysis',
    parentId: 'ip-annotator-parent',
    title: 'Apply IP Analysis',
    contexts: ['page'],
    documentUrlPatterns: SUPPORTED_SITES
  });
  
  chrome.contextMenus.create({
    id: 'clear-ip-annotations',
    parentId: 'ip-annotator-parent',
    title: 'Clear IP Annotations',
    contexts: ['page'],
    documentUrlPatterns: SUPPORTED_SITES
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    switch (info.menuItemId) {
      case 'apply-ip-analysis':
        await chrome.tabs.sendMessage(tab.id, { type: 'APPLY_IP_ANNOTATION' });
        break;
        
      case 'clear-ip-annotations':
        await chrome.tabs.sendMessage(tab.id, { type: 'CLEAR_IP_ANNOTATION' });
        break;
    }
  } catch (error) {
    console.error('Error handling context menu click:', error);
  }
});
