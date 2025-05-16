import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useCalendarStore, SpecialDay } from '../stores/calendarStore';
import TaskModal from './TaskModal';
import { useAuthStore } from '../stores/authStore';

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const CalendarGrid: React.FC = () => {
  const {
    currentMonth,
    setCurrentMonth,
    selectedDate,
    setSelectedDate,
    tasks,
    specialDays,
    hasTasksOnDate,
    isSpecialDay,
    categories
  } = useCalendarStore();
  const { isAuthenticated } = useAuthStore();
  
  const daysInMonth = useMemo(() => {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);
    const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
    const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);
  
  const goToPreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
  };
  
  const goToNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
  };
  
  const handleDayClick = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };
  
  const isDateInRange = (date: Date, startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    date.setHours(0, 0, 0, 0);
    return date >= start && date <= end;
  };
  
  const getDayClassName = (day: Date, dayStr: string, specialDay?: SpecialDay) => {
    let className = "calendar-day cursor-pointer transition-colors duration-200";
    
    if (isSameMonth(day, currentMonth)) {
      className += " calendar-day-current-month";
    } else {
      className += " calendar-day-other-month";
    }
    
    if (isToday(day)) {
      className += " calendar-day-today";
    }
    
    if (hasTasksOnDate(dayStr)) {
      className += " calendar-day-has-tasks";
    }
    
    if (selectedDate === dayStr) {
      className += " ring-2 ring-blue-500";
    }

    if (specialDay) {
      className += " calendar-day-special";
    } else {
      className += " hover:bg-gray-50";
    }
    
    return className;
  };
  
  const getDayStyle = (specialDay?: SpecialDay) => {
    if (!specialDay?.category) return {};
    
    const color = specialDay.category.color;
    return {
      backgroundColor: `${color}15`,
      borderColor: color,
      borderWidth: '1px',
      borderStyle: 'solid',
      color: color
    };
  };
  
  return (
    <div className="space-y-6">
      <div className="card animate-fade-in">
        <div className="p-4 bg-primary-50 flex justify-between items-center">
          <button 
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-white transition-colors"
            aria-label="Previous month"
          >
            <ChevronRight size={20} />
          </button>
          
          <h2 className="text-xl md:text-2xl font-lalezar text-primary-800">
            {format(currentMonth, 'MMMM yyyy', { locale: enUS })}
          </h2>
          
          <button 
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-white transition-colors"
            aria-label="Next month"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-7 bg-primary-100">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center font-medium text-primary-800">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {daysInMonth.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const specialDay = specialDays.find(sd => 
              isDateInRange(day, sd.startDate, sd.endDate)
            );
            
            const className = getDayClassName(day, dayStr, specialDay);
            const style = getDayStyle(specialDay);
            const tasksForDate = tasks.filter(task => {
              const taskDate = new Date(task.date);
              return taskDate.toDateString() === day.toDateString();
            });

            return (
              <div
                key={dayStr}
                className={className}
                style={style}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm">
                    {format(day, 'd')}
                  </span>
                  {tasksForDate.length > 0 && (
                    <span className="text-primary-800 text-xl">★</span>
                  )}
                </div>
                
                {specialDay && (
                  <div 
                    className="text-xs truncate mt-1 hidden md:block"
                    style={{ color: specialDay.category?.color }}
                  >
                    {specialDay.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {categories && categories.length > 0 && (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h3 className="text-lg font-medium mb-3">Categories</h3>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(category => (
              <li 
                key={category._id} 
                className="flex items-center space-x-2"
              >
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-gray-700">{category.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TaskModal />
    </div>
  );
};

export default CalendarGrid;