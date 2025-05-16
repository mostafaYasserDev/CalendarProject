const loadAdmins = async () => {
  try {
    setIsLoading(true);
    const users = await getUsers();
    const adminUsers = users.filter(user => user.role === 'admin');
    setAdmins(adminUsers);
  } catch (error) {
    console.error('Error loading admins:', error);
    setError('Failed to load administrators. Please try again.');
  } finally {
    setIsLoading(false);
  }
}; 