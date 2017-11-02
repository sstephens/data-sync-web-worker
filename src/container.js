/**
 * @module Container
 *
 */
import { get, set } from './utils/object';

/**
 * @class Container
 *
 */
export default class Container {
	constructor() {
		this.__managers = {};
	}

	setManager(name, inst) {
		set(this.__managers, name, inst);
	}

	getManager(name) {
		return get(this.__managers, name);
	}
}
