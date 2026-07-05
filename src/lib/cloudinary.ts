import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Uploads a file buffer directly to Cloudinary using a stream.
 */
export function uploadFileStream(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'study_materials'
): Promise<{ publicId: string; url: string; fileType: string; fileSize: number }> {
  return new Promise((resolve, reject) => {
    // Clean file name to be URL-friendly, preserving the extension
    const ext = fileName.split('.').pop() || '';
    const baseName = fileName
      .split('.')
      .slice(0, -1)
      .join('.')
      .replace(/[^a-zA-Z0-9]/g, '_');
    const cleanName = ext ? `${baseName}.${ext.toLowerCase()}` : baseName;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: cleanName,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          // Determine file extension/type from result format or secure_url
          const extension = fileName.split('.').pop() || result.format || result.resource_type || 'unknown';
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            fileType: extension.toLowerCase(),
            fileSize: result.bytes,
          });
        } else {
          reject(new Error('Upload failed with empty result'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Deletes a file from Cloudinary using its publicId.
 */
export function deleteFile(publicId: string, fileType: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Cloudinary resource types: 'image', 'raw', 'video'
    let resourceType = 'image';
    const lowerType = fileType.toLowerCase();
    
    // Non-image, non-pdf documents go to 'raw' in Cloudinary auto-mode
    if (['docx', 'doc', 'zip', 'rar', 'txt', 'csv', 'xlsx', 'xls', 'ppt', 'pptx'].includes(lowerType)) {
      resourceType = 'raw';
    } else if (['mp4', 'avi', 'mov', 'mkv', 'webm', 'mp3', 'wav'].includes(lowerType)) {
      resourceType = 'video';
    }

    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
