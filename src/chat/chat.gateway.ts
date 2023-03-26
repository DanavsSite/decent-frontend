import { JwtService } from "@nestjs/jwt";
import {
	ConnectedSocket,
	SubscribeMessage,
	WebSocketGateway,
} from "@nestjs/websockets";
import { MessageBody, WebSocketServer } from "@nestjs/websockets/decorators";
import { Socket } from "socket.io";
import { User } from "src/decorators/user";
import { messageDTo } from "src/dtos/chat.dto";
import { ChatService } from "./chat.service";
@WebSocketGateway()
export class ChatGateway {
	@WebSocketServer()
	server;
	constructor(private service: ChatService) {}
	async handleConnection(client: Socket) {
		let bool;
		if (!client.handshake.headers.authorization) {
			bool = false;
		} else {
			bool = true;
		}
		await this.service.verify(
			bool,
			client,
			client.handshake.headers["authorization"],
		);
	}

	@SubscribeMessage('sendMessage')
	async sendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: messageDTo,
	) {
		const data = await this.service.getData(
			client.handshake.headers.authorization,
		);
		await this.service.sendMessage(client, body, data, this.server);
	}
	@SubscribeMessage('sendFriendRequest')
	async addf(@ConnectedSocket() client: Socket, @MessageBody() body: string) {
		const data = await this.service.getData(
			client.handshake.headers.authorization,
		);
		this.service.sendFriendRequest(data, body, client, this.server);
	}
	@SubscribeMessage('acceptFriendRequest')
	async accfr(@ConnectedSocket() client: Socket, @MessageBody() body: string) {
		const data = await this.service.getData(
			client.handshake.headers.authorization,
		);
		await this.service.addFriend(client, data, body);
	}
}
