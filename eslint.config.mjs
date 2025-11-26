import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const [nextBaseConfig = {}, nextTypescriptConfig = {}, ...remainingConfigs] =
  nextCoreWebVitals;

const extendedRemainingConfigs = remainingConfigs.map((config) => {
  if (config?.ignores) {
    return {
      ...config,
      ignores: [...config.ignores, ".vercel/**", "node_modules.bak/**"],
    };
  }

  return config;
});

const eslintConfig = [
  {
    ...nextBaseConfig,
    rules: {
      ...(nextBaseConfig.rules ?? {}),
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    ...nextTypescriptConfig,
    rules: {
      ...(nextTypescriptConfig.rules ?? {}),
      "@typescript-eslint/no-explicit-any": "off",
      // Treat unused vars as warnings and allow underscore-prefixed values
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  ...extendedRemainingConfigs,
];

export default eslintConfig;
