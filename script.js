let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentLang = localStorage.getItem('appLang') || 'ml';
let currentTheme = localStorage.getItem('appAccent') || 'theme-neon-green';
let currentMode = localStorage.getItem('appMode') || 'dark';
let myChart = null;

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

const balanceEl = document.getElementById('balance-amount');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const form = document.getElementById('tracker-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const typeInput = document.getElementById('type');
const editIndexInput = document.getElementById('edit-index');
const saveBtn = document.getElementById('save-btn');
const historyList = document.getElementById('history-list');
const exportBtn = document.getElementById('export-btn');

const settingsBtn = document.getElementById('settings-btn');
const closeSettingsBtn = document.getElementById('close-settings');
const settingsModal = document.getElementById('settings-modal');
const darkModeBtn = document.getElementById('dark-mode-btn');
const lightModeBtn = document.getElementById('light-mode-btn');
const colorBtns = document.querySelectorAll('.color-btn');

const langEnBtn = document.getElementById('lang-en-btn');
const langMlBtn = document.getElementById('lang-ml-btn');

const googleLoginBtn = document.getElementById('google-login-btn');
const googleLogoutBtn = document.getElementById('google-logout-btn');
const userProfileDiv = document.getElementById('user-profile');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');

const i18n = {
  en: {
    balance: 'Balance',
    income: 'Income',
    expense: 'Expense',
    selectCat: 'Select Category',
    descPlaceholder: 'Description (Optional)',
    amountPlaceholder: 'Amount',
    saveBtn: 'SAVE ENTRY',
    updateBtn: 'UPDATE ENTRY',
    history: 'History',
    expenseOpt: 'Expense',
    incomeOpt: 'Income',
    accountSetting: 'Account',
    langSetting: 'Language',
    modeSetting: 'Mode',
    accentSetting: 'Neon Accent Color'
  },
  ml: {
    balance: 'ബാക്കി തുക (Balance)',
    income: 'വരുമാനം',
    expense: 'ചെലവ്',
    selectCat: 'കാറ്റഗറി തിരഞ്ഞെടുക്കുക',
    descPlaceholder: 'വിവരണം (ഐച്ഛികം)',
    amountPlaceholder: 'തുക (Amount)',
    saveBtn: 'സേവ് ചെയ്യുക',
    updateBtn: 'അപ്ഡേറ്റ് ചെയ്യുക',
    history: 'ചരിത്രം (History)',
    expenseOpt: 'ചെലവ് (Expense)',
    incomeOpt: 'വരുമാനം (Income)',
    accountSetting: 'അക്കൗണ്ട് (Google Auth)',
    langSetting: 'ഭാഷ (Language)',
    modeSetting: 'മോഡ് (Theme)',
    accentSetting: 'നിയോൺ കളർ'
  }
};

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('appLang', lang);
  const t = i18n[lang];

  document.getElementById('lbl-balance').innerText = t.balance;
  document.getElementById('lbl-income').innerText = t.income;
  document.getElementById('lbl-expense').innerText = t.expense;
  document.getElementById('opt-select-cat').innerText = t.selectCat;
  descInput.placeholder = t.descPlaceholder;
  amountInput.placeholder = t.amountPlaceholder;
  
  if (editIndexInput.value === '-1') {
    saveBtn.innerText = t.saveBtn;
  } else {
    saveBtn.innerText = t.updateBtn;
  }

  document.getElementById('lbl-history').innerText = t.history;
  document.getElementById('opt-expense').innerText = t.expenseOpt;
  document.getElementById('opt-income').innerText = t.incomeOpt;

  document.getElementById('lbl-account-setting').innerText = t.accountSetting;
  document.getElementById('lbl-language-setting').innerText = t.langSetting;
  document.getElementById('lbl-mode-setting').innerText = t.modeSetting;
  document.getElementById('lbl-accent-setting').innerText = t.accentSetting;

  if (lang === 'en') {
    langEnBtn.classList.add('active');
    langMlBtn.classList.remove('active');
  } else {
    langMlBtn.classList.add('active');
    langEnBtn.classList.remove('active');
  }
}

function applyAccentColor(theme) {
  currentTheme = theme;
  localStorage.setItem('appAccent', theme);
  document.body.className = `${currentMode === 'light' ? 'light-theme' : 'dark-theme'} ${theme}`;
  initChart();
}

function applyThemeMode(mode) {
  currentMode = mode;
  localStorage.setItem('appMode', mode);
  document.body.className = `${mode === 'light' ? 'light-theme' : 'dark-theme'} ${currentTheme}`;
  if (mode === 'light') {
    lightModeBtn.classList.add('active');
    darkModeBtn.classList.remove('active');
  } else {
    darkModeBtn.classList.add('active');
    lightModeBtn.classList.remove('active');
  }
}

// Trading Style Dynamic Graph (Pacha for Income UP, Chuvappu for Expense DOWN)
function initChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (myChart) myChart.destroy();

  let chartPoints = [0];
  let labels = ['Start'];
  let currentRunningBal = 0;

  transactions.forEach((t, i) => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'income') {
      currentRunningBal += amt;
    } else {
      currentRunningBal -= amt;
    }
    chartPoints.push(currentRunningBal);
    labels.push(`T${i + 1}`);
  });

  if (chartPoints.length === 1) {
    chartPoints = [0, 100, 50, 200];
    labels = ['1', '2', '3', '4'];
  }

  const firstVal = chartPoints[0];
  const lastVal = chartPoints[chartPoints.length - 1];
  const isProfit = lastVal >= firstVal;

  const lineColor = isProfit ? '#00ff87' : '#ff4757';
  const bgGlow = isProfit ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 71, 87, 0.15)';

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Trend',
        data: chartPoints,
        borderColor: lineColor,
        backgroundColor: bgGlow,
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointBackgroundColor: lineColor
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

function updateUI() {
  historyList.innerHTML = '';
  let balance = 0, totalIncome = 0, totalExpense = 0;

  transactions.forEach((item, index) => {
    const val = parseFloat(item.amount) || 0;
    if (item.type === 'income') {
      balance += val;
      totalIncome += val;
    } else {
      balance -= val;
      totalExpense += val;
    }

    const itemCat = item.category || 'Others';
    const itemDesc = (item.desc && item.desc.trim() !== '') ? item.desc : itemCat;
    const itemDate = item.dateTime || '';

    const li = document.createElement('li');
    li.className = `history-item ${item.type}`;
    li.innerHTML = `
      <div>
        <strong>${itemDesc}</strong> <span style="font-size:0.7rem; opacity:0.7;">(${itemCat})</span>
        <div class="history-date">${itemDate}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: bold;">₹${val.toFixed(2)}</span>
        <button class="edit-btn" onclick="editEntry(${index})">Edit</button>
      </div>
    `;
    historyList.appendChild(li);
  });

  balanceEl.innerText = `₹${balance.toFixed(2)}`;
  totalIncomeEl.innerText = `₹${totalIncome.toFixed(2)}`;
  totalExpenseEl.innerText = `₹${totalExpense.toFixed(2)}`;
  
  localStorage.setItem('transactions', JSON.stringify(transactions));
  initChart();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const index = parseInt(editIndexInput.value);
  const now = new Date();
  const dateTimeStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const selectedCat = categoryInput.value || 'Others';
  const enteredDesc = descInput.value.trim();

  const data = {
    desc: enteredDesc !== '' ? enteredDesc : selectedCat,
    amount: amountInput.value,
    category: selectedCat,
    type: typeInput.value,
    dateTime: index === -1 ? dateTimeStr : (transactions[index].dateTime || dateTimeStr)
  };

  if (index === -1) {
    transactions.push(data);
  } else {
    transactions[index] = data;
    editIndexInput.value = -1;
  }

  descInput.value = '';
  amountInput.value = '';
  categoryInput.selectedIndex = 0;
  applyLanguage(currentLang);
  updateUI();
});

window.editEntry = function(index) {
  const item = transactions[index];
  descInput.value = item.desc || '';
  amountInput.value = item.amount || '';
  categoryInput.value = item.category || 'Others';
  typeInput.value = item.type || 'expense';
  editIndexInput.value = index;
  saveBtn.innerText = i18n[currentLang].updateBtn;
};

exportBtn.addEventListener('click', () => {
  let csv = 'Description,Category,Amount,Type,Date\n';
  transactions.forEach(t => {
    csv += `"${t.desc}","${t.category}",${t.amount},${t.type},"${t.dateTime}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'Money_Tracker_History.csv');
  a.click();
});

// Google Auth Handlers
function parseJwt(token) {
  try {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function handleCredentialResponse(response) {
  const user = parseJwt(response.credential);
  if (user) {
    localStorage.setItem('googleUser', JSON.stringify(user));
    showUserProfile(user);
  }
}

function showUserProfile(user) {
  googleLoginBtn.classList.add('hidden');
  userProfileDiv.classList.remove('hidden');
  userPhoto.src = user.picture || 'https://via.placeholder.com/32';
  userName.innerText = user.name || user.email;
}

googleLogoutBtn.addEventListener('click', () => {
  localStorage.removeItem('googleUser');
  googleLoginBtn.classList.remove('hidden');
  userProfileDiv.classList.add('hidden');
});

// Settings & Events
settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

langEnBtn.addEventListener('click', () => applyLanguage('en'));
langMlBtn.addEventListener('click', () => applyLanguage('ml'));

darkModeBtn.addEventListener('click', () => applyThemeMode('dark'));
lightModeBtn.addEventListener('click', () => applyThemeMode('light'));

colorBtns.forEach(btn => {
  btn.addEventListener('click', () => applyAccentColor(btn.dataset.color));
});

googleLoginBtn.addEventListener('click', () => {
  if (window.google) {
    google.accounts.id.prompt();
  } else {
    alert("Google Sign-In ready aakan Google Cloud Console-il Client ID set cheyyanam.");
  }
});

window.onload = function() {
  applyThemeMode(currentMode);
  applyAccentColor(currentTheme);
  applyLanguage(currentLang);
  updateUI();

  const savedUser = JSON.parse(localStorage.getItem('googleUser'));
  if (savedUser) {
    showUserProfile(savedUser);
  }

  if (window.google) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse
    });
  }
};
