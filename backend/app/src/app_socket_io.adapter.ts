import { INestApplicationContext, Logger } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions, Server, Socket } from "socket.io";

export class SocketIOAdapter extends IoAdapter {
	private readonly logger = new Logger(SocketIOAdapter.name);
	constructor( private app: INestApplicationContext ) { 
		super(app); 
	}
	
	createIOServer(port: number, options?: ServerOptions) {
		const clientPort = 3001;
		
		const cors = {
			origin: [
        `http://localhost:${clientPort}`,
        new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`).toString(),
			],
			credentials: true
		}
		
		this.logger.debug('Configuring SocketIOAdapter', cors);
		
		const optionsWithCors: ServerOptions = {
			...options,
			cors
		};
		
		const server: Server = super.createIOServer(port, optionsWithCors);
		
		
		return server;
	}
}