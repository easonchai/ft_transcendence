import { PlayerPosition, PlayerConnection, PongState, initialState, GameStatus, BALL_DEFAULTS } from "./PongValues";
import { v4 as uuidv4 } from "uuid";
import { Namespace, Socket } from 'socket.io'
import { KeyPressBody, MatchMessageBody } from "src/gateways/match.gateway";
import { PongGameState } from "./PongGameState";
import { MatchesService } from "src/matches/matches.service";

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
	
	movePaddle(player: PlayerPosition, dir: 'up' | 'down') {
		if (dir === 'up') {
			this._state.movePaddleUp(player);
		} else {
			this._state.movePaddleDown(player);
		}
	}
	
	getScore(pos: PlayerPosition) {
		if (pos === 'left') return this._state.state.players['left'].score;
		else return this._state.state.players['right'].score;
	}
	
	get status() { return this._state.status; }
	get left() { return this._left; }
	get right() { return this._right; }
}

export class PongStates {
	private games: Map<string, PongGame>;	// <roomId, PongGame>
	private clientRooms: Map<string, string>; // <client_id, roomId>
	
	constructor(private readonly io: Namespace, private readonly matchesService: MatchesService) {
		this.games = new Map<string, PongGame>();
		this.clientRooms = new Map<string, string>();
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
					client.join(key);
					this.clientRooms.set(client.id, key);
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
		this.clientRooms.set(client.id, roomId);
		client.emit('joinedRoom', { roomId: roomId, playerPosition: playerPos })
		
		// If the room is full, prompt user a readyPage
		if (this.games.get(roomId).isFull()) {
			this.games.get(roomId).setStatus('readyPage');
		}
	}
	
	handleDisconnect(client: Socket, user_id: string) {
		// If client does not exist
		let roomId: string | undefined
		if (!(roomId = this.clientRooms.get(client.id))) return;
		
		// If roomId does not exist
		let game: PongGame | undefined;
		if (!(game = this.games.get(roomId))) return;
		
		// If user is not exist in the room
		let player: Player | undefined
		if (!(player = game.isExisted(user_id))) return;

		// If user disconnect during 'playing'
		if (game.status === 'playing') {
			player.disconnect();
			game.setStatus('paused');
		} else {
			player.remove(player.position);
			game.setStatus('matchMakingPage');
			if (game.isBothDisconnected()) {
				game.clearGame();
				this.games.delete(roomId);
			}
		}
		
		this.clientRooms.delete(client.id);
	}
	
	handleReadyButtonPressed(client: Socket, body: MatchMessageBody) {
		const game = this.games.get(body.roomId);
		if (!game) return ;
		
		if (body.playerPosition === 'left') game.setPlayerReady('left');
		else game.setPlayerReady('right');
		
		if (game.isBothReady()) game.setStatus('playing');
	}
	
	handleKeyPress(client: Socket, body: KeyPressBody) {
		const game = this.games.get(body.roomId);
		if (!game) return ;
		
		game.movePaddle(body.playerPosition, body.direction);
	}
	
	handleGameOver(client: Socket, body: MatchMessageBody, auth_user_id: string) {
		const game = this.games.get(body.roomId);
		if (!game) return ;
		
		const left_res = { score: game.getScore('left'), user_id: game.left.user_id };
		const right_res = { score: game.getScore('right'), user_id: game.right.user_id };
		
		if (body.playerPosition === 'left') {
			this.matchesService.createMatch({ opponent_id: right_res.user_id, opponent_score: right_res.score, score: left_res.score }, auth_user_id);
		} else {
			this.matchesService.createMatch({ opponent_id: left_res.user_id, opponent_score: left_res.score, score: right_res.score }, auth_user_id);
		}
		
		game.clearGame();
		this.games.delete(body.roomId);
	}
}