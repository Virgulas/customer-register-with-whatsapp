const { User, sequelize } = require('./user');

async function createUser(id, name, birthday, period, callDate) {
  try {
      const userExists = await getUser(id);

      if (userExists) {
          await User.update(
              { name, birthday, period, callDate },
              { where: { id } }
          );
          return { updated: true };
      }

      const user = await User.create({
          id,
          name,
          birthday,
          period,
          callDate
      });

      return { created: true, user };
  } catch (error) {
      console.error('Error creating or updating user:', error);
      throw new Error('Database error');
  }
}

async function getUser(id) {
    await sequelize.sync();
    const user = await User.findByPk(id);
  
    if (user === null || !user) {
        return false;
    }
    else {
        return user;
    }
}

async function getUserCount(){
  const userCount = await User.count();
  return userCount;

}

async function updateUser(id, newValues) {
  await sequelize.sync();

 try {
    const user = await getUser(id);
  
    Object.assign(user, newValues);
  
    await user.save();
  
    console.log('Updated user:', user.toJSON());
  
    return user; 

    } catch (error) {
        console.error('Error updating user:', error);
    }
}

async function deleteUser(id) {
    try {
      // Find the user by ID
      const user = await getUser(id);
  
      if (!user) {
        console.log('User not found');
        return null;
      }
  
      // Remove the user from the database
      await user.destroy();
  
      console.log(`User with ID ${id} deleted successfully.`);
      return true; // Return true to indicate successful deletion

    } catch (error) {
      console.error('Error deleting user:', error);
      return false; // Return false if an error occurred
    }
  }  

async function getUsersByPage(page = 1, limit = 100) {
    await sequelize.sync();
    
    // Calculate offset based on page number and limit
    const offset = (page - 1) * limit;

    // Fetch users with pagination
    const users = await User.findAll({
        limit: limit,
        offset: offset
    });

    return users;
}

module.exports = { 
    createUser, 
    getUser, 
    updateUser, 
    deleteUser,
    getUsersByPage,
    getUserCount,
    User
};