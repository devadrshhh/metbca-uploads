import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { signToken, setAdminSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }

    await dbConnect();
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }

    const token = signToken({ id: admin._id.toString(), username: admin.username });
    await setAdminSessionCookie(token);

    return NextResponse.json({ message: 'Logged in successfully', username: admin.username });
  } catch (error: any) {
    return NextResponse.json({ message: 'Login error', error: error.message }, { status: 500 });
  }
}
