import { useEffect, useState } from "react";

const useCartOfLocalStorage = () => {
	const [cartItems, setCartItems] = useState([]);

	useEffect(() => {
		let localStorageCart = JSON.parse(localStorage.getItem("Cart"));
		setCartItems(localStorageCart || null);
	}, []);

	//add Cart to local storage
	const addCartToLocalStorage = (newItems) => {
		localStorage.setItem("Cart", JSON.stringify([...newItems]));
	};
	// delete items from local storage
	const deleteCartFromLocalStorage = (newItems) => {
		localStorage.removeItem(JSON.parse([...newItems]));
	};

	return { cartItems, addCartToLocalStorage, deleteCartFromLocalStorage };
};

export default useCartOfLocalStorage;
