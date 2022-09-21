
import { Badges, Tags } from './data.ts';

export function getChannelName(channel: string) {
	channel = channel.toLowerCase();
	if (channel[0] !== '#') channel = '#' + channel;
	return channel;
}

export async function getOAUTHInfo(oauth: string) {
	const data = await fetch('https://id.twitch.tv/oauth2/validate', {
		method: 'GET',
		headers: { 'Authorization': `OAuth ${oauth}` }
	});
	if (data.status !== 200) throw new Error('Invalid OAUTH token!');
	const json = await data.json();
	return { id: json.client_id, username: json.login, userid: json.user_id };
}

export function removeBreaks(s: string) {
	return s.replace(/(\r\n|\n|\r)/gm, '');
}

export function findChannelName(str: string) {
	let chan = '';
	for (const char of str) {
		if (char === ':') break;
		chan += char;
	}
	return chan;
}

export const createBadges = (): Badges => ({
	subscriber: false,
	glitchcon: false,
	turbo: false,
	moderator: false,
});

export const createTags = (): Tags => ({
	'display-name': '',
	'room-id': '',
	'id': '',
	'color': '',
	'emotes': '',
	'mod': false,
	'vip': false,
	'art': false,
	'turbo': false,
	'subscriber': false,
	'flags': '',
	'tmi-sent-ts': '',
	'user-id': '',
	'user-type': '',
});

export function setBadges(badges: string, badgeRec: Badges) {
	const reg = /^[a-z]+$/i;
	let badge = '';
	for (const char of badges) {
		const test = reg.test(char);
		if (test) badge += char;
		else {
			if (badge.length) badgeRec[badge as keyof Badges] = true;
			badge = '';
		}
	}
}
