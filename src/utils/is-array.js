/**
 * @module utils
 *
 */
import isNone from './is-none';

export default function isArray(val) {
	return !isNone(val) && Array.isArray(val);
}
