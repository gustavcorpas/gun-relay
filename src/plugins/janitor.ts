import path from "path";
import {readdir, stat, rm, access} from "fs/promises";
import { IPlugin } from "../models/plugin";

const get_directory_size = async directory => {
	try{
		await access(directory);
	}catch{
		return 0;
	}
	const files = await readdir( directory );
	const stats = files.map( file => stat( path.join( directory, file ) ) );

	return ( await Promise.all( stats ) ).reduce( ( accumulator, { size } ) => accumulator + size, 0 );
}

/**
 * Cleans, mobs and throws out old data.
 */
export default class Janitor implements IPlugin {
	#started = false;
	#timeout;

    timer: number;
    max_bytes: number;
    folder: string;

	/**
	 * Creates a new janitor.
	 * @param {Object} options - Options. You may instantiate without to use defaults.
	 * @param {number} options.timer_seconds - Goes a round every x secodns, looking if anything needs cleaning. Default is 1 hour.
	 * @param {number} options.clean_at_mb - If data takes up more than x mb space, clean it. Default is 1GB.
	 * @param {string} folder_path - Data folder. Default is `radata` in root directory.
	 */
	constructor({timer_seconds, clean_at_mb, folder_path}){

		this.timer = timer_seconds * 1000;
		this.max_bytes = clean_at_mb * 1024 * 1024;
		this.folder = folder_path;

	}

	start() {
		console.log("Plugin started: Janitor");
		if(this.#started === false){
			this.#started = true;
			this.#clean();
		}
	}

	stop() {
		this.#started = false;
		if(this.#timeout){
			clearTimeout(this.#timeout);
			this.#timeout = undefined;
		}
	}

	#clean = () => {
		const gun_data = this.folder;

		get_directory_size(gun_data).
			then(size => {
				if(size < this.max_bytes) return;

				rm(gun_data, {recursive: true}).then(res => {
					console.log("Janitor says: Reset database!");
				}).catch(err => {
					console.warn("Janitor says: ", err);
				})
			}).
			catch(err => {
				console.warn("Janitor says: ", err);
			})

		this.#timeout = setTimeout(this.#clean, this.timer);
	}

}
