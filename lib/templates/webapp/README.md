详细用法详见：http://gitlab.alibaba-inc.com/animajs/app/tree/master

# 5分钟开发一个SPA(Single Page Application)应用
----

## 1、建立项目
[如何使用Anima开发项目？](http://gitlab.alibaba-inc.com/alipay/anima/wikis/anima-howto-use)

## 2、安装模块
```html
$ amb install anima-app
```

## 3、开发
> 写入HTML模板和默认CSS

#### Html
```html
<div class="viewport">
  <header class="navbar"></header>
  <section class="content"></section>
  <footer class="toolbar"></footer>
</div>
```

#### Css

```css
html, body {
    margin: 0;
    padding: 0;
    width:100%;
    height:100%;
}
ul, ol {
    -webkit-margin-before: 0;
    -webkit-margin-after: 0;
    -webkit-margin-start: 0;
    -webkit-margin-end: 0;
    -webkit-padding-before: 0;
    -webkit-padding-after: 0;
    -webkit-padding-start: 0;
    -webkit-padding-end: 0;
}
body * {
    -webkit-text-size-adjust:none;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
}
.navbar {
    -webkit-box-sizing: border-box;
    position: relative;
    width: 100%;
    z-index: 99;
    top: 0;
    left: 0;
}
.toolbar {
    position: relative;
    z-index: 99;
}
.viewport {
    width: 100%;
    min-height: 100%;
}
.viewport > .navbar {
    display: none;
}
.viewport > .content {
  position: relative;
    overflow: auto;
    width: auto;
    height: auto;
}
.viewport > .toolbar {
    display: none;
}
.viewport > .content > .wrap,
    .viewport > .content > .wrap > .active,
        .viewport > .content > .wrap > .inactive {
    width: 100%;
    min-height: 100%;
}
.viewport > .content > .wrap > .active{
    display: block;
}
.viewport > .content > .wrap > .inactive{
    display: none;
}
.viewport > .content > .trans {
    display: none;
    background: transparent;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    overflow: hidden;
    z-index: 9999;
}
.viewport > .content > .trans > div {
    position: absolute;
    width: 100%;
    height: 100%;
}
.viewport.enableNavbar > .navbar {
    display: block;
}
.viewport.enableToolbar > .toolbar {
    display: block;
}
.viewport.enableScroll,
    .viewport.enableScroll > .content,
    .viewport.enableScroll > .content > .wrap {
    position: relative;
    overflow-y: hidden;
    height: 100%;
}
.viewport.enableScroll > .content > .wrap {
    height: auto;
}
.viewport.enableTransition,
    .viewport.enableTransition > .content,
    .viewport.enableTransition > .content > .wrap {
    position: relative;
    overflow-x: hidden;
    width: 100%;
}

/* 自定义样式 */
.viewport {
  background: #fff;
}
.viewport > .content {
  background: #ddd;
}
.viewport > .content > .wrap,
.viewport > .content > .wrap > section {
  background: #fafafa;
}
/* 低性能下转场loading样式 */
.viewport > .content > .trans > div {
  background-color: #eee;
}
```

#### 引用模块
```javascript
var App = require('anima-app'); //引用anima-app模块
```

#### 配置
```javascript
var app = new App(".viewport", {
    enableScroll: false,  // 是否开启滚动
    enableNavbar: false,  // 是否开启导航栏
    enableToolbar: false,  // 是否开启工具栏
    enableTransition: true,  // 是否开启转场动画
    enableMessageLog: false,  // 是否输出日志
    raiseErrors: false,  // 是否提高错误警告级别
    headerCls: "am-header",  // 导航栏样式名
    cacheLength: 5,  // 内容区缓存page数
    plugins: {}, // 插件模块
    initPage: "", // 默认hash
    transTimes: 300, // 转场动画时间
    highAnims: false, // 更牛逼的动画，性能差机器慎用
    headerTpl: {  // 导航栏模板
      title: '<h1>{title}</h1>',  // title模板
      btnLeft: '<a class="am-header-reverse am-header-reverse-btn">{text}</a>',  // 左侧按钮模板
      btnRight: '<a class="am-header-operate am-header-operate-btn">{text}</a>'  // 右侧按钮模板
    }
}, function(){
    // callback
    this.router("", function(){
        this.renderPage({
          title: "主页",
          startup: function() {
            // 输出hello world
            this.html('hello world!');
          }
        })
    })
});
```

> done！

### 使用路由
```javascript
var app = new App(".viewport", {
    ...
}, function(){
    // callback
    this.router("", function(){
        var _self = this;
        this.renderPage({
          title: "主页",
          events: [
              ["click", "button", "_btnClick"]
          ],
          startup: function() {
            // 输出hello world
            this.html('<h1>Hello World!</h1><div><input type="text" id="name"><button>say</button></div>');
          },
          _btnClick: function(e){
            _self.redirect("hello/" + $("#name").val())
          }
        })
    })
    this.router("hello/:name", function(){
        var parameters = this.getParameters();
        this.renderPage({
          title: "欢迎",
          startup: function() {
            // 输出hello world
            this.html('welcome ' + parameters.name);
          }
        })
    })
});
```
> 输入姓名点击按钮试试吧


## 使用Anima UI
````html
<link rel="stylesheet" type="text/css" href="https://a.alipayobjects.com/anima/dpl/1.1.0/amui.css" media="all">
````

>对于Anima UI库的详细说明，以及最新版本信息，请[点击这里查看](http://aliceui.org/mobile/)。