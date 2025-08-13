import type { Product } from './productTypes'

export default function ProductDetail({
    product,
    onBack,
}: {
    product: Product
    onBack: () => void
}) {
    return (
        <div className="max-w-xl mx-auto border rounded-lg p-6 flex flex-col items-center">
            <img
                src={product?.images?.[0]} // The Api always return images within an array
                alt={product?.title}
                title={product?.title}
                className="w-full object-cover rounded"
            />
            <h1 className="text-2xl font-bold mb-2">{product?.title}</h1>
            <p className="text-gray-700">{product?.description}</p>
            <p>
                <button
                    type="button"
                    onClick={onBack}
                    className="text-blue-600 hover:underline"
                >
                    Back to Products
                </button>
            </p>
        </div>
    )
}
