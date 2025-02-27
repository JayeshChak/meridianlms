// tab controller
const filter = () => {
	if (typeof window !== "undefined") {
		import("isotope-layout").then(({ default: Isotope }) => {
			//isotop
			var grid = document.querySelector(".filter-contents");
			if (grid) {
				var iso = new Isotope(grid, {
					// options...
					itemSelector: ".grid-item",
					percentPosition: true,
					masonry: {
						columnWidth: ".grid-item",
					},
				});
				// filter functions
				var filterFns = {
					// show if number is greater than 50
					numberGreaterThan50: function (itemElem) {
						var number =
							itemElem.querySelector(".number").textContent;
						return parseInt(number, 10) > 50;
					},
					// show if name ends with -ium
					ium: function (itemElem) {
						var name = itemElem.querySelector(".name").textContent;
						return name.match(/ium$/);
					},
				};

				// bind filter button click
				var filtersElem = document.querySelector(
					".filters-button-group"
				);
				filtersElem.addEventListener("click", function (Event) {
					// only work with buttons
					// if (!matchesSelector(Event.target, "button")) {
					//   return;
					// }
					var filterValue = Event.target.getAttribute("data-filter");
					// use matching filter function
					filterValue = filterFns[filterValue] || filterValue;
					iso.arrange({ filter: filterValue });
				});

				// change is-checked class on buttons
				var buttonGroups = document.querySelectorAll(".button-group");
				for (var i = 0, len = buttonGroups.length; i < len; i++) {
					var buttonGroup = buttonGroups[i];
					radioButtonGroup(buttonGroup);
				}

				function radioButtonGroup(buttonGroup) {
					buttonGroup.addEventListener("click", function (Event) {
						// only work with buttons
						// if (!matchesSelector(Event.target, "button")) {
						//   return;
						// }
						buttonGroup
							.querySelector(".is-checked")
							.classList.remove("is-checked");
						Event.target.classList.add("is-checked");
					});
				}
			}
		});
	}
};

export default filter;
