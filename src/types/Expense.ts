export interface Expense {
  id: string;
  title: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  imageUrl?: string;
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFormData {
  title: string;
  amount: string;
  description: string;
  category: string;
  image?: File;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Business',
  'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const CATEGORY_EMOJIS: Record<string, string> = {
  'Food & Dining': '🍽️',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Bills & Utilities': '⚡',
  'Healthcare': '🏥',
  'Travel': '✈️',
  'Education': '📚',
  'Business': '💼',
  'Other': '📝'
};
