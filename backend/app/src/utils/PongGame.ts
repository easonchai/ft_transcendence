import { PlayerPosition, PlayerConnection, PongState, initialState, GameStatus, BALL_DEFAULTS } from "./PongValues";
import { v4 as uuidv4 } from "uuid";
import { Namespace, Socket } from 'socket.io'
import { MatchMessageBody } from "src/gateways/match.gateway";
import { PongGameState } from "./PongGameState";

const exceptionBody = (msg: string) => {
	return {
		message: msg
	}
}

class Player {
	client_id: string;
	user_id: string;
	occupied: boolean;
	connection: PlayerConnection
	position: PlayerPosition
	ready: boolean

	constructor(pos: PlayerPosition) {
		this.client_id = '';
		this.user_id = '';
		this.occupied = false;
		this.connection = 'disconnected';
		this.position = pos;
		this.ready = false;
	}
	
	remove(pos: PlayerPosition) {
		this.client_id = '';
		this.user_id = '';
		this.occupied = false;
		this.connection = 'disconnected';
		this.position = pos;
		this.ready = false;
	}
	
	disconnect() {
		this.connection = 'disconnected';
	}
	
	reconnect(client_id: string) {
		this.connection = 'connected';
		this.client_id = client_id;
	}
	
	init(client_id: string, user_id: string) {
		this.client_id = client_id;
		this.user_id = user_id;
		this.occupied = true;
		this.connection = 'connected';
		this.ready = false;
	}
	
}

export class PongGame {
	private _state: PongGameState;
	private _roomId: string;
	private _left: Player;
	private _right: Player;
	private _interval: ReturnType<typeof setInterval>;
	
	constructor(private readonly io: Namespace, client_id: string, user_id: string) {
		this._state = new PongGameState();
		this._left = new Player('left');
		this._left.init(client_id, user_id);
		this._right = new Player('right');
		this._interval = setInterval(() => {
			if (this._state.status === 'playing') {
				this._state.moveBall();
				if (this._state.winner) {
					this._state.setStatus('game-over');
				}
			}
			this.io.in(this._roomId).emit('sync', this._state.state);
			if (this._state.status === 'game-over') {
				// if (this._state.winner === 'left') this.io.to(this._left.client_id).emit('game-over');
				// else this.io.to(this._right.client_id).emit('game-over');
				clearInterval(this._interval);
			}
		}, 20);
	}
	
	isAvailable(): Player | undefined {
		if (!this._left.occupied) return this._left;
		else if (!this._right.occupied) return this._right;
		return undefined
	}
	
	isExisted(user_id: string): Player | undefined {
		if (this._left.user_id === user_id) return this._left;
		if (this._right.user_id === user_id) return this._right;
		return undefined;
	}
	
	isFull(): boolean {
		return this._left.occupied && this._right.occupied;
	}
	
	isBothDisconnected(): boolean {
		return this._left.connection === 'disconnected' && this._right.connection === 'disconnected';
	}
	
	setStatus(stat: GameStatus) {
		this._state.setStatus(stat);
	}
	
	setRoomId(id: string) {
		this._roomId = id;
	}
	
	clearGame() {
		clearInterval(this._interval);
	}
	
	setPlayerReady(pos: PlayerPosition) {
		if (pos === 'left') this._left.ready = true;
		else this._right.ready = true;
	}
	
	isBothReady(): boolean {
		return this._left.ready && this._right.ready;
	}
	
	get status() { return this._state.status; }
	get left() { return this._left; }
	get right() { return this._right; }
	
	// isPlayerExistByUserId(user_id: string): boolean {
	// 	return this._left.user_id === user_id || this._right.user_id === user_id; 
	// }
	
	// getPlayerByUserId(user_id: string): Player {
	// 	return this._left.user_id === user_id ? this._left : this._right 
	// }
	
	// isBothDisconnected(): boolean {
	// 	return this._left.connection === 'disconnected' && this._right.connection === 'disconnected'; 
	// }
	
	// setReady(playerPosition: PlayerPosition) { 
	// 	playerPosition === 'left' ? this._left.ready = true : this._right.ready = true; 
	// }
	
	// clearGame() {
	// 	clearInterval(this._ball_interval);
	// 	clearInterval(this._sync_interval);
	// }
	
	// isBothReady(): boolean {
	// 	return this._left.ready && this._right.ready
	// }
	
	// set status(st: Status) { this._status = st; }
	// set roomId(id: string) { this._roomId = id; }
	// get state() { return this._state; }
	// get status() { return this._status; }
}

export class PongStates {
	private games: Map<string, PongGame>;	// <roomId, PongGame>
	
	constructor(private readonly io: Namespace) {
		this.games = new Map<string, PongGame>();
	}
	
	handleNewGamePressed(client: Socket, user_id: string) {
		
		// If player is already existed and trying to reconnect
		for (const [key, value] of this.games) {
			let player: Player | undefined;
			if (player = value.isExisted(user_id)) {
				if (player.connection === 'connected') { 
					client.emit('exception', exceptionBody("User is existed"));
				} else {
					player.reconnect(client.id);
					client.emit('joinedRoom', { roomId: key, playerPosition: player.position })
					value.setStatus('playing');
				}
				return ;
			}
		}
		
		// New player trying to join room
		let roomId = '';
		let playerPos: PlayerPosition = 'left';
		for (const [key, value] of this.games) {
			let player: Player | undefined;
			if (player = value.isAvailable()) {
				player.init(client.id, user_id)
				playerPos = player.position;
				roomId = key;
				break ;
			}
		}
		// If no rooms are available
		if (roomId === '') {
			roomId = uuidv4();
			this.games.set(roomId, new PongGame(this.io, client.id, user_id));
			this.games.get(roomId).setRoomId(roomId);
			this.games.get(roomId).setStatus('matchMakingPage');
		}
		
		client.join(roomId);
		client.emit('joinedRoom', { roomId: roomId, playerPosition: playerPos })
		
		// If the room is full, prompt user a readyPage
		if (this.games.get(roomId).isFull()) {
			this.games.get(roomId).setStatus('readyPage');
		}
	}
	
	handleDisconnect(client: Socket, user_id: string, roomId: string) {
		// If roomId is not exist
		let game: PongGame | undefined;
		if (!(game = this.games.get(roomId))) return;
		
		// If user is not exist in the room
		let player: Player | undefined
		if (!(player = game.isExisted(user_id))) return;
		
		if (game.status !== 'playing') {
			player.remove(player.position);
			if (game.isBothDisconnected()) {
				game.clearGame();
				this.games.delete(roomId);
			}
		} else {
			player.disconnect();
			game.setStatus('paused');
		}
	}
	
	handleReadyButtonPressed(client: Socket, body: MatchMessageBody) {
		const game = this.games.get(body.roomId);
		if (!game) return ;
		
		if (body.playerPosition === 'left') game.setPlayerReady('left');
		else game.setPlayerReady('right');
		
		if (game.isBothReady()) game.setStatus('playing');
	}
	
	handleGameOver(client: Socket, body: MatchMessageBody) {
		console.log("Body", body);
		const game = this.games.get(body.roomId);
		if (!game) return ;
		
		const left = game.left;
		const right = game.right;
		
		game.clearGame();
		this.games.delete(body.roomId);
		
		console.log(this.games)
	}
}