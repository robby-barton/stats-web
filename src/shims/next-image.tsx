import { CSSProperties } from 'react';

export type ImageLoaderProps = {
	src: string;
	width: number;
	quality?: number;
};

type ImageProps = {
	alt: string;
	src: string;
	width?: number;
	height?: number;
	fill?: boolean;
	sizes?: string;
	className?: string;
	style?: CSSProperties;
	onError?: () => void;
	placeholder?: string;
	unoptimized?: boolean;
	loader?: (props: ImageLoaderProps) => string;
	quality?: number;
};

export default function Image({
	alt,
	src,
	width,
	height,
	fill,
	className,
	style,
	onError,
	loader,
	quality,
}: ImageProps) {
	const imgStyle: CSSProperties = fill
		? {
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				objectFit: 'contain',
				...style,
			}
		: { ...style };

	const resolvedSrc = loader ? loader({ src, width: width || 256, quality }) : src;

	return (
		<img
			alt={alt}
			src={resolvedSrc}
			width={width}
			height={height}
			className={className}
			style={imgStyle}
			onError={onError}
		/>
	);
}
