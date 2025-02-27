/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	unoptimized: true,
	images: {
		remotePatterns: [
			// {
			//   protocol : 'https',
			//   hostname : '***/res.cloudinary.com',
			//   pathname : '/ddj5gisb3/image/upload/**',
			//   port : '',
			// }
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				pathname: "/ddj5gisb3/image/upload/**",
			},
		],
	},
};

export default nextConfig;

// https://res.cloudinary.com/ddj5gisb3/image/upload/v1728283106/Courses/ai-generated-8136172_1280_a3p57l.png
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'res.cloudinary.com',
//         pathname: '/ddj5gisb3/image/upload/**',
//       },
//     ],
//   },
// };

// export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
// };

// export default nextConfig;
