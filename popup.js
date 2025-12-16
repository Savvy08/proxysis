// Загрузка текущего состояния
async function loadState() {
  const data = await chrome.storage.local.get(['proxyMode', 'currentProfile']);
  const mode = data.proxyMode || 'direct';
  
  // Сброс всех статусов
  document.querySelectorAll('.status-indicator').forEach(el => {
    el.classList.remove('active');
    el.classList.add('inactive');
  });
  
  document.querySelectorAll('.menu-item').forEach(el => {
    el.classList.remove('active');
  });
  
  // Установка активного режима
  if (mode === 'direct') {
    document.getElementById('directStatus').classList.remove('inactive');
    document.getElementById('directStatus').classList.add('active');
    document.getElementById('directBtn').classList.add('active');
  } else if (mode === 'system') {
    document.getElementById('systemStatus').classList.remove('inactive');
    document.getElementById('systemStatus').classList.add('active');
    document.getElementById('systemBtn').classList.add('active');
  } else if (mode === 'proxy') {
    document.getElementById('proxyStatus').classList.remove('inactive');
    document.getElementById('proxyStatus').classList.add('active');
    document.getElementById('proxyBtn').classList.add('active');
  }
}

// Прямое подключение
document.getElementById('directBtn').addEventListener('click', async () => {
  await chrome.storage.local.set({ proxyMode: 'direct' });
  chrome.runtime.sendMessage({ action: 'setDirect' });
  loadState();
});

// Системный прокси
document.getElementById('systemBtn').addEventListener('click', async () => {
  await chrome.storage.local.set({ proxyMode: 'system' });
  chrome.runtime.sendMessage({ action: 'setSystem' });
  loadState();
});

// Прокси
document.getElementById('proxyBtn').addEventListener('click', async () => {
  await chrome.storage.local.set({ proxyMode: 'proxy' });
  chrome.runtime.sendMessage({ action: 'setProxy' });
  loadState();
});

// Открыть настройки
document.getElementById('optionsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Загрузить состояние при открытии
loadState();