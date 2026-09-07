import { describe, expect, it } from 'vitest';

import { serializeJson } from './serialize.js';

describe('serializeJson', () => {
	it('never emits a raw </script> sequence', () => {
		const output = serializeJson({ evil: '</script><script>alert(1)</script>' });
		expect(output).not.toContain('</script>');
	});

	it('never emits a raw U+2028 line separator', () => {
		const output = serializeJson({ evil: 'before\u2028after' });
		expect(output).not.toContain('\u2028');
	});

	it('never emits a raw U+2029 paragraph separator', () => {
		const output = serializeJson({ evil: 'before\u2029after' });
		expect(output).not.toContain('\u2029');
	});

	it('escapes HTML-significant characters', () => {
		const output = serializeJson({ evil: '<b>&</b>' });
		expect(output).toBe('{"evil":"\\u003cb\\u003e\\u0026\\u003c/b\\u003e"}');
	});

	it('round-trips nested objects exactly', () => {
		const value = {
			team: { name: 'Alpha </script>', conf: 'C & 1', logo: 'https://example.com/a.png?x=<1>' },
			weeks: [1, 2, 3],
			rankings: [{ rank: 1, raw: 5.5, ties: 0 }],
			flag: true,
			missing: null,
			sep: 'line\u2028sep and\u2029para sep',
		};
		expect(JSON.parse(serializeJson(value))).toEqual(value);
	});

	it('round-trips strings with escaped sequences at the edges', () => {
		const value = '</script>';
		expect(JSON.parse(serializeJson(value))).toBe(value);
	});

	it('preserves non-string primitives', () => {
		expect(serializeJson(5)).toBe('5');
		expect(serializeJson(null)).toBe('null');
		expect(serializeJson(true)).toBe('true');
	});
});
