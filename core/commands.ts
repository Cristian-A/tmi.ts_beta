
// https://dev.twitch.tv/docs/irc/chat-commands#migration-guide

const CHAT_ENDPOINT = 'https://api.twitch.tv/helix/chat/';
const MOD_ENDPOINT  = 'https://api.twitch.tv/helix/moderation/chat';

export type Announcement = "primary" | "blue" | "purple" | "green" | "orange";
export type ChatType = "emote" | "follower" | "subscriber" |
					   "unique" | "slow" | "delay";

export class TwitchCommands {

	private headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer `,
		'Client-Id': '',
	};

	/** @param broadcaster the broadcaster id */
	constructor (private broadcaster: string,
		private oauthid: string, private oauth: string) {
		this.headers['Authorization'] += this.oauth;
		this.headers['Client-Id'] = this.oauthid;
	}

	/**  send an announcement to the channel
	 *   `moderator:manage:announcements`
	 *   @param message the message to send
	 *   @param color the color of the announcement:
	 *                `"primary"`, `"blue"`, `"purple"`, `"green"`, `"orange"`
	 */
	async announce(message: string, color: Announcement = "primary") {
		const query = await fetch(CHAT_ENDPOINT + 'announcements' +
			`?broadcaster_id=${this.broadcaster}&moderator_id=${this.oauthid}`,
		{
			method: 'POST', headers: this.headers,
			body: JSON.stringify({ message, color })
		});
		switch (query.status) {
			case 204: return;
			case 400: throw new Error('400 bad request: invalid parameters!');
			case 401: throw new Error('401 unauthorized: bad scope / oauth!');
		}
		throw new Error('endpoint connection failed on `announce`!');
	}

	/**  delete chat messages
	 *   `moderator:manage:chat_messages`
	 *   @param id the id of the message to delete or `""`
	 *             to delete all messages in the channel
	 */
	async delete(id = "") {
		const query = await fetch(MOD_ENDPOINT +
			`?broadcaster_id=${this.broadcaster}&moderator_id=${this.oauthid}` +
			(id.length > 0 ? `&message_id=${id}` : ''), {
			method: 'DELETE', headers: this.headers
		});
		switch (query.status) {
			case 204: return;
			case 401: throw new Error('401 unauthorized: bad scope / oauth!');
			case 404: throw new Error('404 not found: invalid message id!');
		}
		throw new Error('endpoint connection failed on `announce`!');
	}

	// moderator:manage:chat_settings
	async chat(type: ChatType, data: boolean | string) {
		
	}

	// sendwisper user:manage:whispers
	// color user:manage:chat_color
	// ban moderator:manage:banned_users

}
