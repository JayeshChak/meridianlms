// style controllers

const controllerStyle = (accordionController, is_active) => {
	const rotateAbleLine = accordionController.querySelectorAll("span")[1];

	if (rotateAbleLine) {
		rotateAbleLine.style.transform = !is_active
			? "rotate(0deg)"
			: "rotate(90deg)";
	}
};

// accordion hide and show
const toggleAccordion = (accordion, is_active, currentIndex, index) => {
	const parentContent = accordion.closest(".accordion-content");
	const content = accordion.querySelector(".accordion-content");
	const contentWrapper = accordion.querySelector(".content-wrapper");
	const contentHeight = contentWrapper.offsetHeight;

	let contenStyleHeight = content.style.height;
	if (contenStyleHeight === "auto") {
		content.style.height = `${contentHeight}px`;
	}

	setTimeout(() => {
		content.style.height = !is_active ? `${contentHeight}px` : 0;
	}, 1);
	if (!is_active) {
		setTimeout(() => {
			if (!parentContent) {
				content.style.height = `auto`;
			}
		}, 500);
	}
};

// get accordion controller and listen click Event
const accordionController = (accordionContainer) => {
	const groupOfAccordion = [...accordionContainer.children];

	groupOfAccordion.forEach((accordion, idx) => {
		const accordionController = accordion.querySelector(
			".accordion-controller"
		);
		const isInitialyActive = accordion.classList.contains("active");

		if (isInitialyActive) {
			const contents = accordion.querySelector(".accordion-content");
			const contentHeight = contents.children[idx].offsetHeight;
			if (contentHeight) {
				contents.style.height = `${contentHeight}px`;
			}
		}

		if (accordionController) {
			accordionController.addEventListener("click", function () {
				const currentAccordion = this.closest(".accordion");

				const is_active = currentAccordion.classList.contains("active");
				let waitForDblClick = setTimeout(() => {
					groupOfAccordion.forEach((accordion, idx1) => {
						const isAccordionController = accordion.querySelector(
							".accordion-controller"
						);

						if (isAccordionController) {
							accordion.classList.remove("active");
							const accordionController = accordion.querySelector(
								".accordion-controller"
							);
							controllerStyle(accordionController, true);
							toggleAccordion(accordion, true, idx, idx1);
						}
					});
					if (!is_active) {
						currentAccordion.classList.add("active");
						controllerStyle(accordionController, false);
						toggleAccordion(currentAccordion, false);
					}
				}, 10);
				accordionController.addEventListener("dblclick", function () {
					clearTimeout(waitForDblClick);
				});
			});
		}
	});
};
const accordions = () => {
	const accordionContainers = document.querySelectorAll(
		".accordion-container"
	);

	if (!accordionContainers.length) {
		return;
	}
	accordionContainers.forEach((accordionContainer) => {
		accordionController(accordionContainer);
	});
};

export default accordions;
