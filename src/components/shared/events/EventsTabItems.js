import React from "react";
import EventsTabItem from "./EventsTabItem";
import eventImage1 from "@/assets/images/Event/event__1.png";
import eventImage2 from "@/assets/images/Event/event__2.png";
import eventImage3 from "@/assets/images/Event/event__3.png";
import eventImage4 from "@/assets/images/Event/event__4.png";
const EventsTabItems = ({ events, idx: currentEvent }) => {
	const images = [eventImage1, eventImage2, eventImage3, eventImage4];
	const reversedImages = [...images].reverse();

	return (
		<div className="flex flex-col gap-y-6">
			{events.map((Event, idx) => (
				<EventsTabItem
					key={idx}
					idx={idx}
					Event={{
						...Event,
						image:
							currentEvent === 0
								? images[idx]
								: reversedImages[idx],
					}}
				/>
			))}
		</div>
	);
};

export default EventsTabItems;
