import {Constant} from "../config/constant.js";
import {ErrorCode} from "../config/errorcode.js";
import {ServiceError} from "../models/service.error.model.js";
import mongodb from "mongodb";
var ObjectID = mongodb.ObjectID;
import crypto from "crypto";
import md5 from "md5";
import querystring from "querystring";
import {PhoneUtil} from "../util/phone.util.js";
import {RandomUtil} from "../util/random.util.js";
import {SmsUtil} from "../util/sms.util.js";
import {User,ClientUser,AddUser} from "../models/user.model";
import {EasyChat} from "../util/easychat.util.js";

export class UserService {

  constructor(userCollection,cache) {
    this._users = userCollection;
    this._cache = cache;
    this._constant = Constant();
    this._errorCode = ErrorCode();

  }

  /**
   * 获得手机验证码
   * @param phone
   * @returns {{phone: *, smsCode: *, expireTime: number}}
   */
  * getSmsCode(phone) {
    if (PhoneUtil.checkPhoneFormat(phone).status) {

      //生成随机四位验证码
      var smsCode = RandomUtil.getRandomNumber(1000, 9999);

      //将验证码，手机号，过期时间保存
      var passport = {
        phone: phone,
        smsCode: smsCode
      };

      //将验证码等保存到memcached,一分钟过期
      yield this._cache.$set("sms"+phone,passport,this._constant.ONE_MINUTE);

      //调用网络接口，发送验证码
      try{
        SmsUtil.sendSmsCode(phone,smsCode);
      }catch(error){
        throw new ServiceError(this._errorCode.ERROR_CODE_SERVER_NET_FAIL,"发送验证码失败");
      }
      //返回passport对象
      return passport;
    }
  }

  /**
   * 注册
   * @param user
   * @returns {*}
   */
  * signUp(adduser) {
    //根据用户手机号和验证码获得passport，检查是否过期
    var passport = yield this._cache.$get("sms"+adduser.phone);
    if (passport) {
      if (adduser.smsCode == passport.smsCode) {

        adduser.password = md5(adduser.password);
        try {

          //检查phone是否重复注册
          var oldUser = User.fromMongo( yield this._users.findOne({phone: adduser.phone}) );
          if(oldUser && oldUser.id){
            throw new ServiceError(this._errorCode.ERROR_CODE_CLIENT_PARAMS_ERROR,"该手机已注册");
            //yield this._users.remove({phone: adduser.phone});
          }
          adduser.smsCode=undefined;
          var result = yield this._users.insert(adduser);
          var now = new Date();
          adduser.id=result._id;
          adduser.token = md5(now.getTime() );

          var oldToken = yield this._cache.$get(adduser.phone );
          yield this._cache.$del(oldToken);
          yield this._cache.$set(adduser.token,adduser.id,this._constant.TWO_HOURS);
          yield this._cache.$set(adduser.phone,adduser.token,this._constant.TWO_HOURS);

          yield EasyChat.createUser(adduser.id,adduser.password);

          return ClientUser.fromAddUser(adduser);
        } catch (err) {
          throw err;
        }
      } else {
        throw new ServiceError(this._errorCode.ERROR_CODE_CLIENT_PARAMS_ERROR,"验证码错误");
      }
    } else {
      throw new ServiceError(this._errorCode.ERROR_CODE_CLIENT_PARAMS_ERROR,"验证码已经过期");
    }
  }

  /**
   * 重置密码
   * @param adduser
   * @returns {*}
   */
  * resetPassword(adduser) {
    //根据用户手机号和验证码获得passport，检查是否过期
    var passport = yield this._cache.$get("sms"+adduser.phone);
    if (passport) {
      if (adduser.smsCode == passport.smsCode) {

        //使用随机数生成password和token
        var oldUser = User.fromMongo(yield this._users.findOne({phone: adduser.phone}));
        console.log(oldUser);
        if(!oldUser){
          throw new ServiceError(this._errorCode.ERROR_CODE_CLIENT_PARAMS_ERROR,"用户不存在，请检查手机号码");
        }
        oldUser.password = md5(adduser.password);
        oldUser.phone = adduser.phone;

        //新增用户到数据库
        try {
          //用户写入到数据库
          var result = yield this._users.update({phone: adduser.phone}, oldUser.toMongo() );
          var now = new Date();
          oldUser.token = md5(now.getTime() );

          var oldToken = yield this._cache.$get(adduser.phone );
          yield this._cache.$del(oldToken);
          yield this._cache.$set(oldUser.token,oldUser.id,this._constant.TWO_HOURS);
          yield this._cache.$set(oldUser.phone,oldUser.token,this._constant.TWO_HOURS);

          yield EasyChat.resetPassword(oldUser.id,oldUser.password);

          return ClientUser.fromUser(oldUser);
        } catch (err) {
          throw err;
        }
      } else {
        throw new ServiceError(this._errorCode.ERROR_CODE_CLIENT_PARAMS_ERROR,"验证码错误");
      }
    } else {
      throw new ServiceError(this._errorCode.ERROR_CODE_CLIENT_PARAMS_ERROR,"验证码已经过期");
    }
  }

  /**
   * 登陆
   * @param user
   * @returns {*}
   */
  * signIn(addUser) {
    var oldUser = User.fromMongo(yield this._users.findOne({phone: addUser.phone}));
    if (!oldUser) {
      throw ServiceError(this._errorCode.ERROR_CODE_CLIENT_PARAMS_ERROR,"账户不存在");
    }
    addUser.password = md5(addUser.password);
    if (addUser.password == oldUser.password) {

      //验证成功，生成新token
      var now = new Date();
      oldUser.token = md5(now.getTime());

      var oldToken = yield this._cache.$get(addUser.phone );

      yield this._cache.$del(oldToken);
      yield this._cache.$set(oldUser.phone ,oldUser.token,this._constant.TWO_HOURS);
      yield this._cache.$set(oldUser.token ,oldUser.id,this._constant.TWO_HOURS);

      return ClientUser.fromUser(oldUser);

    } else {
      throw ServiceError(this._errorCode.ERROR_CODE_CLIENT_PARAMS_ERROR,"用户登陆失败，密码不正确");
    }
  }

  /**
   * 更新用户信息
   * @param user
   */
  *update(user){

    var oldUser = User.fromMongo( yield this._users.findOne({_id: ObjectID(user.id)}) );
    if(user){

      oldUser.avatar = user.avatar;
      oldUser.username = user.username;
      oldUser.gender = user.gender;

      try{
        var result = yield this._users.update({_id: ObjectID(user.id)}, oldUser.toMongo());
        yield this._cache.$set(user.token ,oldUser.id,this._constant.TWO_HOURS);
      }catch(err){
        throw new ServiceError(this._errorCode.ERROR_CODE_DB_FAIL,"数据库更新信息失败");
      }

      if(result){
        oldUser.token=user.token;
        return ClientUser.fromUser(oldUser);
      }
    }else{
      throw new ServiceError(this._errorCode.ERROR_CODE_CLIENT_PARAMS_ERROR,"用户不存在");
    }

  }

  /**
   * 检查用户token是否登陆
   * @param token
   * @returns {*}
   */
  *checkLogin(token){
    var userId = yield this._cache.$get(token);
    if(!userId){
      throw new ServiceError(this._errorCode.ERROR_CODE_CLIENT_PARAMS_ERROR,"token失效");
    }else{
      yield this._cache.$set(token ,userId,this._constant.TWO_HOURS);
    }
    return userId;
  }

}