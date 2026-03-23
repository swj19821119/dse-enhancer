import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 生成 JWT Token
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 验证 JWT Token
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// 用户注册
export async function registerUser(email: string, password: string, nickname: string) {
  // 检查邮箱是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('邮箱已被注册');
  }

  // 哈希密码
  const hashedPassword = await hashPassword(password);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      nickname,
    },
  });

  // 初始化用户能力等级
  await prisma.userAbility.create({
    data: {
      userId: user.id,
    },
  });

  // 生成 Token
  const token = generateToken(user.id, user.email);

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    },
    token,
  };
}

// 用户登录
export async function loginUser(email: string, password: string) {
  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  // 验证密码
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    throw new Error('密码错误');
  }

  // 生成 Token
  const token = generateToken(user.id, user.email);

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      isVip: user.isVip,
      currentLevel: user.currentLevel,
    },
    token,
  };
}

// 根据 Token 获取用户
export async function getUserFromToken(token: string) {
  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      nickname: true,
      avatarUrl: true,
      isVip: true,
      currentLevel: true,
    },
  });

  return user;
}
