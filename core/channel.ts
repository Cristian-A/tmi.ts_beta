
import { TwitchChat } from './chat.ts';
import { IRCMessage } from './data.ts';
import { TwitchCommands } from './commands.ts';
import { Deferred } from 'https://deno.land/std@0.79.0/async/deferred.ts';

export type ChannelEvents =
	| 'privmsg'
	| 'join'
	| 'clearchat'
	| 'userstate'
	| 'usernotice'
	| 'clearmsg'
	| 'roomstate';

export type ChannelCallback = (msg: IRCMessage) => void;

export class Channel {

	commands: TwitchCommands;
	signal: null | Deferred<IRCMessage> = null;
	private isConnected = true;

	private cbs: Record<ChannelEvents, ChannelCallback | null> = {
		privmsg: null, join: null, clearchat: null, userstate: null,
		usernotice: null, clearmsg: null, roomstate: null,
	};

	/** @param broadcaster the broadcaster id */
	constructor (private channel: string, private broadcaster: string,
				 private oauthid: string, private oauth: string,
				 private tc: TwitchChat) {
		this.commands = new TwitchCommands(
			this.broadcaster, this.oauthid, this.oauth
		);
	}

	send(message: string) {
		const { ws } = this.tc;
		if (!ws || !this.isConnected)
			throw new Error('No ws connection has been made');
		const query = `PRIVMSG ${this.channel} :${message}`;
		ws.send(query);
	}

	part() {
		const { ws } = this.tc;
		if (!ws) throw 'WebSocket not available';
		ws.send(`PART ${this.channel}`);
		this.tc.channels.delete(this.channel);
		if (this.signal) this.signal.reject();
		this.isConnected = false;
	}

	get channelName() { return this.channel.slice(1, this.channel.length); }

	trigger(event: ChannelEvents, message: IRCMessage) {
		const f = this.cbs[event];
		if (f) f(message);
	}

	listener(event: ChannelEvents, func: ChannelCallback) {
		this.cbs[event] = func;
	}

}
