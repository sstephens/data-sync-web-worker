/**
 * @module utils
 *
 */
import isNone from './is-none';

function splitOnce(str, delim) {
	if (str.indexOf(delim) === -1) {
		return [str];
	}
	let p1 = str.substr(0, str.indexOf(delim));
	let p2 = str.substr(str.indexOf(delim) + 1);
	return [p1, p2];
}

export function get(target, key) {
	let [ k, m ] = splitOnce(key, '.');
	let sub = target[k];
	if (isNone(sub)) {
		return sub;
	}

	if (!isNone(m)) {
		if (!isNone(sub) && typeof sub !== 'object') {
			throw new Error("You cant get property on non object type: " + typeof target);
		}
		return get(sub, m);
	}

	return sub;
}

export function set(target, key, val) {
	if (isNone(target) || typeof target !== 'object') {
		throw new Error("You cant set property on non object type: " + typeof target);
	}

	let [ k, m ] = splitOnce(key, '.');
	if (!isNone(m)) {
		set(get(target, k), m, val);
	} else {
		target[key] = val;
	}
}
