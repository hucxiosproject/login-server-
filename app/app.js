import koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "koa-cors";
import bunyan from "bunyan";


var log = bunyan.createLogger({name: "login"});
var app = koa();
app.use(bodyParser());

/**
 * 中间件：错误处理
 */
app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
    this.app.emit('error', err, this);
  }
});

import { EasyChat } from "./util/easychat.util";
co(function* () {
  let token = yield EasyChat.init();
});

import {Config} from "./config/config";

import {UserRoute} from "./routes/user.route.js";
var userRoute = yield UserRoute(Config.getMongo(), Config.getMemcached());
app.use(userRoute.middleware());

app.on('error', function (err) {
  log.error(err);
});

app.use(cors());

app.listen(5000);
