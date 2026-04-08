'use client'

import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Cart, CartItem } from '@/types'

interface CartContextType {
  cart: Cart
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'azaminos-cart'

function loadCart(): Cart {
  if (typeof window === 'undefined') return { items: [] }
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : { items: [] }
  } catch {
    return { items: [] }
  }
}

function saveCart(cart: Cart) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [] })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setCart(loadCart())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) saveCart(cart)
  }, [cart, mounted])

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.items.find((i) => i.variantId === item.variantId)
        if (existing) {
          return {
            items: prev.items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
                : i
            ),
          }
        }
        return { items: [...prev.items, { ...item, quantity }] }
      })
    },
    []
  )

  const removeItem = useCallback((variantId: string) => {
    setCart((prev) => ({
      items: prev.items.filter((i) => i.variantId !== variantId),
    }))
  }, [])

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId)
      return
    }
    setCart((prev) => ({
      items: prev.items.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i
      ),
    }))
  }, [removeItem])

  const clearCart = useCallback(() => {
    setCart({ items: [] })
  }, [])

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
