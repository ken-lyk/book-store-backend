// eslint.config.js
import globals from "globals";
import eslint from "@eslint/js"; // Core recommended rules
import tseslint from "typescript-eslint"; // New package for v6+ TS-ESLint flat config
import eslintConfigPrettier from "eslint-config-prettier"; // Disables conflicting rules

export default tseslint.config( // Use the tseslint helper for convenience
    {
        // Global ignores - files/directories ESLint should not lint
        ignores: [
            "node_modules/",
            "dist/",
            "docs/", // Usually don't need to lint documentation files
            "coverage/", // Ignore coverage reports
            "*.sql", // Ignore sql files
            "*.yaml", // Ignore yaml files
            "*.md" // Ignore markdown files
        ],
    },

    eslint.configs.recommended,

    // ...tseslint.configs.recommendedTypeChecked, // Use this for stricter checks
    ...tseslint.configs.recommended, // Use this for faster, less strict checks

    // Configuration for project-specific settings and rules
    {
        languageOptions: {
            // ecmaVersion: 2022, // Usually inferred by tseslint
            // sourceType: "module", // Uncomment if your project uses ES Modules explicitly
            globals: {
                ...globals.node, // Enable Node.js global variables
            },
            parserOptions: {
                // Required for recommendedTypeChecked rules, optional otherwise
                // project: true, // Automatically find tsconfig.json
                // tsconfigRootDir: import.meta.dirname, // Set root for tsconfig discovery
            },
        },
        rules: {
            // --- Customize or override rules here ---

            // Example Rules (adjust as needed):
            'no-console': 'off',
            // "no-console": ["warn", { "allow": ["warn", "error", "info"] }], // Warn on console.log, allow others
            "no-unused-vars": "off", // Disable base rule, use TS version below
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }], // Warn on unused TS vars unless prefixed with _

            // Rules from previous .eslintrc.json:
            "@typescript-eslint/no-explicit-any": "warn", // Allow 'any' but warn
            "@typescript-eslint/explicit-module-boundary-types": "off", // Allow omitting return types

            // Potential other useful rules:
            "eqeqeq": ["error", "always"], // Enforce ===
            "curly": ["error", "multi-line"], // Require braces for multi-line blocks
            // Add any other specific rules you want to enforce or disable
        },
    },
    eslintConfigPrettier
);