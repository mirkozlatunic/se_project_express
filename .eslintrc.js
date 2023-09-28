module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    extends: ["eslint:recommended", "airbnb-base", "prettier"],
  overrides: [],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
    }
}
