// Mapping of token symbols to Token Metrics token IDs
const SYMBOL_TO_TOKEN_METRICS_TOKEN_ID = {
    "ETH": 3306,
    "CELO": 11442,
    "BNB": 3312,
    // Add other mappings as needed
  };
  
  const SYMBOL_TO_TOKEN_METRICS_NAME = {
    "ETH": "ethereum",
    "CELO": "celo",
    "BNB": "binancecoin",
  };
  
  // Function to format a date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Function to fetch and process trading signals
  function fetchAndProcessTradingSignals(tokenIds, startDate, endDate) {
    // Retrieve the API key from chrome.storage
    chrome.storage.sync.get('apiKey', function(result) {
      if (result.apiKey) {
        const apiKey = result.apiKey;
  
        // Function to fetch signals based on the signal type
        async function fetchSignals(signalType) {
          if (tokenIds.length == 1 && tokenIds[0] == 3306) {
            tokenIds.push(11442);
          }
          const url = `https://api.tokenmetrics.com/v2/trading-signals?token_id=${tokenIds.join(',')}&startDate=${startDate}&endDate=${endDate}&marketcap=1&volume=1&fdv=1&signal=${signalType}&limit=1000&page=0`;
  
          return fetch(url, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'api_key': apiKey
            }
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.json();
          });
        }
  
        // Fetch both bullish and bearish signals
        Promise.all([fetchSignals(1), fetchSignals(-1)])
          .then(([bullishData, bearishData]) => {
            const combinedData = [...(bullishData.data || []), ...(bearishData.data || [])];
            const latestSignals = {};
  
            // Process the combined data to find the latest trading signal for each token
            combinedData.forEach(entry => {
              const tokenId = entry.TOKEN_ID;
              const signalDate = new Date(entry.DATE);
  
              if (!latestSignals[tokenId] || signalDate > latestSignals[tokenId].date) {
                latestSignals[tokenId] = {
                  date: signalDate,
                  tradingSignal: entry.TRADING_SIGNAL
                };
              }
            });
  
            // Store the latest trading signals in chrome.storage
            chrome.storage.local.set({ latestTradingSignals: latestSignals }, function() {
              console.log('Latest trading signals saved:', latestSignals);
              // After saving, update the links with the trading signals
              updateLinksWithTradingSignals(latestSignals);
            });
          })
          .catch(error => {
            console.error('Error during API requests:', error);
          });
      } else {
        console.error('API key not found in storage.');
      }
    });
  }
  
  function updateLinksWithTradingSignals(latestSignals) {
    const allLinks = Array.from(document.querySelectorAll("tr[data-testid='table-row-component']"));
    const links = allLinks.filter(link => link.querySelector("div[class='mr-1.5 uppercase']"));
    // console.log(links);
  
    latestSignals[SYMBOL_TO_TOKEN_METRICS_TOKEN_ID["ETH"]] = {tradingSignal: 1} // ALWAYS BULLISH ON ETH
    links.forEach(link => {
    //   console.log(link.textContent.trim());
      const symbol = link.textContent.trim().split(' ')[link.textContent.trim().split(' ').length - 1];
    //   console.log(symbol);
      const tokenId = SYMBOL_TO_TOKEN_METRICS_TOKEN_ID[symbol];
      if (tokenId && latestSignals[tokenId]) {
        const signal = latestSignals[tokenId].tradingSignal;
        const signalText = signal === 1 ? 'Bullish' : signal === -1 ? 'Bearish' : 'Neutral';
        const signalColor = signal === 1 ? 'green' : signal === -1 ? 'red' : 'gray';

        const el = link.querySelector("div[class='mr-1.5 uppercase']");
        el.innerHTML += ` <span style="color: ${signalColor};font-weight:bold;">${signalText}</span>`;
      }
    });
  }
  
  // Wait for the page to fully load
  window.addEventListener("load", () => {
    const jsInitChecktimer = setInterval(checkForJS_Finish, 111);
  
    function checkForJS_Finish() {
      const links = document.querySelectorAll("tr[data-testid='table-row-component']");
    //   console.log(links);
      const symbols = new Set();
      links.forEach(link => {
        if (link.querySelector("div[class='mr-1.5 uppercase']")) {
            const symbol = link.querySelector("div[class='mr-1.5 uppercase']").textContent.trim();
            if (SYMBOL_TO_TOKEN_METRICS_TOKEN_ID[symbol]) {
                symbols.add(symbol);
            }
        }
      });

    //   console.log(symbols)

      if (symbols.size > 0) {
        clearInterval(jsInitChecktimer);
  
        const tokenIds = Array.from(symbols).map(symbol => SYMBOL_TO_TOKEN_METRICS_TOKEN_ID[symbol]);
        // console.log("WOOOW");
        // console.log(tokenIds);
  
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
  
        const formattedEndDate = formatDate(endDate);
        const formattedStartDate = formatDate(startDate);
  
        fetchAndProcessTradingSignals(tokenIds, formattedStartDate, formattedEndDate);
      }
    }
  });
  