import CartPrimary from "@/components/sections/Cart/CartPrimary";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";

const CartMain = () => {
	return (
		<>
			<HeroPrimary path={"Cart"} title={"Cart"} />
			<CartPrimary />
		</>
	);
};

export default CartMain;
