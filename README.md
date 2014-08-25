# amb v2

[![build status](http://gitlab-ci.alibaba-inc.com/projects/140/status.png?ref=master)](http://gitlab-ci.alibaba-inc.com/projects/140?ref=master)

基于 [spm](http://spmjs.io/) 的**项目**开发工具.

---

## 安装

注意：`必须`用 tnpm 来安装 amb .

```bash
$ npm install tnpm -g --registry=http://registry.npm.alibaba-inc.com
$ tpm install @alipay/amb -g
```

## 使用

### 生成新项目

```bash
$ mkdir foo && cd foo
$ amb init
```

### 安装依赖

等价于 `spm install --save` .

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
