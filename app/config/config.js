/**
 * Created by lvshun on 2015/10/13.
 */
import monk from "monk";
import wrap from "co-monk";
import mongodb from "mongodb";
import Memcached from 'cofy-memcached';

export class Config {

		static getMongo() {
      var mongo = monk(process.env.MONGO_URL);
      return mongo;
    }
    static getMemcached(){
      var memcached = new Memcached(process.env.MEMCACHED_URL);
      return memcached;
    }
}
