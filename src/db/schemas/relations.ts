import { relations } from "drizzle-orm";
import { Chapters } from "./Chapters";
import { Courses } from "./Courses";
import { Lectures } from "./Lectures";

// Course Relations
export const CoursesRelations = relations(Courses, ({ many }) => ({
	chapters: many(Chapters), // Changed to lowercase for better readability
}));

// Chapter Relations
export const ChaptersRelations = relations(Chapters, ({ one, many }) => ({
	course: one(Courses, {
		fields: [Chapters.course_id],
		references: [Courses.id],
	}),
	lectures: many(Lectures), // Changed to lowercase for consistency
}));

// Lecture Relations
export const LecturesRelations = relations(Lectures, ({ one }) => ({
	chapter: one(Chapters, {
		fields: [Lectures.chapter_id],
		references: [Chapters.id],
	}),
}));
