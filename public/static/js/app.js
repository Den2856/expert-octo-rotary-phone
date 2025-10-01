(() => {
  'use strict '

  const CURRENCIES = [
    ['USD', 'Доллар'], ['EUR', 'Евро'], ['GBP', 'Фунт']
  ]

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));


  const els = {
    amount: $('#amount'),
    to: $('#to'),
    from: $('#from'),
    result: $('#result'),
    ratw: $('#rate')
  }

  const fallback = {
    USD: 1,
    EUR: 0.92,
  }

  function fillS(select, excludeValue = null) {
    CURRENCIES.forEach(([code, name]) => {
      if (code===excludeValue) return;
      const option = document.createElement('option');
      option.value = code;
      option.textContent = `${code} - ${name}`;
      select.appendChild(option);
    });
  }

  fillS(els.from)
  fillS(els.to)

  els.from.value = 'USD'
  els.to.value = 'EUR'
  els.amount.value = '100'

  async function fetchRates(base) {
    base = base.toUpperCase()
    const key = `fx:${base}`

    try {
      const url = `https://api.frankfurter.dev/v1/latest?from=${encodeURIComponent(base)}`
      const res = await fetch (url, {headers: {accept: 'application/json'}})

      const data = await res.json()
      
      if(data && data.rates){
        data.rates[base] = 1
        return { base, rates: data.rates }

      }
    } catch(err){}

    return {base: 'USD', rates: {...fallback}, }
  }

  let state = {base: null, rates: null}

  function getRate(from, to){
    from = from.toUpperCase()
    to = to.toUpperCase()
    const base = state.base.toUpperCase()
    if(from === to) return 1
    const rateFrom = from = base ? 1 : state.rates[from]
    const rateTo = to = base ? 1 : state.rates[to]
    if (rateFrom == null || rateTo == null) return
    return rateTo / rateFrom
      
  }

  function getFmtMoney(x, code){
    try {
      new Intl.NumberFormat('ru-RU', {style: 'currency', currency: code, maximumFractionDigits: 6}.format.x)
    } catch {
      `${x.toFixed(4)} ${code}`
    }
  }

  function render(){
    const amount = parseFloat(els.amount.value)
    const from = els.from.value
    const to = els.to.value
    
    const r = getRate(from,to)
    const out = amount * r 

    els.result.textContent = `${getFmtMoney(amount, from)} = ${getFmtMoney(out, to)}`
    els.rate.textContent = ` 1 ${from} - ${r.toFixed(6)} ${to}`
  }
  
  async function boot() {
    render()
    [input, 'change'].forEach(evt => {
      els.amount.addEventListener(evt, render)
      els.to.addEventListener(evt, render)
    })
  }

  boot()

})()