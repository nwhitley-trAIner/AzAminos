export interface CartItem {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  variantName: string
  sku: string
  price: number
  quantity: number
  imageUrl: string | null
  stock: number
}

export interface Cart {
  items: CartItem[]
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
}

export interface CheckoutData {
  email: string
  shippingName: string
  shippingAddress: ShippingAddress
  items: CartItem[]
  ruoAcknowledged: boolean
}

export interface BulkPriceTier {
  qty: number
  price: number
}

export interface ProductWithVariants {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string | null
  casNumber: string | null
  molecularWeight: string | null
  molecularFormula: string | null
  sequence: string | null
  purity: number | null
  form: string
  storageInstructions: string | null
  shelfLife: string | null
  imageUrl: string | null
  coaUrl: string | null
  coaLabName: string | null
  coaBatchNumber: string | null
  status: string
  tags: string[]
  ruoDisclaimer: string
  categoryId: string
  category: {
    id: string
    name: string
    slug: string
  }
  variants: {
    id: string
    name: string
    sku: string
    price: number
    compareAtPrice: number | null
    stock: number
    weight: number | null
    bulkPricing: BulkPriceTier[] | null
  }[]
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  processorResponse?: Record<string, unknown>
}

export interface PaymentRequest {
  amount: number // in dollars
  currency: string
  orderId: string
  customerEmail: string
  card?: {
    number: string
    exp: string
    cvv: string
  }
  billingAddress?: ShippingAddress
}
