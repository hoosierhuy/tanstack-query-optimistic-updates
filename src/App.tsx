import { useState } from 'react'
import AddProduct from './components/products/AddProduct'
import AddProductOptimistic from './components/products/AddProductOptimistic'
import AddProductOptimisticComprehensiveDemo from './components/products/AddProductOptimisticComprehensiveDemo'
// Local imports
import ProductDetail from './components/products/ProductDetail'
import ProductList from './components/products/ProductList'
import type { Product } from './components/products/productTypes'

function App() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product)
    }

    const handleBackToList = () => {
        setSelectedProduct(null)
    }

    return (
        <>
            <div className="flex justify-center p-4  gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <AddProductOptimisticComprehensiveDemo />
                {/* <AddProductOptimistic /> */}
                {selectedProduct ? (
                    <ProductDetail
                        product={selectedProduct}
                        onBack={handleBackToList}
                    />
                ) : (
                    <ProductList onProductSelect={handleProductSelect} />
                )}
            </div>
            {/* <AddProduct /> */}
        </>
    )
}

export default App
