/**
 * Created by lvshun on 15/10/13.
 */
import monk from "monk";
import wrap from "co-monk";
import router from "koa-router";
import {UserService} from "../services/user.service.js";
import {UserController} from "../controllers/user.controller.js";

export function * UserRoute(mongo, memcached) {

  var userCollection = wrap(mongo.get("users"));
  var userService = new UserService(userCollection, memcached);
  var userController = UserController(userService);
  var r = new router();
  r.get("/user/sms/:phone", userController.getSmsCode);
  r.post("/user/signup", userController.signUp);
  r.post("/user/signin", userController.signIn);
  r.post("/user/resetPassword", userController.resetPassword);
  r.put("/user", userController.checkLogin, userController.update);

  return r
}