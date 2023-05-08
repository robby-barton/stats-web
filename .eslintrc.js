module.exports = {
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: "module",
	},
	env: {
		node: true,
	},
	plugins: ["prettier", "import"],
	extends: ["eslint:recommended", "plugin:prettier/recommended", "plugin:import/recommended", "next"],
	overrides: [
		{
			files: ["**/*.ts", "**/*.tsx"],
			parser: "@typescript-eslint/parser",
			parserOptions: {
				ecmaVersion: 2018,
				sourceType: "module",
			},
			plugins: ["@typescript-eslint", "prettier", "import"],
			extends: [
				"eslint:recommended",
				"plugin:@typescript-eslint/recommended",
				"plugin:prettier/recommended",
				"plugin:import/recommended",
				"plugin:import/typescript",
				"next",
			],
		},
	],
	rules: {
		"@typescript-eslint/ban-types": [
			"error",
			{
				extendDefaults: true,
				types: {
					"{}": false,
				},
			},
		],
		"no-tabs": 0,
		"sort-imports": [
			"error",
			{
				ignoreCase: false,
				ignoreDeclarationSort: true,
				ignoreMemberSort: false,
				memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
				allowSeparatedGroups: true,
			},
		],
		"import/no-unresolved": "error",
		"import/order": [
			"error",
			{
				groups: ["builtin", "external", "internal"],
				pathGroups: [
					{
						pattern: "react",
						group: "external",
						position: "before",
					},
				],
				pathGroupsExcludedImportTypes: ["react"],
				"newlines-between": "always",
				alphabetize: {
					order: "asc",
					caseInsensitive: true,
				},
			},
		],
	},
	settings: {
		"import/resolver": {
			typescript: {
				project: "./tsconfig.json",
			},
		},
	},
};
