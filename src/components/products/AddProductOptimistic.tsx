import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type {
    NewProduct,
    ProductResponse,
    ProductsQueryData,
} from './productTypes'

export default function AddProductOptimistic() {
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')

    const queryClient = useQueryClient()

    // 🔥 OPTIMISTIC UPDATES IMPLEMENTATION
    // This shows the transformation from pessimistic to optimistic updates
    const addProductMutation = useMutation({
        // ✅ 1. MUTATION FUNCTION (Same as before)
        // This is the actual API call - no changes needed here
        mutationFn: async (
            newProduct: NewProduct,
        ): Promise<ProductResponse> => {
            const response = await fetch('https://dummyjson.com/products/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProduct),
            })

            if (!response.ok) {
                throw new Error('Failed to add product')
            }

            return response.json()
        },

        // 🚀 2. ON_MUTATE - THE OPTIMISTIC UPDATE MAGIC
        // This runs IMMEDIATELY when mutation is triggered (before API call)

        // AFTER: We immediately update the UI assuming success
        onMutate: async (newProduct: NewProduct) => {
            console.info(
                '🚀 onMutate: Starting optimistic update for:',
                newProduct.title,
            )

            // Step 1: Cancel any outgoing re-fetches
            // This prevents race conditions where a background refetch
            // could overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['products'] })
            console.info('✅ Cancelled any pending queries')

            // Step 2: Snapshot the previous value for rollback
            // We need this in case the mutation fails and we need to revert
            const previousProducts =
                queryClient.getQueryData<ProductsQueryData>(['products'])
            console.info(
                '📸 Saved snapshot of previous products:',
                previousProducts?.products?.length || 0,
                'items',
            )

            // Step 3: Optimistically update the cache
            // This is where the magic happens - we immediately show the new product
            queryClient.setQueryData<ProductsQueryData>(
                ['products'],
                (oldData) => {
                    if (!oldData) {
                        console.info('❌ No existing data to update')
                        return oldData
                    }

                    // Create the optimistic product that will appear immediately
                    const timestamp = Date.now() // Timestamp for unique IDs
                    const optimisticProduct: ProductResponse = {
                        id: timestamp,
                        title: newProduct.title,
                        price: newProduct.price,
                        thumbnail: `https://picsum.photos/150/150?random=${timestamp}`, // Placeholder
                        description: 'Recently added product', // Default description
                        images: [
                            `https://picsum.photos/300/300?random=${timestamp}`,
                        ], // Placeholder image
                    }

                    console.info(
                        '✨ Created optimistic product:',
                        optimisticProduct.title,
                    )

                    // Add the optimistic product to the beginning of the list
                    const updatedData = {
                        ...oldData,
                        products: [optimisticProduct, ...oldData.products],
                        total: oldData.total + 1, // Update the total count
                    }

                    console.info(
                        '🎯 Updated cache with optimistic data. New count:',
                        updatedData.products.length,
                    )
                    return updatedData
                },
            )

            // Step 4: Return context for potential rollback
            // This context will be passed to onError if the mutation fails
            return {
                previousProducts,
                optimisticProductTitle: newProduct.title,
            }
        },
        // 💥 3. ON_ERROR - ROLLBACK ON FAILURE
        // This runs only if the API call fails
        // AFTER: We rollback the optimistic update AND show an error
        onError: (error, _newProduct, context) => {
            console.info(
                '💥 onError: Mutation failed for:',
                context?.optimisticProductTitle,
            )
            console.info('📝 Error details:', error.message)

            // Rollback: Restore the previous state
            if (context?.previousProducts) {
                queryClient.setQueryData(['products'], context.previousProducts)
                console.info('⏪ Rolled back to previous state')
            }

            // Show user-friendly error
            console.error('❌ Failed to add product:', error)
        },

        // ✅ 4. ON_SUCCESS - FINALIZE SUCCESS
        // This runs when the API call succeeds
        // AFTER: We just reset the form (the UI already shows the product)
        onSuccess: (serverResponse, _newProduct) => {
            console.info('✅ onSuccess: Server confirmed product creation')
            console.info(
                '🔄 Server assigned ID:',
                serverResponse.id,
                'for product:',
                serverResponse.title,
            )

            // Reset the form since the product was successfully added
            setTitle('')
            setPrice('')

            // Note: We don't need to update the UI here because it's already showing
            // the optimistic update. The onSettled will sync with the server.
        },

        // 🏁 5. ON_SETTLED - ALWAYS SYNC WITH SERVER
        // This runs after either success or error
        // AFTER: Always invalidate to ensure UI matches server state
        onSettled: (_data, error, _variables, _context) => {
            console.info('🏁 onSettled: Syncing with server state')

            // Always refetch from server to ensure consistency
            // This will replace our optimistic update with real server data
            queryClient.invalidateQueries({ queryKey: ['products'] })

            if (error) {
                console.info(
                    '🔧 Settled after error - cache should be rolled back',
                )
            } else {
                console.info(
                    '🎉 Settled after success - server data will replace optimistic data',
                )
            }
        },
    })

    // Form submission handler (unchanged from before)
    const handleSubmit = (evt: React.FormEvent) => {
        evt.preventDefault()

        if (!title.trim() || !price.trim()) {
            alert('Please fill in both title and price')
            return
        }

        const priceNumber = parseFloat(price)
        if (Number.isNaN(priceNumber) || priceNumber <= 0) {
            alert('Please enter a valid price')
            return
        }

        console.info('🎬 Starting mutation for:', title)

        // Trigger the optimistic update mutation
        addProductMutation.mutate({
            title: title.trim(),
            price: priceNumber,
        })
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">
                Add New Product (Optimistic)
            </h2>

            {/* 📊 Debug Info - Shows the current mutation state */}
            <section className="mb-4 p-2 bg-gray-100 rounded text-xs">
                <strong>Debug Info:</strong>
                <br />
                isPending: {addProductMutation.isPending ? '✅' : '❌'}
                <br />
                isError: {addProductMutation.isError ? '✅' : '❌'}
                <br />
                isSuccess: {addProductMutation.isSuccess ? '✅' : '❌'}
                <br />
            </section>

            <form onSubmit={handleSubmit} className="space-y-4">
                <section>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Product Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(evt) => setTitle(evt.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., iphone"
                        disabled={addProductMutation.isPending}
                    />
                </section>

                <section>
                    <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Price ($)
                    </label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(evt) => setPrice(evt.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="9"
                        min="0"
                        step="0.01"
                        disabled={addProductMutation.isPending}
                    />
                </section>

                <button
                    type="submit"
                    disabled={addProductMutation.isPending}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {addProductMutation.isPending
                        ? '⚡ Adding Product (Check the list!)...'
                        : '🚀 Add Product Optimistically'}
                </button>
            </form>

            {/* Error State - Enhanced with rollback info */}
            {addProductMutation.isError && (
                <section className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>💥 Optimistic Update Failed!</strong>
                    <br />
                    The product was removed from the list and changes were
                    rolled back.
                    <br />
                    Error:{' '}
                    {addProductMutation.error?.message ||
                        'Failed to add product'}
                </section>
            )}

            {/* Success State - Enhanced with optimistic info */}
            {addProductMutation.isSuccess && (
                <section className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    <strong>✅ Optimistic Update Confirmed!</strong>
                    <br />
                    The product appeared instantly and was confirmed by the
                    server.
                </section>
            )}

            {/* Educational Info */}
            <section className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
                <h3 className="font-bold text-blue-800 mb-2">
                    🎓 How Optimistic Updates Work:
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>
                        <strong>Instant UI:</strong> Product appears immediately
                        when you click submit
                    </li>
                    <li>
                        <strong>Background Request:</strong> API call happens
                        behind the scenes
                    </li>
                    <li>
                        <strong>Success Path:</strong> Server confirms → UI
                        stays updated
                    </li>
                    <li>
                        <strong>Error Path:</strong> Server fails → UI rolls
                        back changes
                    </li>
                    <li>
                        <strong>Final Sync:</strong> Always refetch to ensure
                        consistency
                    </li>
                </ol>
            </section>
        </div>
    )
}
