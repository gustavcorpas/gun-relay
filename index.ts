// We need the side effects from these imports.
import rfs from "gun/lib/rfs";
import store from "gun/lib/store";
import axe from "gun/lib/axe.js";

// Actual imports
import config from "./relay-config.json" assert {type: "json"}
import GunPlus from "gun-plus";
import { AppNode } from "./src/models/spec.ts";
import Janitor from "./src/plugins/janitor.ts";
import { BulletCatcher } from "./src/plugins/bullet-catcher.ts";
import get_bun_server from "./src/server/bun-server.ts";

globalThis.mode = process.argv[2] ?? "production";
console.log(`Running in mode: ${globalThis.mode}.`);

// const server = get_server({port: config.server.port});
const {Gun, SEA} = await GunPlus.imports();

const server = get_bun_server(Gun, {port: config.server.port});


{
    // JANITOR PLUGIN
    const timer_seconds = globalThis.mode === "dev" ? 0.5 : config.plugins.janitor["timer-minutes"];
    const clean_at_mb = globalThis.mode === "dev" ? 0.000001 : config.plugins.janitor["max-capacity-gb"];
    const janitor = new Janitor({timer_seconds, clean_at_mb, folder_path: "./radata"});

    // BULLET CATCHER
    const bullet_catcher = new BulletCatcher(Gun, config.plugins["bullet-catcher"].token);

    var plugins = {"janitor": janitor, "bullet-catcher": bullet_catcher};
}

for(const [name, plugin] of Object.entries(plugins)) {
    if(config.plugins[name].enabled) {
        plugin.start();
    }
}

console.log({
    axe: config.gun["use-axe"],
    localStorage: config.gun["use-localstorage"],
    radisk: config.gun["use-radisk"],
    multicast: config.gun["use-multicast"],
})

globalThis.gunInstance = new GunPlus({Gun, SEA}, config.gun["app-scope"], {
    axe: config.gun["use-axe"],
    localStorage: config.gun["use-localstorage"],
    radisk: config.gun["use-radisk"],
    multicast: config.gun["use-multicast"],
    
    web: server,
    peers: config.gun.peers,
}).gun;


// PING TEST
if(globalThis.mode === "dev") {
    const app_node = GunPlus.instance.wrap(AppNode);
    app_node.timestamp.watch(0).subscribe(timestamp => console.log(`${GunPlus.instance.app_scope} -> timestamp -> ${timestamp.value}`))
    setInterval(test, 3000);

    function test() {
        const app_node = GunPlus.instance.wrap(AppNode);
        app_node.timestamp.put(Date.now());
    }
}


