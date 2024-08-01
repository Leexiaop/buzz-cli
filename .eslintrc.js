module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    // 0是忽略，1是警告，2是报错
    "rules": {                              // ESLint 规则配置
        "quotes": 2,                        // 非双引号报错
        "semi": 1,                          // 无分号就警告
        "no-console": 1,                    // 有console.log就警告
        "space-before-function-paren": 0    // 函数前空格忽略
    }
}