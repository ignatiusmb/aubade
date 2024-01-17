const separators = /[\s\][!"#$%&'()*+,./:;<=>?@\\^_{|}~-]/g;

export const generate = {
	/**
	 * @param {'clipboard' | 'list'} name
	 * @param {string} tooltip
	 */
	icon(name, tooltip) {
		const span = `<span data-mrq="tooltip" class="mrq">${tooltip}</span>`;
		return `<button data-mrq-toolbar="${name}" class="mrq">${span}</button>`;
	},
	/** @param {string} title */
	id(title) {
		title = title.toLowerCase().replace(separators, '-');
		title = title.replace(/`/g, '').replace(/-+/g, '-');
		return title.replace(/^-*(.+)-*$/, '$1');
	},
};

/** @param {string} source */
export function escape(source) {
	const symbols = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
	return source.replace(/[&<>"']/g, (s) => symbols[/** @type {keyof typeof symbols} */ (s)]);
}
