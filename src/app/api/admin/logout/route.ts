import { NextResponse } from 'next/server';
import { removeAdminSessionCookie } from '@/lib/auth';

export async function POST() {
  await removeAdminSessionCookie();
  return NextResponse.json({ message: 'Logged out successfully' });
}
