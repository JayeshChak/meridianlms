import { db } from "@/db";
import { sql } from "drizzle-orm";
import { Courses } from "@/db/schemas/Courses";
import { Orders } from "@/db/schemas/Orders";
import { User } from "@/db/schemas/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const page = parseInt(url.searchParams.get("page") || "1");
	const limit = 10;
	const offset = (page - 1) * limit;

	try {
		const result = await db
			.select({
				instructorId: User.id,
				instructorName: User.name,
				profileImage: User.image,
				courseCount: sql`COUNT(DISTINCT ${Courses.id}) AS course_count`,
				totalEnrollments: sql`COALESCE(SUM(${Courses.enrolled_count}), 0) AS total_enrollments`,
				totalRevenue: sql`COALESCE(SUM(${Orders.total_amount}), 0) AS total_revenue`,
				reviewCount: sql`COALESCE(SUM(jsonb_array_length(${Courses.reviews}::jsonb)), 0) AS review_count`,
				avgRating: sql`COALESCE(AVG((review->>'rating')::numeric), 0) AS avg_rating`, // Lateral join for individual review ratings
				wishlistCount: sql`COALESCE(SUM(jsonb_array_length(${User.wishlist}::jsonb)), 0) AS wishlist_count`,
				enrolledCoursesCount: sql`COALESCE(SUM(jsonb_array_length(${User.enrolled_courses}::jsonb)), 0) AS enrolled_courses_count`,
				popularityScore: sql`
          COALESCE(SUM(${Courses.enrolled_count}), 0) * 0.3 + 
          COALESCE(SUM(${Orders.total_amount}), 0) * 0.2 + 
          COALESCE(SUM(jsonb_array_length(${Courses.reviews}::jsonb)), 0) * 0.1 + 
          COALESCE(AVG((review->>'rating')::numeric), 0) * 0.3 + 
          COALESCE(SUM(jsonb_array_length(${User.wishlist}::jsonb)), 0) * 0.1 + 
          COUNT(DISTINCT ${Courses.id}) * 0.1
        `.as("popularity_score"),
			})
			.from(User)
			.leftJoin(Courses, sql`${Courses.user_id} = ${User.id}`)
			.leftJoin(
				Orders,
				sql`${Orders.user_id} = ${User.id} AND ${Orders.items}::jsonb @> jsonb_build_object('course_id', ${Courses.id}::text)::jsonb`
			)
			.leftJoin(
				sql`LATERAL jsonb_array_elements(${Courses.reviews}::jsonb) AS review`,
				true
			)
			.where(sql`${User.roles}::jsonb @> '[\"instructor\"]'::jsonb`)
			.groupBy(User.id)
			.orderBy(sql`popularity_score DESC`)
			.limit(limit)
			.offset(offset);

		return NextResponse.json({ instructors: result });
	} catch (error) {
		console.error("Error fetching instructors:", error);
		return NextResponse.json(
			{ error: "Failed to fetch instructors" },
			{ status: 500 }
		);
	}
}

// import { db } from "@/db";
// import { sql } from "drizzle-orm";
// import { Courses } from "@/db/schemas/Courses";
// import { Orders } from "@/db/schemas/Orders";
// import { User } from "@/db/schemas/User";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   const url = new URL(req.url);
//   const page = parseInt(url.searchParams.get('page') || '1');
//   const limit = 10;
//   const offset = (page - 1) * limit;

//   try {
//     const result = await db
//       .select({
//         instructorId: User.id,
//         instructorName: User.name,
//         profileImage: User.image,
//         courseCount: sql`COUNT(DISTINCT ${Courses.id}) AS course_count`,
//         totalEnrollments: sql`COALESCE(SUM(${Courses.enrolled_count}), 0) AS total_enrollments`,
//         totalRevenue: sql`COALESCE(SUM(${Orders.total_amount}), 0) AS total_revenue`,
//         reviewCount: sql`COALESCE(SUM(jsonb_array_length(${Courses.reviews}::jsonb)), 0) AS review_count`,
//         avgRating: sql`COALESCE(AVG((review->>'rating')::numeric), 0) AS avg_rating`, // Lateral join for individual review ratings
//         wishlistCount: sql`COALESCE(SUM(jsonb_array_length(${User.wishlist}::jsonb)), 0) AS wishlist_count`,
//         popularityScore: sql`
//           COALESCE(SUM(${Courses.enrolled_count}), 0) * 0.3 +
//           COALESCE(SUM(${Orders.total_amount}), 0) * 0.2 +
//           COALESCE(SUM(jsonb_array_length(${Courses.reviews}::jsonb)), 0) * 0.1 +
//           COALESCE(AVG((review->>'rating')::numeric), 0) * 0.3 +
//           COALESCE(SUM(jsonb_array_length(${User.wishlist}::jsonb)), 0) * 0.1 +
//           COUNT(DISTINCT ${Courses.id}) * 0.1
//         `.as("popularity_score"),
//       })
//       .from(User)
//       .leftJoin(Courses, sql`${Courses.user_id} = ${User.id}`)
//       .leftJoin(Orders, sql`${Orders.user_id} = ${User.id} AND ${Orders.items}::jsonb @> jsonb_build_object('course_id', ${Courses.id}::text)::jsonb`)
//       .leftJoin(
//         sql`LATERAL jsonb_array_elements(${Courses.reviews}::jsonb) AS review`,
//         true
//       )
//       .where(sql`${User.roles}::jsonb @> '[\"instructor\"]'::jsonb`)
//       .groupBy(User.id)
//       .orderBy(sql`popularity_score DESC`)
//       .limit(limit)
//       .offset(offset);

//     return NextResponse.json({ instructors: result });
//   } catch (error) {
//     console.error("Error fetching instructors:", error);
//     return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 });
//   }
// }
