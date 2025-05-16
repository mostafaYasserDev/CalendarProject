import React, { useState, useEffect } from 'react';
import { Task } from '../stores/calendarStore';
import { useAuthStore } from '../stores/authStore';

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: Omit<Task, '_id' | 'createdAt' | 'createdBy'>) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDate(new Date(task.date).toISOString().split('T')[0]);
      setStatus(task.status);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [task]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    
    if (!date) {
      setError('Date is required');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to add a task');
      return;
    }
    
    const taskData: Omit<Task, '_id' | 'createdAt' | 'createdBy'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: new Date(date).toISOString(),
      status,
      completed: status === 'completed'
    };
    
    onSubmit(taskData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="label">Task Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          required
          placeholder="Enter task title"
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
          placeholder="Enter task description"
        />
      </div>
      
      <div>
        <label htmlFor="date" className="label">Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
          required
        />
      </div>
      
      <div>
        <label htmlFor="status" className="label">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'pending' | 'completed')}
          className="input"
        >
          <option value="pending">In Progress</option>
          <option value="completed">Completed</option>
        </select>
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
          {task ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;