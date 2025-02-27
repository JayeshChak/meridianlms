// types.ts

export type Lecture = {
	title: string;
	id: string;
	chapter_id: string;
	duration: string;
	description: string | null;
	order: string | null;
	video_url: string;
	is_preview: boolean | null;
	is_locked: boolean | null;
};

export interface Chapter {
	id: string | number;
	title: string;
	description?: string;
	order?: string;
	duration?: string;
	Lectures?: Lecture[];
	questionnaire_id?: string;
}

// types/User.ts
export interface User {
	id: string;
	name: string;
	email: string;
	username: string;
	phoneNumber: string;
	unique_identifier: string;
	enrolledCoursesCount: number;
	created_at: string;
	roles: string[];
	// Add other relevant fields as needed
}

export interface UserTableProps {
	users: User[];
	setUsers: React.Dispatch<React.SetStateAction<User[]>>;
	isLoading: boolean;
	fallbackMessage?: string; // Optional prop for custom messages
}
// types/UserDetails.ts
export interface EnrolledCourse {
	course_id: string;
	progress: number;
	completedLectures: string[];
}

export interface UserSocials {
	facebook: string;
	twitter: string;
	linkedin: string;
	website: string;
	github: string;
}

// src/types/type.ts

export interface UserDetailsType {
	id: string;
	name: string;
	username?: string;
	phone?: string;
	email: string;
	image?: string;
	roles: string[];
	is_verified: boolean;
	created_at: string;
	updated_at: string;
	biography: string;
	expertise: string[];
	registration_date: string;
	enrolled_courses?: any[]; // Define a proper type based on your course structure
	wishlist?: any[]; // Define a proper type based on your wishlist structure
	socials: {
		facebook: string;
		twitter: string;
		linkedin: string;
		website: string;
		github: string;
	};
}

// types.ts for -> Certification

export interface TextElement {
	id: string;
	text: string;
	x: number;
	y: number;
	fontSize: number;
	fontFamily: string;
	fill: string;
}

// export interface ImageElement {
//   id: string;
//   src: string;
//   x: number;
//   y: number;
// }
// types/type.ts

export interface ImageElement {
	id: string;
	src: string;
	x: number;
	y: number;
	width?: number;
	height?: number;
}
