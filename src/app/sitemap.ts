import { MetadataRoute } from 'next';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://heybca.vercel.app';

  // Base static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/uploads`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/room`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  try {
    await dbConnect();
    // Retrieve all rooms to dynamically expose them in the sitemap for indexing
    const rooms = await Room.find({}, '_id createdAt').lean() as any[];
    
    const roomRoutes = rooms.map((room) => ({
      url: `${baseUrl}/room/${room._id}`,
      lastModified: room.createdAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...roomRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
    return staticRoutes;
  }
}
