import { clipboard } from 'mauss/web';

export function hydrate(signal?: any) {
	signal; // listen to signal changes and re-run the function if needed
	return (node: HTMLElement) => {
		const active: Array<() => void> = [];
		for (const block of node.querySelectorAll('[data-aubade="block"]')) {
			const actions = block.querySelectorAll('[data-aubade-toolbar]');
			const source = block.querySelector('[data-aubade="pre"]');
			if (!actions.length || !source) continue;

			for (const item of actions) {
				const action = item.getAttribute('data-aubade-toolbar');
				if (action === 'clipboard') {
					const tooltip = item.querySelector('[data-aubade="tooltip"]');
					if (!tooltip) continue;
					const original = tooltip.textContent;

					const handler = () => {
						clipboard.copy(source.textContent || '', {
							accept() {
								tooltip.textContent = 'Copied to clipboard!';
							},
							reject() {
								tooltip.textContent = `Failed to copy code`;
							},
						});

						setTimeout(() => {
							tooltip.textContent = original;
						}, 5000);
					};

					item.addEventListener('click', handler);
					active.push(() => item.removeEventListener('click', handler));
				} else if (action === 'list') {
					const handler = () => source.classList.toggle('numbered');
					item.addEventListener('click', handler);
					active.push(() => item.removeEventListener('click', handler));
				}
			}
		}
		return () => {
			active.forEach((fn) => fn());
			active.length = 0;
		};
	};
}
