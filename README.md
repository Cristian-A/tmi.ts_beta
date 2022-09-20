
# Deno Twitch Message Interface

This repo is a fork of https://github.com/MarcDwyer/tmi.ts since he did not
add me as a collaborator, he's probably not going to update / maintain it
(and I needed fast changes to the api). Also his version is going to break
after Feb 2023, cause of the breaking changes in the twitch api itself.
I revrote everything to be typesafe and compatible with the new api.
This package is very similar to [tmi.js](https://github.com/tmijs/tmi.js)
but for Deno. This package is still very early in development.

## What it does

tmi.ts allows you to create bots and automate tasks in a users' Twitch Chat.

## What you need in order to use

1. OAuth token (https://twitchapps.com/tokengen/) make sure that your app's
redirect url matches the websites redirect url and the scopes are correct.

## Quick Example

``` javascript
import { TwitchChat, Channel } from "https://deno.land/x/tmi/mod.ts";
import { delay } from "https://deno.land/std@0.64.0/async/delay.ts";

const tc = new TwitchChat(oauth);

try {
	await tc.connect();
	tc.listener("whisper", whisper => {
		// Do something with whisper here
	});
	const channel = tc.join("xqcow", "9119090");
	channel.listener("privmsg", ircMsg => {
		// Do something with ircMsg here
	});
	await delay(60000);
	tc.disconnect();
} catch (e) { console.error(e); }
```

## TwitchChat

Allows you to connect to Twitch's chat, listen to private whispers and more

- `.connect()`

	Connects to Twitch's secure WebSocket endpoint
	`wss://irc-ws.chat.twitch.tv:443` and returns a promise that resolves when
	the user has correctly authenticated else it rejects.

- `.join(channel: string, broadcaster: string)`

	Joins the channel that it's given as a parameter.
	It requires a broadcaster id in order to join a channel.

- `.disconnect()`

	Parts all channels that have been joined, cleans up everything in
	the Event Loop and closes connection to Twitch's websocket.

- `.channels: Map<string, Channel>`

	A Map for all channels that are currently joined.
	If a channel is parted it will also delete itself from this Map.

- `.listener(event: TwitchChatEvents, (message: IRCMessage) => void)`

	Handle specific events outside the scope of a channel like, whispers,
	notices, and pings etc. Events are specific strings which TypeScript
	should help you out with.

### Channel

Listen to specific events of a channel or part it (leave the channel).

- `.send(message: string)`

	Send a message to the channels chat.

- `.part()`

	Leave the channel, deletes itself from channels Map in TwitchChat,
	and resolves all of its promises in event loop.

- `.channelName: string`

	Returns the username of the owner (channel name).

- `.commands`

	These are commands that can be used in a twitch chat.
	Note that certain commands require certain
	[scopes](https://dev.twitch.tv/docs/irc/guide#scopes-for-irc-commands)
	in your oauth token. Some scopes requires mod status for the bot,
	and twitch will not always tell you which one they are.
	https://help.twitch.tv/s/article/chat-commands?language=en_US

- `.listener(event: ChannelEvent, (message: IRCMessage) => void)`

	Handle events such as messages, joins, roomstate etc.
	> Tip: `'privmsg'` is the event which handles chat messsages.
