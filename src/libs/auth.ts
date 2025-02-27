import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db"; // Ensure this path is correct
// import bcrypt from "bcrypt";
import bcrypt from "bcryptjs";
import { User } from "@/db/schemas/User";
import { eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { v4 as uuidv4 } from "uuid";

export const options = {
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_ID as string,
			clientSecret: process.env.GITHUB_SECRET as string,
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_ID as string,
			clientSecret: process.env.GOOGLE_SECRET as string,
		}),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials: any) {
				const foundUser = await db
					.select()
					.from(User)
					.where(eq(User.email, credentials.email))
					.limit(1)
					.then((res) => res[0]);

				if (!foundUser) {
					throw new Error("No User found with this email.");
				}

				if (!foundUser.is_verified && foundUser.activation_token) {
					throw new Error(
						"Please verify your email before logging in."
					);
				}

				const isValid = await bcrypt.compare(
					credentials.password,
					foundUser.password
				);
				if (!isValid) {
					throw new Error("Password does not match.");
				}

				return foundUser;
			},
		}),
	],
	callbacks: {
		async signIn({ User, account, profile }) {
			if (
				account.provider === "google" ||
				account.provider === "github"
			) {
				const email = User.email;

				// Check if the User already exists in the database
				let foundUser = await db
					.select()
					.from(User)
					.where(eq(User.email, email))
					.limit(1)
					.then((res) => res[0]);

				if (!foundUser) {
					// If the User doesn't exist, create a new User
					foundUser = await db
						.insert(User)
						.values({
							email: email,
							username:
								profile.login ||
								profile.name ||
								email.split("@")[0], // Fallback to email prefix if no username
							name: profile.name || email.split("@")[0],
							image: profile.picture || User.image,
							roles: sql`'["User"]'::json`, // Assign default role 'User'
							is_verified: true, // Consider OAuth users as verified
							activation_token: uuidv4(),
						})
						.returning()
						.then((res) => res[0]);
				}
			}
			return true;
		},
		async jwt({ token, User }) {
			if (User) {
				token.id = User.id;
				token.roles = User.roles; // Updated to handle multiple roles as JSON
			}
			return token;
		},
		async session({ session, token }) {
			session.User.id = token.id;
			session.User.roles = token.roles; // Updated to handle multiple roles
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: {
		signIn: "/login",
	},
};

export async function getSession(req: unknown) {
	return await getServerSession(options);
}

// import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { db } from "@/db"; // Ensure this path is correct
// import bcrypt from "bcrypt";
// import { User } from "@/db/schemas/User";
// import { eq } from "drizzle-orm";
// import { getServerSession } from "next-auth/next";
// import { v4 as uuidv4 } from "uuid";

// export const options = {
//   providers: [
//     GitHubProvider({
//       clientId: process.env.GITHUB_ID as string,
//       clientSecret: process.env.GITHUB_SECRET as string,
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID as string,
//       clientSecret: process.env.GOOGLE_SECRET as string,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials: any) {
//         const foundUser = await db
//           .select()
//           .from(User)
//           .where(eq(User.email, credentials.email))
//           .limit(1)
//           .then((res) => res[0]);

//         if (!foundUser) {
//           throw new Error("No User found with this email.");
//         }

//         if (!foundUser.is_verified && foundUser.activation_token) {
//           throw new Error("Please verify your email before logging in.");
//         }

//         const isValid = await bcrypt.compare(
//           credentials.password,
//           foundUser.password
//         );
//         if (!isValid) {
//           throw new Error("Password does not match.");
//         }

//         return foundUser;
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ User, account, profile }) {
//       if (account.provider === "google" || account.provider === "github") {
//         const email = User.email;

//         // Check if the User already exists in the database
//         let foundUser = await db
//           .select()
//           .from(User)
//           .where(eq(User.email, email))
//           .limit(1)
//           .then((res) => res[0]);

//         if (!foundUser) {
//           // If the User doesn't exist, create a new User
//           foundUser = await db
//             .insert(User)
//             .values({
//               email: email,
//               username: profile.login || profile.name || email.split("@")[0], // Fallback to email prefix if no username
//               name: profile.name || email.split("@")[0],
//               image: profile.picture || User.image,
//               role: "User",
//               is_verified: true, // Consider OAuth users as verified
//               activation_token: uuidv4(),
//             })
//             .returning()
//             .then((res) => res[0]);
//         }
//       }
//       return true;
//     },
//     async jwt({ token, User }) {
//       if (User) {
//         token.id = User.id;
//         token.role = User.role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.User.id = token.id;
//       session.User.role = token.role;
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/login",
//   },
// };

// export async function getSession(req) {
//   return await getServerSession(options);
// }

// import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { db } from "@/db"; // Ensure this path is correct
// import bcrypt from "bcrypt";
// import { User } from "@/db/schemas/User";
// import { eq } from "drizzle-orm";
// import { getServerSession } from "next-auth/next";

// export const options = {
//   providers: [
//     GitHubProvider({
//       clientId: process.env.GITHUB_ID,
//       clientSecret: process.env.GITHUB_SECRET,
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID,
//       clientSecret: process.env.GOOGLE_SECRET,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         // Fetch User from database
//         const foundUser = await db
//           .select()
//           .from(User)
//           .where(eq(User.email, credentials.email))
//           .limit(1)
//           .then((res) => res[0]);

//         if (!foundUser) {
//           throw new Error("No User found with this email.");
//         }

//         // // Check if User is verified
//         if (!foundUser.is_verified && foundUser.activation_token) {
//           throw new Error("Please verify your email before logging in.");
//         }

//         // Validate password
//         const isValid = await bcrypt.compare(credentials.password, foundUser.password);
//         if (!isValid) {
//           throw new Error("Password does not match.");
//         }

//         return foundUser;
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, User }) {
//       if (User) {
//         token.id = User.id;
//         token.role = User.role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.User.id = token.id;
//       session.User.role = token.role;
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/login",
//   },
// };

// export async function getSession(req) {
//   return await getServerSession(options);
// }
