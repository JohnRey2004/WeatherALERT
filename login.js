// ==========================================
// 1. TAB SWITCHING LOGIC
// ==========================================
function switchTab(tabName) {
    // Get the Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Get the Tab Buttons
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (tabName === 'login') {
        // Show Login Form
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        
        // Highlight Login Tab
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        // Show Register Form
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        
        // Highlight Register Tab
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
    }
}

// ==========================================
// 2. REGISTRATION LOGIC (With Email for Alerts)
// ==========================================
async function handleRegister(e) {
    e.preventDefault(); // Stop page reload
    const form = e.target;
    
    // --- A. GET VALUES ---
    const name = form.querySelector('[name="name"]').value;
    const role = form.querySelector('[name="role"]').value;
    const email = form.querySelector('[name="email"]').value; // Collects Email
    const phone = form.querySelector('[name="phone"]').value;
    const password = form.querySelector('[name="password"]').value;
    const consent = document.getElementById('reg-consent').checked;

    // --- B. VALIDATION ---
    if (!consent) { 
        alert("You must agree to the Data Privacy Act to register."); 
        return; 
    }
    if (role === "") {
        alert("Please select a valid Role.");
        return;
    }

    // --- C. UI FEEDBACK ---
    const btn = form.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Creating Account...";
    btn.disabled = true;

    try {
        // --- D. SEND TO PYTHON SERVER ---
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, role, email, phone, password })
        });

        const result = await response.json();

        // --- E. HANDLE RESPONSE ---
        if (result.status === 'success') {
            alert("✅ Registration Successful!\n\nYou can now sign in to receive alerts.");
            form.reset();       // Clear the inputs
            switchTab('login'); // Automatically switch to login tab
        } else {
            alert("❌ Registration Failed: " + result.message);
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("❌ Server Connection Error. Is 'app.py' running?");
    } finally {
        // Reset button state
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// ==========================================
// 3. LOGIN LOGIC
// ==========================================
async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    
    // --- A. GET VALUES ---
    // User can enter Email OR Phone in this field
    const phoneOrEmail = form.querySelector('[name="phone"]').value; 
    const password = form.querySelector('[name="password"]').value;

    // --- B. UI FEEDBACK ---
    const btn = form.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Verifying...";
    btn.disabled = true;

    try {
        // --- C. SEND TO PYTHON SERVER ---
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneOrEmail, password: password })
        });

        const result = await response.json();

        // --- D. HANDLE RESPONSE ---
        if (result.status === 'success') {
            // Success! Redirect to Dashboard
            window.location.href = "/dashboard";
        } else {
            alert("❌ Login Failed: " + result.message);
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("❌ Server Connection Error. Is 'app.py' running?");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}