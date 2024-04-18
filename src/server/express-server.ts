
import express from "express"

export default function get_server({port}: {port: number}) {

    const app = express();
    const PORT = port;

	app.get("/", (_, res) => {
        res.sendFile(`${import.meta.dirname}/server.html`);
	})

	const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });


    return server;
}
