import type { Metadata } from 'next';
import UserUploadsClient from '@/components/UserUploadsClient';

export const metadata: Metadata = {
  title: 'HeyBCA Student Contributions - Shared BCA Notes & Study Resources',
  description: 'Access peer-contributed study materials, semester notes, and question banks uploaded by BCA students on the HeyBCA portal.',
  alternates: {
    canonical: 'https://bca.microxlearn.online/uploads',
  },
};

export default function UserUploadsPage() {
  return <UserUploadsClient />;
}
