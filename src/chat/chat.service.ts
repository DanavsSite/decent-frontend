import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Users } from "@prisma/client";
import { Socket } from "socket.io";
import { messageDTo } from "src/dtos/chat.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { ChatGateway } from "./chat.gateway";

@Injectable()
export class ChatService {
	constructor(
		private jwt: JwtService,
		private prisma: PrismaService,
		private config: ConfigService,
	) {}
	async verify(jwt: boolean, client: Socket, ajwt: string) {
		if (jwt) {
			const jwt2 = this.jwt.verify(ajwt.slice(6), {
				secret: this.config.get("JWT_SECRET"),
			});
			let user = await this.prisma.users.findUnique({
				where: {
					id: jwt2.sub,
				},
			});
			console.log(user);
			if (!user) return client.disconnect(true);
			client.join(user.id);
			const friendRequests = await this.getFriendRequest(client, user);
			client.emit("gotFriendRequest", friendRequests);
		} else {
			client.disconnect(true);
		}
	}
	async getData(token: string) {
		const data = await this.jwt.verify(token, {
			secret: this.config.get("JWT_SECRET"),
		});
		return await this.prisma.users.findUnique({
			where: {
				id: data.sub,
			},
		});
	}
	async sendFriendRequest(
		user: Users,
		username: string,
		client: Socket,
		// rome-ignore lint/suspicious/noExplicitAny: <explanation>
		server: any,
	) {
		const friend = await this.prisma.users.findUnique({
			where: { username: username },
		});
		server.to(friend.id).volatile.emit("friendRequest", user);
		await this.prisma.users.update({
			where: {
				username,
			},
			data: {
				pendingFriendRequests: {
					connect: {
						username,
					},
				},
			},
		});
	}
	async getFriendRequest(client: Socket, user: Users) {
		const friendRequests = await this.prisma.users.findUnique({
			where: {
				username: user.username,
			},
			include: {
				pendingFriendRequests: true,
			},
		});
		return friendRequests.pendingFriendRequests;
	}
	async addFriend(client: Socket, user: Users, otherUsername: string) {
		const other = await this.prisma.users.findUnique({
			where: {
				username: otherUsername,
			},
		});
		await this.prisma.users.update({
			where: {
				username: other.username,
			},
			data: {
				friends: {
					connect: {
						username: user.username,
					},
				},
				pendingFriendRequests: {
					disconnect: {
						username: user.username,
					},
				},
			},
		});
		await this.prisma.users.update({
			where: {
				username: user.username,
			},
			data: {
				friends: {
					connect: {
						username: other.username,
					},
				},
				pendingFriendRequests: {
					disconnect: {
						username: other.username,
					},
				},
			},
		});
	}
	async sendMessage(
		client: Socket,
		messageBody: messageDTo,
		user: Users,
		// rome-ignore lint/suspicious/noExplicitAny: <explanation>
		server: any,
	) {
		console.log(user, messageBody);
		const to = await this.prisma.users.findUnique({
			where: {
				username: messageBody.to,
			},
			include: {
				friends: true,
			},
		});
		to.friends.forEach((friend) => {
			if (friend.username === user.username) {
				server.to(to.id).emit("message", messageBody);
			}
		});
	}
}
