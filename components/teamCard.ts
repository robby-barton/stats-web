import styles from '@components/teamCard.module.css';
import { renderTeamName } from '@components/teamNameRenderer';
import { Team } from '@lib/types';

export function renderTeamCard(team: Team): HTMLElement {
	const a = document.createElement('a');
	a.href = `/team/${team.team_id}`;

	const card = document.createElement('div');
	card.className = styles.card;
	card.appendChild(renderTeamName(team));

	a.appendChild(card);
	return a;
}
