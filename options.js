// Загрузка настроек
async function loadSettings() {
  const data = await chrome.storage.local.get(['proxyServers', 'bypassList', 'username', 'password']);
  
  if (data.proxyServers && data.proxyServers.length > 0) {
    const container = document.getElementById('proxyServers');
    container.innerHTML = '';
    
    data.proxyServers.forEach((server, index) => {
      addServerRow(server);
    });
  }
  
  if (data.bypassList) {
    document.getElementById('bypassList').value = data.bypassList;
  }
  
  if (data.username) {
    document.getElementById('username').value = data.username;
  }
  
  if (data.password) {
    document.getElementById('password').value = data.password;
  }
}

// Добавление строки сервера
function addServerRow(server = null) {
  const container = document.getElementById('proxyServers');
  const row = document.createElement('div');
  row.className = 'proxy-server-row';
  
  row.innerHTML = `
    <div class="form-group">
      <label class="form-label">Схема</label>
      <select class="form-select scheme-select">
        <option value="default" ${!server || server.scheme === 'default' ? 'selected' : ''}>(default)</option>
        <option value="http" ${server && server.scheme === 'http' ? 'selected' : ''}>http</option>
        <option value="https" ${server && server.scheme === 'https' ? 'selected' : ''}>https</option>
        <option value="socks4" ${server && server.scheme === 'socks4' ? 'selected' : ''}>socks4</option>
        <option value="socks5" ${server && server.scheme === 'socks5' ? 'selected' : ''}>socks5</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Протокол</label>
      <select class="form-select protocol-select">
        <option value="HTTP" ${!server || server.protocol === 'HTTP' ? 'selected' : ''}>HTTP</option>
        <option value="HTTPS" ${server && server.protocol === 'HTTPS' ? 'selected' : ''}>HTTPS</option>
        <option value="SOCKS4" ${server && server.protocol === 'SOCKS4' ? 'selected' : ''}>SOCKS4</option>
        <option value="SOCKS5" ${server && server.protocol === 'SOCKS5' ? 'selected' : ''}>SOCKS5</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Сервер</label>
      <input type="text" class="form-input server-input" placeholder="example.com" value="${server ? server.host : ''}">
    </div>
    <div class="form-group">
      <label class="form-label">Порт</label>
      <input type="text" class="form-input port-input" placeholder="8080" value="${server ? server.port : ''}">
    </div>
    <div class="form-group">
      <label class="form-label">&nbsp;</label>
      <button class="btn-icon btn-remove">🗑️</button>
    </div>
  `;
  
  row.querySelector('.btn-remove').addEventListener('click', () => {
    row.remove();
  });
  
  container.appendChild(row);
}

// Сохранение настроек
async function saveSettings() {
  const rows = document.querySelectorAll('.proxy-server-row');
  const servers = [];
  
  rows.forEach(row => {
    const scheme = row.querySelector('.scheme-select').value;
    const protocol = row.querySelector('.protocol-select').value;
    const host = row.querySelector('.server-input').value;
    const port = row.querySelector('.port-input').value;
    
    if (host && port) {
      servers.push({ scheme, protocol, host, port });
    }
  });
  
  const bypassList = document.getElementById('bypassList').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  await chrome.storage.local.set({
    proxyServers: servers,
    bypassList: bypassList,
    username: username,
    password: password
  });
  
  // Отправить сообщение фоновому скрипту для обновления прокси
  chrome.runtime.sendMessage({ action: 'updateProxy' });
  
  // Показать сообщение об успехе
  const successMsg = document.getElementById('successMessage');
  successMsg.classList.add('show');
  setTimeout(() => {
    successMsg.classList.remove('show');
  }, 3000);
}

// Обработчики событий
document.getElementById('addServerBtn').addEventListener('click', () => {
  addServerRow();
});

document.getElementById('saveBtn').addEventListener('click', saveSettings);

document.getElementById('discardBtn').addEventListener('click', () => {
  loadSettings();
});

document.getElementById('advancedToggle').addEventListener('click', () => {
  const section = document.getElementById('advancedSection');
  const toggle = document.getElementById('advancedToggle');
  
  if (section.classList.contains('show')) {
    section.classList.remove('show');
    toggle.textContent = '▼ Показать расширенные настройки';
  } else {
    section.classList.add('show');
    toggle.textContent = '▲ Скрыть расширенные настройки';
  }
});

// Переключение разделов боковой панели
document.querySelectorAll('.sidebar-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    const section = item.dataset.section;
    // Здесь можно добавить переключение между разделами
    console.log('Переключение на раздел:', section);
  });
});

document.getElementById('wildcardHelp').addEventListener('click', (e) => {
  e.preventDefault();
  alert('Примеры подстановочных знаков:\n\n' +
        '*.example.com - все поддомены example.com\n' +
        '192.168.*.* - все адреса в диапазоне 192.168\n' +
        '<local> - локальные адреса без точки\n' +
        '*:80 - все адреса на порту 80');
});

// Загрузка при открытии
loadSettings();