const fs = require('fs');
const path = require('path');

let _manifest;

function manifestPath() {
	return path.resolve(__dirname, '../../src/assets/build/.vite/manifest.json');
}

function getManifest() {
	if (!_manifest) {
		_manifest = JSON.parse(fs.readFileSync(manifestPath(), 'utf-8'));
	}
	return _manifest;
}

function assetPath(entryKey) {
	const entry = getManifest()[entryKey];
	if (!entry) {
		throw new Error(
			`Vite manifest entry '${entryKey}' not found in ${manifestPath()} — run yarn build:assets and check the entry key`,
		);
	}
	return `/assets/build/${entry.file}`;
}

module.exports = { getManifest, assetPath };
