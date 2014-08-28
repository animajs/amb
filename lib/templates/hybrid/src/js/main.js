/**
 * <%= name %> By <%= author %>@alipay.com
 * Created By Anima
 */

//remember to run `amb install` before using anima-yocto ...
var $ = require('anima-yocto');

var util = {
  getJSON: function(url, data, callback) {
    //调用容器接口，获取到当前环境的rpc网关地址和did设备号
    AlipayJSBridge.call('getConfig', {
      configKeys: ['did', 'rpcUrl']
    }, function(result) {
      var rpcUrl = result.data.rpcUrl;
      var did = result.data.did;
      $.ajax({
        url: rpcUrl,
        dataType: 'json',
        type: 'post',
        timeout: 15000,
        data: {
          operationType: url,
          requestData: JSON.stringify([data])
        },
        headers: {
          did: did
        },
        success: function(result) {
          // resultStatus为1000的时候表示结果正常.
          if (result.resultStatus === 1000) {
            callback(result);
          } else {
            // 除以上异常外, 参考http://doc.alipay.net/pages/viewpage.action?pageId=45288095
          }
        }
      });
    });
  }
};

var url = 'alipay.charity.mobile.donate.once.myItems.get'; // 线上走通的数据接口

$('.J_GetData').on('tap', function() {
  util.getJSON(url, {
    test: '测试参数写法'
  }, function(result) {
    alert(JSON.stringify(result));
  });
});