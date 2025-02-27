// Convert local path to URL for videos
export const convertLocalPathToUrl = (video_url: string) => {
	if (video_url.startsWith("D:\\AI_LMS\\public\\uploads\\")) {
		return video_url.replace("D:\\AI_LMS\\public\\uploads\\", "/uploads/");
	}
	return video_url;
};
