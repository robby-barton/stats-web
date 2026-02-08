import { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react';

type ContextProps = {
	colorMode: string;
	setColorMode: (value: string) => void;
};
export const ThemeContext = createContext<ContextProps>({} as ContextProps);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
	const [colorMode, rawSetColorMode] = useState<string>('');

	useEffect(() => {
		rawSetColorMode(document.body.dataset.theme as string);
	}, []);

	const contextValue = useMemo(() => {
		function setColorMode(newValue: string) {
			document.body.dataset.theme = newValue;
			window.localStorage.setItem('theme', newValue);

			rawSetColorMode(newValue);
			window.dispatchEvent(new CustomEvent('theme-change', { detail: newValue }));
		}

		return {
			colorMode,
			setColorMode,
		};
	}, [colorMode, rawSetColorMode]);

	useEffect(() => {
		function syncTheme() {
			const current = document.body.dataset.theme as string;
			if (current && current !== colorMode) {
				rawSetColorMode(current);
			}
		}

		window.addEventListener('theme-change', syncTheme);
		return () => {
			window.removeEventListener('theme-change', syncTheme);
		};
	}, [colorMode]);

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
