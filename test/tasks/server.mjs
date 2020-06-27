import minimist from 'minimist';
import server from "live-server";

(({ root, port }) => {
  server.start({
    root, // Set root directory that's being served. Defaults to cwd.
    port, // Set the server port. Defaults to 8080.
    host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    open: false, // When false, it won't load your browser by default.
    file: undefined, // When set, serve this file for every 404
    wait: 500, // Waits for all changes, before reloading. Defaults to 0 sec.
    logLevel: 1 // 0 = errors only, 1 = some, 2 = lots
    // ignore: 'a, b, c', // comma-separated string for paths to ignore
  });
})(minimist(process.argv.slice(2)));