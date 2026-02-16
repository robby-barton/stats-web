const fs = require('fs');
const path = require('path');

let _manifest;

function getManifest() {
	if (!_manifest) {
		const manifestPath = path.resolve(__dirname, '../../src/assets/build/.vite/manifest.json');
		_manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
	}
	return _manifest;
}

function assetPath(entryKey) {
	return `/assets/build/${getManifest()[entryKey].file}`;
}

module.exports = { getManifest, assetPath };
