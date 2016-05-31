/**
 * Created by lvshun on 15/10/13.
 */
/**
 * Created by lvshun on 15/9/8.
 */
import mongodb from "mongodb";
var ObjectID = mongodb.ObjectID;
import {ServiceError} from "../models/service.error.model.js";

import {AddUser,User} from "../models/user.model";

export function UserController(userService) {
  return {

    * checkLogin(next) {

      var token = this.request.body.token;
      this.request.userId = yield userService.checkLogin(token);
      console.log(this.request.userId);
      this.type = "json";
      this.status = 200;
      yield next;

    },


    * getSmsCode(next) {

      if(!this.params.phone){
        throw new ServiceError(501, "请填写完整信息：phone");
      }

      this.body = yield userService.getSmsCode(this.params.phone);
      this.type = "json";
      this.status = 200;

    },

    * signUp(next) {

      if(!this.request.body.phone || !this.request.body.smsCode || !this.request.body.password){
        throw new ServiceError(501, "请填写完整信息：phone smsCode password");
      }

      var addUser = AddUser.FromAccount(this.request.body.phone, this.request.body.smsCode, this.request.body.password);

      this.body = yield userService.signUp(addUser);
      this.type = "json";
      this.status = 200;

    },

    * resetPassword(next) {

      if(!this.request.body.phone || !this.request.body.smsCode || !this.request.body.password){
        throw new ServiceError(501, "请填写完整信息：phone smsCode password");
      }

      var addUser = AddUser.FromAccount(this.request.body.phone, this.request.body.smsCode, this.request.body.password);
      addUser.id=this.request.userId;
      this.body = yield userService.resetPassword(addUser);
      this.type = "json";
      this.status = 200;

    },

    * signIn(next) {
      if(!this.request.body.phone || !this.request.body.password){
        throw new ServiceError(501, "请填写完整信息：phone password");
      }

      var addUser = new AddUser(this.request.body.phone,this.request.body.password);

      this.body = yield userService.signIn(addUser);
      this.type = "json";
      this.status = 200;
    },

    * update(next) {

      var userId = this.request.userId;
      if(!this.request.body.avatar || !this.request.body.username || this.request.body.gender == ""){
        throw new ServiceError(501, "请填写完整信息：头像，昵称，性别");
      }
      var user = new User(userId,"","",this.request.body.username,this.request.body.avatar,this.request.body.gender);
      this.body = yield userService.update(user);
      this.type = "json";
      this.status = 200;
    }
  };
}


