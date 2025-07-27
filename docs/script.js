// API Configuration
const API_BASE_URL = 'http://localhost:8000'; // Change to your backend URL
let currentUser = null;
let accessToken = localStorage.getItem('access_token');

// DOM Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const closeModal = document.querySelectorAll('.close-modal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const campaignForm = document.getElementById('campaignForm');
const generateBtn = document.getElementById('generateCampaignBtn');
const saveBtn = document.getElementById('saveBtn');
const exportBtn = document.getElementById('exportBtn');
const heroGenerateBtn = document.getElementById('heroGenerateBtn');
const campaignCards = document.querySelector('.campaign-cards');
const analyticsData = document.getElementById('analyticsData');

// Modal Controls
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
    registerModal.style.display = 'none';
});

registerBtn.addEventListener('click', () => {
    registerModal.style.display = 'flex';
    loginModal.style.display = 'none';
});

showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
});

closeModal.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal || e.target === registerModal) {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    }
});

// User Authentication
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
        }

        const data = await response.json();
        accessToken = data.access_token;
        localStorage.setItem('access_token', accessToken);

        // Get user details
        const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (userResponse.ok) {
            currentUser = await userResponse.json();
            updateUIAfterLogin();
            showNotification('Login successful!');
            loginModal.style.display = 'none';
        } else {
            throw new Error('Failed to fetch user details');
        }
    } catch (error) {
        showNotification(error.message, true);
        console.error('Login error:', error);
    }
}

async function registerUser(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                full_name: name,
                password: password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Registration failed');
        }

        const data = await response.json();
        showNotification('Registration successful! Please login.');
        registerModal.style.display = 'none';
        loginModal.style.display = 'flex';
    } catch (error) {
        showNotification(error.message, true);
        console.error('Registration error:', error);
    }
}

function updateUIAfterLogin() {
    document.querySelector('.auth-buttons').innerHTML = `
        <div class="user-info">
            <span>Hi, ${currentUser.full_name}</span>
            <button class="secondary-button" id="logoutBtn">Logout</button>
        </div>
    `;

    document.getElementById('logoutBtn').addEventListener('click', logoutUser);

    // Load user campaigns
    loadUserCampaigns();
    loadAnalytics();
}

function logoutUser() {
    localStorage.removeItem('access_token');
    accessToken = null;
    currentUser = null;
    document.querySelector('.auth-buttons').innerHTML = `
        <button class="secondary-button" id="loginBtn">Login</button>
        <button class="cta-button" id="registerBtn">Register</button>
    `;

    // Reattach event listeners
    document.getElementById('loginBtn').addEventListener('click', () => loginModal.style.display = 'flex');
    document.getElementById('registerBtn').addEventListener('click', () => registerModal.style.display = 'flex');

    // Clear campaigns
    campaignCards.innerHTML = '';
    analyticsData.innerHTML = '';

    showNotification('Logged out successfully');
}

// Form Event Listeners
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    loginUser(email, password);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;

    if (password !== confirm) {
        showNotification('Passwords do not match', true);
        return;
    }

    registerUser(name, email, password);
});

// Campaign Generation
generateBtn.addEventListener('click', generateCampaign);
heroGenerateBtn.addEventListener('click', () => {
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
});

async function generateCampaign() {
    if (!accessToken) {
        showNotification('Please login to generate campaigns', true);
        loginModal.style.display = 'flex';
        return;
    }

    const product = document.getElementById('product').value;
    const audience = document.getElementById('audience').value;
    const tone = document.getElementById('tone').value;
    const language = document.getElementById('language').value;
    const details = document.getElementById('details').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-campaign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                product: product,
                audience: audience,
                tone: tone,
                language: language,
                details: details
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to generate campaign');
        }

        const campaign = await response.json();

        // Update UI with generated content
        document.getElementById('adCopy').textContent = campaign.ad_copy;
        document.getElementById('socialMedia').textContent = campaign.social_media;
        document.getElementById('quote').textContent = campaign.quote;

        // Show image if available
        // Display Google Image search link instead of actual image
        // Show Google Images search link instead of image
        const imageContainer = document.getElementById('aiImage');
        if (campaign.image_url) {
            imageContainer.innerHTML = `
        <a href="${campaign.image_url}" target="_blank" class="cta-button">
            View Related Images on Google
        </a>
    `;
        } else {
            imageContainer.innerHTML = `<p>No image available</p>`;
        }


        // Scroll to preview section
        document.getElementById('preview').scrollIntoView({ behavior: 'smooth' });

        showNotification('Campaign generated successfully!');
    } catch (error) {
        showNotification(error.message, true);
        console.error('Campaign generation error:', error);
    }
}

saveBtn.addEventListener('click', async () => {
    if (!accessToken) {
        showNotification('Please login to save campaigns', true);
        loginModal.style.display = 'flex';
        return;
    }

    const product = document.getElementById('product').value;
    const audience = document.getElementById('audience').value;
    const tone = document.getElementById('tone').value;
    const language = document.getElementById('language').value;
    const adCopy = document.getElementById('adCopy').textContent;
    const socialMedia = document.getElementById('socialMedia').textContent;
    const quote = document.getElementById('quote').textContent;
    const imageUrl = document.querySelector('#aiImage a')?.href || '';


    try {
        const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                title: product,
                product: product,
                audience: audience,
                tone: tone,
                language: language,
                ad_copy: adCopy,
                social_media: socialMedia,
                quote: quote,
                image_url: imageUrl
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to save campaign');
        }

        const savedCampaign = await response.json();
        loadUserCampaigns();
        showNotification('Campaign saved successfully!');
    } catch (error) {
        showNotification(error.message, true);
        console.error('Save campaign error:', error);
    }
});
exportBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Fetch the live preview content
    const productTitle = document.getElementById('product').value || 'Marketing Campaign';
    const adCopy = document.getElementById('adCopy').textContent || 'No Ad Copy';
    const socialMedia = document.getElementById('socialMedia').textContent || 'No Social Content';
    const quote = document.getElementById('quote').textContent || 'No Quote';
    const imageUrl = document.querySelector('#aiImage a')?.href || '';

    let y = 10;
    doc.setFontSize(16);
    doc.text(productTitle, 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Ad Copy:', 10, y);
    y += 8;
    const adLines = doc.splitTextToSize(adCopy, 180);
    doc.text(adLines, 10, y);
    y += adLines.length * 7;

    doc.text('Social Media Post:', 10, y);
    y += 8;
    const smLines = doc.splitTextToSize(socialMedia, 180);
    doc.text(smLines, 10, y);
    y += smLines.length * 7;

    doc.text('Quote:', 10, y);
    y += 8;
    const quoteLines = doc.splitTextToSize(quote, 180);
    doc.text(quoteLines, 10, y);
    y += quoteLines.length * 7;

    if (imageUrl) {
        doc.text('Image Link:', 10, y);
        y += 8;
        doc.setTextColor(0, 0, 255); // blue for link
        doc.textWithLink(imageUrl, 10, y, { url: imageUrl });
    }

    doc.save(`${productTitle.trim().replace(/\s+/g, '_')}_campaign.pdf`);
    showNotification('PDF downloaded!');
});

// Load User Campaigns
async function loadUserCampaigns() {
    if (!accessToken) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load campaigns');
        }

        const campaigns = await response.json();
        renderCampaigns(campaigns);
    } catch (error) {
        console.error('Error loading campaigns:', error);
    }
}

function renderCampaigns(campaigns) {
    campaignCards.innerHTML = '';

    campaigns.forEach(campaign => {
        const campaignCard = document.createElement('div');
        campaignCard.className = 'campaign-card';
        campaignCard.innerHTML = `
            <h4>${campaign.title}</h4>
            <p>${campaign.product} for ${campaign.audience}</p>
            <div class="campaign-stats">
                <span><i class="fas fa-calendar"></i> ${new Date(campaign.created_at).toLocaleDateString()}</span>
                <span><i class="fas fa-eye"></i> ${campaign.analytics?.impressions || 0}</span>
            </div>
        `;
        campaignCards.appendChild(campaignCard);
    });
}

// Load Analytics
async function loadAnalytics() {
    if (!accessToken) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/analytics`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load analytics');
        }

        const analytics = await response.json();
        renderAnalytics(analytics);
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function renderAnalytics(analytics) {
    analyticsData.innerHTML = '';

    analytics.forEach(item => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '15px';
        row.style.padding = '10px';
        row.style.background = 'rgba(15, 23, 42, 0.2)';
        row.style.borderRadius = '8px';

        row.innerHTML = `
            <div style="flex: 2;">${item.campaign.title}</div>
            <div style="flex: 1;">${item.impressions}</div>
            <div style="flex: 1;">${item.clicks}</div>
            <div style="flex: 1;">${item.conversion_rate}%</div>
        `;

        analyticsData.appendChild(row);
    });
}

// Notification System
function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.backgroundColor = isError ? '#dc2626' : '#10b981';
    notification.style.color = 'white';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    notification.style.zIndex = '10000';
    notification.style.transition = 'opacity 0.3s';
    notification.style.opacity = '0';

    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (accessToken) {
        // Fetch user data
        fetch(`${API_BASE_URL}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Invalid token');
                }
            })
            .then(user => {
                currentUser = user;
                updateUIAfterLogin();
            })
            .catch(error => {
                console.error('Authentication error:', error);
                localStorage.removeItem('access_token');
                accessToken = null;
            });
    }

    // Load sample analytics data
    loadAnalytics();
});

// function showOnlySection(idToShow) {
//     const sections = ['dashboard', 'features', 'demo', 'analytics'];
//     sections.forEach(id => {
//         const section = document.getElementById(id);
//         if (section) {
//             section.style.display = (id === idToShow) ? 'block' : 'none';
//         }
//     });
// }

// // Navigation links
// document.querySelector('a[href="#dashboard"]').addEventListener('click', (e) => {
//     e.preventDefault();
//     showOnlySection('dashboard');
// });

// document.querySelector('a[href="#features"]').addEventListener('click', (e) => {
//     e.preventDefault();
//     showOnlySection('features');
// });

// document.querySelector('a[href="#demo"]').addEventListener('click', (e) => {
//     e.preventDefault();
//     showOnlySection('demo');
// });

// document.querySelector('a[href="#analytics"]').addEventListener('click', (e) => {
//     e.preventDefault();
//     showOnlySection('analytics');
// });
