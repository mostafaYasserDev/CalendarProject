import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Plus, Calendar, Edit, Trash2, UserPlus, Users, Key, X, Tag } from 'lucide-react';
import { useCalendarStore, Task, SpecialDay, Category } from '../stores/calendarStore';
import { useAuthStore, User } from '../stores/authStore';
import { authAPI } from '../services/api';
import TaskForm from '../components/TaskForm';
import SpecialDayForm from '../components/SpecialDayForm';
import PasswordChangeModal from '../components/PasswordChangeModal';
import CategoryForm from '../components/CategoryForm';
import AddAdminForm from '../components/AddAdminForm';

type ActiveTab = 'tasks' | 'specialDays' | 'admins' | 'categories';
type ActiveModal = 'addTask' | 'editTask' | 'addSpecialDay' | 'editSpecialDay' | 'addAdmin' | 'addCategory' | 'editCategory' | 'changePassword' | null;

const Dashboard: React.FC = () => {
  const { 
    tasks, 
    specialDays,
    categories,
    isLoading,
    error,
    loadTasks,
    loadSpecialDays,
    loadCategories,
    addTask,
    updateTask,
    deleteTask,
    addSpecialDay,
    updateSpecialDay,
    deleteSpecialDay,
    addCategory,
    updateCategory,
    deleteCategory
  } = useCalendarStore();
  
  const { 
    isOwner, 
    user,
    addAdmin, 
    removeAdmin 
  } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedSpecialDayId, setSelectedSpecialDayId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<User[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  
  // New admin form state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const selectedTask = selectedTaskId ? tasks.find(t => t._id === selectedTaskId) : undefined;
  const selectedSpecialDay = selectedSpecialDayId 
    ? specialDays.find(d => d._id === selectedSpecialDayId) 
    : undefined;

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (!user) {
          // Redirect to login if not authenticated
          window.location.href = '/login';
          return;
        }

        if (activeTab === 'tasks') {
          await loadTasks();
        } else if (activeTab === 'specialDays') {
          await loadSpecialDays();
        } else if (activeTab === 'categories') {
          await loadCategories();
        } else if (activeTab === 'admins' && isOwner()) {
          await loadAdmins();
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (error instanceof Error && error.message.includes('Not authenticated')) {
          // Redirect to login if authentication fails
          window.location.href = '/login';
        }
      }
    };

    initializeData();
  }, [activeTab, user, isOwner, loadTasks, loadSpecialDays, loadCategories]);

  const loadAdmins = async () => {
    try {
      setIsLoadingAdmins(true);
      if (!user) {
        throw new Error('User not authenticated');
      }
      if (!isOwner()) {
        throw new Error('Not authorized as owner');
      }
      const data = await authAPI.getUsers();
      setAdmins(data.filter((user: User) => user.role === 'admin'));
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setIsLoadingAdmins(false);
    }
  };
  
  const handleAddTask = async (taskData: Omit<Task, '_id' | 'createdAt' | 'createdBy'>) => {
    await addTask(taskData);
    setActiveModal(null);
  };
  
  const handleUpdateTask = async (taskData: Omit<Task, '_id' | 'createdAt' | 'createdBy'>) => {
    if (selectedTaskId) {
      await updateTask(selectedTaskId, taskData);
      setActiveModal(null);
      setSelectedTaskId(null);
    }
  };
  
  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };
  
  const handleAddSpecialDay = async (data: Omit<SpecialDay, '_id' | 'createdAt' | 'createdBy'>) => {
    await addSpecialDay(data);
    setActiveModal(null);
  };
  
  const handleUpdateSpecialDay = async (data: Omit<SpecialDay, '_id' | 'createdAt' | 'createdBy'>) => {
    if (selectedSpecialDayId) {
      await updateSpecialDay(selectedSpecialDayId, data);
      setActiveModal(null);
      setSelectedSpecialDayId(null);
    }
  };
  
  const handleDeleteSpecialDay = async (id: string) => {
    if (confirm('Are you sure you want to delete this special day?')) {
      await deleteSpecialDay(id);
    }
  };
  
  const handleAddAdmin = async (adminData: {
    name: string;
    email: string;
    password: string;
    systemUsername?: string;
  }) => {
    try {
      await addAdmin(adminData);
      setActiveModal(null);
      loadAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };
  
  const handleDeleteAdmin = async (id: string) => {
    if (confirm('Are you sure you want to delete this admin?')) {
      try {
        await removeAdmin(id);
        loadAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };
  
  const handleEditTask = (id: string) => {
    setSelectedTaskId(id);
    setActiveModal('editTask');
  };
  
  const handleEditSpecialDay = (id: string) => {
    setSelectedSpecialDayId(id);
    setActiveModal('editSpecialDay');
  };
  
  const closeModal = () => {
    setActiveModal(null);
    setSelectedTaskId(null);
    setSelectedSpecialDayId(null);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
  };
  
  const handleAddCategory = async (data: Omit<Category, '_id' | 'createdAt' | 'createdBy'>) => {
    await addCategory(data);
    setActiveModal(null);
  };

  const handleUpdateCategory = async (data: Omit<Category, '_id' | 'createdAt' | 'createdBy'>) => {
    if (selectedCategoryId) {
      await updateCategory(selectedCategoryId, data);
      setActiveModal(null);
      setSelectedCategoryId(null);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
    }
  };
  
  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, d MMMM yyyy', { locale: enUS });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-lalezar text-gray-800">Dashboard</h2>
        
        {(activeTab !== 'admins' || isOwner()) && (
          <button
            onClick={() => setActiveModal(
              activeTab === 'tasks' ? 'addTask' : 
              activeTab === 'specialDays' ? 'addSpecialDay' : 
              activeTab === 'categories' ? 'addCategory' :
              'addAdmin'
            )}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            <span>
              Add {
                activeTab === 'tasks' ? 'Task' : 
                activeTab === 'specialDays' ? 'Special Day' : 
                activeTab === 'categories' ? 'Category' :
                'Admin'
              }
            </span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'tasks' 
                ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'specialDays' 
                ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('specialDays')}
          >
            Special Days
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'categories' 
                ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          {isOwner() && (
            <button
              className={`flex-1 py-3 px-4 text-center font-medium ${
                activeTab === 'admins' 
                  ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('admins')}
            >
              Admins
            </button>
          )}
        </div>
        
        {activeTab === 'admins' && isOwner() && (
          <div className="p-4">
            <div className="mb-4">
              <button
                onClick={() => setActiveModal('changePassword')}
                className="btn btn-outline flex items-center gap-2"
              >
                <Key size={16} />
                <span>Change Your Password</span>
              </button>
            </div>
            
            {isLoadingAdmins ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-400" />
                <p>No admins yet</p>
                <button
                  onClick={() => setActiveModal('addAdmin')}
                  className="mt-4 btn btn-outline"
                >
                  Add New Admin
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {admins.map(admin => (
                  <div 
                    key={admin._id}
                    className="p-4 border border-gray-200 rounded-md hover:border-primary-200"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{admin.name}</h3>
                        <p className="text-gray-600">{admin.email}</p>
                        {admin.systemUsername && (
                          <p className="text-sm text-gray-500">System Username: {admin.systemUsername}</p>
                        )}
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleDeleteAdmin(admin._id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div className="p-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                <p>No tasks yet</p>
                <button
                  onClick={() => setActiveModal('addTask')}
                  className="mt-4 btn btn-outline"
                >
                  Add New Task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(tasks) ? tasks : []).map(task => (
                  <div 
                    key={task._id}
                    className={`p-4 border rounded-md ${
                      task.status === 'completed' 
                        ? 'border-success-200 bg-success-50' 
                        : 'border-gray-200 hover:border-primary-200'
                    }`}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-lg">{task.title}</h3>
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEditTask(task._id)}
                          className="p-1 text-gray-600 hover:text-primary-600"
                          aria-label="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="mt-2 text-gray-600">{task.description}</p>
                    )}
                    
                    <div className="mt-3 flex justify-between items-center text-sm">
                      <div className="text-gray-500">
                        <div>{formatDate(task.date)}</div>
                        <div className="text-xs mt-1">
                          {task.createdBy?.name && (
                            <>
                              Added by: {task.createdBy.name}
                              <br />
                            </>
                          )}
                          {task.createdAt && formatDate(task.createdAt)}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full ${
                        task.status === 'completed' 
                          ? 'bg-success-100 text-success-700' 
                          : 'bg-secondary-100 text-secondary-700'
                      }`}>
                        {task.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'specialDays' && (
          <div className="p-4">
            {specialDays.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                <p>No special days yet</p>
                <button
                  onClick={() => setActiveModal('addSpecialDay')}
                  className="mt-4 btn btn-outline"
                >
                  Add New Special Day
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {specialDays.map(day => (
                  <div 
                    key={day._id}
                    className={`p-4 border rounded-md ${
                      day.type === 'holiday' 
                        ? 'border-secondary-200 bg-secondary-50' 
                        : 'border-accent-200 bg-accent-50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-lg">
                        {day.type === 'holiday' ? '🎉 ' : '📅 '}
                        {day.title}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSpecialDay(day._id)}
                          className="p-1 text-gray-600 hover:text-primary-600"
                          aria-label="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSpecialDay(day._id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {day.description && (
                      <p className="mt-2 text-gray-600">{day.description}</p>
                    )}
                    
                    <div className="mt-3 text-sm">
                      <div className="text-gray-500">
                        <div>
                          {formatDate(day.startDate)} 
                          {day.startDate !== day.endDate && ` - ${formatDate(day.endDate)}`}
                        </div>
                        <div className="text-xs mt-1">
                          {day.createdBy?.name && (
                            <>
                              Added by: {day.createdBy.name}
                              <br />
                            </>
                          )}
                          {day.createdAt && formatDate(day.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'categories' && (
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Tag size={48} className="mx-auto mb-4 text-gray-400" />
                <p>No categories yet</p>
                <button
                  onClick={() => setActiveModal('addCategory')}
                  className="mt-4 btn btn-outline"
                >
                  Add New Category
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map(category => (
                  <div 
                    key={category._id}
                    className="p-4 border rounded-md hover:border-primary-300 transition-colors"
                    style={{ borderColor: category.color + '40' }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-medium text-lg">{category.name}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCategoryId(category._id);
                            setActiveModal('editCategory');
                          }}
                          className="p-1 text-gray-600 hover:text-primary-600"
                          aria-label="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modals */}
      {(activeModal === 'addTask' || activeModal === 'editTask') && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-primary-50 flex justify-between items-center">
              <h3 className="text-xl font-lalezar text-primary-800">
                {activeModal === 'addTask' ? 'Add New Task' : 'Edit Task'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-white transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <TaskForm 
                task={selectedTask}
                onSubmit={activeModal === 'addTask' ? handleAddTask : handleUpdateTask}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      )}
      
      {(activeModal === 'addSpecialDay' || activeModal === 'editSpecialDay') && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-primary-50 flex justify-between items-center">
              <h3 className="text-xl font-lalezar text-primary-800">
                {activeModal === 'addSpecialDay' ? 'Add New Special Day' : 'Edit Special Day'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-white transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <SpecialDayForm 
                specialDay={selectedSpecialDay}
                onSubmit={activeModal === 'addSpecialDay' ? handleAddSpecialDay : handleUpdateSpecialDay}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      )}
      
      {activeModal === 'addAdmin' && (
        <AddAdminForm
          onClose={closeModal}
          onSubmit={handleAddAdmin}
          isLoading={isLoadingAdmins}
        />
      )}
      
      {activeModal === 'changePassword' && (
        <PasswordChangeModal onClose={closeModal} />
      )}
      
      {/* Add CategoryForm modal */}
      {(activeModal === 'addCategory' || activeModal === 'editCategory') && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-primary-50 flex justify-between items-center">
              <h3 className="text-xl font-lalezar text-primary-800">
                {activeModal === 'addCategory' ? 'Add New Category' : 'Edit Category'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-white transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <CategoryForm 
                category={selectedCategoryId ? categories.find(c => c._id === selectedCategoryId) : undefined}
                onSubmit={activeModal === 'addCategory' ? handleAddCategory : handleUpdateCategory}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;