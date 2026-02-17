import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import _import from 'eslint-plugin-import';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

const eslintConfig = [
	{
		ignores: ['**/out', '**/node_modules', '**/.next', '**/.swc', '**/coverage', '**/_site', '**/src/assets/build'],
	},
	...fixupConfigRules(
		compat.extends(
			'eslint:recommended',
			'plugin:@typescript-eslint/recommended',
			'plugin:prettier/recommended',
			'plugin:import/recommended',
		),
	),
	{
		plugins: {
			'@typescript-eslint': fixupPluginRules(typescriptEslint),
			prettier: fixupPluginRules(prettier),
			import: fixupPluginRules(_import),
		},

		languageOptions: {
			globals: {
				...globals.node,
			},

			ecmaVersion: 2018,
			sourceType: 'module',
		},

		settings: {
			'import/core-modules': ['react', 'react-dom', 'react-dom/client'],
			'import/resolver': {
				typescript: {
					project: './tsconfig.json',
				},
			},
		},

		rules: {
			'prettier/prettier': 'error',

			'@typescript-eslint/no-empty-object-type': 'error',

			'@typescript-eslint/no-unsafe-function-type': 'error',

			'@typescript-eslint/no-wrapper-object-types': 'error',

			'no-tabs': 0,

			'sort-imports': [
				'error',
				{
					ignoreCase: false,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false,
					memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
					allowSeparatedGroups: true,
				},
			],

			'import/no-unresolved': 'error',
		},
	},
	...fixupConfigRules(
		compat.extends(
			'eslint:recommended',
			'plugin:@typescript-eslint/recommended',
			'plugin:prettier/recommended',
			'plugin:import/recommended',
			'plugin:import/typescript',
		),
	).map((config) => ({
		...config,
		files: ['**/*.ts', '**/*.tsx'],
	})),
	{
		files: ['**/*.ts', '**/*.tsx'],

		plugins: {
			'@typescript-eslint': fixupPluginRules(typescriptEslint),
			prettier: fixupPluginRules(prettier),
			import: fixupPluginRules(_import),
		},

		languageOptions: {
			parser: tsParser,
			ecmaVersion: 2018,
			sourceType: 'module',
		},
	},
	{
		files: ['**/*.js', '**/*.cjs'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
];

export default eslintConfig;
