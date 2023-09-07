import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
	dir: './',
});

const config = {
	testEnvironment: 'jest-environment-jsdom',
	collectCoverage: true,
	collectCoverageFrom: ['**/*.{ts,tsx}', '!.next/**/*'],
	transform: {
		'^.*\\.(t|j)sx?$': '@swc/jest',
	},
	moduleNameMapper: {
		'@app/(.*)': ['<rootDir>/app/$1'],
		'@components/(.*)': ['<rootDir>/components/$1'],
		'@styles/(.*)': ['<rootDir>/styles/$1'],
		'@lib/(.*)': ['<rootDir>/lib/$1'],
		'@pages/(.*)': ['<rootDir>/pages/$1'],
	},
	testRegex: ['.*\\.test\\.(t|j)sx?$'],
};

export default createJestConfig(config);
