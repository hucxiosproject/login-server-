/**
 * Created by lvshun on 15/10/19.
 */
/**
 * Created by lvshun on 15/10/19.
 */
import request from "cofy-request";
import queryString from "querystring";
import {ErrorCode} from "../config/errorcode.js";
import {ServiceError} from "../models/service.error.model.js";

export class EasyChat {
  static requestUrl; //环信请求基础url，在init中初始化
  static EasyConfig; //环信admin参数，在init中初始
  static token; //init中初始

  static * resetPassword(username, password) {
    var param = {
      newpassword: password
    };
    var res = yield request.$post({
      url: this.requestUrl + "/users/" + username + "/password",
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + this.token,
        'Content-Type': "application/json;charset=UTF-8"
      },
      body: JSON.stringify(param)
    });
    console.log(res);
  }

  static * createUser(username, password) {
    console.log("begin create")
    var param = {
      username: username,
      password: password
    };
    var res = yield request.$post({
      url: this.requestUrl + "/users",
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + this.token,
        'Content-Type': "application/json;charset=UTF-8"
      },
      body: JSON.stringify(param)
    });
    console.log(res);
  }


  static * createGroup(name, desc, owner) {
    var param = {
      groupname: name, //群组名称, 此属性为必须的
      desc: desc, //群组描述, 此属性为必须的
      public: true, //是否是公开群, 此属性为必须的
      maxusers: 300, //群组成员最大数(包括群主), 值为数值类型,默认值200,此属性为可选的
      approval: true, //加入公开群是否需要批准, 默认值是true（加群需要群主批准）, 此属性为可选的
      owner: "jma1", //群组的管理员, 此属性为必须的
      "members": ["jma2", "jma3"] //群组成员,此属性为可选的,但是如果加了此项,数组元素至少一个（注：群主jma1不需要写入到members里面）
    };
    var res = yield request.$post({
      url: this.requestUrl + "/chatgroups",
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + this.token,
        'Content-Type': "application/json;charset=UTF-8"
      },
      body: JSON.stringify(param)
    });
    console.log(res);

  }

  static * init() {

    this.requestUrl = "https://a1.easemob.com/voc/hit";
    this.EasyConfig = {
      client_id: "YXA6szidMHY-EeW_Irdlqg1uyA",
      client_secret: "YXA6_6PaYiaZ0KuBFWIzPPTLioREiVs",
      grant_type: "client_credentials"
    };

    var r = yield request.$post({
      url: this.requestUrl + "/token",
      method: 'POST',
      headers: {
        'Content-Type': "application/json;charset=UTF-8"
      },
      body: JSON.stringify(this.EasyConfig)
    });
    this.token = JSON.parse(r[0].body).access_token;
    console.log(this.token);
    return this.token;
  }

}