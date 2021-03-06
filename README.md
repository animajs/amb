# amb

基于 [spm](http://spmjs.io/) 的项目开发工具。

---

## 安装

```bash
$ npm install amb -g
```

## 使用

### 初始化

```bash
$ mkdir foo && cd foo
$ amb init
```

提供 3 套模板供选择，分别是 `simple`, `webapp`, 对应各种项目类型。

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

TODO

### 调试

```bash
$ amb server
```

参数：

- `-p, --port`，指定端口
- `--https`，同时开启 https 服务器
- `--livereload`，开启 livereload 服务器
- `--weinre`，开启 weinre 服务器



## License

Copyright (c) 2014 chencheng. Licensed under the MIT license.
