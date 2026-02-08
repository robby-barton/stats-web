#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = process.env.ELEVENTY_OUTPUT || '_site';
const INTERVAL_MS = 500;
const HEARTBEAT_MS = 2000;

async function countFiles(rootDir) {
	let count = 0;
	const stack = [rootDir];

	while (stack.length) {
		const current = stack.pop();
		let entries;
		try {
			entries = await fs.readdir(current, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			const fullPath = path.join(current, entry.name);
			if (entry.isDirectory()) {
				stack.push(fullPath);
			} else if (entry.isFile()) {
				count += 1;
			}
		}
	}

	return count;
}

function formatTime() {
	return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

let lastCount = -1;
let lastHeartbeat = 0;
let ticker;

async function startTicker() {
	ticker = setInterval(async () => {
		if (!existsSync(OUTPUT_DIR)) {
			return;
		}
		const count = await countFiles(OUTPUT_DIR);
		const now = Date.now();
		if (count !== lastCount || now - lastHeartbeat >= HEARTBEAT_MS) {
			lastCount = count;
			lastHeartbeat = now;
			process.stdout.write(`[11ty] building… ${formatTime()} (files: ${count})\n`);
		}
	}, INTERVAL_MS);
}

function stopTicker() {
	if (ticker) clearInterval(ticker);
}

const env = { ...process.env };
if (!env.DEBUG) {
	env.DEBUG = 'Eleventy:Benchmark';
}

const child = spawn('eleventy', { stdio: 'inherit', env });

startTicker();

child.on('exit', (code) => {
	stopTicker();
	process.exit(code ?? 1);
});

child.on('error', (err) => {
	stopTicker();
	console.error('[11ty] failed to start:', err.message);
	process.exit(1);
});
