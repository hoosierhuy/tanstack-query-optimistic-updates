import { useQuery } from '@tanstack/react-query'
// Local imports
import ProductCard from './ProductCard'
import type { Product } from './productTypes'

function ProductList({
    onProductSelect,
}: {
    onProductSelect: (product: Product) => void
}) {
    const { isPending, error, data } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await fetch(
                'https://dummyjson.com/products?limit=2',
            )

            return response.json()
        },
    })

    if (isPending) return <section>Loading...</section>
    if (error) return <section>Error: {error.message}</section>
    if (!data) return <section>No data found</section>

    return (
        <section>
            <h1 className="text-3xl font-bold text-center mb-2">Products</h1>
            <ul>
                {data?.products.map((product: Product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={onProductSelect}
                    />
                ))}
            </ul>
        </section>
    )
}

export default ProductList
