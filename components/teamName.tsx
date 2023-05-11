import { RefObject, useContext, useEffect, useRef, useState } from "react";

import Image, { StaticImageData } from "next/image";

import styles from "@components/teamName.module.css";
import { ThemeContext } from "@components/themeProvider";
import { ERROR_IMAGES } from "@lib/constants";

function useOnScreen(ref: RefObject<HTMLDivElement>) {
	const observerRef = useRef<IntersectionObserver | null>(null);
	const [isOnScreen, setIsOnScreen] = useState(false);

	useEffect(() => {
		observerRef.current = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting));
	}, []);

	useEffect(() => {
		if (observerRef.current && ref.current) {
			observerRef.current.observe(ref.current);
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	});

	return isOnScreen;
}

type TeamName = {
	team_id: number;
	name: string;
};
export default function TeamName({ team_id, name }: TeamName) {
	const { colorMode } = useContext(ThemeContext);
	const [img, setImg] = useState<string | StaticImageData>("");

	const elementRef = useRef<HTMLDivElement>(null);
	const isOnScreen = useOnScreen(elementRef);

	useEffect(() => {
		if (colorMode !== "") {
			setImg(`https://a.espncdn.com/i/teamlogos/ncaa/500${colorMode === "dark" ? "-dark" : ""}/${team_id}.png`);
		}
	}, [colorMode]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className={styles.container}>
			<div ref={elementRef} className={styles.logo}>
				{img === "" ? null : (
					<Image
						src={img}
						onError={() => {
							setImg(ERROR_IMAGES[team_id % ERROR_IMAGES.length]);
						}}
						alt={name}
						fill
						placeholder="empty"
						priority={isOnScreen}
					/>
				)}
			</div>
			<div className={styles.name}>
				<span>{name}</span>
			</div>
		</div>
	);
}
