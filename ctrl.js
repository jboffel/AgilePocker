/**
 * Created by jeannie.boffel on 2/10/2016.
 */

var daemon = require("daemonize2").setup({
    main: "bin/www",
    name: "agilepoker",
    user: "nobody",
    group: "daemon",
    pidfile: "/var/run/agilepoker.pid"
});

switch (process.argv[2]) {

    case "start":
        daemon.start();
        break;

    case "stop":
        daemon.stop();
        break;

    default:
        console.log("Usage: [start|stop]");
}