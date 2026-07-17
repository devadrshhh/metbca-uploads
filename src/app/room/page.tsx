import type { Metadata } from 'next';
import RoomsClient from '@/components/RoomsClient';

export const metadata: Metadata = {
  title: 'HeyBCA Study Rooms - Peer Collaborative Workspaces',
  description: 'Join or create collaborative study rooms on HeyBCA. Share previous year questions (PYQs), course records, and lecture notes with fellow BCA students.',
  alternates: {
    canonical: 'https://heybca.vercel.app/room',
  },
};

export default function RoomsPage() {
  return <RoomsClient />;
}
