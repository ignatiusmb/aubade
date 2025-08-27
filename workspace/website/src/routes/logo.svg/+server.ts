// import { dev } from '$app/environment';

function build(r: number, w: number, amp: number, halves: number): string {
	const c = (theta: number) => r + amp * Math.sin(w * theta);
	const prime = (theta: number) => amp * w * Math.cos(w * theta);

	const dx = (theta: number) => prime(theta) * Math.cos(theta) - c(theta) * Math.sin(theta);
	const dy = (theta: number) => prime(theta) * Math.sin(theta) + c(theta) * Math.cos(theta);

	const norm = ([a, b]: [a: number, b: number]) => {
		const m = Math.hypot(a, b);
		return [a / m, b / m];
	};

	const T = (2 * Math.PI) / w;

	let path = '';
	for (let l = 0; l < w; l++) {
		for (let h = 0; h < halves; h++) {
			const t0 = l * T + h * (T / halves);
			const t1 = l * T + (h + 1) * (T / halves);

			const [x0, y0] = [c(t0) * Math.cos(t0), c(t0) * Math.sin(t0)];
			const [x3, y3] = [c(t1) * Math.cos(t1), c(t1) * Math.sin(t1)];

			const [tx0, ty0] = norm([dx(t0), dy(t0)]);
			const [tx1, ty1] = norm([dx(t1), dy(t1)]);

			const chord = Math.hypot(x3 - x0, y3 - y0);
			const scale = chord / 3;

			const x1 = (x0 + scale * tx0).toFixed(0);
			const y1 = (y0 + scale * ty0).toFixed(0);
			const x2 = (x3 - scale * tx1).toFixed(0);
			const y2 = (y3 - scale * ty1).toFixed(0);

			if (l === 0 && h === 0) path += `M${x0.toFixed(0)},${y0.toFixed(0)} `;
			path += `C${x1},${y1} ${x2},${y2} ${x3.toFixed(0)},${y3.toFixed(0)} `;
		}
	}
	return path + 'Z';
}

export const prerender = true;
export function GET() {
	const favicon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-128 -128 256 256" fill="none" stroke="#efedf6">
	<path stroke="#b087fe" stroke-width="12" d="${build(64, 3, -42, 4)}" />
	<path stroke="#b087fe" stroke-width="12" d="${build(64, 3, +42, 4)}" />
	<circle r="4" stroke="#b087fe" stroke-width="8" />
</svg>
`.replace(/\n\s+/g, '');
	return new Response(favicon.trim(), {
		headers: { 'Content-Type': 'image/svg+xml' },
	});
}
