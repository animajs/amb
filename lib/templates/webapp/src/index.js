/**
 * <%= name %> By <%= author %>@alipay.com
 * Created By Anima
 */

var App = require('anima-app'); //引用anima-app模块
var $ = require('anima-yocto');

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
        this.html('  <div class="am-button-group">  <button class="am-button-group-current" type="button">选中标签一</button><button type="button">标签二</button><button type="button">标签三</button></div>');
      }
    });
  });
  this.router("hello/:name", function(){
    var parameters = this.getParameters();
    this.renderPage({
      title: "欢迎",
      startup: function() {
        // 输出hello world
        this.html('welcome ' + parameters.name);
      }
    });
  });
});
