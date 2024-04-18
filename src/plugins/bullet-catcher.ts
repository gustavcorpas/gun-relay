// Implementation based on Geir Gåsodden's repo found here: https://github.com/zrrrzzt/bullet-catcher

import type { GunHookMessageIn, IGun } from "gun";
import { IPlugin } from "../models/plugin";


function validate(message: GunHookMessageIn<any, any>, token: string) : Boolean{
    if(message?.headers?.token === token) return true;
    return false;
}

export class BulletCatcher implements IPlugin {
    
    constructor(public Gun: IGun, public token: string) {}

    start() {
        console.log("Plugin started: Bullet Catcher");
        const token = this.token;
        this.Gun.on("opt", function(root) {
            if(typeof root.opt !== "object" || "length" in root.opt || "plugins" in root.opt && root.opt.plugins && "bullet-catcher" in root.opt.plugins) {
                return;
            }

            const plugins = root.opt.plugins ?? {};
            plugins["bullet-catcher"] = {enabled: true};
            root.opt.plugins = plugins;

            
            root.on("in", function(message) {
                // validate if attempting a put.
                if("put" in message && validate(message, token)) {
                    console.log("Bullet-catcher says: Message validation failed!");
                    return;
                }
                this.to.next(message);
            })

            this.to.next(root);
        })
    }

}
