/**
 * Created by lvshun on 15/10/14.
 */

import http from "http";
import {ErrorCode} from "../config/errorcode.js";
import {ServiceError} from "../models/service.error.model.js";

export class SmsUtil {

  static sendSmsCode(phone, sms) {
    var params = "?method=Submit&account=cf_vocinno&password=36b7fdaab1cbe00da78edf760ef36d2c&mobile=" + phone + "&content=您的验证码是：【" + sms + "】。请不要把验证码泄露给其他人。";
    var url = "http://106.ihuyi.cn/webservice/sms.php" + params;
    url = encodeURI(url);
    http.get(url, function (res) {
      res.on('data', function (data) {
        console.log("Got data: " + data);
      });
    }).on('error', function (e) {
      throw e;
    });
  }
}