import { PropsWithChildren, createContext, useEffect, useMemo, useState } from "react";

type ContextProps = {
	colorMode: string;
	setColorMode: (value: string) => void;
};
export const ThemeContext = createContext<ContextProps>({} as ContextProps);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
	const [colorMode, rawSetColorMode] = useState<string>("");

	useEffect(() => {
		rawSetColorMode(document.body.dataset.theme as string);
	}, []);

	const contextValue = useMemo(() => {
		function setColorMode(newValue: string) {
			document.body.dataset.theme = newValue;
			window.localStorage.setItem("theme", newValue);

			rawSetColorMode(newValue);
		}

		return {
			colorMode,
			setColorMode,
		};
	}, [colorMode, rawSetColorMode]);

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
