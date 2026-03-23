import prisma from './prisma';

export async function initDatabase() {
  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function closeDatabase() {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected.');
  } catch (error) {
    console.error('Failed to disconnect from database:', error);
    throw error;
  }
}

export default prisma;
