import mongodb from "mongodb";
var ObjectID = mongodb.ObjectID;
import {ServiceError} from "../models/service.error.model.js";

export class User {

  constructor(id, phone, password, username, avatar, gender) {
    this.id = id;
    this.phone = phone;
    this.password = password;
    this.username = username;
    this.avatar = avatar;
    this.gender = gender;
  }

  static fromMongo(doc) {
    if(doc){
      let user = new User(String(doc._id), doc.phone, doc.password, doc.username, doc.avatar, doc.gender);
      return user;
    }else{
      return null;
    }
  }

  toMongo() {
    let user = {};
    if (this.id) {
      user._id = ObjectID(this.id);
    }
    user.phone = this.phone;
    user.password = this.password;
    user.username = this.username;
    user.avatar = this.avatar;
    user.gender = this.gender;
    return user;
  }
}

export class ClientUser {
  constructor(id, phone, username, avatar, gender,token) {
    this.id = id;
    this.phone = phone;
    this.username = username;
    this.avatar = avatar;
    this.gender = gender;
    this.token=token;
  }

  static fromUser(user) {
    let clientUser = new ClientUser(user.id, user.phone, user.username, user.avatar, user.gender,user.token);
    return clientUser;
  }

  static fromAddUser(user) {
    if (!user.id || !user.phone || !user.token) {
      throw new ServiceError(504, "字段不完整，id,phone,token");
    }
    let clientUser = new ClientUser(user.id, user.phone, "", "", "",user.token);
    return clientUser;
  }
}

export class AddUser {
  constructor(phone, password) {
    if (!phone || !password) {
      throw new ServiceError(504, "字段不完整，phone,password");
    }
    this.phone = phone;
    this.password = password;
  }

  static FromAccount(phone, smsCode, password) {
    if (!phone || !smsCode || !password) {
      throw new ServiceError(504, "字段不完整，phone,smsCode,password");
    }
    let user = new AddUser(phone, password);
    user.smsCode = smsCode;
    return user;
  }
}