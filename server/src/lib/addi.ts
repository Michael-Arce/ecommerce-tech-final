export interface AddiOrderData {
  id: string
  total: number
}

export interface AddiCustomerData {
  cedula: string
  celular: string
  email?: string
}

export async function generateAddiPaymentLink(order: AddiOrderData, customer: AddiCustomerData): Promise<string> {
  // TODO: Implementar fetch a la API de Addi (auth0 token + payment request) cuando lleguen las llaves de Sandbox.
  
  // Estructura preparada para el payload de Addi:
  /*
  const payload = {
    amount: order.total,
    currency: 'COP',
    orderId: order.id,
    client: {
      idType: 'CC',
      idNumber: customer.cedula,
      email: customer.email || 'correo@ejemplo.com',
      cellphone: customer.celular,
    },
    // ... otras propiedades requeridas por Addi como redirectUrl, webhookUrl, etc.
  }
  */

  return `https://sandbox.addi.com/pagar/${order.id}`
}