import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from './components/Layout/Header';
import { TabNavigation } from './components/Layout/TabNavigation';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ExpenseForm } from './components/ExpenseForm/ExpenseForm';
import { ExpenseList } from './components/ExpenseList/ExpenseList';
import { useExpenses } from './hooks/useExpenses';

function App() {
  const { expenses, isLoading, addExpense } = useExpenses();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { totalExpenses, monthlyExpenses } = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthly = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    return { totalExpenses: total, monthlyExpenses: monthly };
  }, [expenses]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard expenses={expenses} />;
      case 'add-expense':
        return <ExpenseForm onSubmit={addExpense} isLoading={isLoading} />;
      case 'history':
        return <ExpenseList expenses={expenses} />;
      default:
        return <Dashboard expenses={expenses} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header totalExpenses={totalExpenses} monthlyExpenses={monthlyExpenses} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderActiveTab()}
        </motion.div>
      </main>
    </div>
  );
}

export default App;
