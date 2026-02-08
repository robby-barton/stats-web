import { CSSProperties, useContext, useEffect, useState } from 'react';

import styles from '@components/teamName.module.css';
import { ThemeContext } from '@components/themeProvider';
import { ERROR_IMAGES } from '@lib/constants';
import { Team } from '@lib/types';

function getImgSrc(mode: string, team: Team): string {
	const errImg = ERROR_IMAGES[team.team_id % 3];
	switch (mode) {
		case 'light':
			return team.logo || errImg;
		case 'dark':
			return team.logo_dark || errImg;
	}

	return errImg;
}

function espnLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
	return `https://a.espncdn.com/combiner/i?img=${src}&w=${width}&h=${width}&scale=crop&cquality=${
		quality || 75
	}&location=origin`;
}

type TeamName = {
	team: Team;
};
export default function TeamName({ team }: TeamName) {
	const { colorMode } = useContext(ThemeContext);
	const [img, setImg] = useState<string>('');

	useEffect(() => {
		if (colorMode !== '') {
			setImg(getImgSrc(colorMode, team));
		}
	}, [colorMode]);

	function teamLogo() {
		if (img === '') {
			return null;
		}

		const sliceIndex = img.indexOf('/i/teamlogos/ncaa');
		const imgStyle: CSSProperties = {
			position: 'absolute',
			inset: 0,
			width: '100%',
			height: '100%',
			objectFit: 'contain',
		};

		if (sliceIndex < 0) {
			return (
				<img
					src={img}
					onError={() => {
						setImg('/pups.png');
					}}
					alt={team.name}
					style={imgStyle}
				/>
			);
		}

		return (
			<img
				src={espnLoader({ src: img.slice(sliceIndex), width: 64 })}
				onError={() => {
					setImg('/pups.png');
				}}
				alt={team.name}
				style={imgStyle}
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
