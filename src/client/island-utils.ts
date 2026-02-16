export function getIslandProps<T>(island: string): { root: HTMLElement; props: T } | null {
	const root = document.querySelector<HTMLElement>(`[data-island="${island}"]`);
	if (!root) {
		return null;
	}

	const propsId = root.getAttribute('data-props-id');
	if (!propsId) {
		return null;
	}

	const propsNode = document.getElementById(propsId);
	if (!propsNode || !propsNode.textContent) {
		return null;
	}

	return {
		root,
		props: JSON.parse(propsNode.textContent) as T,
	};
}
