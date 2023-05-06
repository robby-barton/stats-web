import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
})

const config = {
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{ts,tsx}']
}

export default createJestConfig(config)
