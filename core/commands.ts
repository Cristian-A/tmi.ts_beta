
const CHAT_ENDPOINT = 'https://api.twitch.tv/helix/chat/';

// https://help.twitch.tv/s/article/chat-commands?language=en_US

export type Announcement = "primary" | "blue" | "purple" | "green" | "orange";

export class TwitchCommands {

	constructor(private broadcaster: string,
		private id: string, private token: string) { }

	/**  send an announcement to the channel
	 *   `moderator:manage:announcements`
	 *   @param message the message to send
	 *   @param color the color of the announcement
	 */
	async announce(message: string, color: Announcement = "primary") {
		const query = await fetch(CHAT_ENDPOINT + 'announcements' +
			`?broadcaster_id=${this.broadcaster}&moderator_id=${this.id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.token}`,
				'Client-Id': this.id,
			},
			body: JSON.stringify({ message, color })
		});
		if (query.status !== 204)
			throw new Error('Endpoint connection failed on `announce`!');
	}

	/**
	 * 
	 * @param color can be hex value of `'yellow'` | `'red'`
	 *
	color(color: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/color ${color}`);
	}
	ban(username: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/ban ${username}`);
	}
	unban(username: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/unban ${username}`);
	}

	/**
	 * 
	 * @param time in seconds
	 *
	commercial(time: number) {
		return this.ws.send(`PRIVMSG ${this.channel} :/commercial ${time}`);
	}
	mods() {
		return this.ws.send(`PRIVMSG ${this.channel} :/mods`);
	}
	vips() {
		return this.ws.send(`PRIVMSG ${this.channel} :/vips`);
	}
	block(username: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/block ${username}`);
	}
	unblock(username: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/block ${username}`);
	}
	whisper(username: string, msg: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/w ${username} ${msg}`);
	}

	/**
	 * 
	 * @param time in seconds
	 *
	timeout(username: string, time: number) {
		return this.ws.send(
			`PRIVMSG ${this.channel} :/timeout ${username} ${time}`,
		);
	}

	/**
	 * 
	 * @param time in seconds
	 *
	slow(time: number) {
		this.ws.send(`PRIVMSG ${this.channel} :/time ${time}`);
	}
	slowOff() {
		this.ws.send(`PRIVMSG ${this.channel} :/slowoff`);
	}

	/**
	 *  Restrict your chat to all of some of your followers
	 * @param time an example would be `'30 minutes'` or `'30m'`
	 *
	followers(time?: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/followers ${time || ''}`);
	}
	followersOff() {
		return this.ws.send(`PRIVMSG ${this.channel} :/followersoff`);
	}
	subscribers() {
		return this.ws.send(`PRIVMSG ${this.channel} :/subscribers`);
	}
	subscribersOff() {
		return this.ws.send(`PRIVMSG ${this.channel} :/subscribersoff`);
	}
	clear() {
		return this.ws.send(`PRIVMSG ${this.channel} :/clear`);
	}
	uniqueChat() {
		return this.ws.send(`PRIVMSG ${this.channel} :/uniquechat`);
	}
	uniqueChatOff() {
		return this.ws.send(`PRIVMSG ${this.channel} :/uniquechatoff`);
	}
	raid(channel: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/raid ${channel}`);
	}
	unRaid() {
		return this.ws.send(`PRIVMSG ${this.channel} :/unraid`);
	}
	announce(msg: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/announce ${msg}`);
	}
	announceOrange(msg: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/announceorange ${msg}`);
	}
	announceGreen(msg: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/announcegreen ${msg}`);
	}
	announceBlue(msg: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/announceblue ${msg}`);
	}
	announcePurple(msg: string) {
		return this.ws.send(`PRIVMSG ${this.channel} :/announcepurple ${msg}`);
	}*/

}
