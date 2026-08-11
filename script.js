let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentLang = localStorage.getItem('appLang') || 'ml';
let myChart = null;

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

const i18n = {
  en: {
    balance: 'Balance',
    income: 'Income',
    expense: 'Expense',
    selectCat: 'Select Category',
    descPlaceholder: 'Description (e.g. Tea)',
    amountPlaceholder: 'Amount',
    saveBtn: 'SAVE ENTRY',
    updateBtn: 'UPDATE ENTRY',
    history: 'History',
    expenseOpt: 'Expense',
    incomeOpt: 'Income',
    langSetting: 'Language',
    modeSetting: 'Mode',
    accentSetting: 'Neon Accent Color'
  },
  ml: {
    balance: 'ബാക്കി തുക (Balance)',
    income: 'വരുമാനം',
    expense: 'ചെലവ്',
    selectCat: 'കാറ്റഗറി തിരഞ്ഞെടുക്കുക',
    descPlaceholder: 'വിവരണം (ഉദാ: ചായ)',
    amountPlaceholder: 'തുക (Amount)',
    saveBtn: 'സേവ് ചെയ്യുക',
    updateBtn: 'അപ്ഡേറ്റ് ചെയ്യുക',
    history: 'ചരിത്രം (History)',
    expenseOpt: 'ചെലവ് (Expense)',
    incomeOpt: 'വരുമാനം (Income)',
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

function initChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (myChart) myChart.destroy();

  const recentData = transactions.slice(-6);
  const labels = recentData.length ? recentData.map((_, i) => `#${i + 1}`) : ['1', '2', '3'];
  const dataPoints = recentData.length 
    ? recentData.map(t => parseFloat(t.amount) * (t.type === 'expense' ? -1 : 1)) 
    : [0, 0, 0];

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Flow',
        data: dataPoints,
        borderColor: '#00ff87',
        backgroundColor: 'rgba(0, 255, 135, 0.15)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 2
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

    const itemDesc = item.desc || 'No details';
    const itemCat = item.category || 'General';
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

  const data = {
    desc: descInput.value,
    amount: amountInput.value,
    category: categoryInput.value || 'Others',
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

settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

langEnBtn.addEventListener('click', () => applyLanguage('en'));
langMlBtn.addEventListener('click', () => applyLanguage('ml'));

darkModeBtn.addEventListener('click', () => {
  document.body.classList.remove('light-theme');
  darkModeBtn.classList.add('active');
  lightModeBtn.classList.remove('active');
});

lightModeBtn.addEventListener('click', () => {
  document.body.classList.add('light-theme');
  lightModeBtn.classList.add('active');
  darkModeBtn.classList.remove('active');
});

colorBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.classList.remove('theme-neon-green', 'theme-neon-cyan', 'theme-neon-pink', 'theme-neon-yellow');
    document.body.classList.add(btn.dataset.color);
  });
});

applyLanguage(currentLang);
updateUI();
