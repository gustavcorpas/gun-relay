// THIS FILE RUNS BEFORE THE SETUP
import fs from "fs";

try {
    fs.writeFileSync("./relay-config.json", "{}", {flag: "wx"});
    console.log('relay-config.json created successfully!');
} catch (error) {
    console.error("Using existing relay-config.json file...");
}