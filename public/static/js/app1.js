(() => {
  'use strict';

  const CURRENCIES = [
    ['USD', 'Доллар'], ['EUR', 'Евро'], ['GBP', 'Фунт']
  ];

  const $ = (s, root = document) => root.querySelector(s);

  const els = {
    amount: $('#amount'),
    from: $('#from'),
    result: $('#result')
  };
  
  function fillSelect(select) {
    CURRENCIES.forEach(([code, name]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = `${code} — ${name}`;
      select.appendChild(option);
    });
  }

  fillSelect(els.from);
  els.from.value = 'USD';
  els.amount.value = '100';

  async function fetchRates(base) {
    base = base.toUpperCase();
    const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(base)}`;
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    const data = await res.json();
    if (data && data.rates) {
      data.rates[base] = 1;
      return { base, rates: data.rates };
    }
    return { base: 'USD', rates: {} };
  }

  let state = { base: 'USD', rates: {} };

  function getRate(from, to) {
    from = from.toUpperCase();
    to = to.toUpperCase();
    const base = state.base.toUpperCase();
    if (from === to) return 1;

    const rateFrom = from === base ? 1 : state.rates[from];
    const rateTo = to === base ? 1 : state.rates[to];

    if (rateFrom == null || rateTo == null) return 0;
    return rateTo / rateFrom;
  }

  function getFmtMoney(x, code) {
    try {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 6
      }).format(x);
    } catch {
      return `${x.toFixed(4)} ${code}`;
    }
  }

  function render() {
    const amount = parseFloat(els.amount.value);
    const from = els.from.value;

    if (isNaN(amount)) {
      els.result.textContent = 'Введите сумму';
      return;
    }

    let html = `<h3>Конвертация ${getFmtMoney(amount, from)}:</h3><ul>`;
    CURRENCIES.forEach(([code]) => {
      if (!code) return;
      if (code === from) return;
      const rate = state.rates[code];
      if (!rate) return;
      const converted = amount * rate;
      html += `<li>${getFmtMoney(converted, code)}</li>`;
    });
    html += '</ul>';

    els.result.innerHTML = html;
  }

  async function boot() {
    state = await fetchRates(els.from.value);
    render();

    els.amount.addEventListener('input', render);
    els.from.addEventListener('change', async () => {
      state = await fetchRates(els.from.value);
      render();
    });
  }

  boot();
})();
