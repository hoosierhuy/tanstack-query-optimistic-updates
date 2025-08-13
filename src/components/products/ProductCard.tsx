import type { Product } from './productTypes'

export default function ProductCard({
    product,
    onSelect,
}: {
    product: Product
    onSelect: (product: Product) => void
}) {
    return (
        <li className="border border-gray-200 rounded-lg p-4 flex flex-col items-center hover:shadow-lg transition">
            <button
                type="button"
                onClick={() => onSelect(product)}
                className="flex flex-col items-center w-full group"
            >
                <img
                    src={product.thumbnail}
                    title={product.title}
                    alt={product.title}
                    className="w-full object-cover rounded mb-2 group-hover:scale-105 transition"
                />
                <h2 className="text-lg font-semibold text-center group-hover:text-blue-600">
                    {product.title}
                </h2>
            </button>
        </li>
    )
}
