let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
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

// Settings Elements
const settingsBtn = document.getElementById('settings-btn');
const closeSettingsBtn = document.getElementById('close-settings');
const settingsModal = document.getElementById('settings-modal');
const darkModeBtn = document.getElementById('dark-mode-btn');
const lightModeBtn = document.getElementById('light-mode-btn');
const colorBtns = document.querySelectorAll('.color-btn');

function initChart(income, expense) {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (myChart) myChart.destroy();

  myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#00ff87', '#ff4757'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#ffffff' } }
      }
    }
  });
}

function updateUI() {
  historyList.innerHTML = '';
  let balance = 0, totalIncome = 0, totalExpense = 0;

  transactions.forEach((item, index) => {
    const val = parseFloat(item.amount);
    if (item.type === 'income') {
      balance += val;
      totalIncome += val;
    } else {
      balance -= val;
      totalExpense += val;
    }

    const li = document.createElement('li');
    li.className = `history-item ${item.type}`;
    li.innerHTML = `
      <div>
        <strong>${item.desc} (${item.category})</strong>
        <div class="history-date">${item.dateTime}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
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
  initChart(totalIncome, totalExpense);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const index = parseInt(editIndexInput.value);
  const now = new Date();
  const dateTimeStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const data = {
    desc: descInput.value,
    amount: amountInput.value,
    category: categoryInput.value,
    type: typeInput.value,
    dateTime: index === -1 ? dateTimeStr : transactions[index].dateTime
  };

  if (index === -1) {
    transactions.push(data);
  } else {
    transactions[index] = data;
    editIndexInput.value = -1;
    saveBtn.innerText = 'Save Entry';
  }

  descInput.value = '';
  amountInput.value = '';
  categoryInput.selectedIndex = 0;
  updateUI();
});

window.editEntry = function(index) {
  const item = transactions[index];
  descInput.value = item.desc;
  amountInput.value = item.amount;
  categoryInput.value = item.category;
  typeInput.value = item.type;
  editIndexInput.value = index;
  saveBtn.innerText = 'Update Entry';
};

// Export to CSV
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

// Google Sign-In Handler
window.handleCredentialResponse = function(response) {
  const responsePayload = parseJwt(response.credential);
  document.getElementById('user-info').innerText = `Signed in as: ${responsePayload.name}`;
};

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(window.atob(base64));
}

// Modal & Settings
settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

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

updateUI();
