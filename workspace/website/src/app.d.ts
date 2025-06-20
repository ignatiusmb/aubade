declare global {
	namespace App {
		// interface Locals {}

		interface PageData {
			meta: {
				title: string;
				canonical: `/${string}`;
				description?: string;
				og?: {
					title: string;
					url?: string;
					description?: string;
					// TODO
				};
			};
		}

		// interface PageState {}
	}
}

export {};
