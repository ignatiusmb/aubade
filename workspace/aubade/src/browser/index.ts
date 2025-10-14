export function hydrate(signal?: any) {
	signal; // listen to signal changes and re-run the function if needed
	return (node: HTMLElement) => {
		const active: Array<() => void> = [];
		for (const block of node.querySelectorAll('[data-aubade="codeblock"]')) {
			const actions = block.querySelectorAll('[data-aubade-toolbar]');
			const source = block.querySelector('pre');
			if (!actions.length || !source) continue;

			for (const item of actions) {
				const action = item.getAttribute('data-aubade-toolbar');
				if (action === 'copy') {
					const original = item.getAttribute('data-aubade-tooltip') || 'Copy';

					const handler = () => {
						copy(source.textContent || '', {
							accept: () => item.setAttribute('data-aubade-tooltip', 'Copied to clipboard!'),
							reject: () => item.setAttribute('data-aubade-tooltip', 'Failed to copy code'),
						});
						setTimeout(() => item.setAttribute('data-aubade-tooltip', original), 5000);
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

function copy(
	data: string | Blob,
	handler: {
		accept?(): void | Promise<void>;
		reject?(): void | Promise<void>;
	} = {},
) {
	const ncb = navigator.clipboard;

	// check for compatibility/permissions

	let process: Promise<void>;
	if (typeof data === 'string') {
		process = ncb.writeText(data);
	} else {
		// https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write
		process = ncb.write([new ClipboardItem({ [data.type]: data })]);
	}

	const { accept = () => {}, reject = () => {} } = handler;
	return process.then(accept, reject);
}
