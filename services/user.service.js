import { AppError } from '../middleware/error-response.js';
import * as userRepository from '../repositories/user.repository.js';

export async function getUserById(id) {
  return userRepository.getUserById(id);
}

export async function getAllUsers(){
    return userRepository.getAllUsers();
}

export async function updateUserProfile(id, data){
  const user = await userRepository.updateUserProfile(id, data);
  if (!user){
    throw new AppError("User does not exist", 404);
  }
  return user;
}