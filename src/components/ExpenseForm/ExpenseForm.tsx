import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { ExpenseFormData, EXPENSE_CATEGORIES } from '../../types/Expense';
import { geminiAIService } from '../../services/geminiAI';
import { ImageUpload } from './ImageUpload';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  isLoading: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    amount: '',
    description: '',
    category: 'Other',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleImageSelect = useCallback(async (file: File) => {
    setSelectedImage(file);
    setIsProcessingAI(true);
    setAiError(null);

    try {
      const aiResult = await geminiAIService.extractBillDetails(file);
      setFormData(prev => ({
        ...prev,
        title: aiResult.title,
        amount: aiResult.amount,
        description: aiResult.description,
        category: aiResult.category,
      }));
    } catch (error) {
      console.error('AI processing failed:', error);
      setAiError(error instanceof Error ? error.message : 'Failed to process image with AI');
    } finally {
      setIsProcessingAI(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    await onSubmit({
      ...formData,
      image: selectedImage || undefined,
    });

    // Reset form
    setFormData({
      title: '',
      amount: '',
      description: '',
      category: 'Other',
    });
    setSelectedImage(null);
    setAiError(null);
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Expense</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUpload
          onImageSelect={handleImageSelect}
          selectedImage={selectedImage}
          onRemoveImage={() => {
            setSelectedImage(null);
            setAiError(null);
          }}
          isProcessing={isProcessingAI}
        />

        {aiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">AI Processing Failed</h4>
              <p className="text-sm text-red-700 mt-1">{aiError}</p>
              <p className="text-sm text-red-600 mt-2">Please fill in the details manually below.</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter expense title"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {EXPENSE_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any additional details..."
          />
        </div>

        <motion.button
          type="submit"
          disabled={isLoading || isProcessingAI || !formData.title || !formData.amount}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Adding Expense...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Add Expense</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};
