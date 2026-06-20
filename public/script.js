var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c, _d, _e, _f, _g;
const API_URL = '/api';
// --- 1. DOM ELEMENTS ---
// Sections
const sectionHome = document.getElementById('section-home');
const sectionForm = document.getElementById('section-form');
const sectionDashboard = document.getElementById('section-dashboard');
const sectionContact = document.getElementById('section-contact');
const sectionLogin = document.getElementById('section-login');
const sectionProfile = document.getElementById('section-profile');
const sectionRequests = document.getElementById('section-requests');
// Navigation Buttons
const navHome = document.getElementById('nav-home');
const btnNavRegister = document.getElementById('nav-register');
const btnNavDashboard = document.getElementById('nav-dashboard');
const btnNavContact = document.getElementById('nav-contact');
const btnNavLogin = document.getElementById('nav-login');
const btnNavProfile = document.getElementById('nav-profile');
const btnNavRequests = document.getElementById('nav-requests');
const btnLogout = document.getElementById('btn-logout');
// Blood Request Modal Elements
const requestModal = document.getElementById('requestModal');
const bloodRequestForm = document.getElementById('bloodRequestForm');
const reqDonorName = document.getElementById('req-donor-name');
const reqDonorGroup = document.getElementById('req-donor-group');
const reqDonorId = document.getElementById('req-donor-id');
const reqGroupInput = document.getElementById('req-group');
// Forms
const form = document.getElementById('donationForm');
const contactForm = document.getElementById('contactForm');
const donorLoginForm = document.getElementById('donorLoginForm');
// Search & Filters
const searchInput = document.getElementById('search-input');
const filterGroup = document.getElementById('filter-group');
const filterBranch = document.getElementById('filter-branch');
// Registration Inputs
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const stuIdInput = document.getElementById('stu_id');
const ageInput = document.getElementById('age');
const branchInput = document.getElementById('branches');
const groupInput = document.getElementById('blood_group');
const collegeInput = document.getElementById('college');
const passwordInput = document.getElementById('password');
const lastDateInput = document.getElementById('lastDate');
const addressInput = document.getElementById('address');
// Table Elements
const tableBody = document.getElementById('table-body');
const emptyMsg = document.getElementById('empty-msg');
const noResultMsg = document.getElementById('no-result-msg');
let globalDonors = [];
let globalRequesterRequests = [];
// --- 2. PAGE LOAD & AUTH CHECK ---
document.addEventListener('DOMContentLoaded', () => {
    // Splash Screen
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    if (splashScreen && mainContent) {
        setTimeout(() => {
            splashScreen.classList.add('animate-fade-out');
            splashScreen.addEventListener('animationend', () => {
                splashScreen.style.display = 'none';
                mainContent.classList.remove('hidden');
                setTimeout(() => { mainContent.classList.remove('opacity-0'); }, 50);
                // Redirect check
                const showLogin = sessionStorage.getItem("showLoginAfterReload") === "true";
                sessionStorage.removeItem("showLoginAfterReload");
                if (showLogin) {
                    showSection('login');
                }
                else {
                    showSection('home');
                }
            });
        }, 100);
    }
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const donorUser = localStorage.getItem('donorUser');
    // LOGOUT BUTTON CHECK
    if ((isAdmin || donorUser) && btnLogout) {
        btnLogout.classList.remove('hidden');
        btnLogout.classList.add('text-red-500');
    }
    const mobileBtnLogout = document.getElementById('mobile-btn-logout');
    if ((isAdmin || donorUser) && mobileBtnLogout) {
        mobileBtnLogout.classList.remove('hidden');
        mobileBtnLogout.classList.add('flex');
    }
    // MENU BUTTONS CHECK FOR LOGGED IN DONOR
    if (donorUser) {
        if (btnNavProfile) {
            btnNavProfile.classList.remove('hidden');
            btnNavProfile.classList.add('flex');
        }
        if (btnNavRequests) {
            btnNavRequests.classList.remove('hidden');
            btnNavRequests.classList.add('flex');
        }
        const mobileBtnNavProfile = document.getElementById('mobile-nav-profile');
        if (mobileBtnNavProfile) {
            mobileBtnNavProfile.classList.remove('hidden');
            mobileBtnNavProfile.classList.add('flex');
        }
        const mobileBtnNavRequests = document.getElementById('mobile-nav-requests');
        if (mobileBtnNavRequests) {
            mobileBtnNavRequests.classList.remove('hidden');
            mobileBtnNavRequests.classList.add('flex');
        }
    }
});
// --- 3. LOGOUT LOGIC ---
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        const wasDonor = !!localStorage.getItem('donorUser');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('donorUser'); // Logout donor too
        alert("Logged Out Successfully!");
        if (wasDonor) {
            sessionStorage.setItem("showLoginAfterReload", "true");
        }
        location.reload();
    });
}
// --- 4. NAVIGATION LOGIC (UNIFIED) ---
function showSection(sectionName) {
    // Hide all
    if (sectionHome)
        sectionHome.classList.add('hidden');
    if (sectionForm)
        sectionForm.classList.add('hidden');
    if (sectionDashboard)
        sectionDashboard.classList.add('hidden');
    if (sectionContact)
        sectionContact.classList.add('hidden');
    if (sectionLogin)
        sectionLogin.classList.add('hidden');
    if (sectionProfile)
        sectionProfile.classList.add('hidden');
    if (sectionRequests)
        sectionRequests.classList.add('hidden');
    // Reset buttons
    const buttons = [navHome, btnNavRegister, btnNavDashboard, btnNavContact, btnNavLogin, btnNavProfile, btnNavRequests];
    buttons.forEach(btn => {
        if (btn) {
            btn.classList.remove('bg-red-600', 'text-white', 'shadow-lg');
            btn.classList.add('text-slate-400', 'hover:bg-slate-800');
        }
    });
    // Reset mobile buttons
    const mobileButtonsMap = {
        'home': document.getElementById('mobile-nav-home'),
        'form': document.getElementById('mobile-nav-register'),
        'dashboard': document.getElementById('mobile-nav-dashboard'),
        'contact': document.getElementById('mobile-nav-contact'),
        'login': document.getElementById('mobile-nav-login'),
        'profile': document.getElementById('mobile-nav-profile'),
        'requests': document.getElementById('mobile-nav-requests')
    };
    Object.values(mobileButtonsMap).forEach(btn => {
        if (btn) {
            btn.classList.remove('bg-red-600', 'text-white', 'shadow-lg');
            btn.classList.add('text-slate-400', 'hover:bg-slate-800');
        }
    });
    const activeMobileBtn = mobileButtonsMap[sectionName];
    if (activeMobileBtn) {
        activeMobileBtn.classList.add('bg-red-600', 'text-white', 'shadow-lg');
        activeMobileBtn.classList.remove('text-slate-400', 'hover:bg-slate-800');
    }
    // Show Target
    if (sectionName === 'home') {
        if (sectionHome)
            sectionHome.classList.remove('hidden');
        if (navHome)
            activateBtn(navHome);
    }
    else if (sectionName === 'form') {
        if (sectionForm)
            sectionForm.classList.remove('hidden');
        if (btnNavRegister)
            activateBtn(btnNavRegister);
    }
    else if (sectionName === 'dashboard') {
        if (sectionDashboard)
            sectionDashboard.classList.remove('hidden');
        if (btnNavDashboard)
            activateBtn(btnNavDashboard);
        fetchDonors();
    }
    else if (sectionName === 'contact') {
        if (sectionContact)
            sectionContact.classList.remove('hidden');
        if (btnNavContact)
            activateBtn(btnNavContact);
    }
    else if (sectionName === 'login') {
        if (sectionLogin)
            sectionLogin.classList.remove('hidden');
        if (btnNavLogin)
            activateBtn(btnNavLogin);
    }
    else if (sectionName === 'profile') {
        const donorData = localStorage.getItem('donorUser');
        if (donorData && sectionProfile) {
            const donor = JSON.parse(donorData);
            sectionProfile.classList.remove('hidden');
            if (btnNavProfile)
                activateBtn(btnNavProfile);
            // Populate form
            document.getElementById('profile-id').value = donor.id;
            document.getElementById('profile-stu_id').value = donor.student_id;
            document.getElementById('profile-name').value = donor.name;
            document.getElementById('profile-phone').value = donor.mobile_number || donor.phone || "";
            document.getElementById('profile-college').value = donor.college_name || "";
            document.getElementById('profile-blood_group').value = donor.blood_group || "";
            document.getElementById('profile-branch').value = donor.branch || "";
            document.getElementById('profile-age').value = donor.age || "";
            if (donor.last_donation_date) {
                document.getElementById('profile-lastDate').value = donor.last_donation_date.split('T')[0];
            }
        }
        else {
            showSection('login');
        }
    }
    else if (sectionName === 'requests') {
        const donorData = localStorage.getItem('donorUser');
        if (donorData && sectionRequests) {
            const donor = JSON.parse(donorData);
            sectionRequests.classList.remove('hidden');
            if (btnNavRequests)
                activateBtn(btnNavRequests);
            fetchRequests(donor.id);
        }
        else {
            showSection('login');
        }
    }
}
function activateBtn(btn) {
    btn.classList.add('bg-red-600', 'text-white', 'shadow-lg');
    btn.classList.remove('text-slate-400', 'hover:bg-slate-800');
}
// Nav Listeners
if (navHome)
    navHome.addEventListener('click', () => showSection('home'));
if (btnNavRegister)
    btnNavRegister.addEventListener('click', () => showSection('form'));
if (btnNavDashboard)
    btnNavDashboard.addEventListener('click', () => showSection('dashboard'));
if (btnNavContact)
    btnNavContact.addEventListener('click', () => showSection('contact'));
if (btnNavLogin)
    btnNavLogin.addEventListener('click', () => showSection('login'));
if (btnNavProfile)
    btnNavProfile.addEventListener('click', () => showSection('profile'));
if (btnNavRequests)
    btnNavRequests.addEventListener('click', () => showSection('requests'));
// Mobile Hamburger Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIconHamburger = document.getElementById('menu-icon-hamburger');
const menuIconClose = document.getElementById('menu-icon-close');
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.remove('hidden');
            menuIconHamburger === null || menuIconHamburger === void 0 ? void 0 : menuIconHamburger.classList.add('hidden');
            menuIconClose === null || menuIconClose === void 0 ? void 0 : menuIconClose.classList.remove('hidden');
        }
        else {
            mobileMenu.classList.add('hidden');
            menuIconHamburger === null || menuIconHamburger === void 0 ? void 0 : menuIconHamburger.classList.remove('hidden');
            menuIconClose === null || menuIconClose === void 0 ? void 0 : menuIconClose.classList.add('hidden');
        }
    });
}
function closeMobileMenu() {
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
        menuIconHamburger === null || menuIconHamburger === void 0 ? void 0 : menuIconHamburger.classList.remove('hidden');
        menuIconClose === null || menuIconClose === void 0 ? void 0 : menuIconClose.classList.add('hidden');
    }
}
// Mobile Nav Listeners
(_a = document.getElementById('mobile-nav-home')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => { showSection('home'); closeMobileMenu(); });
(_b = document.getElementById('mobile-nav-register')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => { showSection('form'); closeMobileMenu(); });
(_c = document.getElementById('mobile-nav-dashboard')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => { showSection('dashboard'); closeMobileMenu(); });
(_d = document.getElementById('mobile-nav-contact')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => { showSection('contact'); closeMobileMenu(); });
(_e = document.getElementById('mobile-nav-login')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => { showSection('login'); closeMobileMenu(); });
(_f = document.getElementById('mobile-nav-profile')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => { showSection('profile'); closeMobileMenu(); });
(_g = document.getElementById('mobile-nav-requests')) === null || _g === void 0 ? void 0 : _g.addEventListener('click', () => { showSection('requests'); closeMobileMenu(); });
const mobileBtnLogout = document.getElementById('mobile-btn-logout');
if (mobileBtnLogout) {
    mobileBtnLogout.addEventListener('click', () => {
        const wasDonor = !!localStorage.getItem('donorUser');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('donorUser'); // Logout donor too
        alert("Logged Out Successfully!");
        if (wasDonor) {
            sessionStorage.setItem("showLoginAfterReload", "true");
        }
        location.reload();
    });
}
// --- 5. FETCH DONORS ---
function fetchDonors() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const reqPhone = localStorage.getItem('requesterPhone');
            if (reqPhone) {
                try {
                    const reqRes = yield fetch(`${API_URL}/requester-requests?phone=${reqPhone}`);
                    if (reqRes.ok) {
                        globalRequesterRequests = yield reqRes.json();
                    }
                }
                catch (e) {
                    console.error("Error fetching requester requests:", e);
                }
            }
            else {
                globalRequesterRequests = [];
            }
            const response = yield fetch(`${API_URL}/donors`);
            if (!response.ok)
                throw new Error('Failed to fetch data');
            const data = yield response.json();
            globalDonors = data;
            applyFilters();
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedGroup = filterGroup ? filterGroup.value : '';
    const selectedBranch = filterBranch ? filterBranch.value : '';
    if (globalDonors.length === 0) {
        tableBody.innerHTML = '';
        if (emptyMsg)
            emptyMsg.classList.remove('hidden');
        if (noResultMsg)
            noResultMsg.classList.add('hidden');
        return;
    }
    const filteredDonors = globalDonors.filter((donor) => {
        var _a, _b;
        const matchesSearch = searchTerm === '' ||
            ((_a = donor.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm)) ||
            ((_b = donor.student_id) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm));
        const matchesGroup = selectedGroup === '' || donor.blood_group === selectedGroup;
        const matchesBranch = selectedBranch === '' || donor.branch === selectedBranch;
        return matchesSearch && matchesGroup && matchesBranch;
    });
    renderTable(filteredDonors);
}
if (searchInput)
    searchInput.addEventListener('input', applyFilters);
if (filterGroup)
    filterGroup.addEventListener('change', applyFilters);
if (filterBranch)
    filterBranch.addEventListener('change', applyFilters);
// --- 6. RENDER TABLE ---
function renderTable(donors) {
    tableBody.innerHTML = '';
    if (emptyMsg)
        emptyMsg.classList.add('hidden');
    if (noResultMsg)
        noResultMsg.classList.add('hidden');
    if (donors.length === 0) {
        if (noResultMsg)
            noResultMsg.classList.remove('hidden');
        return;
    }
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    donors.forEach((donor) => {
        const row = document.createElement('tr');
        row.className = "hover:bg-red-50 transition-colors border-b border-gray-100";
        let statusBadge = !donor.last_donation_date ? 'Eligible ✅' : 'Wait ⏳';
        // Find if there is a request from this requester to this donor
        const request = globalRequesterRequests.find((r) => r.donor_id === donor.id);
        let contactInfoHtml = '';
        if (isAdmin) {
            contactInfoHtml = `<a href="tel:${donor.mobile_number}" class="text-blue-600 font-bold hover:underline">${donor.mobile_number}</a>`;
        }
        else if (request) {
            if (request.status === 'Accepted') {
                contactInfoHtml = `<a href="tel:${request.donor_mobile}" class="text-green-600 font-bold hover:underline">${request.donor_mobile}</a>`;
            }
            else if (request.status === 'Pending') {
                contactInfoHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Pending ⏳</span>`;
            }
            else {
                contactInfoHtml = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected ❌</span>`;
            }
        }
        else {
            contactInfoHtml = `<button onclick="openRequestModal(${donor.id}, '${donor.name}', '${donor.blood_group}')" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-red-500/10">Request Blood</button>`;
        }
        row.innerHTML = `
            <td class="px-3 py-3 sm:px-6 sm:py-4 font-bold text-blue-600">${donor.student_id}</td> <td class="px-3 py-3 sm:px-6 sm:py-4">${donor.name}</td>
            <td class="px-3 py-3 sm:px-6 sm:py-4">${donor.blood_group}</td> <td class="px-3 py-3 sm:px-6 sm:py-4">${contactInfoHtml}</td>
            <td class="px-3 py-3 sm:px-6 sm:py-4">${donor.college_name || '-'}</td> <td class="px-3 py-3 sm:px-6 sm:py-4">${donor.branch}</td>
            <td class="px-3 py-3 sm:px-6 sm:py-4">${statusBadge}</td> ${isAdmin ? `
            <td class="px-3 py-3 sm:px-6 sm:py-4"><button onclick="deleteDonor(${donor.id})" class="text-red-500 hover:text-red-700 font-bold">🗑️</button></td>` : ''}
        `;
        tableBody.appendChild(row);
    });
}
// --- 7. REGISTRATION FORM ---
if (form) {
    form.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        e.preventDefault();
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const stuId = stuIdInput ? stuIdInput.value.trim() : "";
        const age = ageInput.value;
        const branch = branchInput.value;
        const group = groupInput.value;
        const college = collegeInput ? collegeInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value.trim() : "";
        const lastDate = lastDateInput ? lastDateInput.value : "";
        const gender = ((_a = document.querySelector('input[name="gender"]:checked')) === null || _a === void 0 ? void 0 : _a.value) || "";
        if (!name || !phone || !stuId || !password) {
            Swal.fire({ icon: 'error', title: 'Missing Details', text: 'Name, ID, Phone & Password are required!' });
            return;
        }
        const donorData = {
            student_id: stuId, name, mobile_number: phone, blood_group: group, branch, age, college_name: college, password, gender, last_donation_date: lastDate
        };
        try {
            const response = yield fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donorData)
            });
            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Registered!', text: 'Details saved.' }).then(() => form.reset());
            }
            else {
                throw new Error('Registration failed');
            }
        }
        catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    }));
}
// --- 8. CONTACT FORM ---
if (contactForm) {
    contactForm.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const full_name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;
        try {
            const res = yield fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name, email, subject, message })
            });
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Sent!', text: 'Message sent successfully.' }).then(() => contactForm.reset());
            }
        }
        catch (e) {
            console.error(e);
        }
    }));
}
// --- 9. DONOR LOGIN FORM ---
if (donorLoginForm) {
    donorLoginForm.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const student_id = document.getElementById('login-stu_id').value.trim();
        const password = document.getElementById('login-password').value.trim();
        try {
            const response = yield fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id, password })
            });
            const data = yield response.json();
            if (response.ok) {
                localStorage.setItem('donorUser', JSON.stringify(data.donor));
                Swal.fire({ icon: 'success', title: 'Login Successful', text: `Welcome ${data.donor.name}` })
                    .then(() => location.reload());
            }
            else {
                Swal.fire({ icon: 'error', title: 'Login Failed', text: data.message });
            }
        }
        catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Server Error' });
        }
    }));
}
// --- 8. DELETE FUNCTION ---
window.deleteDonor = (id) => __awaiter(this, void 0, void 0, function* () {
    if (localStorage.getItem('isAdmin') !== 'true')
        return alert("Access Denied!");
    if (!confirm("Delete this donor?"))
        return;
    try {
        yield fetch(`${API_URL}/donors/${id}`, { method: 'DELETE' });
        fetchDonors();
    }
    catch (e) {
        console.error(e);
    }
});
// --- 10. PROFILE UPDATE FORM ---
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const id = document.getElementById('profile-id').value;
        const updatedData = {
            name: document.getElementById('profile-name').value,
            mobile_number: document.getElementById('profile-phone').value,
            college_name: document.getElementById('profile-college').value,
            blood_group: document.getElementById('profile-blood_group').value,
            branch: document.getElementById('profile-branch').value,
            age: document.getElementById('profile-age').value,
            last_donation_date: document.getElementById('profile-lastDate').value
        };
        try {
            const response = yield fetch(`${API_URL}/donors/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Updated!', text: 'Profile updated successfully.' });
                // Update local storage
                const donor = JSON.parse(localStorage.getItem('donorUser') || '{}');
                localStorage.setItem('donorUser', JSON.stringify(Object.assign(Object.assign({}, donor), updatedData)));
            }
        }
        catch (e) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Update failed' });
        }
    }));
}
// --- 11. REQUEST MODAL & INCOMING REQUESTS LOGIC ---
window.openRequestModal = (donorId, donorName, donorGroup) => {
    if (requestModal) {
        requestModal.classList.remove('hidden');
        if (reqDonorId)
            reqDonorId.value = String(donorId);
        if (reqDonorName)
            reqDonorName.textContent = donorName;
        if (reqDonorGroup)
            reqDonorGroup.textContent = donorGroup;
        if (reqGroupInput)
            reqGroupInput.value = donorGroup;
    }
};
window.closeRequestModal = () => {
    if (requestModal) {
        requestModal.classList.add('hidden');
        if (bloodRequestForm)
            bloodRequestForm.reset();
    }
};
if (bloodRequestForm) {
    bloodRequestForm.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const donor_id = document.getElementById('req-donor-id').value;
        const requester_name = document.getElementById('req-name').value.trim();
        const requester_phone = document.getElementById('req-phone').value.trim();
        const hospital_name = document.getElementById('req-hospital').value.trim();
        const locationInput = document.getElementById('req-location').value.trim();
        const blood_group = document.getElementById('req-group').value;
        const message = document.getElementById('req-message').value.trim();
        if (!requester_name || !requester_phone || !hospital_name || !locationInput || !message) {
            Swal.fire({ icon: 'error', title: 'Missing Fields', text: 'All form fields are required!' });
            return;
        }
        const payload = {
            donor_id,
            requester_name,
            requester_phone,
            hospital_name,
            blood_group,
            location: locationInput,
            message
        };
        try {
            const response = yield fetch(`${API_URL}/blood-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                localStorage.setItem('requesterPhone', requester_phone);
                Swal.fire({ icon: 'success', title: 'Request Sent!', text: 'Your request has been submitted to the donor.' });
                window.closeRequestModal();
                fetchDonors();
            }
            else {
                const data = yield response.json();
                throw new Error(data.message || 'Failed to submit request');
            }
        }
        catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    }));
}
function fetchRequests(donorId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableBody = document.getElementById('requests-table-body');
        const emptyMsg = document.getElementById('requests-empty-msg');
        if (!tableBody)
            return;
        try {
            const response = yield fetch(`${API_URL}/donors/${donorId}/requests`);
            if (!response.ok)
                throw new Error('Failed to fetch requests');
            const data = yield response.json();
            tableBody.innerHTML = '';
            if (data.length === 0) {
                if (emptyMsg)
                    emptyMsg.classList.remove('hidden');
                return;
            }
            if (emptyMsg)
                emptyMsg.classList.add('hidden');
            data.forEach((req) => {
                const row = document.createElement('tr');
                row.className = "hover:bg-red-50 transition-colors border-b border-gray-100";
                let statusBadge = '';
                if (req.status === 'Pending') {
                    statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Pending ⏳</span>`;
                }
                else if (req.status === 'Accepted') {
                    statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Accepted ✅</span>`;
                }
                else {
                    statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected ❌</span>`;
                }
                let actionHtml = '';
                if (req.status === 'Pending') {
                    actionHtml = `
                    <div class="flex gap-2">
                        <button onclick="updateRequestStatus(${req.id}, 'Accepted')" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all">Accept</button>
                        <button onclick="updateRequestStatus(${req.id}, 'Rejected')" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-all">Reject</button>
                    </div>
                `;
                }
                else {
                    actionHtml = `<span class="text-xs text-gray-400 font-medium">Completed</span>`;
                }
                row.innerHTML = `
                <td class="px-3 py-3 sm:px-6 sm:py-4 font-bold text-slate-800">${req.requester_name}</td>
                <td class="px-3 py-3 sm:px-6 sm:py-4">${req.requester_phone}</td>
                <td class="px-3 py-3 sm:px-6 sm:py-4">${req.hospital_name}</td>
                <td class="px-3 py-3 sm:px-6 sm:py-4">${req.location}</td>
                <td class="px-3 py-3 sm:px-6 sm:py-4 font-semibold text-red-600">${req.blood_group}</td>
                <td class="px-3 py-3 sm:px-6 sm:py-4 max-w-xs truncate" title="${req.message}">${req.message}</td>
                <td class="px-3 py-3 sm:px-6 sm:py-4">${statusBadge}</td>
                <td class="px-3 py-3 sm:px-6 sm:py-4">${actionHtml}</td>
            `;
                tableBody.appendChild(row);
            });
        }
        catch (e) {
            console.error(e);
        }
    });
}
window.updateRequestStatus = (reqId, status) => __awaiter(this, void 0, void 0, function* () {
    try {
        const res = yield fetch(`${API_URL}/blood-requests/${reqId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Updated!', text: `Request ${status.toLowerCase()} successfully.` });
            const donorData = localStorage.getItem('donorUser');
            if (donorData) {
                const donor = JSON.parse(donorData);
                fetchRequests(donor.id);
            }
        }
    }
    catch (e) {
        console.error(e);
    }
});
// --- PASSWORD VISIBILITY TOGGLE ---
const toggleRegPasswordBtn = document.getElementById('toggle-reg-password');
const regPasswordInput = document.getElementById('password');
if (toggleRegPasswordBtn && regPasswordInput) {
    toggleRegPasswordBtn.addEventListener('click', () => {
        const isPassword = regPasswordInput.type === 'password';
        regPasswordInput.type = isPassword ? 'text' : 'password';
        toggleRegPasswordBtn.innerHTML = isPassword
            ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
               </svg>`
            : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
               </svg>`;
    });
}
const toggleLoginPasswordBtn = document.getElementById('toggle-login-password');
const loginPasswordInput = document.getElementById('login-password');
if (toggleLoginPasswordBtn && loginPasswordInput) {
    toggleLoginPasswordBtn.addEventListener('click', () => {
        const isPassword = loginPasswordInput.type === 'password';
        loginPasswordInput.type = isPassword ? 'text' : 'password';
        toggleLoginPasswordBtn.innerHTML = isPassword
            ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
               </svg>`
            : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
               </svg>`;
    });
}
