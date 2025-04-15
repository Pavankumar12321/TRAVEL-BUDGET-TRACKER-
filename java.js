document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const expenseForm = document.getElementById('expense-form');
    const expenseName = document.getElementById('expense-name');
    const expenseAmount = document.getElementById('expense-amount');
    const expenseCategory = document.getElementById('expense-category');
    const expenseDate = document.getElementById('expense-date');
    const expensesList = document.getElementById('expenses-list');
    const totalBudgetEl = document.getElementById('total-budget');
    const totalSpentEl = document.getElementById('total-spent');
    const remainingBudgetEl = document.getElementById('remaining-budget');
    const progressBar = document.getElementById('progress-bar');
    const searchInput = document.getElementById('search-expense');
    const setBudgetBtn = document.getElementById('set-budget-btn');
    const budgetModal = document.getElementById('budget-modal');
    const closeModal = document.querySelector('.close-modal');
    const budgetForm = document.getElementById('budget-form');
    const tripNameInput = document.getElementById('trip-name');
    const totalBudgetInput = document.getElementById('total-budget-amount');

    // Initialize expenses array and budget from localStorage
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let budget = JSON.parse(localStorage.getItem('budget')) || 0;
    let tripName = localStorage.getItem('tripName') || 'My Trip';

    // Set initial budget display
    totalBudgetEl.textContent = `$${budget.toLocaleString()}`;
    updateSummary();

    // Event Listeners
    expenseForm.addEventListener('submit', addExpense);
    searchInput.addEventListener('input', filterExpenses);
    setBudgetBtn.addEventListener('click', openBudgetModal);
    closeModal.addEventListener('click', closeBudgetModal);
    window.addEventListener('click', outsideClick);
    budgetForm.addEventListener('submit', setBudget);

    // Display existing expenses
    displayExpenses();

    // Functions
    function addExpense(e) {
        e.preventDefault();
        
        // Get form values
        const name = expenseName.value.trim();
        const amount = parseFloat(expenseAmount.value);
        const category = expenseCategory.value;
        const date = expenseDate.value;
        
        // Validate inputs
        if (name === '' || isNaN(amount) || amount <= 0 || category === '' || date === '') {
            alert('Please fill in all fields with valid values');
            return;
        }
        
        // Create new expense object
        const expense = {
            id: Date.now(),
            name,
            amount,
            category,
            date
        };
        
        // Add to expenses array
        expenses.push(expense);
        
        // Save to localStorage
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        // Update UI
        displayExpenses();
        updateSummary();
        
        // Reset form
        expenseForm.reset();
    }
    
    function displayExpenses() {
        // Clear existing expenses
        expensesList.innerHTML = '';
        
        if (expenses.length === 0) {
            expensesList.innerHTML = '<tr><td colspan="5" class="no-expenses">No expenses added yet</td></tr>';
            return;
        }
        
        // Sort expenses by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add each expense to the table
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>$${expense.amount.toLocaleString()}</td>
                <td><span class="category-badge ${expense.category}">${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}</span></td>
                <td>${formatDate(expense.date)}</td>
                <td>
                    <button class="action-btn edit" data-id="${expense.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" data-id="${expense.id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            expensesList.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', deleteExpense);
        });
        
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', editExpense);
        });
    }
    
    function deleteExpense(e) {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        
        if (confirm('Are you sure you want to delete this expense?')) {
            // Remove expense from array
            expenses = expenses.filter(expense => expense.id !== id);
            
            // Update localStorage
            localStorage.setItem('expenses', JSON.stringify(expenses));
            
            // Update UI
            displayExpenses();
            updateSummary();
        }
    }
    
    function editExpense(e) {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        const expense = expenses.find(exp => exp.id === id);
        
        if (expense) {
            // Fill form with expense data
            expenseName.value = expense.name;
            expenseAmount.value = expense.amount;
            expenseCategory.value = expense.category;
            expenseDate.value = expense.date;
            
            // Remove expense from array
            expenses = expenses.filter(exp => exp.id !== id);
            
            // Update localStorage
            localStorage.setItem('expenses', JSON.stringify(expenses));
            
            // Update UI
            displayExpenses();
            updateSummary();
        }
    }
    
    function filterExpenses() {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = expensesList.querySelectorAll('tr');
        
        rows.forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            const category = row.cells[2].textContent.toLowerCase();
            
            if (name.includes(searchTerm) || category.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    function updateSummary() {
        // Calculate total spent
        const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
        
        // Calculate remaining budget
        const remaining = budget - totalSpent;
        
        // Update DOM
        totalSpentEl.textContent = `$${totalSpent.toLocaleString()}`;
        remainingBudgetEl.textContent = `$${remaining.toLocaleString()}`;
        
        // Update progress bar
        const percentage = budget > 0 ? (totalSpent / budget) * 100 : 0;
        progressBar.style.width = `${percentage}%`;
        
        // Change color if over budget
        if (remaining < 0) {
            remainingBudgetEl.style.color = 'var(--danger-color)';
            progressBar.style.backgroundColor = 'var(--danger-color)';
        } else {
            remainingBudgetEl.style.color = 'var(--secondary-color)';
            progressBar.style.backgroundColor = 'var(--primary-color)';
        }
    }
    
    function openBudgetModal() {
        budgetModal.style.display = 'block';
        tripNameInput.value = tripName;
        totalBudgetInput.value = budget;
    }
    
    function closeBudgetModal() {
        budgetModal.style.display = 'none';
    }
    
    function outsideClick(e) {
        if (e.target === budgetModal) {
            closeBudgetModal();
        }
    }
    
    function setBudget(e) {
        e.preventDefault();
        
        const newTripName = tripNameInput.value.trim() || 'My Trip';
        const newBudget = parseFloat(totalBudgetInput.value);
        
        if (isNaN(newBudget) || newBudget <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }
        
        // Update budget and trip name
        budget = newBudget;
        tripName = newTripName;
        
        // Save to localStorage
        localStorage.setItem('budget', JSON.stringify(budget));
        localStorage.setItem('tripName', tripName);
        
        // Update header if trip name is not empty
        if (newTripName !== 'My Trip') {
            document.querySelector('header h1').innerHTML = `<i class="fas fa-plane"></i> ${tripName} Budget Tracker`;
        }
        
        // Update UI
        totalBudgetEl.textContent = `$${budget.toLocaleString()}`;
        updateSummary();
        
        // Close modal
        closeBudgetModal();
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
});