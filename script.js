document.addEventListener("DOMContentLoaded", loadData);

function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

function addTransaction() {
  const title = document.getElementById('title').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  if (title === '' || isNaN(amount) || amount <= 0) {
    alert('ദയവായി ശരിയായ വിവരങ്ങൾ നൽകുക!');
    return;
  }

  const transaction = {
    id: Date.now(),
    title,
    amount,
    type
  };

  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  document.getElementById('title').value = '';
  document.getElementById('amount').value = '';

  updateUI();
}

function deleteTransaction(id) {
  let transactions = getTransactions();
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

function updateUI() {
  const transactions = getTransactions();
  const list = document.getElementById('list');
  list.innerHTML = '';

  let balance = 0;

  transactions.forEach(t => {
    const li = document.createElement('li');
    li.classList.add(t.type);

    if (t.type === 'expense') {
      balance -= t.amount;
      li.innerHTML = `${t.title} <span>-₹${t.amount}</span> <button onclick="deleteTransaction(${t.id})" style="background:red; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">X</button>`;
    } else {
      balance += t.amount;
      li.innerHTML = `${t.title} <span>+₹${t.amount}</span> <button onclick="deleteTransaction(${t.id})" style="background:red; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">X</button>`;
    }

    list.appendChild(li);
  });

  document.getElementById('balance').innerText = `₹${balance.toFixed(2)}`;
}

function loadData() {
  updateUI();
}
