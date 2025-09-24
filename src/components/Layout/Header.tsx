import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, TrendingUp } from 'lucide-react';

interface HeaderProps {
  totalExpenses: number;
  monthlyExpenses: number;
}

export const Header: React.FC<HeaderProps> = ({ totalExpenses, monthlyExpenses }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Receipt className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ExpenseTracker</h1>
              <p className="text-blue-100">Smart bill management</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
              <div className="text-blue-100 text-sm">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">₹{monthlyExpenses.toFixed(2)}</div>
              <div className="text-blue-100 text-sm">This Month</div>
            </div>
          </div>
        </div>
        
        <div className="md:hidden mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <div className="text-xl font-bold">₹{totalExpenses.toFixed(2)}</div>
            <div className="text-blue-100 text-sm">Total</div>
          </div>
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <div className="text-xl font-bold">₹{monthlyExpenses.toFixed(2)}</div>
            <div className="text-blue-100 text-sm">This Month</div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
