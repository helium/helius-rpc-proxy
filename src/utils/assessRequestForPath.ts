export const assessRequestForPath = (request: Request): boolean => {
	const { pathname } = new URL(request.url); 

  // If pathname is just "/", then there is no path.
  // If pathname is something like "/path/on/request", then there is a path.
  return pathname !== "/";
};
