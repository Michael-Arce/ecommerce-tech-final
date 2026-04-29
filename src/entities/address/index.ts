export type { Address } from './model/address.types'
export { getAddresses, createAddress, updateAddress, deleteAddress } from './api/address-api'
export {
  addressKeys,
  useAddresses,
  useCreateAddress,
  useSetDefaultAddress,
  useDeleteAddress,
} from './model/address-queries'
