export interface Ingredient {
  name: string
  quantity: string
}

export interface Meal {
  id: string
  name: string
  estimated_cost: number
  ingredients: Ingredient[]
  image_url?: string
}

export interface GroceryItem {
  id: string
  name: string
  is_checked: boolean
  estimated_price: number
  category?: string
  quantity?: number
}
