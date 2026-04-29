import { apiClient } from './axios-instance'

interface UploadResult {
  url: string
  publicId: string
}

export async function uploadProductImage(file: File): Promise<UploadResult> {
  const form = new FormData()
  form.append('image', file)

  // Pasamos Content-Type: undefined para que axios borre el default 'application/json'
  // y genere automáticamente 'multipart/form-data; boundary=...' con el boundary correcto
  const response = await apiClient.post<{ success: boolean; data: UploadResult }>(
    '/api/upload',
    form,
    { headers: { 'Content-Type': undefined } },
  )

  return response.data.data
}
