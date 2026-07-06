module.exports = {
  root: true,
  extends: ['@electron-toolkit/eslint-config-ts/recommended'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-function': ['warn', { allow: ['arrowFunctions'] }],
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': false }],
  },
  ignorePatterns: ['node_modules', 'dist', 'out', '.electron-builder'],
}
