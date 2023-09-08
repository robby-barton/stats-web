import { useContext, useEffect, useState } from "react";

import Image, { ImageLoaderProps } from "next/image";

import styles from "@components/teamName.module.css";
import { ThemeContext } from "@components/themeProvider";
import { ERROR_IMAGES } from "@lib/constants";
import { Team } from "@lib/types";

function getImgSrc(mode: string, team: Team): string {
	const errImg = ERROR_IMAGES[team.team_id % 3];
	switch (mode) {
		case "light":
			return team.logo || errImg;
		case "dark":
			return team.logo_dark || errImg;
	}

	return errImg;
}

function espnLoader({ src, width, quality }: ImageLoaderProps) {
	return `https://a.espncdn.com/combiner/i?img=${src}&w=${width}&h=${width}&scale=crop&cquality=${
		quality || 75
	}&location=origin`;
}

type TeamName = {
	team: Team;
};
export default function TeamName({ team }: TeamName) {
	const { colorMode } = useContext(ThemeContext);
	const [img, setImg] = useState<string>("");

	useEffect(() => {
		if (colorMode !== "") {
			setImg(getImgSrc(colorMode, team));
		}
	}, [colorMode]); // eslint-disable-line react-hooks/exhaustive-deps

	function teamLogo() {
		if (img === "") {
			return null;
		}

		const sliceIndex = img.indexOf("/i/teamlogos/ncaa");

		if (sliceIndex < 0) {
			return (
				<Image
					src={img}
					onError={() => {
						setImg("/pups.png");
					}}
					alt={team.name}
					fill
					sizes="2rem"
					placeholder="empty"
				/>
			);
		}

		return (
			<Image
				loader={espnLoader}
				src={img.slice(sliceIndex)}
				onError={() => {
					setImg("/pups.png");
				}}
				alt={team.name}
				fill
				sizes="4rem, 2rem"
				placeholder="empty"
			/>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.logo}>{teamLogo()}</div>
			<div className={styles.name}>
				<span>{team.name}</span>
			</div>
		</div>
	);
}
