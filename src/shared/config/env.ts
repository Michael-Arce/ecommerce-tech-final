export const API_URL = (() => {
  const url = import.meta.env.VITE_API_URL
  if (!url) throw new Error('VITE_API_URL is not defined')
  return url
})()

export const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? 'Ecommerce'
