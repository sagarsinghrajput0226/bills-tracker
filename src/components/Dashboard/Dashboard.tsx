import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, PieChart } from 'lucide-react';
import { Expense, EXPENSE_CATEGORIES } from '../../types/Expense';
import { formatCurrency } from '../../utils/currency';
import { format, subDays, isAfter, startOfDay, eachDayOfInterval, isSameDay } from 'date-fns';
import { ExpenseTrendChart } from './ExpenseTrendChart';
import { CategoryPieChart } from './CategoryPieChart';
import { MonthlyComparisonChart } from './MonthlyComparisonChart';

interface DashboardProps {
  expenses: Expense[];
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const lastWeek = subDays(now, 7);
    const lastMonth = subDays(now, 30);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const weeklyExpenses = expenses
      .filter(expense => isAfter(expense.date, lastWeek))
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const monthlyExpenses = expenses
      .filter(expense => isAfter(expense.date, lastMonth))
      .reduce((sum, expense) => sum + expense.amount, 0);

    const categoryTotals = EXPENSE_CATEGORIES.reduce((acc, category) => {
      acc[category] = expenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .filter(([, amount]) => amount > 0);

    const recentExpenses = expenses.slice(0, 5);

    const averageDaily = totalExpenses / Math.max(1, expenses.length);

    // Prepare data for trend chart (last 30 days)
    const last30Days = eachDayOfInterval({
      start: subDays(now, 29),
      end: now
    });

    const dailyExpenses = last30Days.map(day => {
      const dayExpenses = expenses.filter(expense => 
        isSameDay(startOfDay(expense.date), startOfDay(day))
      );
      return {
        date: format(day, 'MMM dd'),
        amount: dayExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: dayExpenses.length
      };
    });

    // Prepare data for monthly comparison (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });
      
      monthlyData.push({
        month: format(monthStart, 'MMM yyyy'),
        amount: monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: monthExpenses.length
      });
    }

    return {
      totalExpenses,
      weeklyExpenses,
      monthlyExpenses,
      topCategories,
      recentExpenses,
      averageDaily,
      totalTransactions: expenses.length,
      dailyExpenses,
      monthlyData,
      categoryTotals
    };
  }, [expenses]);

  if (analytics.totalTransactions === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="text-gray-400 mb-4">
          <PieChart className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
        <p className="text-gray-500 mb-6">
          Start by adding your first expense to see your dashboard analytics and beautiful charts.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          Get Started with Your First Expense
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.totalExpenses)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.monthlyExpenses)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.weeklyExpenses)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg per Transaction</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.averageDaily)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <PieChart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Expense Trend</h3>
          <ExpenseTrendChart data={analytics.dailyExpenses} />
        </motion.div>

        {/* Category Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <CategoryPieChart data={analytics.categoryTotals} />
        </motion.div>
      </div>

      {/* Monthly Comparison Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison (Last 6 Months)</h3>
        <MonthlyComparisonChart data={analytics.monthlyData} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {analytics.topCategories.map(([category, amount], index) => {
              const percentage = (amount / analytics.totalExpenses) * 100;
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" style={{
                      backgroundColor: `hsl(${index * 72}, 70%, 60%)`
                    }} />
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Expenses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {analytics.recentExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{expense.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(expense.date, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(expense.amount)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
