import { GunNode } from "gun-plus";

export class AppNode extends GunNode {
    constructor(...args: ConstructorParameters<typeof GunNode>){
        super(...args)
    }

    /** Timestamp for testing purposes. */
    get timestamp() {
        return new GunNode(this.get("timestamp").chain);
    }
}