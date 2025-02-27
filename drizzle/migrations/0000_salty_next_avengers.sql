CREATE TABLE IF NOT EXISTS "Blog" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"desc" text NOT NULL,
	"date" text NOT NULL,
	"publish_date" text NOT NULL,
	"month" text NOT NULL,
	"author_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Cart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CertificateIssuance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificate_id" uuid NOT NULL,
	"issued_by" uuid NOT NULL,
	"issued_to" uuid NOT NULL,
	"signature" text,
	"description" text,
	"issuance_unique_identifier" text NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"revocation_reason" text,
	"is_expired" boolean DEFAULT false NOT NULL,
	"expiration_date" timestamp,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "CertificateIssuance_issuanceUniqueIdentifier_unique" UNIQUE("issuance_unique_identifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CertificateTracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificate_id" uuid NOT NULL,
	"verification_code" text NOT NULL,
	"holder_name" text NOT NULL,
	"issue_date" timestamp NOT NULL,
	"expiry_date" timestamp,
	"last_verified_at" timestamp,
	"status" text NOT NULL,
	"grade" text,
	"score" text,
	"digital_signature" text,
	"verification_history" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "CertificateTracking_verificationCode_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Certification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"certificate_data_url" text NOT NULL,
	"description" text DEFAULT 'description' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"unique_identifier" text NOT NULL,
	"title" text DEFAULT 'title_here' NOT NULL,
	"expiration_date" timestamp,
	"is_revocable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"metadata" jsonb,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"orientation" text DEFAULT 'landscape' NOT NULL,
	"max_download" integer DEFAULT 1 NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"course_id" uuid NOT NULL,
	CONSTRAINT "Certification_uniqueIdentifier_unique" UNIQUE("unique_identifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"questionnaire_id" uuid,
	"order" varchar(50),
	"duration" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"questionnaire_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"lesson" varchar(100) NOT NULL,
	"duration" varchar(100) NOT NULL,
	"featured" boolean DEFAULT false,
	"estimated_price" numeric(10, 2),
	"is_free" boolean DEFAULT false,
	"tag" varchar(100) NOT NULL,
	"skill_level" varchar(100) NOT NULL,
	"Categories" json DEFAULT ('[]') NOT NULL,
	"instructor_name" varchar(255) NOT NULL,
	"thumbnail" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"demo_video_url" varchar(500),
	"is_published" boolean DEFAULT false,
	"enrolled_count" numeric(10, 0) DEFAULT '0' NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"extras" json DEFAULT '{}' NOT NULL,
	"reviews" json DEFAULT '[]' NOT NULL,
	"comments" json DEFAULT '[]' NOT NULL,
	"certificate_id" uuid,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Event" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"duration" text NOT NULL,
	"speaker" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"path" varchar(255),
	"size" integer,
	"course_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "InstructorApplications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"instructor_bio" text DEFAULT '',
	"qualifications" json DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Lectures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"duration" varchar(100) NOT NULL,
	"video_url" varchar(500) NOT NULL,
	"is_preview" boolean DEFAULT false,
	"is_locked" boolean DEFAULT true,
	"order" varchar(50)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ManageCertificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"course_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" text DEFAULT 'false' NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Meeting" (
	"id" bigint PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"duration" text NOT NULL,
	"starting_time" text NOT NULL,
	"speaker_name" text NOT NULL,
	"department" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method" text NOT NULL,
	"items" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Placeholders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificate_id" uuid NOT NULL,
	"key" text NOT NULL,
	"discount" integer DEFAULT 0,
	"x" numeric(10, 2) DEFAULT '0' NOT NULL,
	"y" numeric(10, 2) DEFAULT '0' NOT NULL,
	"font_size" numeric DEFAULT '12' NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"label" text DEFAULT 'PlaceHolderLabel' NOT NULL,
	"color" text DEFAULT '#000000' NOT NULL,
	"value" text DEFAULT 'PlaceHolderValue' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"course_id" uuid NOT NULL,
	"chapter_id" uuid,
	"is_required" boolean DEFAULT true,
	"min_pass_score" integer DEFAULT 80,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questionnaire_id" uuid,
	"question" text,
	"options" text,
	"correct_answer" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"questionnaire_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unique_identifier" text NOT NULL,
	"name" text NOT NULL,
	"username" text,
	"phone" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"roles" json DEFAULT '["User"]'::json NOT NULL,
	"enrolled_courses" json DEFAULT '[]'::json NOT NULL,
	"wishlist" json DEFAULT '[]'::json NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"activation_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"instructor_bio" text DEFAULT '',
	"qualifications" json DEFAULT '[]'::json NOT NULL,
	CONSTRAINT "User_uniqueIdentifier_unique" UNIQUE("unique_identifier"),
	CONSTRAINT "User_username_unique" UNIQUE("username"),
	CONSTRAINT "User_phone_unique" UNIQUE("phone"),
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserCategories" (
	"user_id" uuid NOT NULL,
	"category_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserDetails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"biography" text,
	"expertise" text[] DEFAULT '{}'::text[] NOT NULL,
	"registration_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserSocials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"facebook" text DEFAULT '' NOT NULL,
	"twitter" text DEFAULT '' NOT NULL,
	"linkedin" text DEFAULT '' NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"github" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "VerificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "VerificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Cart" ADD CONSTRAINT "cart_userId_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Cart" ADD CONSTRAINT "cart_courseId_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_certificateId_certification_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."Certification"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_issuedBy_User_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CertificateIssuance" ADD CONSTRAINT "CertificateIssuance_issuedTo_User_id_fk" FOREIGN KEY ("issued_to") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "CertificateTracking" ADD CONSTRAINT "CertificateTracking_certificateId_certification_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."Certification"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Certification" ADD CONSTRAINT "certification_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Certification" ADD CONSTRAINT "Certification_ownerId_User_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Chapters" ADD CONSTRAINT "chapters_courseId_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_questionnaires" ADD CONSTRAINT "course_questionnaires_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_questionnaires" ADD CONSTRAINT "course_questionnaires_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."Questionnaires"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Courses" ADD CONSTRAINT "courses_userId_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_courseId_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Lectures" ADD CONSTRAINT "lectures_chapterId_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."Chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ManageCertificates" ADD CONSTRAINT "managecertificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ManageCertificates" ADD CONSTRAINT "managecertificates_courseFk" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Placeholders" ADD CONSTRAINT "placeholders_certificate_id_certification_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."Certification"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Placeholders" ADD CONSTRAINT "placeholders_certificate_id_certifications_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."Certification"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Questionnaires" ADD CONSTRAINT "questionnaires_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."Courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Questionnaires" ADD CONSTRAINT "questionnaires_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."Chapters"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."Questionnaires"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."Questionnaires"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserCategories" ADD CONSTRAINT "UserCategories_userId_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserCategories" ADD CONSTRAINT "UserCategories_categoryId_Categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserDetails" ADD CONSTRAINT "userDetails_userId_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSocials" ADD CONSTRAINT "UserSocials_userId_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "verificationTokenUnique" ON "VerificationToken" USING btree ("identifier","token");