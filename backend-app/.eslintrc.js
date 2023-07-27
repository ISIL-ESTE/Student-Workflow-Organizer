module.exports = {
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'error',
        'no-console': 'off',
        'no-undef': 'off',
        'no-unused-vars': 'off',

        //...rules
    },
    parserOptions: {
        ecmaVersion: 2021,
    },
    env: {
        es6: true,
        node: true,
    },
};
