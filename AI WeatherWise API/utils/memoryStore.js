const bcrypt = require('bcryptjs');

/**
 * Fallback In-Memory Storage for AI WeatherWise
 * Operates seamlessly if local MongoDB daemon and MongoMemoryServer are both unavailable.
 */

const memoryUsers = [];
const memoryLocations = [];

let userIdCounter = 1;
let locationIdCounter = 1;

const findUserByEmail = async (email) => {
  const normalized = email.toLowerCase().trim();
  const user = memoryUsers.find((u) => u.email === normalized);
  if (!user) return null;
  return {
    ...user,
    matchPassword: async (candidate) => await bcrypt.compare(candidate, user.password),
  };
};

const createUser = async ({ name, email, password, role = 'reader' }) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const id = `mem_user_${userIdCounter++}`;
  
  const newUser = {
    _id: id,
    id,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryUsers.push(newUser);
  return newUser;
};

const findUserById = async (id) => {
  const user = memoryUsers.find((u) => u._id.toString() === id.toString() || u.id === id);
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const getAllMemoryUsers = async () => {
  return memoryUsers.map(({ password, ...rest }) => rest);
};

const deleteMemoryUser = async (id) => {
  const index = memoryUsers.findIndex((u) => u._id.toString() === id.toString() || u.id === id);
  if (index !== -1) {
    memoryUsers.splice(index, 1);
    return true;
  }
  return false;
};

const updateMemoryUserStatus = async (id, isActive) => {
  const user = memoryUsers.find((u) => u._id.toString() === id.toString() || u.id === id);
  if (user) {
    user.isActive = Boolean(isActive);
    const { password, ...rest } = user;
    return rest;
  }
  return null;
};

const createMemoryLocation = async ({ userId, city, country, notes }) => {
  const id = `mem_loc_${locationIdCounter++}`;
  const newLocation = {
    _id: id,
    id,
    user: userId,
    city: city.trim(),
    country: country.trim(),
    notes: notes ? notes.trim() : '',
    createdAt: new Date().toISOString(),
  };
  memoryLocations.push(newLocation);
  return newLocation;
};

const getMemoryLocationsByUser = async (userId) => {
  return memoryLocations.filter((l) => l.user.toString() === userId.toString());
};

const getMemoryLocationById = async (id) => {
  return memoryLocations.find((l) => l._id.toString() === id.toString() || l.id === id);
};

const updateMemoryLocation = async (id, userId, updates) => {
  const location = memoryLocations.find((l) => (l._id.toString() === id.toString() || l.id === id) && l.user.toString() === userId.toString());
  if (!location) return null;
  if (updates.city) location.city = updates.city.trim();
  if (updates.country) location.country = updates.country.trim();
  if (updates.notes !== undefined) location.notes = updates.notes.trim();
  return location;
};

const deleteMemoryLocation = async (id, userId) => {
  const index = memoryLocations.findIndex((l) => (l._id.toString() === id.toString() || l.id === id) && l.user.toString() === userId.toString());
  if (index !== -1) {
    memoryLocations.splice(index, 1);
    return true;
  }
  return false;
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
  getAllMemoryUsers,
  deleteMemoryUser,
  updateMemoryUserStatus,
  createMemoryLocation,
  getMemoryLocationsByUser,
  getMemoryLocationById,
  updateMemoryLocation,
  deleteMemoryLocation,
};
