
// https://dev.twitch.tv/docs/irc/chat-commands

const CHAT_ENDPOINT = 'https://api.twitch.tv/helix/chat/';

export type Announcement = "primary" | "blue" | "purple" | "green" | "orange";

export class TwitchCommands {

	/** @param broadcaster the broadcaster id */
	constructor (private broadcaster: string,
		private oauthid: string, private oauth: string) { }

	/**  send an announcement to the channel
	 *   `moderator:manage:announcements`
	 *   @param message the message to send
	 *   @param color the color of the announcement
	 */
	async announce(message: string, color: Announcement = "primary") {
		const query = await fetch(CHAT_ENDPOINT + 'announcements' +
			`?broadcaster_id=${this.broadcaster}&moderator_id=${this.oauthid}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.oauth}`,
				'Client-Id': this.oauthid,
			},
			body: JSON.stringify({ message, color })
		});
		if (query.status !== 204)
			throw new Error('Endpoint connection failed on `announce`!');
	}

}
