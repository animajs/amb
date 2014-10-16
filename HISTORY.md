# History

---

## 2.1.1

* `spm-build@0.1.1 - spm-build@0.1.4`
    - 修复配置项不能 merge 二级配置的问题
    - cssminOpts 默认设置 noAdvanced 为 true, http://gitlab.alibaba-inc.com/animajs/amb/issues/10 (由于 clean-css 的一个 bug，而这个 bugfix 的版本要到 3.0 才发布，时间未知)
    - 默认不开启 autoprefixer, http://gitlab.alibaba-inc.com/animajs/amb/issues/9
    - 修复 windows 下 pathmap 失效的问题
    - 不用 gulp-load-plugin 来载入 gulp 插件，他在处理 @alipay 下的 node_modules 时有问题
    - 添加 package 解析出错时的提示
* `cmdclean@0.2.6`
    - 修复 umd wrap 的包在打包时处理不正确的问题

## 2.1.0

* `improved` 把 build 部分代码抽取到 `spm-build`，和 aspm 共用
* `spm-build@0.1.0` 添加了 duplicate deps 检查、extDeps 安装、withDeps 处理、autoprefixer 等任务，完整任务详见 http://gitlab.alibaba-inc.com/alipay-tool/aspm/issues/2
* `bugfix` 修复 simple 模板依赖未声明的 bug

## 2.0.0

* 重构，详见 gitlab.alibaba-inc.com/animajs/amb/issues/2

## 1.2.2

* `bugfix` 修复 clean bug，没有正确处理依赖
* `improved` 添加 --force 参数，和 spm 保持一致，只在 --force 的情况下才 clean

## 1.2.1

* `new` build 之前先 clean

## 1.2.0

* `new` amb server
* `new` 新增 flatten 配置项，可以配置是否拍平目录
* `improved` 可以配置 build 模式，支持 spm 的各种 build 方式
* `improved` html 和 css 的处理全部抽成 gulp 插件
* `improved` standalone 的 build 切换为 umi.standalonify
* `deleted` 删除图片压缩处理

## 1.1.1

* `improved` 添加 livereload 支持

## 1.1.0

* `improved` [基于 gulp task 的 build](https://github.com/animajs/amb/pull/3)
* `fixed` build 失败时 crash 的问题
* `improved` watch 路径可配置，便于集成在其他项目(比如 express)里时保持 watch 的干净
* `improved` watch 加入延迟处理，避免同时触发多次 build

## 1.0.0

* `improved` 完成项目生成和构建的基本功能，详见 [issue#1](https://github.com/animajs/amb/issues/1)
