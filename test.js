console.log(1);
const uniID = require("./dist/index");
console.log(1);
var context = {
  APPID : "1111",
  PLATFORM : "h5",
  LOCALE : "zh-Hans"
}
var config = {
  passwordSecret: "passwordSecret-demo",
  tokenSecret: "tokenSecret-demo",
  tokenExpiresIn: 7200,
  tokenExpiresThreshold: 600,
  passwordErrorLimit: 6,
  passwordErrorRetryTime: 3600,
  autoSetInviteCode: false,
  forceInviteCode: false,
  "app-plus": {
    tokenExpiresIn: 2592000,
    oauth: {
      weixin: {
        appid: "weixin appid",
        appsecret: "weixin appsecret",
      },
      apple: {
        bundleId: "your APP bundleId",
      },
    },
  },
  "mp-weixin": {
    oauth: {
      weixin: {
        appid: "weixin appid",
        appsecret: "weixin appsecret",
      },
    },
  },
  "mp-alipay": {
    oauth: {
      alipay: {
        appid: "alipay appid",
        privateKey: "alipay privateKey",
      },
    },
  },
  service: {
    sms: {
      name: "DCloud",
      codeExpiresIn: 300,
      smsKey: "your sms key",
      smsSecret: "your sms secret",
    },
    univerify: {
      appid: "your appid",
      apiKey: "your apiKey",
      apiSecret: "your apiSecret",
    },
  },
};
const cloud = {
  aaa: '3123123'
}
console.log(13);
const uniIDIns = uniID.createInstance({
  // 创建uni-id实例，其上方法同uniID
  context: context,
  config: config,
  db: cloud
});

console.log(uniIDIns);
