
import { IRCMessage, Commands, KeyOfCommands, Tags } from './data.ts';
import { createBadges, setBadges, removeBreaks } from './utilities.ts';

/*
	Copyright (c) 2013-2015, Fionn Kelleher All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	Redistributions of source code must retain the above copyright notice,
	this list of conditions and the following disclaimer.

	Redistributions in binary form must reproduce the above copyright notice,
	this list of conditions and the following disclaimer in the documentation
	and / or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

export function parser(data: string, username: string) {
	const message: IRCMessage = {
		raw: data,
		badges: createBadges(),
		tags: { } as Tags,
		prefix: '',
		command: Commands.NONE,
		params: [],
		channel: '',
		directMsg: false,
		message: '',
		username: '',
	};
	// position and nextspace are used by the parser as a reference.
	let position = 0;
	let nextspace = 0;
	// the first thing we check for is IRCv3.2 message tags.
	// http://ircv3.atheme.org/specification/message-tags-3.2
	if (data.charCodeAt(0) === 64) {
		nextspace = data.indexOf(' ');
		// malformed IRC message..
		if (nextspace === - 1) return null;
		// tags are split by a semi colon.
		const rawTags = data.slice(1, nextspace).split(';');
		for (let i = 0; i < rawTags.length; i++) {
			// tags delimited by an equals sign are key=value tags.
			// if there's no equals, we assign the tag a value of true.
			const tag = rawTags[i];
			const [k, v] = tag.split('=');
			if (k === 'badges') setBadges(v, message.badges);
			switch (k) {
				case 'display-name': message.tags['display-name'] = v; break;
				case 'room-id': message.tags['room-id'] = v; break;
				case 'id': message.tags['id'] = v; break;
				case 'color': message.tags['color'] = v; break;
				case 'emotes': message.tags['emotes'] = v; break;
				case 'mod': message.tags['mod'] = v == '1'; break;
				case 'vip': message.tags['vip'] = v == '1'; break;
				case 'art': message.tags['art'] = v == '1'; break;
				case 'turbo': message.tags['turbo'] = v == '1'; break;
				case 'subscriber': message.tags['subscriber'] = v == '1'; break;
				case 'flags': message.tags['flags'] = v; break;
				case 'tmi-sent-ts': message.tags['tmi-sent-ts'] = v; break;
				case 'user-id': message.tags['user-id'] = v; break;
				case 'user-type': message.tags['user-type'] = v; break;
			}
		}
		position = nextspace + 1;
	}
	// skip any trailing whitespace..
	while (data.charCodeAt(position) === 32) position++;
	// extract message's prefix if present. prefixes are prepended with a colon.
	if (data.charCodeAt(position) === 58) {
		nextspace = data.indexOf(' ', position);
		// if there's nothing after the prefix, deem message to be malformed.
		if (nextspace === -1) return null;
		message.prefix = data.slice(position + 1, nextspace);
		position = nextspace + 1;
		// skip any trailing whitespace..
		while (data.charCodeAt(position) === 32) position++;
	}
	nextspace = data.indexOf(' ', position);
	// if there's no more whitespace left, extract everything from the
	// current position to the end of the string as the command..
	if (nextspace === - 1) {
		if (data.length > position) {
			message.command = data.slice(position) as KeyOfCommands;
			return message;
		}
		return null;
	}
	// else, the command is the current position up to the next space.
	// after that, we expect some parameters.
	message.command = data.slice(position, nextspace) as KeyOfCommands;
	position = nextspace + 1;
	// skip any trailing whitespace..
	while (data.charCodeAt(position) === 32) position++;
	while (position < data.length) {
		nextspace = data.indexOf(' ', position);
		// if the character is a colon, we've got a trailing parameter.
		// at this point, there are no extra params, so we push everything
		// from after the colon to the end of the string, to the params array
		// and break out of the loop.
		if (data.charCodeAt(position) === 58) {
			message.params.push(data.slice(position + 1));
			break;
		}
		// if we still have some whitespace...
		if (nextspace !== -1) {
			// push whatever's between the current position and the next
			// space to the params array.
			message.params.push(data.slice(position, nextspace));
			position = nextspace + 1;
			// Skip any trailing whitespace and continue looping.
			while (data.charCodeAt(position) === 32) position++;
			continue;
		}
		// if we don't have any more whitespace and the param isn't trailing,
		// push everything remaining to the params array.
		if (nextspace === -1) {
			message.params.push(data.slice(position));
			break;
		}
	}
	if (message.params.length && message.params[0][0] === '#') {
		const copy = { ...message };
		let channel = '';
		for (const char of message.params[0]) {
			if (char === '@') break;
			channel += char;
		}
		message.channel = removeBreaks(channel);
		message.params.shift();
		message.message = removeBreaks(copy.params.join(' '));
	}
	for (const c of message.prefix) {
		if (c === '!') break;
		message.username += c;
	}
	const lowerMsg = message.message.toLowerCase();
	const hasName = lowerMsg.includes(username);
	if (hasName) message.directMsg = true;
	return message;
}
