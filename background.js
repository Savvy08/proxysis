// Инициализация при установке
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    proxyMode: 'direct',
    proxyServers: [{
      scheme: 'default',
      protocol: 'HTTP',
      host: '31.59.185.243',
      port: '23430'
    }],
    bypassList: 'localhost\n127.0.0.1\n*.local',
    username: '',
    password: ''
  });
});

// Применение прокси настроек
async function applyProxySettings() {
  const data = await chrome.storage.local.get(['proxyMode', 'proxyServers', 'bypassList']);
  
  if (data.proxyMode === 'direct') {
    // Прямое подключение
    await chrome.proxy.settings.set({
      value: { mode: 'direct' },
      scope: 'regular'
    });
  } else if (data.proxyMode === 'system') {
    // Системный прокси
    await chrome.proxy.settings.set({
      value: { mode: 'system' },
      scope: 'regular'
    });
  } else if (data.proxyMode === 'proxy' && data.proxyServers && data.proxyServers.length > 0) {
    // Настраиваемый прокси
    const server = data.proxyServers[0]; // Используем первый сервер
    const bypassList = data.bypassList ? data.bypassList.split('\n').filter(s => s.trim()) : [];
    
    const config = {
      mode: 'fixed_servers',
      rules: {}
    };
    
    // Определяем тип прокси
    const proxyType = server.protocol.toLowerCase();
    
    if (proxyType === 'http') {
      config.rules.proxyForHttp = {
        scheme: 'http',
        host: server.host,
        port: parseInt(server.port)
      };
      config.rules.proxyForHttps = {
        scheme: 'http',
        host: server.host,
        port: parseInt(server.port)
      };
    } else if (proxyType === 'https') {
      config.rules.proxyForHttp = {
        scheme: 'https',
        host: server.host,
        port: parseInt(server.port)
      };
      config.rules.proxyForHttps = {
        scheme: 'https',
        host: server.host,
        port: parseInt(server.port)
      };
    } else if (proxyType === 'socks4') {
      config.rules.singleProxy = {
        scheme: 'socks4',
        host: server.host,
        port: parseInt(server.port)
      };
    } else if (proxyType === 'socks5') {
      config.rules.singleProxy = {
        scheme: 'socks5',
        host: server.host,
        port: parseInt(server.port)
      };
    }
    
    if (bypassList.length > 0) {
      config.rules.bypassList = bypassList;
    }
    
    await chrome.proxy.settings.set({
      value: config,
      scope: 'regular'
    });
  }
}

// Обработка сообщений от popup и options
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setDirect') {
    applyProxySettings();
  } else if (request.action === 'setSystem') {
    applyProxySettings();
  } else if (request.action === 'setProxy') {
    applyProxySettings();
  } else if (request.action === 'updateProxy') {
    applyProxySettings();
  }
});

// Применение настроек при запуске
applyProxySettings();