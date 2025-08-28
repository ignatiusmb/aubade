import { describe } from 'vitest';
import { engrave } from './index.js';

describe('block', ({ concurrent: it }) => {
	it.todo('list | unordered and ordered', ({ expect }) => {
		expect(engrave('- a\n- b\n- c').html()).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
		expect(engrave('* a\n* b\n* c').html()).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
		expect(engrave('1. one\n2. two\n3. three').html()).toBe(
			'<ol><li>one</li><li>two</li><li>three</li></ol>',
		);
		expect(engrave('1. a\n- b\n- c').html()).toBe(
			'<ol><li>a<ul><li>b</li><li>c</li></ul></li></ol>',
		);
	});

	it.todo('table | basic markdown table', ({ expect }) => {
		expect(engrave('| a | b |\n|---|---|\n| 1 | 2 |').html()).toBe(
			'<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>',
		);
	});
});

describe('inline', ({ concurrent: it }) => {
	it('image | ![alt](src)', ({ expect }) => {
		expect(engrave('hello ![wave emoji](wave.png)').html()).toBe(
			'<p>hello <img src="wave.png" alt="wave emoji" /></p>',
		);
	});
	it('image | titled', ({ expect }) => {
		expect(engrave('hello ![wave](wave.png "emoji")').html()).toBe(
			'<p>hello <img src="wave.png" alt="wave" title="emoji" /></p>',
		);
	});

	it('autolink | bracketed links', ({ expect }) => {
		expect(engrave('<https://mauss.dev>').html()).toBe(
			'<p><a href="https://mauss.dev">https://mauss.dev</a></p>',
		);
		expect(engrave('<no-reply@github.com>').html()).toBe(
			'<p><a href="mailto:no-reply@github.com">no-reply@github.com</a></p>',
		);
	});

	it('link | hyperlinks [text](url)', ({ expect }) => {
		expect(engrave('[link](https://mauss.dev)').html()).toBe(
			'<p><a href="https://mauss.dev">link</a></p>',
		);
	});
	it('link | invalid hyperlinks', ({ expect }) => {
		expect(engrave('[foo`]`(bar)').html()).toBe('<p>[foo<code>]</code>(bar)</p>');
	});
	it('link | nested and multiline links', ({ expect }) => {
		expect(engrave('[a **b** c](https://mauss.dev)').html()).toBe(
			'<p><a href="https://mauss.dev">a <strong>b</strong> c</a></p>',
		);
		expect(engrave('[line\nbreak](https://mauss.dev)').html()).toBe(
			'<p><a href="https://mauss.dev">line break</a></p>',
		);
	});

	it('modifiers | modified links', ({ expect }) => {
		expect(engrave('**[a b c](https://mauss.dev)**').html()).toBe(
			'<p><strong><a href="https://mauss.dev">a b c</a></strong></p>',
		);
	});
});
