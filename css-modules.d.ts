// Ambient type for CSS module imports (Vite handles these at build time).
declare module '*.module.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}
