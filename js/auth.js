document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('errorMessage');
    
    // Disable button
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span>⏳ Logging in...</span>';
    errorDiv.style.display = 'none';
    
    try {
        // Sign in to Firebase
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Cek apakah user ada di database premium_users
        const snapshot = await firebase.database().ref(`premium_users/${user.uid}`).once('value');
        const ownerSnapshot = await firebase.database().ref('settings/owner_uid').once('value');
        
        if (snapshot.exists() || user.uid === ownerSnapshot.val()) {
            // Login sukses, redirect ke dashboard
            window.location.href = 'dashboard.html';
        } else {
            // User tidak punya akses
            throw new Error('Akun tidak memiliki akses premium');
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // Tampilkan error
        errorDiv.style.display = 'block';
        errorDiv.textContent = error.message;
        
        // Enable button
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>🔓 Login ke Panel</span>';
    }
});
