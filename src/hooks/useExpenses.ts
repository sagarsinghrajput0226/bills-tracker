import { useState, useCallback } from 'react';
import { Expense, ExpenseFormData, CATEGORY_EMOJIS } from '../types/Expense';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addExpense = useCallback(async (formData: ExpenseFormData): Promise<void> => {
    setIsLoading(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: new Date(),
      imageUrl: formData.image ? URL.createObjectURL(formData.image) : undefined,
      emoji: CATEGORY_EMOJIS[formData.category] || '📝',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setExpenses(prev => [newExpense, ...prev]);
    setIsLoading(false);
  }, []);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === id 
          ? { ...expense, ...updates, updatedAt: new Date() }
          : expense
      )
    );
    setIsLoading(false);
  }, []);

  const deleteExpense = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    setIsLoading(false);
  }, []);

  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
  };
};
