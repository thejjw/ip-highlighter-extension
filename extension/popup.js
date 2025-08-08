// SPDX-License-Identifier: zlib-acknowledgement
// Copyright (c) 2025 @thejjw

// Apply IP annotation functionality
document.getElementById('apply-annotation').addEventListener('click', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      const response = await chrome.tabs.sendMessage(tabs[0].id, { 
        type: 'APPLY_IP_ANNOTATION'
      });
      
      if (response && response.success) {
        showFeedback('IP analysis applied successfully!', 'success');
      } else {
        showFeedback('Failed to apply IP analysis', 'error');
      }
    }
  } catch (error) {
    console.error('Error applying IP annotation:', error);
    showFeedback('Error: Make sure you are on a supported page', 'error');
  }
});

// Clear IP annotation functionality
document.getElementById('clear-annotation').addEventListener('click', async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      const response = await chrome.tabs.sendMessage(tabs[0].id, { 
        type: 'CLEAR_IP_ANNOTATION'
      });
      
      if (response && response.success) {
        showFeedback('Annotations cleared successfully!', 'success');
      } else {
        showFeedback('Failed to clear annotations', 'error');
      }
    }
  } catch (error) {
    console.error('Error clearing IP annotation:', error);
    showFeedback('Error: Make sure you are on a supported page', 'error');
  }
});

// Toggle debug mode functionality
document.getElementById('toggle-debug').addEventListener('click', async () => {
  try {
    // Get current debug state from storage
    const result = await chrome.storage.local.get(['debugEnabled']);
    const currentDebug = result.debugEnabled ?? true; // Default to true
    const newDebug = !currentDebug;
    
    // Save new debug state
    await chrome.storage.local.set({ debugEnabled: newDebug });
    
    // Send message to content script to update debug flag
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        type: 'UPDATE_DEBUG', 
        debugEnabled: newDebug 
      });
    }
    
    // Update button text
    const button = document.getElementById('toggle-debug');
    button.textContent = newDebug ? 'Disable Debug Mode' : 'Enable Debug Mode';
    
    // Show feedback
    showFeedback(`Debug mode ${newDebug ? 'enabled' : 'disabled'}`, 'info');
  } catch (error) {
    console.error('Error toggling debug mode:', error);
    showFeedback('Error toggling debug mode', 'error');
  }
});

// Helper function to show feedback messages
function showFeedback(message, type = 'info') {
  // Remove any existing feedback
  const existingFeedback = document.querySelector('.feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  const feedback = document.createElement('div');
  feedback.className = `feedback feedback-${type}`;
  feedback.textContent = message;
  
  // Define styles based on type
  const styles = {
    info: { background: '#d4edda', color: '#155724', border: '#c3e6cb' },
    success: { background: '#d4edda', color: '#155724', border: '#c3e6cb' },
    error: { background: '#f8d7da', color: '#721c24', border: '#f5c6cb' }
  };
  
  const style = styles[type] || styles.info;
  feedback.style.cssText = `
    margin-top: 10px; 
    padding: 8px 12px; 
    background: ${style.background}; 
    color: ${style.color};
    border: 1px solid ${style.border};
    border-radius: 4px; 
    font-size: 12px;
    text-align: center;
  `;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.remove();
    }
  }, 3000);
}

// Initialize button text based on current debug state
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load version from manifest
    const manifestData = chrome.runtime.getManifest();
    const versionElement = document.getElementById('version');
    if (versionElement && manifestData.version) {
      versionElement.textContent = `v${manifestData.version}`;
    }
    
    // Initialize debug button
    const result = await chrome.storage.local.get(['debugEnabled']);
    const debugEnabled = result.debugEnabled ?? false; // Default to false
    const button = document.getElementById('toggle-debug');
    button.textContent = debugEnabled ? 'Disable Debug Mode' : 'Enable Debug Mode';
  } catch (error) {
    console.error('Error initializing popup:', error);
  }
});
