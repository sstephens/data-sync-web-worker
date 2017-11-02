/**
 * @module Utils
 *
 */
import isNone from './is-none';

export default function isEmpty(value) {
	return !(!isNone(value) && value.length > 0);
}
