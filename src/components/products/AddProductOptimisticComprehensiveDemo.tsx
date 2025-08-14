import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type {
    NewProduct,
    ProductResponse,
    ProductsQueryData,
} from './productTypes'

export default function OptimisticUpdateDemo() {
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [demoMode, setDemoMode] = useState<'normal' | 'slow' | 'error'>(
        'normal',
    )

    const queryClient = useQueryClient()

    // 🎭 DEMO SCENARIOS FOR YOUR TEAM
    const addProductMutation = useMutation({
        mutationFn: async (
            newProduct: NewProduct,
        ): Promise<ProductResponse> => {
            console.info(`🎬 DEMO MODE: ${demoMode.toUpperCase()}`)

            // 🎯 SCENARIO 1: Normal Success (Most Common)
            if (demoMode === 'normal') {
                console.info('📡 Making normal API call to dummyjson...')
                const response = await fetch(
                    'https://dummyjson.com/products/add',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newProduct),
                    },
                )
                return response.json()
            }

            // 🐢 SCENARIO 2: Slow Network (To see optimistic update clearly)
            if (demoMode === 'slow') {
                console.info('🐢 Simulating slow network (6 second delay)...')
                await new Promise((resolve) => setTimeout(resolve, 6000))
                const response = await fetch(
                    'https://dummyjson.com/products/add',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newProduct),
                    },
                )
                return response.json()
            }

            // 💥 SCENARIO 3: Server Error (To see rollback)
            if (demoMode === 'error') {
                console.info('💥 Simulating server error...')
                await new Promise((resolve) => setTimeout(resolve, 1000))
                throw new Error('Server temporarily unavailable (demo error)')
            }

            throw new Error('Unknown demo mode')
        },

        // 🚀 OPTIMISTIC UPDATE - HAPPENS INSTANTLY
        onMutate: async (newProduct: NewProduct) => {
            const timestamp = Date.now()
            console.info('\n🎬 === OPTIMISTIC UPDATE DEMO START ===')
            console.info(`⚡ INSTANT UI UPDATE for: "${newProduct.title}"`)
            console.info(
                `🕐 Timestamp: ${new Date(timestamp).toLocaleTimeString()}`,
            )

            // Cancel background fetches
            await queryClient.cancelQueries({ queryKey: ['products'] })

            // Save current state for rollback
            const previousProducts =
                queryClient.getQueryData<ProductsQueryData>(['products'])

            // 🎭 CREATE REALISTIC OPTIMISTIC PRODUCT
            // This is what your team will see appear INSTANTLY
            queryClient.setQueryData<ProductsQueryData>(
                ['products'],
                (oldData) => {
                    if (!oldData) return oldData

                    // 🎯 REAL-WORLD OPTIMISTIC PRODUCT
                    const optimisticProduct: ProductResponse = {
                        id: timestamp, // Temporary ID (will be replaced by dummyjson)
                        title: newProduct.title, // ✅ Real user input
                        price: newProduct.price, // ✅ Real user input

                        // 🎭 Realistic defaults based on dummyjson structure
                        thumbnail: `https://picsum.photos/150/150?random=${timestamp}`, // Random working image
                        description: `${newProduct.title} - Added via optimistic update`, // Temporary image description
                        images: [
                            `https://picsum.photos/300/300?random=${timestamp}`,
                        ], // Working placeholder
                    }

                    console.info('✨ Optimistic product created:', {
                        id: optimisticProduct.id,
                        title: optimisticProduct.title,
                        price: optimisticProduct.price,
                        realOrFake: 'FAKE (but looks real to user)',
                    })

                    return {
                        ...oldData,
                        products: [optimisticProduct, ...oldData.products],
                        total: oldData.total + 1,
                    }
                },
            )

            console.info(
                '🎯 UI UPDATED INSTANTLY - User sees product immediately!',
            )

            return { previousProducts, timestamp }
        },

        // 💥 ERROR HANDLING - ROLLBACK IF NEEDED
        onError: (error, newProduct, context) => {
            console.info('\n💥 === ERROR SCENARIO DEMO ===')
            console.info(`❌ Server rejected: "${newProduct.title}"`)
            console.info(`📝 Error: ${error.message}`)

            // Rollback the optimistic update
            if (context?.previousProducts) {
                queryClient.setQueryData(['products'], context.previousProducts)
                console.info('⏪ ROLLBACK COMPLETE - Product removed from UI')
                console.info(
                    '🎭 User sees product disappear (like magic trick failed)',
                )
            }
        },

        // ✅ SUCCESS HANDLING
        onSuccess: (serverResponse, newProduct, context) => {
            console.info('\n✅ === SUCCESS SCENARIO DEMO ===')
            console.info(`🎉 Server confirmed: "${newProduct.title}"`)
            console.info('📊 Server vs Optimistic comparison:')
            console.info('   Optimistic ID:', context?.timestamp)
            console.info('   Real Server ID:', serverResponse.id)
            console.info(
                '   Title match:',
                serverResponse.title === newProduct.title ? '✅' : '❌',
            )

            // Reset form
            setTitle('')
            setPrice('')
        },

        // 🏁 FINAL SYNC
        onSettled: (_data, error) => {
            console.info('\n🏁 === FINAL SYNC DEMO ===')
            console.info('🔄 Refetching from server to ensure consistency...')

            // This replaces optimistic data with real server data
            queryClient.invalidateQueries({ queryKey: ['products'] })

            if (error) {
                console.info(
                    '🛠️ After error: Cache restored to pre-optimistic state',
                )
            } else {
                console.info(
                    '🔄 After success: Optimistic data replaced with real server data',
                )
                console.info('🎭 User never notices the switch (if done right)')
            }
            console.info('🎬 === DEMO COMPLETE ===\n')
        },
    })

    const handleSubmit = (evt: React.FormEvent) => {
        evt.preventDefault()
        if (!title.trim() || !price.trim()) return

        const priceNumber = parseFloat(price)
        if (Number.isNaN(priceNumber) || priceNumber <= 0) return

        console.clear() // Clear console for clean demo
        addProductMutation.mutate({
            title: title.trim(),
            price: priceNumber,
        })
    }

    return (
        <div className="max-w-2xl bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center">
                🎭 Optimistic Updates Live Demo
            </h2>

            {/* 🎯 DEMO MODE SELECTOR */}
            <section className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-bold text-yellow-800 mb-3">
                    📋 Demo Scenarios for Your Team:
                </h3>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="demoMode"
                            value="normal"
                            checked={demoMode === 'normal'}
                            onChange={(evt) =>
                                setDemoMode(
                                    evt.target.value as
                                        | 'normal'
                                        | 'slow'
                                        | 'error',
                                )
                            }
                            className="mr-2"
                        />
                        <span className="font-medium">🟢 Normal Success</span> -
                        Real dummyjson API call (~500ms)
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="demoMode"
                            value="slow"
                            checked={demoMode === 'slow'}
                            onChange={(evt) =>
                                setDemoMode(
                                    evt.target.value as
                                        | 'normal'
                                        | 'slow'
                                        | 'error',
                                )
                            }
                            className="mr-2"
                        />
                        <span className="font-medium">🐌 Slow Network</span> - 6
                        second delay to see Optimistic Update clearly
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="demoMode"
                            value="error"
                            checked={demoMode === 'error'}
                            onChange={(evt) =>
                                setDemoMode(
                                    evt.target.value as
                                        | 'normal'
                                        | 'slow'
                                        | 'error',
                                )
                            }
                            className="mr-2"
                        />
                        <span className="font-medium">💥 Server Error</span> -
                        Simulate failure to see rollback
                    </label>
                </div>
            </section>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <section>
                    <label
                        htmlFor="title-input"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Product Title
                    </label>
                    <input
                        id="title-input"
                        type="text"
                        value={title}
                        onChange={(evt) => setTitle(evt.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., phone"
                        disabled={addProductMutation.isPending}
                    />
                </section>

                <section>
                    <label
                        htmlFor="price-input"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Price ($)
                    </label>
                    <input
                        id="price-input"
                        type="number"
                        value={price}
                        onChange={(evt) => setPrice(evt.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 9"
                        min="0"
                        step="0.01"
                        disabled={addProductMutation.isPending}
                    />
                </section>

                <button
                    type="submit"
                    disabled={
                        addProductMutation.isPending ||
                        !title.trim() ||
                        !price.trim()
                    }
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {addProductMutation.isPending
                        ? `⚡ ${demoMode === 'slow' ? 'Watch the product list!' : 'Adding...'} (${demoMode.toUpperCase()})`
                        : `🚀 Add Product (${demoMode.toUpperCase()} Mode)`}
                </button>
            </form>

            {/* STATUS DISPLAY */}
            <section className="mt-6 space-y-3">
                {/* Debug Status */}
                <div className="p-3 bg-gray-100 rounded text-sm font-mono">
                    <strong>Live Status:</strong>
                    <br />
                    isPending:{' '}
                    {addProductMutation.isPending ? '✅ YES' : '❌ NO'}
                    <br />
                    isError: {addProductMutation.isError ? '✅ YES' : '❌ NO'}
                    <br />
                    isSuccess:{' '}
                    {addProductMutation.isSuccess ? '✅ YES' : '❌ NO'}
                    <br />
                    Mode:{' '}
                    <span className="font-bold">{demoMode.toUpperCase()}</span>
                </div>

                {/* Error State */}
                {addProductMutation.isError && (
                    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        <strong>💥 Demo Error Scenario!</strong>
                        <br />
                        <span className="text-sm">
                            The product appeared instantly, then disappeared
                            when server failed.
                            <br />
                            Error: {addProductMutation.error?.message}
                        </span>
                    </div>
                )}

                {/* Success State */}
                {addProductMutation.isSuccess && (
                    <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        <strong>✅ Demo Success!</strong>
                        <br />
                        <span className="text-sm">
                            Product appeared instantly, then server confirmed it
                            was real!
                        </span>
                    </div>
                )}
            </section>

            {/* INSTRUCTIONS FOR ORGANIZATION */}
            <section className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">
                    🎓 Instructions for Your Organization Demo:
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                    <li>
                        <strong>Open Browser Console</strong> (F12) to see
                        detailed logs
                    </li>
                    <li>
                        <strong>Watch the Product List</strong> on the right
                        side while adding products
                    </li>
                    <li>
                        <strong>Try Normal Mode:</strong> See instant feedback +
                        real server confirmation
                    </li>
                    <li>
                        <strong>Try Slow Mode:</strong> Watch product appear
                        immediately despite 3s delay
                    </li>
                    <li>
                        <strong>Try Error Mode:</strong> See product appear then
                        disappear (rollback)
                    </li>
                    <li>
                        <strong>Note:</strong> Console shows the "fake vs real"
                        data comparison
                    </li>
                </ol>
            </section>
        </div>
    )
}
