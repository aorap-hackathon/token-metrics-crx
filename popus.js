document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('apiKey');
    const saveButton = document.getElementById('save');
    const status = document.getElementById('status');
  
    // Загружаем сохранённый API ключ (если есть)
    chrome.storage.sync.get('apiKey', function(result) {
      if (result.apiKey) {
        input.value = result.apiKey;
      }
    });
  
    // Сохраняем API ключ при клике
    saveButton.addEventListener('click', function() {
      const key = input.value;
      chrome.storage.sync.set({apiKey: key}, function() {
        status.textContent = 'API key saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 2000);
      });
    });
  });
  