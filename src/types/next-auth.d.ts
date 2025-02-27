import "next-auth";

declare module "next-auth" {
	interface Session {
		User: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
		};
	}
}
