import * as userRepository from '../repositories/user.repository.js';

export async function getUserById(id) {
  return userRepository.getUserById(id);
}

export async function getAllUsers(){
    return userRepository.getAllUsers();
}