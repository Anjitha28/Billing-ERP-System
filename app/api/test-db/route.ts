import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    
    return NextResponse.json({ 
      status: 'success', 
      userCount, 
      adminExists: !!adminUser,
      adminEmail: adminUser?.email,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      authSecretLength: process.env.AUTH_SECRET?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  }
}
