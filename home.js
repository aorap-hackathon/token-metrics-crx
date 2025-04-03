document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('apiKey');
    const saveButton = document.getElementById('save');
    const status = document.getElementById('status');
  
    // Load the saved API key (if any)
    chrome.storage.sync.get('apiKey', function(result) {
      if (result.apiKey) {
        input.value = result.apiKey;
      }
    });
  
    // Save the API key when the button is clicked
    saveButton.addEventListener('click', function() {
      const key = input.value;
      chrome.storage.sync.set({apiKey: key}, function() {
        status.textContent = 'API key saved.';
        setTimeout(function() {
          status.textContent = '';
        }, 2000);
      });
    });
  });
  