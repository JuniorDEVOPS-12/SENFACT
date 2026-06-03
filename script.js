// ============ SYSTÈME D'AUTHENTIFICATION ============

// Structure de données par utilisateur
let users = [];
let currentUser = null;

// Données de l'utilisateur courant
let clients = [];
let products = [];
let invoices = [];
let nextInvoiceNumber = 1;

// Variables d'édition
let currentInvoiceLines = [];
let currentEditingInvoiceId = null;

// Charger les utilisateurs depuis localStorage
function loadUsers() {
    const savedUsers = localStorage.getItem('business_users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        users = [];
    }
}

// Sauvegarder les utilisateurs
function saveUsers() {
    localStorage.setItem('business_users', JSON.stringify(users));
}

// Sauvegarder les données de l'utilisateur courant
function saveUserData() {
    if (currentUser) {
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].data = {
                clients: clients,
                products: products,
                invoices: invoices,
                nextInvoiceNumber: nextInvoiceNumber
            };
            saveUsers();
        }
    }
}

// Charger les données de l'utilisateur courant
function loadUserData() {
    if (currentUser && currentUser.data) {
        clients = currentUser.data.clients || [];
        products = currentUser.data.products || [];
        invoices = currentUser.data.invoices || [];
        nextInvoiceNumber = currentUser.data.nextInvoiceNumber || 1;
    } else {
        clients = [];
        products = [];
        invoices = [];
        nextInvoiceNumber = 1;
    }
    updateDashboard();
    displayClients();
    displayProducts();
    displayInvoices();
}

// Connexion
function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        if (rememberMe) {
            localStorage.setItem('currentUserEmail', email);
        } else {
            sessionStorage.setItem('currentUserEmail', email);
        }
        loadUserData();
        showApp();
    } else {
        alert('Email ou mot de passe incorrect');
    }
}

// Inscription
function register() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!name || !email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
    }
    
    if (password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        alert('Cet email est déjà utilisé');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        data: {
            clients: [],
            products: [],
            invoices: [],
            nextInvoiceNumber: 1
        }
    };
    
    users.push(newUser);
    saveUsers();
    
    alert('Compte créé avec succès ! Veuillez vous connecter.');
    showLogin();
}

// Déconnexion
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUserEmail');
    sessionStorage.removeItem('currentUserEmail');
    showLoginPage();
}

// Afficher l'application
function showApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    document.getElementById('userEmailDisplay').textContent = currentUser.email;
    
    // Mettre à jour l'interface
    updateDashboard();
    displayClients();
    displayProducts();
    displayInvoices();
    
    // Réinitialiser la navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-item')[0].classList.add('active');
}

// Afficher la page de connexion
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// Afficher la page d'inscription
function showRegister() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'flex';
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';
}

// Retour à la connexion
function showLogin() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('registerPage').style.display = 'none';
}

// Vérifier la session au chargement
function checkSession() {
    loadUsers();
    let savedEmail = localStorage.getItem('currentUserEmail');
    if (!savedEmail) {
        savedEmail = sessionStorage.getItem('currentUserEmail');
    }
    
    if (savedEmail) {
        const user = users.find(u => u.email === savedEmail);
        if (user) {
            currentUser = user;
            loadUserData();
            showApp();
            return;
        }
    }
    showLoginPage();
}

// Format FCFA
function formatFCFA(amount) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
}

// Navigation
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    const titles = {
        dashboard: { title: 'Tableau de bord', subtitle: 'Gérez votre business' },
        clients: { title: 'Clients', subtitle: 'Gérez vos clients' },
        products: { title: 'Produits', subtitle: 'Gérez vos produits/services' },
        invoices: { title: 'Factures', subtitle: 'Gérez vos factures' }
    };
    
    document.getElementById('pageTitle').textContent = titles[page].title;
    document.getElementById('pageSubtitle').textContent = titles[page].subtitle;
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const clickedItem = event.target.closest('.nav-item');
    if (clickedItem) clickedItem.classList.add('active');
    
    if (page === 'dashboard') updateDashboard();
    if (page === 'clients') displayClients();
    if (page === 'products') displayProducts();
    if (page === 'invoices') displayInvoices();
    
    const menu = document.getElementById('sideMenu');
    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
    }
}

function toggleMenu() {
    document.getElementById('sideMenu').classList.toggle('active');
}

// ============ GESTION DES CLIENTS ============
function openClientModal(clientId = null) {
    if (clientId) {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            document.getElementById('clientId').value = client.id;
            document.getElementById('clientName').value = client.name;
            document.getElementById('clientEmail').value = client.email;
            document.getElementById('clientPhone').value = client.phone || '';
            document.getElementById('clientAddress').value = client.address || '';
        }
    } else {
        document.getElementById('clientId').value = '';
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('clientAddress').value = '';
    }
    document.getElementById('clientModal').classList.add('active');
}

function closeClientModal() {
    document.getElementById('clientModal').classList.remove('active');
}

function saveClient() {
    const id = document.getElementById('clientId').value;
    const client = {
        name: document.getElementById('clientName').value.trim(),
        email: document.getElementById('clientEmail').value.trim(),
        phone: document.getElementById('clientPhone').value,
        address: document.getElementById('clientAddress').value
    };
    
    if (!client.name || !client.email) {
        alert('Veuillez remplir tous les champs obligatoires (Nom et Email)');
        return;
    }
    
    if (id) {
        client.id = parseInt(id);
        const index = clients.findIndex(c => c.id === client.id);
        clients[index] = client;
    } else {
        client.id = Date.now();
        clients.push(client);
    }
    
    saveUserData();
    displayClients();
    updateDashboard();
    closeClientModal();
}

function editClient(id) {
    openClientModal(id);
}

function deleteClient(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        clients = clients.filter(c => c.id !== id);
        saveUserData();
        displayClients();
        updateDashboard();
    }
}

function searchClients() {
    const searchTerm = document.getElementById('searchClientInput').value.toLowerCase();
    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm)
    );
    displayClients(filteredClients);
}

function displayClients(filteredClients = null) {
    const container = document.getElementById('clientsList');
    const clientsToShow = filteredClients || clients;
    
    if (clientsToShow.length === 0) {
        container.innerHTML = '<div class="empty-state">Aucun client. Cliquez sur + pour ajouter</div>';
        return;
    }
    
    container.innerHTML = clientsToShow.map(client => `
        <div class="client-card">
            <div class="client-info">
                <h4>${escapeHtml(client.name)}</h4>
                <p>${escapeHtml(client.email)}</p>
                ${client.phone ? `<p><i class="fas fa-phone"></i> ${escapeHtml(client.phone)}</p>` : ''}
                ${client.address ? `<p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(client.address)}</p>` : ''}
            </div>
            <div class="card-actions">
                <button class="btn-icon btn-edit" onclick="editClient(${client.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteClient(${client.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ============ GESTION DES PRODUITS ============
function openProductModal(productId = null) {
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productTva').value = product.tva;
        }
    } else {
        document.getElementById('productId').value = '';
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productTva').value = '18';
    }
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function saveProduct() {
    const id = document.getElementById('productId').value;
    const product = {
        name: document.getElementById('productName').value.trim(),
        price: parseInt(document.getElementById('productPrice').value),
        tva: parseFloat(document.getElementById('productTva').value)
    };
    
    if (!product.name || !product.price) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    if (id) {
        product.id = parseInt(id);
        const index = products.findIndex(p => p.id === product.id);
        products[index] = product;
    } else {
        product.id = Date.now();
        products.push(product);
    }
    
    saveUserData();
    displayProducts();
    closeProductModal();
}

function editProduct(id) {
    openProductModal(id);
}

function deleteProduct(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        products = products.filter(p => p.id !== id);
        saveUserData();
        displayProducts();
    }
}

function displayProducts() {
    const container = document.getElementById('productsList');
    
    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state">Aucun produit. Cliquez sur + pour ajouter</div>';
        return;
    }
    
    container.innerHTML = products.map(product => {
        const priceTTC = product.price * (1 + product.tva / 100);
        return `
            <div class="product-card">
                <div class="product-info">
                    <h4>${escapeHtml(product.name)}</h4>
                    <p>Prix HT: ${formatFCFA(product.price)}</p>
                    <p>TVA: ${product.tva}%</p>
                    <p class="product-price">Prix TTC: ${formatFCFA(priceTTC)}</p>
                </div>
                <div class="card-actions">
                    <button class="btn-icon btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ============ GESTION DES FACTURES ============
function openInvoiceModal(invoiceId = null) {
    currentEditingInvoiceId = invoiceId;
    
    if (invoiceId) {
        const invoice = invoices.find(i => i.id === invoiceId);
        if (invoice) {
            document.getElementById('invoiceModalTitle').textContent = 'Modifier facture';
            document.getElementById('invoiceId').value = invoice.id;
            document.getElementById('invoiceClient').value = invoice.clientId;
            document.getElementById('invoiceStatus').value = invoice.status;
            
            const deleteBtn = document.getElementById('deleteInvoiceBtn');
            if (invoice.status === 'Brouillon') {
                deleteBtn.style.display = 'block';
            } else {
                deleteBtn.style.display = 'none';
            }
            
            currentInvoiceLines = invoice.lines.map(line => ({
                productId: line.productId,
                quantity: line.quantity,
                product: products.find(p => p.id === line.productId)
            }));
            
            updateInvoiceLinesDisplay();
            updateInvoiceTotals();
        }
    } else {
        document.getElementById('invoiceModalTitle').textContent = 'Nouvelle facture';
        document.getElementById('invoiceId').value = '';
        document.getElementById('invoiceStatus').value = 'Brouillon';
        document.getElementById('deleteInvoiceBtn').style.display = 'none';
        currentInvoiceLines = [];
        updateInvoiceLinesDisplay();
        updateInvoiceTotals();
    }
    
    loadClientsForInvoice();
    document.getElementById('invoiceModal').classList.add('active');
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').classList.remove('active');
    currentEditingInvoiceId = null;
}

function deleteCurrentInvoice() {
    if (currentEditingInvoiceId) {
        deleteInvoice(currentEditingInvoiceId);
        closeInvoiceModal();
    }
}

function loadClientsForInvoice() {
    const select = document.getElementById('invoiceClient');
    select.innerHTML = '<option value="">Sélectionner un client</option>';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        select.appendChild(option);
    });
}

function addInvoiceLine() {
    if (products.length === 0) {
        alert('Veuillez d\'abord ajouter des produits');
        return;
    }
    currentInvoiceLines.push({
        productId: null,
        quantity: 1,
        product: null
    });
    updateInvoiceLinesDisplay();
}

function updateInvoiceLinesDisplay() {
    const container = document.getElementById('invoiceLinesContainer');
    
    if (currentInvoiceLines.length === 0) {
        container.innerHTML = '<div class="empty-state">Aucune ligne - Cliquez sur + pour ajouter</div>';
        return;
    }
    
    container.innerHTML = currentInvoiceLines.map((line, index) => `
        <div class="invoice-line" data-index="${index}">
            <div class="line-product">
                <select onchange="updateInvoiceLineProduct(${index}, this.value)">
                    <option value="">Choisir un produit</option>
                    ${products.map(p => `
                        <option value="${p.id}" ${line.productId === p.id ? 'selected' : ''}>
                            ${escapeHtml(p.name)} - ${formatFCFA(p.price)} HT
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="line-quantity">
                <input type="number" value="${line.quantity}" step="0.01" min="0.01"
                       onchange="updateInvoiceLineQuantity(${index}, this.value)"
                       placeholder="Quantité">
                <button class="btn-icon btn-delete" onclick="removeInvoiceLine(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="line-total">
                ${line.product && line.quantity ? 
                    `Total TTC: ${formatFCFA(line.product.price * line.quantity * (1 + line.product.tva / 100))}` : 
                    'Total: 0 FCFA'}
            </div>
        </div>
    `).join('');
}

function updateInvoiceLineProduct(index, productId) {
    if (productId) {
        const product = products.find(p => p.id == productId);
        currentInvoiceLines[index].productId = product.id;
        currentInvoiceLines[index].product = product;
        updateInvoiceTotals();
        updateInvoiceLinesDisplay();
    }
}

function updateInvoiceLineQuantity(index, quantity) {
    currentInvoiceLines[index].quantity = parseFloat(quantity) || 0;
    updateInvoiceTotals();
    updateInvoiceLinesDisplay();
}

function removeInvoiceLine(index) {
    currentInvoiceLines.splice(index, 1);
    updateInvoiceTotals();
    updateInvoiceLinesDisplay();
}

function updateInvoiceTotals() {
    let totalHT = 0;
    let totalTVA = 0;
    
    currentInvoiceLines.forEach(line => {
        if (line.product && line.quantity && line.quantity > 0) {
            const lineHT = line.product.price * line.quantity;
            const lineTVA = lineHT * (line.product.tva / 100);
            totalHT += lineHT;
            totalTVA += lineTVA;
        }
    });
    
    const totalTTC = totalHT + totalTVA;
    
    document.getElementById('totalHT').textContent = formatFCFA(totalHT);
    document.getElementById('totalTVA').textContent = formatFCFA(totalTVA);
    document.getElementById('totalTTC').textContent = formatFCFA(totalTTC);
}

function saveInvoice() {
    const clientId = document.getElementById('invoiceClient').value;
    const status = document.getElementById('invoiceStatus').value;
    const invoiceId = document.getElementById('invoiceId').value;
    
    if (!clientId) {
        alert('Veuillez sélectionner un client');
        return;
    }
    
    if (currentInvoiceLines.length === 0) {
        alert('Veuillez ajouter au moins une ligne de produit');
        return;
    }
    
    const lines = [];
    let totalHT = 0;
    let totalTVA = 0;
    let hasValidLine = false;
    
    currentInvoiceLines.forEach(line => {
        if (line.product && line.quantity && line.quantity > 0) {
            hasValidLine = true;
            const lineHT = line.product.price * line.quantity;
            const lineTVA = lineHT * (line.product.tva / 100);
            lines.push({
                productId: line.product.id,
                productName: line.product.name,
                quantity: line.quantity,
                priceHT: line.product.price,
                tva: line.product.tva,
                totalHT: lineHT,
                totalTVA: lineTVA,
                totalTTC: lineHT + lineTVA
            });
            totalHT += lineHT;
            totalTVA += lineTVA;
        }
    });
    
    if (!hasValidLine) {
        alert('Veuillez remplir les lignes avec des produits et quantités valides');
        return;
    }
    
    const invoice = {
        clientId: parseInt(clientId),
        clientName: clients.find(c => c.id == clientId).name,
        date: new Date().toISOString().split('T')[0],
        status: status,
        lines: lines,
        totalHT: totalHT,
        totalTVA: totalTVA,
        totalTTC: totalHT + totalTVA
    };
    
    if (invoiceId) {
        invoice.id = parseInt(invoiceId);
        invoice.number = invoices.find(i => i.id == invoiceId).number;
        const index = invoices.findIndex(i => i.id == invoiceId);
        invoices[index] = invoice;
    } else {
        invoice.id = Date.now();
        invoice.number = `FACT-${new Date().getFullYear()}-${nextInvoiceNumber.toString().padStart(4, '0')}`;
        nextInvoiceNumber++;
        invoices.push(invoice);
    }
    
    saveUserData();
    displayInvoices();
    updateDashboard();
    closeInvoiceModal();
}

function editInvoice(id) {
    openInvoiceModal(id);
}

function deleteInvoice(id) {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;
    
    if (invoice.status !== 'Brouillon') {
        alert('Seules les factures en statut "Brouillon" peuvent être supprimées');
        return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
        invoices = invoices.filter(i => i.id !== id);
        saveUserData();
        displayInvoices();
        updateDashboard();
    }
}

function updateInvoiceStatus(id, status) {
    const invoice = invoices.find(i => i.id === id);
    if (invoice) {
        invoice.status = status;
        saveUserData();
        displayInvoices();
        updateDashboard();
    }
}

// ============ GÉNÉRATION PDF ============
function generatePDF(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;
    
    const client = clients.find(c => c.id === invoice.clientId);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129);
    doc.text('FACTURE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`N° ${invoice.number}`, 20, 40);
    doc.text(`Date: ${invoice.date}`, 20, 48);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Client:', 20, 65);
    doc.setFontSize(10);
    doc.text(client.name, 20, 73);
    if (client.address) doc.text(client.address, 20, 81);
    if (client.email) doc.text(client.email, 20, 89);
    if (client.phone) doc.text(`Tel: ${client.phone}`, 20, 97);
    
    const tableData = invoice.lines.map(line => [
        line.productName,
        line.quantity.toString(),
        formatFCFA(line.priceHT),
        line.tva + '%',
        formatFCFA(line.totalHT)
    ]);
    
    doc.autoTable({
        startY: 110,
        head: [['Produit', 'Qté', 'Prix HT', 'TVA', 'Total HT']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total HT: ${formatFCFA(invoice.totalHT)}`, 140, finalY);
    doc.text(`TVA: ${formatFCFA(invoice.totalTVA)}`, 140, finalY + 8);
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text(`Total TTC: ${formatFCFA(invoice.totalTTC)}`, 140, finalY + 18);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Statut: ${invoice.status}`, 20, finalY + 18);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Business Manager Pro - Facture générée automatiquement', 105, 280, { align: 'center' });
    
    doc.save(`facture_${invoice.number}.pdf`);
}

// ============ TABLEAU DE BORD ============
function updateDashboard() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyRevenue = invoices
        .filter(inv => {
            const invDate = new Date(inv.date);
            return inv.status === 'Payée' && 
                   invDate.getMonth() === currentMonth && 
                   invDate.getFullYear() === currentYear;
        })
        .reduce((sum, inv) => sum + inv.totalTTC, 0);
    
    document.getElementById('monthlyRevenue').textContent = formatFCFA(monthlyRevenue);
    document.getElementById('totalInvoices').textContent = invoices.length;
    
    const draftCount = invoices.filter(inv => inv.status === 'Brouillon').length;
    const sentCount = invoices.filter(inv => inv.status === 'Envoyée').length;
    const paidCount = invoices.filter(inv => inv.status === 'Payée').length;
    
    document.getElementById('draftCount').textContent = draftCount;
    document.getElementById('sentCount').textContent = sentCount;
    document.getElementById('paidCount').textContent = paidCount;
}

// ============ EXPORT CSV ============
function exportCSV() {
    let csv = '\uFEFFNuméro;Client;Date;Total TTC;Statut\n';
    
    invoices.forEach(invoice => {
        csv += `"${invoice.number}";"${invoice.clientName}";"${invoice.date}";"${invoice.totalTTC}";"${invoice.status}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factures_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function displayInvoices() {
    const container = document.getElementById('invoicesList');
    
    if (invoices.length === 0) {
        container.innerHTML = '<div class="empty-state">Aucune facture. Cliquez sur + pour ajouter</div>';
        return;
    }
    
    container.innerHTML = invoices.map(invoice => {
        let statusClass = '';
        switch(invoice.status) {
            case 'Brouillon': statusClass = 'status-draft'; break;
            case 'Envoyée': statusClass = 'status-sent'; break;
            case 'Payée': statusClass = 'status-paid'; break;
        }
        
        const canDelete = invoice.status === 'Brouillon';
        
        return `
            <div class="invoice-card">
                <div class="invoice-info">
                    <h4>${escapeHtml(invoice.number)}</h4>
                    <p>${escapeHtml(invoice.clientName)}</p>
                    <p>${invoice.date}</p>
                    <span class="status-badge ${statusClass}">${invoice.status}</span>
                </div>
                <div>
                    <p class="invoice-amount">${formatFCFA(invoice.totalTTC)}</p>
                    <div class="card-actions" style="margin-top: 10px;">
                        <button class="btn-icon btn-pdf" onclick="generatePDF(${invoice.id})" title="Télécharger PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button class="btn-icon btn-edit" onclick="editInvoice(${invoice.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${canDelete ? `
                            <button class="btn-icon btn-delete" onclick="deleteInvoice(${invoice.id})" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                        <select class="status-select" onchange="updateInvoiceStatus(${invoice.id}, this.value)">
                            <option value="Brouillon" ${invoice.status === 'Brouillon' ? 'selected' : ''}>Brouillon</option>
                            <option value="Envoyée" ${invoice.status === 'Envoyée' ? 'selected' : ''}>Envoyée</option>
                            <option value="Payée" ${invoice.status === 'Payée' ? 'selected' : ''}>Payée</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialisation
checkSession();