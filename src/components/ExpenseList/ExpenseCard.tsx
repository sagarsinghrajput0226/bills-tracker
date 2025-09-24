import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { Expense } from '../../types/Expense';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';

interface ExpenseCardProps {
  expense: Expense;
  index: number;
}

const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Food & Dining': 'bg-orange-100 text-orange-800',
    'Transportation': 'bg-blue-100 text-blue-800',
    'Shopping': 'bg-purple-100 text-purple-800',
    'Entertainment': 'bg-pink-100 text-pink-800',
    'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
    'Healthcare': 'bg-red-100 text-red-800',
    'Travel': 'bg-green-100 text-green-800',
    'Education': 'bg-indigo-100 text-indigo-800',
    'Business': 'bg-gray-100 text-gray-800',
    'Other': 'bg-gray-100 text-gray-800',
  };
  return colors[category] || colors['Other'];
};

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-3xl">{expense.emoji}</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {expense.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(expense.date, 'MMM dd, yyyy')}</span>
              </div>
              {expense.imageUrl && (
                <div className="flex items-center space-x-1">
                  <ImageIcon className="h-4 w-4" />
                  <span>Image attached</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(expense.amount)}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
            <Tag className="h-3 w-3 mr-1" />
            {expense.category}
          </span>
        </div>
      </div>

      {expense.description && (
        <p className="text-gray-600 text-sm mb-4">{expense.description}</p>
      )}

      {expense.imageUrl && (
        <div className="mt-4">
          <img
            src={expense.imageUrl}
            alt={expense.title}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}
    </motion.div>
  );
};
