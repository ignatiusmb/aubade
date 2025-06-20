import { clipboard } from 'mauss/web';

export function listen(node: HTMLElement) {
	for (const block of node.querySelectorAll('.mrq[data-mrq="block"]')) {
		const actions = block.querySelectorAll('.mrq[data-mrq-toolbar]');
		const source = block.querySelector('.mrq[data-mrq="pre"]');
		if (!actions.length || !source) continue;

		for (const item of actions) {
			const action = item.getAttribute('data-mrq-toolbar');
			if (action === 'clipboard') {
				item.addEventListener('click', () => {
					const tooltip = item.querySelector('.mrq[data-mrq="tooltip"]');
					if (!tooltip) return;
					const text = tooltip.textContent;
					clipboard.copy(source.textContent || '', {
						accept() {
							tooltip.textContent = 'Copied to clipboard!';
						},
						reject() {
							tooltip.textContent = `Failed to copy code`;
						},
					});

					setTimeout(() => {
						tooltip.textContent = text;
					}, 5000);
				});
			} else if (action === 'list') {
				item.addEventListener('click', () => {
					source.classList.toggle('numbered');
				});
			}
		}
	}
}

export function hydrate(node: HTMLElement, _: any) {
	listen(node);
	return {
		update: () => listen(node),
	};
}
