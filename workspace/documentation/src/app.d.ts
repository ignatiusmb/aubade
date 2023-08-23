/// <reference types="@sveltejs/kit" />
/// <reference types="../../marqua" />

namespace App {
	// interface Error {}
	// interface Locals {}
	interface PageData {
		meta: {
			title: string;
			description?: string;
			og?: {
				title: string;
				url?: string;
				description?: string;
			};
		};
	}
}
