
export const host = "http://localhost:8000";

export const authApiEndpoints = {
  login: '/api/token/',
  refresh: '/api/token/refresh/',
  register: '/register/',
  logout: '/api/v1/auth/logout'
};
export const expenseApiEndpoints = {
  expense: '/api/expenses/'
};

export const incomeApiEndpoints = {
  income: '/api/incomes/'
};

export const budgetApiEndpoints = {
  budget: '/api/budgets/'
};