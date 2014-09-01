# amb v2

[![build status](http://gitlab-ci.alibaba-inc.com/projects/140/status.png?ref=master)](http://gitlab-ci.alibaba-inc.com/projects/140?ref=master)

基于 [spm](http://spmjs.io/) 的项目开发工具，amb v1.x 请访问 http://gitlab.alibaba-inc.com/animajs/amb/tree/1.x

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

参数：

- `-f, --force`，强制从源上下载最新的安装，不管本地是否已安装
- `-S, --save`，保存 dependencies 到 package.json
- `-SD, --save-dev`，保存 devDependencies 到 package.json

### 构建

```bash
$ amb build
```

### 调试

```bash
$ amb server
```

## License

Copyright (c) 2014 chencheng. Licensed under the MIT license.
