/**
 * Created by jeannie.boffel on 2/10/2016.
 */

var daemon = require("daemonize2").setup({
    main: "bin/www",
    name: "agilepoker",
    pidfile: "/var/run/agilepoker.pid"
});

if (process.getuid() != 0) {
    console.log("Expected to run as root");
    process.exit(1);
}

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