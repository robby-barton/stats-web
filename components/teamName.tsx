import { useContext } from "react";

import Image from "next/image";

import { ThemeContext } from "./themeProvider";

type TeamName = {
	team_id: number;
	name: string;
};
export default function TeamName({ team_id, name }: TeamName) {
	const { colorMode } = useContext(ThemeContext);

	return (
		<div style={{ display: "flex", gap: "0 0.5rem", alignItems: "center" }}>
			<div style={{ position: "relative", width: "2.5rem", height: "2.5rem" }}>
				<Image src={`/logos/${colorMode}/${team_id}.png`} alt={name} fill placeholder="empty" />
			</div>
			<div style={{ display: "flex", alignItems: "center" }}>{name}</div>
		</div>
	);
}
