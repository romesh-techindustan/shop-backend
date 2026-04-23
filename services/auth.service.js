import bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';
import { AppError } from '../middleware/error-response.js';
import { createUser, getUserByEmail } from '../repositories/user.repository.js';

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function signUpService(data) {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  try {
    const user = await createUser({
      name,
      email,
      password: await hashPassword(data.password)
    });

    return user;
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError('Email already exists', 409);
    }

    throw error;
  }
}


export async function login(data) {
  const email = data.email.trim().toLowerCase();
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    throw new AppError('User does not exists', 404);
  }

  const validPassword = bcrypt.compare(data.password, existingUser.password);
  if (!validPassword){
    throw new AppError('Invalid credentials', 401);
  }

  return existingUser;
}