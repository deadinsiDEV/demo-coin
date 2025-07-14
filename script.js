// Local storage keys
const USERS_KEY = 'bitcoinDemoUsers';
const CURRENT_USER_KEY = 'bitcoinDemoCurrentUser';
const SETTINGS_KEY = 'bitcoinDemoSettings';

// API settings
const API_URL = 'https://api.coingecko.com/api/v3';
const CURRENCY = 'try'; // Default currency

// App state (add to existing state)
let currentTimePeriodIndex = 0;
const timePeriods = [
    { label: '24 Saat', value: '24h' },
    { label: '1 Hafta', value: '7d' },
    { label: '1 Ay', value: '30d' },
    { label: '3 Ay', value: '90d' },
    { label: '1 Yıl', value: '1y' },
    { label: '5 Yıl', value: '5y' }
];

// App state
let currentUser = null;
let coinsData = [];
let selectedCoin = null;
let usdToTryRate = 33;
let settings = {
    theme: 'light',
    currency: 'try',
    language: 'tr',
    autoRefresh: false,
    priceAlerts: false,
    alerts: []
};
let autoRefreshInterval = null;

// Language translations
const translations = {
    tr: {
        welcome: 'Hoş Geldiniz',
        login: 'Giriş Yap',
        register: 'Kayıt Ol',
        username: 'Kullanıcı Adı',
        password: 'Şifre',
        market: 'Piyasa',
        portfolio: 'Portföyüm',
        transactions: 'İşlem Geçmişi',
        deposit: 'Para Yatır',
        buy: 'Satın Al',
        sell: 'Sat',
        settings: 'Ayarlar',
        theme: 'Tema',
        light: 'Açık Mod',
        dark: 'Koyu Mod',
        currency: 'Para Birimi',
        try: 'Türk Lirası (TL)',
        usd: 'ABD Doları (USD)',
        language: 'Dil',
        autoRefresh: 'Otomatik Yenile (30sn)',
        priceAlerts: 'Fiyat Uyarıları',
        addAlert: 'Ekle',
        noTransactions: 'Henüz işlem yapılmadı',
        emptyPortfolio: 'Portföyünüz boş',
        marketLoading: 'Piyasa verileri yükleniyor...',
        marketError: 'Piyasa verileri alınamadı',
        withdraw: 'Para Çek',
        profit: 'Kar/Zarar',
        totalInvested: 'Toplam Yatırım',
        totalPortfolioValue: 'Toplam Portföy Değeri',
        profitAmount: 'Kar/Zarar (TL)',
        profitPercentage: 'Kar/Zarar (%)',
        timePeriod: {
            '24h': '24 Saat',
            '7d': '1 Hafta',
            '30d': '1 Ay',
            '90d': '3 Ay',
            '1y': '1 Yıl',
            '5y': '5 Yıl'
        }
    },
    en: {
        welcome: 'Welcome',
        login: 'Log In',
        register: 'Sign Up',
        username: 'Username',
        password: 'Password',
        market: 'Market',
        portfolio: 'My Portfolio',
        transactions: 'Transaction History',
        deposit: 'Deposit',
        buy: 'Buy',
        sell: 'Sell',
        settings: 'Settings',
        theme: 'Theme',
        light: 'Light Mode',
        dark: 'Dark Mode',
        currency: 'Currency',
        try: 'Turkish Lira (TL)',
        usd: 'US Dollar (USD)',
        language: 'Language',
        autoRefresh: 'Auto Refresh (30s)',
        priceAlerts: 'Price Alerts',
        addAlert: 'Add',
        noTransactions: 'No transactions yet',
        emptyPortfolio: 'Your portfolio is empty',
        marketLoading: 'Loading market data...',
        marketError: 'Failed to load market data',
        withdraw: 'Withdraw',
        profit: 'Profit/Loss',
        totalInvested: 'Total Invested',
        totalPortfolioValue: 'Total Portfolio Value',
        profitAmount: 'Profit/Loss (TL)',
        profitPercentage: 'Profit/Loss (%)',
        timePeriod: {
            '24h': '24 Hours',
            '7d': '1 Week',
            '30d': '1 Month',
            '90d': '3 Months',
            '1y': '1 Year',
            '5y': '5 Years'
        }
    }
};

// DOM loaded
document.addEventListener('DOMContentLoaded', async function() {
    loadSettings();
    applyTranslations();
    await fetchExchangeRate();
    await checkAuthStatus();
    document.getElementById('price-alerts').addEventListener('change', togglePriceAlerts);
});

// Load settings
function loadSettings() {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }
    applySettings();
}

// Apply settings
function applySettings() {
    // Theme
    document.body.className = settings.theme === 'dark' ? 'dark-mode' : '';
    document.getElementById('theme-select').value = settings.theme;

    // Currency
    document.getElementById('currency-select').value = settings.currency;

    // Language
    document.getElementById('language-select').value = settings.language;
    applyTranslations();

    // Auto-refresh
    document.getElementById('auto-refresh').checked = settings.autoRefresh;
    toggleAutoRefresh();

    // Price alerts
    document.getElementById('price-alerts').checked = settings.priceAlerts;
    togglePriceAlerts();
}

// Apply translations
function applyTranslations() {
    const lang = settings.language;
    document.querySelector('.auth-form h2').textContent = translations[lang].welcome;
    document.querySelector('.tab-btn:nth-child(1)').textContent = translations[lang].login;
    document.querySelector('.tab-btn:nth-child(2)').textContent = translations[lang].register;
    document.getElementById('login-username').placeholder = translations[lang].username;
    document.getElementById('login-password').placeholder = translations[lang].password;
    document.getElementById('register-username').placeholder = translations[lang].username;
    document.getElementById('register-password').placeholder = translations[lang].password;
    document.querySelector('#login-form button').textContent = translations[lang].login;
    document.querySelector('#register-form button').textContent = translations[lang].register;
    document.querySelector('.market-section h2 .section-title').textContent = translations[lang].market;
    document.querySelector('.portfolio-section h2 .section-title').textContent = translations[lang].portfolio;
    document.querySelector('.transaction-section h2 .section-title').textContent = translations[lang].transactions;
    document.querySelector('#deposit-modal h3').textContent = translations[lang].deposit;
    document.querySelector('#deposit-modal button').textContent = translations[lang].deposit;
    document.querySelector('.profit-section h2 .section-title').textContent = translations[lang].profit;
    document.getElementById('time-period-btn').textContent = translations[lang].timePeriod[timePeriods[currentTimePeriodIndex].value];
    updateProfitInfo(); // Update profit section translations
}

// Save settings
function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Fetch USD to TRY exchange rate
async function fetchExchangeRate() {
    try {
        const response = await fetch(`${API_URL}/simple/price?ids=usd&vs_currencies=try`);
        const data = await response.json();
        usdToTryRate = data.usd.try;
    } catch (error) {
        console.error('Döviz kuru alınırken hata:', error);
    }
}

// Check auth status
async function checkAuthStatus() {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (userJson) {
        currentUser = JSON.parse(userJson);
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        updateUserInfo();
        await fetchMarketData();
        loadTransactions();
        updatePortfolio();
        checkPriceAlerts();
    }
}

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.form-content').forEach(form => form.style.display = 'none');
    
    if (tabName === 'login') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('login-form').style.display = 'block';
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('register-form').style.display = 'block';
    }
}

// Register
function register() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    
    if (!username || !password) {
        alert(translations[settings.language].username + ' ve ' + translations[settings.language].password + ' gerekli!');
        return;
    }
    
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    
    if (users.some(user => user.username === username)) {
        alert('Bu kullanıcı adı zaten alınmış!');
        return;
    }
    
    const newUser = {
        username,
        password: btoa(password),
        balance: 1000,
        portfolio: {},
        transactions: []
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    alert('Kayıt başarılı! Giriş yapabilirsiniz.');
    switchTab('login');
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
}

// Login
function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!username || !password) {
        alert(translations[settings.language].username + ' ve ' + translations[settings.language].password + ' gerekli!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user = users.find(u => u.username === username && u.password === btoa(password));
    
    if (!user) {
        alert('Geçersiz kullanıcı adı veya şifre!');
        return;
    }
    
    currentUser = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    
    updateUserInfo();
    fetchMarketData();
    loadTransactions();
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem(CURRENT_USER_KEY);
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('coin-list').innerHTML = `<div class="empty-portfolio">${translations[settings.language].marketLoading}</div>`;
}

// Update user info
function updateUserInfo() {
    if (!currentUser) return;
    
    document.getElementById('welcome-message').textContent = `${translations[settings.language].welcome}, ${currentUser.username}`;
    
    const balance = settings.currency === 'try' ? currentUser.balance : currentUser.balance / usdToTryRate;
    const balanceSymbol = settings.currency === 'try' ? 'TL' : 'USD';
    
    document.getElementById('balance-tl').textContent = `${balance.toFixed(2)} ${balanceSymbol}`;
    document.getElementById('balance-usd').textContent = settings.currency === 'try' 
        ? `(${(currentUser.balance / usdToTryRate).toFixed(2)} USD)` 
        : `(${(currentUser.balance).toFixed(2)} TL)`;
    
    updatePortfolio();
    updateProfitInfo(); // Add this
}

function cycleTimePeriod() {
    currentTimePeriodIndex = (currentTimePeriodIndex + 1) % timePeriods.length;
    document.getElementById('time-period-btn').textContent = translations[settings.language].timePeriod[timePeriods[currentTimePeriodIndex].value];
    updateProfitInfo();
}

async function updateProfitInfo() {
    if (!currentUser || !currentUser.transactions || !currentUser.portfolio || !coinsData.length) {
        document.getElementById('profit-info').innerHTML = `<div class="empty-portfolio">${translations[settings.language].emptyPortfolio}</div>`;
        return;
    }

    // Toplam yatırımı al
    let totalInvested = currentUser.totalInvested || 0;

    // Toplam portföy değerini hesapla
    let totalPortfolioValue = 0;
    const selectedPeriod = timePeriods[currentTimePeriodIndex].value;
    Object.entries(currentUser.portfolio).forEach(([coinId, data]) => {
        const coin = coinsData.find(c => c.id === coinId);
        if (coin) {
            let price;
            if (coin.historicalPrices && coin.historicalPrices[selectedPeriod]) {
                price = settings.currency === 'try' ? coin.historicalPrices[selectedPeriod] : coin.historicalPrices[selectedPeriod] / usdToTryRate;
            } else {
                price = settings.currency === 'try' ? coin.current_price : coin.current_price / usdToTryRate;
            }
            totalPortfolioValue += data.amount * price;
        }
    });

    // Kar/zarar hesapla
    const profitAmount = totalPortfolioValue - totalInvested;
    const profitPercentage = totalInvested > 0 ? (profitAmount / totalInvested) * 100 : 0;

    // DOM'u güncelle
    const profitInfoEl = document.getElementById('profit-info');
    profitInfoEl.innerHTML = `
        <div class="profit-item">
            <span>${translations[settings.language].totalInvested}:</span>
            <span id="total-invested">${totalInvested.toFixed(2)} ${settings.currency.toUpperCase()}</span>
        </div>
        <div class="profit-item">
            <span>${translations[settings.language].totalPortfolioValue}:</span>
            <span id="total-portfolio-value">${totalPortfolioValue.toFixed(2)} ${settings.currency.toUpperCase()}</span>
        </div>
        <div class="profit-item">
            <span>${translations[settings.language].profitAmount}:</span>
            <span id="profit-amount" class="profit-amount ${profitAmount >= 0 ? 'positive' : 'negative'}">${profitAmount.toFixed(2)} ${settings.currency.toUpperCase()}</span>
        </div>
        <div class="profit-item">
            <span>${translations[settings.language].profitPercentage}:</span>
            <span id="profit-percentage" class="profit-percentage ${profitPercentage >= 0 ? 'positive' : 'negative'}">${profitPercentage.toFixed(2)}%</span>
        </div>
    `;
}

async function fetchMarketData() {
    try {
        const coins = ['bitcoin', 'ethereum', 'ripple', 'cardano', 'solana'];
        const response = await fetch(`${API_URL}/coins/markets?vs_currency=${settings.currency}&ids=${coins.join(',')}&price_change_percentage=24h,7d,30d`);
        coinsData = await response.json();

        // Fetch historical data for each coin
        for (let coin of coinsData) {
            const days = {
                '24h': 1,
                '7d': 7,
                '30d': 30,
                '90d': 90,
                '1y': 365,
                '5y': 1825
            };
            coin.historicalPrices = {};
            for (const [period, daysValue] of Object.entries(days)) {
                try {
                    const histResponse = await fetch(`${API_URL}/coins/${coin.id}/market_chart?vs_currency=${settings.currency}&days=${daysValue}`);
                    const histData = await histResponse.json();
                    // Get the most recent price from the historical data
                    const lastPrice = histData.prices[histData.prices.length - 1][1];
                    coin.historicalPrices[period] = lastPrice;
                } catch (error) {
                    console.error(`Failed to fetch historical data for ${coin.id} for ${period}:`, error);
                    coin.historicalPrices[period] = coin.current_price; // Fallback to current price
                }
            }
        }

        renderCoinList();
        updateProfitInfo();
        checkPriceAlerts();
    } catch (error) {
        console.error('Piyasa verileri alınırken hata:', error);
        document.getElementById('coin-list').innerHTML = `<div class="empty-portfolio">${translations[settings.language].marketError}</div>`;
    }
}

function showWithdrawModal() {
    document.getElementById('withdraw-amount').value = '';
    document.getElementById('withdraw-modal').style.display = 'flex';
}

function withdrawMoney() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('Geçerli bir miktar girin!');
        return;
    }
    
    if (amount > currentUser.balance) {
        alert('Yetersiz bakiye!');
        return;
    }
    
    currentUser.balance -= amount;
    if (!currentUser.transactions) {
        currentUser.transactions = [];
    }
    currentUser.transactions.push({
        type: 'withdraw',
        amount,
        timestamp: new Date().toISOString()
    });
    updateUserInStorage();
    updateUserInfo();
    renderTransactionList(currentUser.transactions);
    closeModal();
    alert(`${amount.toFixed(2)} ${settings.currency.toUpperCase()} hesabınızdan çekildi.`);
}

// Render coin list
function renderCoinList() {
    const coinListEl = document.getElementById('coin-list');
    coinListEl.innerHTML = '';
    
    if (!coinsData.length) {
        coinListEl.innerHTML = `<div class="empty-portfolio">${translations[settings.language].marketLoading}</div>`;
        return;
    }
    
    coinsData.forEach(coin => {
        const coinItem = document.createElement('div');
        coinItem.className = 'coin-item';
        coinItem.onclick = () => showBuyModal(coin);
        
        const price = settings.currency === 'try' ? coin.current_price : coin.current_price / usdToTryRate;
        coinItem.innerHTML = `
            <div class="coin-info">
                <img src="${coin.image}" alt="${coin.name}" class="coin-icon">
                <div>
                    <div class="coin-name">${coin.name}</div>
                    <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
                </div>
            </div>
            <div class="coin-price-info">
                <div class="coin-price">${price.toFixed(2)} ${settings.currency.toUpperCase()}</div>
                <div class="coin-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                    ${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%
                </div>
            </div>
            <button class="buy-btn" onclick="event.stopPropagation(); showBuyModal('${coin.id}')">${translations[settings.language].buy}</button>
        `;
        
        coinListEl.appendChild(coinItem);
    });
}

// Update portfolio
function updatePortfolio() {
    const portfolioListEl = document.getElementById('portfolio-list');
    portfolioListEl.innerHTML = '';
    
    if (!currentUser.portfolio || Object.keys(currentUser.portfolio).length === 0) {
        portfolioListEl.innerHTML = `<div class="empty-portfolio">${translations[settings.language].emptyPortfolio}</div>`;
        return;
    }
    
    Object.entries(currentUser.portfolio).forEach(([coinId, data]) => {
        const coin = coinsData.find(c => c.id === coinId);
        if (!coin) return;
        
        const totalValue = data.amount * (settings.currency === 'try' ? coin.current_price : coin.current_price / usdToTryRate);
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        
        portfolioItem.innerHTML = `
            <div class="coin-info">
                <img src="${coin.image}" alt="${coin.name}" class="coin-icon">
                <div>
                    <div class="coin-name">${coin.name}</div>
                    <div class="coin-symbol">${coin.symbol.toUpperCase()}</div>
                </div>
            </div>
            <div class="portfolio-value">
                <div class="portfolio-amount">${data.amount.toFixed(6)} ${coin.symbol.toUpperCase()}</div>
                <div class="portfolio-profit ${totalValue >= 0 ? 'positive' : 'negative'}">${totalValue.toFixed(2)} ${settings.currency.toUpperCase()}</div>
            </div>
            <button class="sell-btn" onclick="showSellModal('${coin.id}')">${translations[settings.language].sell}</button>
        `;
        
        portfolioListEl.appendChild(portfolioItem);
    });
}

// Toggle portfolio view
function togglePortfolioView(view) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('portfolio-list').style.display = view === 'list' ? 'flex' : 'none';
    document.getElementById('portfolio-chart').style.display = view === 'chart' ? 'block' : 'none';
    document.querySelector(`.view-btn[onclick="togglePortfolioView('${view}')"]`).classList.add('active');
    
    if (view === 'chart') {
        renderPortfolioChart();
    }
}

// Render portfolio chart (placeholder)
function renderPortfolioChart() {
    const chartEl = document.getElementById('portfolio-chart');
    chartEl.innerHTML = `<div class="empty-portfolio">Portföy grafiği (Gelecekte eklenecek)</div>`;
}

// Load transactions
function loadTransactions() {
    if (currentUser.transactions) {
        renderTransactionList(currentUser.transactions);
    } else {
        currentUser.transactions = [];
        renderTransactionList(currentUser.transactions);
    }
}

function renderTransactionList(transactions) {
    const transactionListEl = document.getElementById('transaction-list');
    transactionListEl.innerHTML = '';
    
    if (!transactions.length) {
        transactionListEl.innerHTML = `<div class="empty-portfolio">${translations[settings.language].noTransactions}</div>`;
        return;
    }
    
    transactions.forEach(tx => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        const date = new Date(tx.timestamp).toLocaleString(settings.language);
        transactionItem.innerHTML = `
            <div>${tx.type === 'deposit' ? translations[settings.language].deposit : 
                   tx.type === 'buy' ? translations[settings.language].buy : 
                   tx.type === 'sell' ? translations[settings.language].sell : 
                   translations[settings.language].withdraw}</div>
            <div>${tx.coin ? `${tx.amount.toFixed(6)} ${tx.coin.toUpperCase()}` : `${tx.amount.toFixed(2)} ${settings.currency.toUpperCase()}`}</div>
            <div>${date}</div>
        `;
        transactionListEl.appendChild(transactionItem);
    });
}

// Show deposit modal
function showDepositModal() {
    document.getElementById('deposit-amount').value = '';
    document.getElementById('deposit-modal').style.display = 'flex';
}

// Show buy modal
function showBuyModal(coinId) {
    const coin = coinsData.find(c => c.id === coinId);
    if (!coin) return;
    
    selectedCoin = coin;
    
    document.getElementById('buy-modal-title').textContent = `${coin.name} (${coin.symbol.toUpperCase()}) ${translations[settings.language].buy}`;
    const price = settings.currency === 'try' ? coin.current_price : coin.current_price / usdToTryRate;
    document.getElementById('buy-coin-price').textContent = `${price.toFixed(2)} ${settings.currency.toUpperCase()}`;
    document.getElementById('buy-coin-change').textContent = `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%`;
    document.getElementById('buy-coin-change').className = `coin-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`;
    document.getElementById('buy-coin-symbol').textContent = coin.symbol.toUpperCase();
    document.getElementById('buy-amount').value = '';
    document.getElementById('buy-coin-amount').textContent = '0';
    
    const buyAmountInput = document.getElementById('buy-amount');
    buyAmountInput.oninput = function() {
        const tlAmount = parseFloat(this.value) || 0;
        const coinAmount = tlAmount / (settings.currency === 'try' ? coin.current_price : coin.current_price / usdToTryRate);
        document.getElementById('buy-coin-amount').textContent = coinAmount.toFixed(6);
    };
    
    document.getElementById('buy-modal').style.display = 'flex';
}

// Show sell modal
function showSellModal(coinId) {
    const coin = coinsData.find(c => c.id === coinId);
    if (!coin) return;
    
    selectedCoin = coin;
    
    document.getElementById('sell-modal-title').textContent = `${coin.name} (${coin.symbol.toUpperCase()}) ${translations[settings.language].sell}`;
    const price = settings.currency === 'try' ? coin.current_price : coin.current_price / usdToTryRate;
    document.getElementById('sell-coin-price').textContent = `${price.toFixed(2)} ${settings.currency.toUpperCase()}`;
    document.getElementById('sell-coin-change').textContent = `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%`;
    document.getElementById('sell-coin-change').className = `coin-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`;
    document.getElementById('sell-amount').value = '';
    document.getElementById('sell-tl-amount').textContent = '0';
    
    const sellAmountInput = document.getElementById('sell-amount');
    sellAmountInput.oninput = function() {
        const coinAmount = parseFloat(this.value) || 0;
        const tlAmount = coinAmount * (settings.currency === 'try' ? coin.current_price : coin.current_price / usdToTryRate);
        document.getElementById('sell-tl-amount').textContent = tlAmount.toFixed(2);
    };
    
    document.getElementById('sell-modal').style.display = 'flex';
}

// Show settings modal
function showSettingsModal() {
    document.getElementById('settings-modal').style.display = 'flex';
}

// Close modal
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Deposit money
function depositMoney() {
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('Geçerli bir miktar girin!');
        return;
    }
    
    currentUser.balance += amount;
    if (!currentUser.transactions) {
        currentUser.transactions = [];
    }
    currentUser.transactions.push({
        type: 'deposit',
        amount,
        timestamp: new Date().toISOString()
    });
    updateUserInStorage();
    updateUserInfo();
    renderTransactionList(currentUser.transactions);
    closeModal();
    alert(`${amount.toFixed(2)} ${settings.currency.toUpperCase()} hesabınıza yatırıldı.`);
}

// Buy coin
function buyCoin() {
    const tlAmount = parseFloat(document.getElementById('buy-amount').value);
    const coinAmount = tlAmount / (settings.currency === 'try' ? selectedCoin.current_price : selectedCoin.current_price / usdToTryRate);
    
    if (isNaN(tlAmount) || tlAmount <= 0) {
        alert('Geçerli bir miktar girin!');
        return;
    }
    
    if (tlAmount > currentUser.balance) {
        alert('Yetersiz bakiye!');
        return;
    }
    
    currentUser.balance -= tlAmount;
    
    if (!currentUser.portfolio) {
        currentUser.portfolio = {};
    }
    
    const currentAmount = currentUser.portfolio[selectedCoin.id]?.amount || 0;
    const currentAvgPrice = currentUser.portfolio[selectedCoin.id]?.avgBuyPrice || 0;
    const newAmount = currentAmount + coinAmount;
    const newAvgPrice = currentAmount > 0 
        ? ((currentAmount * currentAvgPrice) + tlAmount) / newAmount 
        : (settings.currency === 'try' ? selectedCoin.current_price : selectedCoin.current_price / usdToTryRate);
    
    currentUser.portfolio[selectedCoin.id] = {
        amount: newAmount,
        avgBuyPrice: newAvgPrice
    };
    
    if (!currentUser.transactions) {
        currentUser.transactions = [];
    }
    currentUser.transactions.push({
        type: 'buy',
        coin: selectedCoin.symbol.toUpperCase(),
        amount: coinAmount,
        price: settings.currency === 'try' ? selectedCoin.current_price : selectedCoin.current_price / usdToTryRate,
        timestamp: new Date().toISOString()
    });
    
    // Toplam yatırımı güncelle
    updateTotalInvested(tlAmount);
    
    updateUserInStorage();
    updateUserInfo();
    renderTransactionList(currentUser.transactions);
    updateProfitInfo();
    closeModal();
    alert(`${coinAmount.toFixed(6)} ${selectedCoin.symbol.toUpperCase()} ${translations[settings.language].buy.toLowerCase()} alındı.`);
}

// Sell coin
function sellCoin() {
    const coinAmount = parseFloat(document.getElementById('sell-amount').value);
    const tlAmount = coinAmount * (settings.currency === 'try' ? selectedCoin.current_price : selectedCoin.current_price / usdToTryRate);
    
    if (isNaN(coinAmount) || coinAmount <= 0) {
        alert('Geçerli bir miktar girin!');
        return;
    }
    
    const availableAmount = currentUser.portfolio[selectedCoin.id]?.amount || 0;
    if (coinAmount > availableAmount) {
        alert('Yeterli coin miktarınız yok!');
        return;
    }
    
    // Ortalama alış fiyatını al
    const avgBuyPrice = currentUser.portfolio[selectedCoin.id]?.avgBuyPrice || selectedCoin.current_price;
    
    // Toplam yatırımdan satılan miktarı çıkar
    const soldInvestment = coinAmount * avgBuyPrice;
    
    currentUser.balance += tlAmount;
    currentUser.portfolio[selectedCoin.id].amount -= coinAmount;
    
    if (currentUser.portfolio[selectedCoin.id].amount <= 0) {
        delete currentUser.portfolio[selectedCoin.id];
    }
    
    if (!currentUser.transactions) {
        currentUser.transactions = [];
    }
    currentUser.transactions.push({
        type: 'sell',
        coin: selectedCoin.symbol.toUpperCase(),
        amount: coinAmount,
        price: settings.currency === 'try' ? selectedCoin.current_price : selectedCoin.current_price / usdToTryRate,
        timestamp: new Date().toISOString()
    });
    
    // Toplam yatırımı güncelle
    updateTotalInvested(-soldInvestment);
    
    updateUserInStorage();
    updateUserInfo();
    renderTransactionList(currentUser.transactions);
    updateProfitInfo();
    closeModal();
    alert(`${coinAmount.toFixed(6)} ${selectedCoin.symbol.toUpperCase()} ${translations[settings.language].sell.toLowerCase()} satıldı. ${tlAmount.toFixed(2)} ${settings.currency.toUpperCase()} hesabınıza eklendi.`);
}

function updateTotalInvested(amount) {
    if (!currentUser.totalInvested) {
        currentUser.totalInvested = 0;
    }
    currentUser.totalInvested += amount;
    if (currentUser.totalInvested < 0) {
        currentUser.totalInvested = 0; // Negatif yatırım olamaz
    }
    updateUserInStorage();
}

// Update user in storage
function updateUserInStorage() {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
}

// Save transactions
function saveTransactions() {
    updateUserInStorage();
}

// Change theme
function changeTheme() {
    settings.theme = document.getElementById('theme-select').value;
    document.body.className = settings.theme === 'dark' ? 'dark-mode' : '';
    saveSettings();
}

function changeCurrency() {
    settings.currency = document.getElementById('currency-select').value;
    saveSettings();
    updateUserInfo();
    fetchMarketData();
    updateProfitInfo(); // Add this
}

function changeLanguage() {
    settings.language = document.getElementById('language-select').value;
    saveSettings();
    applyTranslations();
    updateUserInfo();
    renderCoinList();
    renderTransactionList(currentUser.transactions);
    updateProfitInfo(); // Add this
}

// Toggle auto-refresh
function toggleAutoRefresh() {
    settings.autoRefresh = document.getElementById('auto-refresh').checked;
    saveSettings();
    if (settings.autoRefresh) {
        autoRefreshInterval = setInterval(fetchMarketData, 30000);
    } else {
        clearInterval(autoRefreshInterval);
    }
}

// Toggle price alerts
function togglePriceAlerts() {
    settings.priceAlerts = document.getElementById('price-alerts').checked;
    document.getElementById('price-alert-settings').style.display = settings.priceAlerts ? 'block' : 'none';
    saveSettings();
}

// Add price alert
function addPriceAlert() {
    const coinId = document.getElementById('alert-coin').value.trim().toLowerCase();
    const price = parseFloat(document.getElementById('alert-price').value);
    
    if (!coinId || isNaN(price) || price <= 0) {
        alert('Geçerli bir coin ve fiyat girin!');
        return;
    }
    
    settings.alerts.push({ coinId, price });
    saveSettings();
    document.getElementById('alert-coin').value = '';
    document.getElementById('alert-price').value = '';
    alert('Fiyat uyarısı eklendi!');
}

// Check price alerts
function checkPriceAlerts() {
    if (!settings.priceAlerts) return;
    
    settings.alerts.forEach(alert => {
        const coin = coinsData.find(c => c.id === alert.coinId);
        if (coin && coin.current_price >= alert.price) {
            document.getElementById('alert-message').textContent = `${coin.name} fiyatı ${alert.price} ${settings.currency.toUpperCase()} seviyesine ulaştı!`;
            document.getElementById('price-alert-modal').style.display = 'flex';
            settings.alerts = settings.alerts.filter(a => a !== alert);
            saveSettings();
        }
    });
}
