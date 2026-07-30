import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export async function uploadToCloudinary(
  file: string,
  folder: string = 'uzstagram'
): Promise<{ url: string; publicId: string; resourceType: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'auto',
    transformation:
      folder === 'uzstagram/avatars'
        ? [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
        : undefined,
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}
