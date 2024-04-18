import fs from "fs";
import inquirer from "inquirer";
import configuration from "../../relay-config.json" assert {type: "json"};

const gun = await inquirer.prompt([
    {
        type: "input",
        name: "app_scope",
        default: configuration?.gun?.["app-scope"] || crypto.randomUUID(),
        message: "What is your unique app scope?"
    },
    {
        type: "checkbox",
        name: "options",
        choices: ["AXE", "Multicast", "Radisk", "LocalStorage"],
        message: "Which options should be enabled?"
    },
    {
        type: "checkbox",
        name: "volunteer_peers",
        choices: ["https://gun-manhattan.herokuapp.com/gun", "https://peer.wallie.io/gun", "https://gundb-relay-mlccl.ondigitalocean.app/gun", "https://plankton-app-6qfp3.ondigitalocean.app/"],
        message: "What voluenteer peers do you want to connect to?"
    },
    {
        type: "input",
        name: "dedicated_peers",
        message: "Any other peers you want to connect to?",
        default: ""
    },
]);

const server = await inquirer.prompt([
    {
        type: "number",
        name: "port",
        default: configuration?.server?.port || 3000,
        message: "What port number should the relay use?"
    },
]);

const {plugins} = await inquirer.prompt([
    {
        type: "checkbox",
        name: "plugins",
        choices: ["janitor", "bullet-catcher"],
        message: "Which plugins should be enabled?"
    },
])

const janitor = {
    max_capacity_gb: configuration?.plugins?.janitor?.["max-capacity-gb"] || 4,
    timer_minutes: configuration?.plugins?.janitor?.["timer-minutes"] || 60,
}

const bullet_catcher = {
    token: configuration?.plugins?.["bullet-catcher"]?.token || crypto.randomUUID()
}

if(plugins.includes("janitor")) {
    const options = await inquirer.prompt([
        {
            type: "number",
            name: "max_capacity_gb",
            default: janitor.max_capacity_gb,
            message: "What is the max capacity in GB?"
        },
        {
            type: "number",
            name: "timer_minutes",
            default: janitor.timer_minutes,
            message: "How often should janitor check in minutes?"
        }
    ]);
    janitor.max_capacity_gb = options.max_capacity_gb;
    janitor.timer_minutes = options.timer_minutes;
}

if(plugins.includes("bullet-catcher")) {
    const options = await inquirer.prompt([
        {
            type: "input",
            name: "token",
            default: bullet_catcher.token,
            message: "What token do you want to use for validation?"
        },
    ]);
    bullet_catcher.token = options.token;
}

const config = {
    gun: {
        "app-scope": gun.app_scope,
        "use-axe": gun.options.includes("AXE"),
        "use-localstorage": gun.options.includes("LocalStorage"),
        "use-radisk": gun.options.includes("Radisk"),
        "use-multicast": gun.options.includes("Multicast"),
        peers: gun.volunteer_peers.concat(gun.dedicated_peers).filter(peer => peer?.length > 0),
    },
    server: {
        port: server.port,
    },
    plugins: {
        janitor: {
            enabled: plugins.includes("janitor"),
            "max-capacity-gb": janitor.max_capacity_gb,
            "timer-minutes": janitor.timer_minutes
        },
        "bullet-catcher": {
            enabled: plugins.includes("bullet-catcher"),
            token: bullet_catcher.token
        }
    }
}

try{
    const data = JSON.stringify(config, undefined, 2);
    fs.writeFileSync("relay-config.json", data);
    console.log("SETUP DONE.")
}catch(err){
    console.log(err);
}
