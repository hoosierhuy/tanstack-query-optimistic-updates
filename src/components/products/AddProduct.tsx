import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { NewProduct, ProductResponse } from './productTypes'

// 🤔 PESSIMISTIC UPDATE
export default function AddProduct() {
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')

    const queryClient = useQueryClient()

    const addProductMutation = useMutation({
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
        // BEFORE: Nothing happened here - we waited for the server response
        // BEFORE: We invalidated queries and reset the form
        onSuccess: (data) => {
            console.info('Product added successfully:', data)
            // Invalidate products query to refetch the list
            // BEFORE: Only invalidated on success
            queryClient.invalidateQueries({ queryKey: ['products'] })
            // Reset form
            setTitle('')
            setPrice('')
        },
        // BEFORE: We just showed an error message
        onError: (error) => {
            console.error('Error adding product:', error)
            // No rollback needed - UI was NEVER updated optimistically
            // No optimistic update happened → No rollback needed
            // Error just shows, but UI was never changed
        },
    })

    // Form submission handler
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

        addProductMutation.mutate({
            title: title.trim(),
            price: priceNumber,
        })
    }

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>

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
                        placeholder="Enter product title"
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
                        placeholder="Enter price"
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
                        ? 'Adding Product...'
                        : 'Add Product'}
                </button>
            </form>

            {/* Error State */}
            {addProductMutation.isError && (
                <section className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>❌ Request Failed!</strong>
                    <br />
                    The product was not added to the server.
                    <br />
                    Error:{' '}
                    {addProductMutation.error?.message ||
                        'Failed to add product'}
                </section>
            )}

            {addProductMutation.isSuccess && (
                <section className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    <strong>✅ Product Added Successfully!</strong>
                    <br />
                    The product was confirmed by the server and added to the
                    list.
                </section>
            )}
        </div>
    )
}
