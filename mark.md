1. husky 步骤
1.1 安装
lint-staged是对暂存文件执行检查的工具
npm i lint-staged husky -D
npm set-script prepare "husky install" # 在package.json中添加脚本
npm run prepare # 初始化husky,将 git hooks 钩子交由,husky执行

1.2  添加 pre-commit hooks 对暂存文件执行eslint prettier检测
npx husky add .husky/pre-commit "npx lint-staged"
再根目录下添加 .lintstagedrc.json

1.3 添加 commit-msg hooks 规范提交信息
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
npm install --save-dev @commitlint/config-conventional @commitlint/cli
echo "module.exports = {extends: ['@commitlint/config-conventional']};" > commitlint.config.js
