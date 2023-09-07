'use client';

import { useTheme } from 'next-themes';

import styled from '@emotion/styled';

const ToggleButton = styled('button')`
  --toggle-width: 2.5rem;
  --toggle-height: 1.25rem;
  --toggle-padding: 0.125rem;
  position: relative;
  float: right;
  display: flex;
  align-items: center;
  justify-content: space-around;
  font-size: 0.70rem;
  width: var(--toggle-width);
  height: var(--toggle-height);
  padding: var(--toggle-padding);
  border: 0;
  border-radius: calc(var(--toggle-width) / 2);
  cursor: pointer;
  background: var(--color-bg-toggle);
  transition: background 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
  &:focus {
    outline-offset: 5px;
  }
  &:focus:not(:focus-visible) {
    outline: none;
  }
  &:hover {
    box-shadow: 0 0 5px 2px var(--color-bg-toggle);
  },
`;

type ThumbProps = {
	colorMode: string;
};
const ToggleThumb = styled('span')<ThumbProps>`
	position: absolute;
	top: var(--toggle-padding);
	left: var(--toggle-padding);
	width: calc(var(--toggle-height) - (var(--toggle-padding) * 2));
	height: calc(var(--toggle-height) - (var(--toggle-padding) * 2));
	border-radius: 50%;
	background: white;
	transition: transform 0.25s ease-in-out;
	transform: ${(p: ThumbProps) =>
		p.colorMode === 'dark' ? 'translate3d(calc(var(--toggle-width) - var(--toggle-height)), 0, 0)' : 'none'};
`;

export default function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const altTheme = resolvedTheme === 'light' ? 'dark' : 'light';

	return (
		<ToggleButton
			aria-label={`Change to ${altTheme} mode`}
			title={`Change to ${altTheme} mode`}
			type="button"
			onClick={() => setTheme(altTheme)}
		>
			{resolvedTheme === '' || resolvedTheme === undefined ? (
				<></>
			) : (
				<>
					<ToggleThumb colorMode={resolvedTheme} />
					<span>🌙</span>
					<span>☀️</span>
				</>
			)}
		</ToggleButton>
	);
}
