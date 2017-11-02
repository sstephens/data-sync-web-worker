/**
 * @module Manager
 *
 */
import { get, set } from './utils/object';

/**
 * @class Managers
 *
 */
export default class Managers {
	constructor() {
		this.__instances = {};
	}

	add(name, inst) {
		set(this.__instances, name, inst);
	}

	getInst(name) {
		return get(this.__instances, name);
	}
};
