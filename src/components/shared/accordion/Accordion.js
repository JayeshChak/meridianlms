const Accordion = ({ children, is_active, accordion, idx }) => {
	return (
		<li
			className={`accordion ${
				accordion === "secondary" ? "accordion-seondary mb-25px" : ""
			} ${is_active ? "active" : ""}`}
		>
			{accordion === "secondary" ? (
				<div className="bg-whiteColor border border-borderColor dark:bg-whiteColor-dark dark:border-borderColor-dark rounded-t-md">
					{children}
				</div>
			) : accordion === "secondaryLg" ? (
				<div
					className={`bg-whiteColor border border-borderAccordion dark:bg-whiteColor-dark dark:border-borderColor2-dark  ${
						idx === 3 ? "" : "border-b-0"
					}`}
				>
					{children}
				</div>
			) : (
				children
			)}
		</li>
	);
};

export default Accordion;
