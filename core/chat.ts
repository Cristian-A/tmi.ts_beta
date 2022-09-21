
import { Deferred } from 'https://deno.land/std@0.79.0/async/deferred.ts';
import { Channel, ChannelEvents } from './channel.ts';
import { SecureIRCURL, IRCMessage } from './data.ts';
import { getChannelName, getOAUTHInfo } from './utilities.ts';
import { parser } from './parser.ts';

type TwitchChatEvents = '001' | 'whisper' | 'ping' | 'notice';
type TwitchChatCallback = (message: IRCMessage) => void;

const CAP = 'CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership';

export class TwitchChat {

	ws: WebSocket | null = null;

	channels = new Map<string, Channel>();
	signal: null | Deferred<IRCMessage> = null;

	private username = ''; private userid = '';
	private oauthid = ''; private broadcaster = '';

	private cbs: Record<TwitchChatEvents, TwitchChatCallback | null> = {
		'001': null, 'whisper': null, 'ping': null, 'notice': null,
	};

	constructor (private oauth: string) { }

	connect() { return new Promise<string>((respond, reject) => {
		getOAUTHInfo(this.oauth).then(({ id, username, userid }) => {
			this.username = username.toLowerCase();
			this.oauthid = id; this.userid = userid;
			if (this.ws && this.ws.readyState !== this.ws.CLOSED)
				reject(new Error('Websocket connection already established!'));
			const ws = new WebSocket(SecureIRCURL);
			ws.onopen = () => {
				ws.send(`PASS oauth:${this.oauth}`);
				ws.send(`NICK ${this.username}`);
			};
			ws.onmessage = message => {
				const tmsg = parser(message.data, this.username);
				if (!tmsg) return;
				const lCmd = tmsg.command.toLowerCase();
				if (lCmd in this.cbs) {
					switch (lCmd) {
						case '001':
							ws.send(CAP);
							this.ws = ws;
							respond(message.data);
						break;
						case 'ping':
							ws.send('PONG :tmi.twitch.tv');
						break;
						case 'notice':
							if (tmsg.raw.includes('failed')) {
								this.ws = null;
								ws.close();
								reject(new Error(tmsg.raw));
							}
						break;
					}
					if (this.signal) this.signal.resolve(tmsg);
					const isGlobalCmd = this.cbs[lCmd as TwitchChatEvents];
					if (isGlobalCmd) isGlobalCmd(tmsg);
					return;
				}
				const channel = this.channels.get(tmsg.channel);
				if (channel) {
					if (channel.signal) channel.signal.resolve(tmsg);
					channel.trigger(
						tmsg.command.toLowerCase() as ChannelEvents, tmsg
					);
				}
			};
			this.ws = ws;
		});
	}); }

	/** @param broadcaster the broadcaster id */
	join(channel: string, broadcaster: string): Channel {
		channel = getChannelName(channel);
		if (!this.ws) throw new Error('Connect before joining');
		const c = new Channel(
			channel, broadcaster, this.userid, this.oauthid, this.oauth, this
		);
		this.channels.set(channel, c);
		this.ws.send(`JOIN ${channel}`);
		return c;
	}

	disconnect(): string | void {
		if (!this.ws)
			throw new Error('Websocket connected hasnt been established yet');
		for (const channel of this.channels.values()) channel.part();
		if (this.signal) this.signal.reject();
		this.ws.close();
		this.ws = null;
	}

	listener(event: TwitchChatEvents, func: TwitchChatCallback) {
		this.cbs[event] = func;
	}

}
