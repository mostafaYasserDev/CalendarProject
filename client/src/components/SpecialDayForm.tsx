import React, { useState, useEffect } from 'react';
import { SpecialDay, Category } from '../stores/calendarStore';
import { useAuthStore } from '../stores/authStore';
import { useCalendarStore } from '../stores/calendarStore';
import { Loader2 } from 'lucide-react';

interface SpecialDayFormProps {
  specialDay?: SpecialDay;
  onSubmit: (data: Omit<SpecialDay, '_id' | 'createdAt' | 'createdBy'>) => void;
  onCancel: () => void;
}

const SpecialDayForm: React.FC<SpecialDayFormProps> = ({ specialDay, onSubmit, onCancel }) => {
  const { user } = useAuthStore();
  const { categories, loadCategories } = useCalendarStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await loadCategories();
        
        if (specialDay) {
          setTitle(specialDay.title);
          setDescription(specialDay.description || '');
          setStartDate(new Date(specialDay.startDate).toISOString().split('T')[0]);
          setEndDate(new Date(specialDay.endDate).toISOString().split('T')[0]);
          const category = categories.find(c => c._id === specialDay.category?._id);
          setCategoryId(category?._id || '');
        } else {
          const today = new Date().toISOString().split('T')[0];
          setStartDate(today);
          setEndDate('');
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [specialDay, loadCategories]);

  useEffect(() => {
    if (startDate && (!endDate || new Date(endDate) < new Date(startDate))) {
      setEndDate(startDate);
    }
  }, [startDate]);
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!startDate) {
        throw new Error('Start date is required');
      }
      
      if (!endDate) {
        throw new Error('End date is required');
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        throw new Error('End date must be after start date');
      }
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        throw new Error('Special days cannot span more than 30 days');
      }
      
      if (!categoryId) {
        throw new Error('Category is required');
      }
      
      if (!user) {
        throw new Error('You must be logged in to add a special day');
      }

      const selectedCategory = categories.find(c => c._id === categoryId);
      if (!selectedCategory) {
        throw new Error('Selected category not found');
      }
      
      const data: Omit<SpecialDay, '_id' | 'createdAt' | 'createdBy'> = {
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        category: selectedCategory
      };
      
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving the special day');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="label">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          required
          placeholder="Enter special day title"
          disabled={isLoading || isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="description" className="label">Description (Optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input min-h-[100px]"
          rows={3}
          placeholder="Enter special day description"
          disabled={isLoading || isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="startDate" className="label">Start Date</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="input"
          required
          disabled={isLoading || isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="endDate" className="label">End Date</label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="input"
          required
          min={startDate}
          disabled={isLoading || isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="category" className="label">Category</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="input"
          required
          disabled={isLoading || isSubmitting}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isLoading || isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </form>
  );
};

export default SpecialDayForm;