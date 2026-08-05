import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * eslint-config-next 16 ships native flat configs, so the `FlatCompat` shim
 * that was needed for the eslintrc-style presets is gone.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [".next/**", "node_modules/**", "supabase/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
