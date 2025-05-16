import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import CalendarGrid from '../components/CalendarGrid';
import { useAuthStore } from '../stores/authStore';
import { useCalendarStore } from '../stores/calendarStore';

const Calendar: React.FC = () => {
  const { isAuthenticated, isAdmin, isOwner } = useAuthStore();
  const { tasks, specialDays, loadTasks, loadSpecialDays, loadCategories } = useCalendarStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadTasks(),
          loadSpecialDays(),
          loadCategories()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [loadTasks, loadSpecialDays, loadCategories]);

  const handleDateClick = (date: Date) => {
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-lalezar text-gray-800">Calendar & Tasks</h2>
        
        {isAuthenticated && (isAdmin || isOwner) && (
          <Link 
            to="/dashboard"
            className="btn btn-primary flex items-center gap-2"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
        )}
      </div>
      
      <div className="max-w-5xl mx-auto">
        <CalendarGrid />
      </div>
    </div>
  );
};

export default Calendar;