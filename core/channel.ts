
import { TwitchChat } from './chat.ts';
import { IRCMessage } from './data.ts';
import { TwitchCommands } from './commands.ts';
import { getAsyncIter } from './utilities.ts';
import {
	Deferred,
	deferred,
} from 'https://deno.land/std@0.79.0/async/deferred.ts';

export type DeferredPayload = {
	type: string;
	payload: any;
};

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
		privmsg: null,
		join: null,
		clearchat: null,
		userstate: null,
		usernotice: null,
		clearmsg: null,
		roomstate: null,
	};

	constructor(public broadcaster: string, public id: string,
		public key: string, private tc: TwitchChat) {
		this.commands = new TwitchCommands(this.broadcaster, this.id, this.key);
	}

	/** send a message to the channel */
	send(msg: string) {
		const { ws } = this.tc;
		if (!ws || !this.isConnected) {
			throw new Error('No ws connection has been made');
		}
		const query = `PRIVMSG ${this.key} :${msg}`;
		ws.send(query);
	}

	/** leave the channel */
	part() {
		const { ws } = this.tc;
		if (!ws) throw 'Websocket not available';
		ws.send(`PART ${this.key}`);
		this.tc.channels.delete(this.key);
		if (this.signal) this.signal.reject();
		this.isConnected = false;
	}

	get channelName() { return this.key.slice(1, this.key.length); }

	trigger(event: ChannelEvents, msg: IRCMessage) {
		const f = this.cbs[event];
		if (f) f(msg);
	}

	listener(event: ChannelEvents, func: (msg: IRCMessage) => void) {
		this.cbs[event] = func;
	}

	[Symbol.asyncIterator](): AsyncIterableIterator<IRCMessage> {
		this.signal = deferred();
		//@ts-ignore
		return getAsyncIter<IRCMessage>(this);
	}

}
