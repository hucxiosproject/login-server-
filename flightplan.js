var plan = require("flightplan");

plan.target("staging", {
  host: "vitamin.bengjiujie.com",
  username: "ubuntu",
  agent: process.env.SSH_AUTH_SOCK
});


plan.remote(function(remote) {
  remote.log("Pull application from gitlab");
  remote.with("cd /data/repos/login-server", function() {
    remote.exec("git pull");
    remote.exec("./run.sh");
  });
});
