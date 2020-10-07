module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  globals: {
    Peer: 'readonly',
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
  },
};
