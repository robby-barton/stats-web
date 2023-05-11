import { useContext, useEffect, useState } from "react";

import Image, { StaticImageData } from "next/image";

import styles from "@components/teamName.module.css";
import { ThemeContext } from "@components/themeProvider";
import { ERROR_IMAGES } from "@lib/constants";

type TeamName = {
	team_id: number;
	name: string;
};
export default function TeamName({ team_id, name }: TeamName) {
	const { colorMode } = useContext(ThemeContext);
	const [img, setImg] = useState<string | StaticImageData>(
		`https://a.espncdn.com/i/teamlogos/ncaa/500${colorMode === "dark" ? "-dark" : ""}/${team_id}.png`
	);

	useEffect(() => {
		setImg(`https://a.espncdn.com/i/teamlogos/ncaa/500${colorMode === "dark" ? "-dark" : ""}/${team_id}.png`);
	}, [colorMode]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className={styles.container}>
			<div className={styles.logo}>
				<Image
					src={img}
					onError={() => {
						setImg(ERROR_IMAGES[team_id % ERROR_IMAGES.length]);
					}}
					alt={name}
					fill
					placeholder="empty"
				/>
			</div>
			<div className={styles.name}>
				<span>{name}</span>
			</div>
		</div>
	);
}
