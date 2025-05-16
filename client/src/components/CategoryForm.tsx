import React, { useState, useEffect } from 'react';
import { Category } from '../stores/calendarStore';
import { useAuthStore } from '../stores/authStore';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: Omit<Category, '_id' | 'createdAt' | 'createdBy'>) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const { user } = useAuthStore();
  
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
    }
  }, [category]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to add a category');
      return;
    }
    
    const data: Omit<Category, '_id' | 'createdAt' | 'createdBy'> = {
      name: name.trim(),
      color
    };
    
    onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="label">Category Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          required
          placeholder="Enter category name"
        />
      </div>
      
      <div>
        <label htmlFor="color" className="label">Color</label>
        <div className="flex items-center space-x-2 space-x-reverse">
          <input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="input flex-1"
            placeholder="#000000"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 space-x-reverse">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {category ? 'Update Category' : 'Add Category'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm; 