"use client";
import useSweetAlert from "@/hooks/useSweetAlert";
import addItemsToLocalstorage from "@/libs/addItemsToLocalstorage";
import getItemsFromLocalstorage from "@/libs/getItemsFromLocalstorage";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const cartContext = createContext(null);

const CartContextProvider = ({ children }) => {
	const [cartProducts, setCartProducts] = useState([]);
	const [error, setError] = useState(null); // To store errors
	const creteAlert = useSweetAlert();
	const { data: session } = useSession();
	const user_id = session?.User?.id; // Static User ID for now (can be replaced with dynamic user_id from session)

	useEffect(() => {
		if (user_id) {
			fetchCartFromDB();
		} else {
			const cartFromLocalStorage = getItemsFromLocalstorage("Cart");
			if (cartFromLocalStorage) {
				setCartProducts(cartFromLocalStorage);
			}
		}
	}, [fetchCartFromDB, user_id]);

	const clearCart = async () => {
		// Clear Cart in state
		setCartProducts([]);

		// Clear Cart in local storage
		addItemsToLocalstorage("Cart", []);

		// Clear Cart in the database if User is logged in
		if (user_id) {
			try {
				const response = await fetch(`/api/User/${user_id}/Cart`, {
					method: "DELETE",
				});

				if (!response.ok) {
					const data = await response.json();
					console.error(
						"Failed to clear Cart on server:",
						data.error || "Unknown error"
					);
					throw new Error(
						data.error || "Failed to clear Cart on server."
					);
				}

				creteAlert("success", "Cart cleared on server.");
			} catch (err) {
				console.error(
					"Error clearing Cart on server:",
					err.message || err
				);
				setError(err.message || "Failed to clear Cart on server.");
			}
		} else {
			creteAlert("success", "Cart cleared locally.");
		}
	};

	// Fetch Cart items from the database
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const fetchCartFromDB = async () => {
		try {
			const response = await fetch(`/api/User/${user_id}/Cart`);

			if (!response.ok) {
				throw new Error(`Failed to fetch Cart: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.length === 0) {
				console.log("No items in the Cart");
				return;
			}

			// Process and update the Cart data
			const updatedCart = data.map((item) => ({
				...item,
				discount: calculateDiscount(item.price, item.estimated_price),
			}));

			setCartProducts(updatedCart);
			addItemsToLocalstorage("Cart", updatedCart);
		} catch (err) {
			console.error("Error fetching Cart:", err.message || err);
			setError(err.message || "Failed to fetch Cart items.");
		}
	};

	// Calculate discount based on price and estimated price
	const calculateDiscount = (price, estimated_price) => {
		const discount = (estimated_price - price).toFixed(2); // Calculate the difference
		return discount > 0 ? discount : "0.00"; // Only return discount if it's greater than 0
	};

	const addProductToCart = async (currentCourse) => {
		const { course_id } = currentCourse;
		const isAlreadyExist = cartProducts.some(
			({ course_id: id }) => id === course_id
		);

		if (isAlreadyExist) {
			creteAlert("error", "Course already in Cart.");
			return;
		}

		const updatedCart = [...cartProducts, currentCourse];
		setCartProducts(updatedCart);
		addItemsToLocalstorage("Cart", updatedCart);
		creteAlert("success", "Course added to Cart.");

		try {
			const response = await fetch(`/api/User/${user_id}/Cart`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ course_id }),
			});
			if (!response.ok) {
				throw new Error("Failed to add course to the Cart");
			}
			creteAlert("success", "Course successfully added to server Cart.");
		} catch (error) {
			console.error(
				"Failed to sync Cart with the server:",
				error.message || error
			);
			setError(error.message || "Failed to sync Cart with the server.");
		}
	};

	const deleteProductFromCart = async (cartId) => {
		if (!cartId) {
			console.error("Cart ID is required.");
			return;
		}

		console.log("Removing Cart item with ID:", cartId);

		const updatedCart = cartProducts.filter(
			(product) => product.cartId !== cartId
		);
		setCartProducts(updatedCart);
		addItemsToLocalstorage("Cart", updatedCart);
		creteAlert("success", "Course removed from Cart.");

		try {
			const response = await fetch(
				`/api/User/${user_id}/Cart?cartId=${cartId}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				const data = await response.json();
				console.error(
					"Failed to remove course from server Cart:",
					data.error || "Unknown error"
				);
				throw new Error(
					data.error || "Failed to remove course from server Cart."
				);
			}

			creteAlert("success", "Course removed from server Cart.");
		} catch (err) {
			console.error(
				"Error removing course from server Cart:",
				err.message || err
			);
			setError(
				err.message || "Failed to remove course. Please try again."
			);
		}
	};

	// Handling rendering when error exists
	if (error) {
		console.error("Rendering error:", error); // Ensure errors are logged but not rendered directly
		return <div className="error-message">Error: {error}</div>; // Display a safe error message
	}

	return (
		<cartContext.Provider
			value={{
				clearCart, // Expose clearCart function
				cartProducts,
				addProductToCart,
				deleteProductFromCart,
			}}
		>
			{children}
		</cartContext.Provider>
	);
};

export const useCartContext = () => {
	return useContext(cartContext);
};
export default CartContextProvider;
