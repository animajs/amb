# amb [![Build Status](https://travis-ci.org/animajs/amb.svg)](https://travis-ci.org/animajs/amb) [![Dependency Status](https://david-dm.org/animajs/amb.svg)](https://david-dm.org/animajs/amb) [![NPM version](https://badge.fury.io/js/amb.png)](http://badge.fury.io/js/amb)

amb 是基于 [spm@3x](https://github.com/spmjs/spm/tree/master) 的**项目**构建工具。

## 安装

```bash
$ npm install tnpm -g --registry=http://registry.npm.alibaba-inc.com
$ tpm install @alipay/amb -g
```

## 使用

### 生成新项目

```bash
$ amb new <projectName>
```

还可以通过加 `--template <templateName>` 来指定模板，目前有两个模板，分别是 `default` 和 `simple`，比如：

```bash
# 用 simple 模板生成新项目
$ amb new <projectName> --template simple
```

### 安装依赖

是 `spm install` 的镜像，默认会添加 `--save` 参数。比如：

```bash
# 安装 package.json 里指定的所有依赖
$ amb install

# 安装指定 package，并保存到 dependencies
$ amb install arale-widget

# 安装指定版本的 package，并保存到 dependencies
$ amb install arale-widget@1.1.0

# 安装 package 并保存到 devDependencies
$ amb install arale-widget --save-dev
```

### 构建

基本命令：

```bash
$ amb build
```

也通过加 `--watch` 或 `-w` 参数来进行实时构建：

```bash
$ amb build --watch
```

处于构建速度的考虑，amb 的构建分两模式，`dev` 和 `publish`，默认是 dev，可以通过加 `--publish` 或 `-p` 参数来指定 `publish` 模式：

```bash
$ amb build --publish
```

## 详解

* [配置项详解](https://github.com/animajs/amb/wiki/Configuration)
* [构建详解](https://github.com/animajs/amb/wiki/Build)

## License

(The MIT License)
