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
  
// Функция для получения последнего TRADING_SIGNAL по дате для каждого TOKEN_ID
function getLatestTradingSignals() {
  // Получаем api_key из chrome.storage
  chrome.storage.sync.get('apiKey', function(result) {
    if (result.apiKey) {
      const apiKey = result.apiKey;
      const url = 'https://api.tokenmetrics.com/v2/trading-signals?token_id=3306%2C11442&startDate=2025-03-01&endDate=2025-04-03&marketcap=1&volume=1&fdv=1&signal=1&limit=1000&page=0';

      // Выполняем GET-запрос к API
      fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api_key': apiKey
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const latestSignals = {};

          // Проходим по всем данным
          data.data.forEach(entry => {
            const tokenId = entry.TOKEN_ID;
            const signalDate = new Date(entry.DATE);

            // Если для токена ещё нет записи или найдена более поздняя дата, обновляем запись
            if (!latestSignals[tokenId] || signalDate > latestSignals[tokenId].date) {
              latestSignals[tokenId] = {
                date: signalDate,
                tradingSignal: entry.TRADING_SIGNAL
              };
            }
          });

          // Сохраняем последние сигналы в chrome.storage
          chrome.storage.local.set({ latestTradingSignals: latestSignals }, function() {
            console.log('Последние торговые сигналы сохранены:', latestSignals);
          });
        } else {
          console.error('Некорректный формат ответа API:', data);
        }
      })
      .catch(error => {
        console.error('Ошибка при выполнении запроса:', error);
      });
    } else {
      console.error('API ключ не найден в хранилище.');
    }
  });
}

// Вызываем функцию для получения и сохранения последних торговых сигналов
getLatestTradingSignals();
