/// <reference types="@sveltejs/kit" />
/// <reference types="../../aubade" />

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
