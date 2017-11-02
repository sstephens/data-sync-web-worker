/**
 * @module utils
 *
 */
import isNone from './is-none';
import isArray from './is-array';

export default function stringifyQuery(query) {
	let queryStr = '';
	Object.keys(query).forEach(key => {
		let value = query[key];
		if (value !== undefined) {
			if (isArray(value)) {
				value.forEach(val => queryStr += `&${key}[]=${val}`);
			} else if (!isNone(value) && typeof value === 'object') {
				let subStr = stringifyQuery(value);
				queryStr += '&' + subStr.replace(/^([^=]*)/, key + '[$1]').replace(/&([^=]*)/g, '&' + key + '[$1]');
			} else {
				if (value === null) {
					value = '';
				}
				queryStr += `&${key}=${value}`;
			}
		}
	});
	return queryStr.replace(/^&/, '');
}
