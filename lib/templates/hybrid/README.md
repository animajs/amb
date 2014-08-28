## demo 介绍
---

### 前置依赖
1. [tnpm](http://web.npm.alibaba-inc.com/?spm=0.0.0.0.p7ZQI8)(下列工具只能用tnpm安装)
    * `npm install -g tnpm --registry=http://registry.npm.alibaba-inc.com`
* [amb(捆绑销售哈)](http://web.npm.alibaba-inc.com/package/@alipay/amb), 要用anima就得使用amb哈, src的源码通过amb build -p构建到./www目录;
     * `tnpm install -g @alipay/amb`
* [hpm](http://web.npm.alibaba-inc.com/package/hpm), 将./www目录构建钱包可识别的amr包以及webview的工作模式
    * `tnpm install -g hpm`
* [jshint](http://www.jshint.com/docs/): 为了让一个项目看起来是一个人写的, 统一语法规则!
    * .jshintrc已经添加
* 想特别玩转watch构建, 可以参考gulpfile, 比较杂乱;

### 运行demo
1. `git clone git@gitlab.alibaba-inc.com:kai.fangk/hellohybrid.git`
* `amb install` 
    * 把amb的依赖项安装到sea-modules
* `amb build` or `amb build -p`
    * -p为压缩build, 调试的话不需要加上
* `hpm debug -o`
    *  生成amr包的构建模式, 手机扫码即可访问离线包
    
    
### 手淘生成模式
1. 参考文档: [http://www.atatech.org/articles/18989?rnd=1740168633](http://www.atatech.org/articles/18989?rnd=1740168633)
* 申请一个应用的时候需要找@[兰茵](http://www.taobao.com/webww/ww.php?ver=3&touid=兰茵&siteid=cntaobao&status=1&charset=utf-8) 或者其团队的人来审核
* 打包命令, 很单纯的一个zip包
    * `zip -r _package/www.zip www/*`
