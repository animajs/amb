# amb v2

[![build status](http://gitlab-ci.alibaba-inc.com/projects/140/status.png?ref=master)](http://gitlab-ci.alibaba-inc.com/projects/140?ref=master)

基于 [spm](http://spmjs.io/) 的项目开发工具，amb v1.x 请访问 http://gitlab.alibaba-inc.com/animajs/amb/tree/1.x

v2 和 v1 的区别详见 [issue#2](http://gitlab.alibaba-inc.com/animajs/amb/issues/2)

---

## 安装

注意：`必须`用 tnpm 安装

```bash
$ npm install tnpm -g --registry=http://registry.npm.alibaba-inc.com
$ tnpm install @alipay/amb -g
```

## 使用

### 初始化

```bash
$ mkdir foo && cd foo
$ amb init
```

提供 3 套模板供选择，分别是 `simple`, `webapp`, `hybird`，对应各种项目类型。

### 安装依赖

等价于 `spm install`。

```bash
# 安装 package.json 里的所有依赖
$ amb install

# 安装 anima-app，并保存 dependencies 到 package.json
$ amb install anima-app -S
```

参数：

- `-f, --force`，强制从源上下载最新的安装，不管本地是否已安装
- `-S, --save`，保存 dependencies 到 package.json
- `-SD, --save-dev`，保存 devDependencies 到 package.json

### 构建

```bash
$ amb build
```

#### 参数：

- `-f, --force`，构建前会先清空 dist 目录

#### amb 配置：(以下是默认值)

```javascript
{
  // spm 源
  "registry": "http://spm.alipay-inc.com",

  // 构建输出目录
  "dest": "./dist/",

  // Rename files
  // 详见：https://github.com/jeremyruppel/pathmap
  "pathmap": null,

  // JS 压缩配置项
  // 详见：https://github.com/terinjokes/gulp-uglify/
  "uglifyOpts": {
    "output": {
      "ascii_only": true
    }
  },

  // CSS 压缩配置项
  // 详见：https://github.com/GoalSmashers/clean-css
  "cssminOpts": null,

  // less 编译配置项
  // 详见：https://github.com/plus3network/gulp-less
  "lessOpts": null,

  // coffee 预编译配置项
  // 详见：https://github.com/wearefractal/gulp-coffee
  "coffeeOpts": {
    "bare": true
  }
}
```

#### ambfile.js

- 自定义任务 `startTask`, `endTask`，需返回函数
- 自定义流 `startStream`, `endStream`，需返回 Stream

具体例子：http://gitlab.alibaba-inc.com/animajs/amb/blob/master/test/fixtures/build/ambfile/ambfile.js


### 调试

```bash
$ amb server
```

参数：

- `-p, --port`，指定端口
- `--https`，同时开启 https 服务器
- `--livereload`，开启 livereload 服务器
- `--weinre`，开启 weinre 服务器


## 例子

* [应用 ambfile](http://gitlab.alibaba-inc.com/animajs/amb/tree/master/test/fixtures/build/ambfile)
* [复制图片](http://gitlab.alibaba-inc.com/animajs/amb/tree/master/test/fixtures/build/copy-img)
* [使用 less 或 coffee](http://gitlab.alibaba-inc.com/animajs/amb/tree/master/test/fixtures/build/precompile)


## FAQ

1. 如何使得构建生产的路径不包含 name/version/?

  配置 `"pathmap": "%{{{name}}/{{version}},}p"` 。

1. 之前的自动上传图片等功能怎么不见了?

  在 v2 里删除了，没有内置。有需要可以通过 ambfile 定义 `startStream` 或 `endStream` 自行添加。


## License

Copyright (c) 2014 chencheng. Licensed under the MIT license.
