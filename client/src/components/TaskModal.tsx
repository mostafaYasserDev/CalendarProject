import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { X } from 'lucide-react';
import { useCalendarStore, Task, SpecialDay } from '../stores/calendarStore';
import { useAuthStore } from '../stores/authStore';

const TaskModal: React.FC = () => {
  const { selectedDate, setSelectedDate, getTasksForDate, isSpecialDay, specialDays } = useCalendarStore();
  const { isAuthenticated, isAdmin, isOwner } = useAuthStore();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [specialDay, setSpecialDay] = useState<SpecialDay | undefined>(undefined);
  
  const isDateInRange = (date: Date, startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return date >= start && date <= end;
  };

  useEffect(() => {
    if (selectedDate) {
      setTasks(getTasksForDate(selectedDate));
      const date = new Date(selectedDate);
      const foundSpecialDay = specialDays.find(sd => 
        isDateInRange(date, sd.startDate, sd.endDate)
      );
      setSpecialDay(foundSpecialDay);
    } else {
      setTasks([]);
      setSpecialDay(undefined);
    }
  }, [selectedDate, getTasksForDate, specialDays]);
  
  if (!selectedDate) return null;
  
  const formattedDate = format(new Date(selectedDate), 'EEEE, d MMMM yyyy', { locale: enUS });
  
  return (
    <div 
      className="modal-backdrop animate-fade-in"
      onClick={() => setSelectedDate(null)}
    >
      <div 
        className="modal-content p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-primary-50 flex justify-between items-center">
          <h3 className="text-xl font-lalezar text-primary-800">{formattedDate}</h3>
          
          <button
            onClick={() => setSelectedDate(null)}
            className="p-1 rounded-full hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {specialDay && (
          <div 
            className="p-4"
            style={{ backgroundColor: `${specialDay.category?.color}15` }}
          >
            <h4 className="font-medium text-lg" style={{ color: specialDay.category?.color }}>
              {specialDay.title}
            </h4>
            {specialDay.description && (
              <p className="mt-1 text-gray-700">{specialDay.description}</p>
            )}
            {specialDay.startDate !== specialDay.endDate && (
              <p className="text-sm text-gray-500 mt-1">
                {format(parseISO(specialDay.startDate), 'MMM d')} - {format(parseISO(specialDay.endDate), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        )}
        
        <div className="p-4">
          <h4 className="font-medium text-lg mb-2">Tasks</h4>
          {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks for this day</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map(task => (
                <li key={task._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-gray-600">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;