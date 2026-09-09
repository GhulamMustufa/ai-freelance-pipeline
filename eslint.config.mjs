import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The app intentionally handles dynamic API payloads and browser state, so
      // loose runtime typing is common in this repo.
      '@typescript-eslint/no-explicit-any': 'off',
      // These hooks rules are too strict for the app's state orchestration pattern.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma client code is produced by tooling and should not be linted.
    "src/generated/**",
  ]),
]);

export default eslintConfig;
