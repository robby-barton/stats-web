import styles from '@components/teamList.module.css';
import { renderTeamCard } from '@components/teamCard';
import { Team } from '@lib/types';

export function renderTeamList(container: HTMLElement, teams: Team[]) {
	container.innerHTML = '';
	container.className = styles.teamList;
	for (const team of teams) {
		container.appendChild(renderTeamCard(team));
	}
}
