export type Product = {
    id?: number
    title: string
    thumbnail: string
    description?: string
    images?: string[]
}

export type NewProduct = {
    title: string
    price: number
}

export type ProductResponse = {
    id: number
    title: string
    price: number
    thumbnail?: string
    description?: string
    images?: string[]
}

export type ProductsQueryData = {
    products: ProductResponse[]
    total: number
    skip: number
    limit: number
}
