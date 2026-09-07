/**
 * Serialize a value as JSON for embedding inside a <script> element.
 *
 * Escapes HTML-significant characters and JavaScript line/paragraph
 * separators so the output can never terminate the enclosing script tag.
 * The result is still valid JSON: JSON.parse round-trips the original
 * value exactly.
 */
function serializeJson(value) {
	return JSON.stringify(value)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}

module.exports = { serializeJson };
