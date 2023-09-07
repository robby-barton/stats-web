'use client';

import { useEffect, useState } from 'react';
import Image, { ImageLoaderProps } from 'next/image';
import { useTheme } from 'next-themes';

import { ERROR_IMAGES } from '@lib/constants';
import { Team } from '@lib/types';

function getImgSrc(mode: string | undefined, team: Team): string {
	const errImg = ERROR_IMAGES[team.team_id % 3];
	switch (mode) {
		case 'light':
			return team.logo || errImg;
		case 'dark':
			return team.logo_dark || errImg;
		default:
			return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
	}
}

function espnLoader({ src, width, quality }: ImageLoaderProps) {
	return `https://a.espncdn.com/combiner/i?img=${src}&w=${width}&h=${width}&scale=crop&cquality=${
		quality || 75
	}&location=origin`;
}

export default function TeamLogo({ team }: { team: Team }) {
	const { resolvedTheme } = useTheme();
	const [img, setImg] = useState<string>('');

	useEffect(() => {
		if (resolvedTheme !== '') {
			setImg(getImgSrc(resolvedTheme, team));
		}
	}, [resolvedTheme]); // eslint-disable-line react-hooks/exhaustive-deps

	function teamLogo() {
		if (img === '') {
			return null;
		}

		const sliceIndex = img.indexOf('/i/teamlogos/ncaa');

		if (sliceIndex < 0) {
			return (
				<Image
					src={img}
					onError={() => {
						setImg('/pups.png');
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
					setImg('/pups.png');
				}}
				alt={team.name}
				fill
				sizes="4rem, 2rem"
				placeholder="empty"
			/>
		);
	}

	return teamLogo();
}
