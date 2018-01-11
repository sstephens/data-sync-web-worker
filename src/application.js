/**
 * @module Application
 *
 */
import DB from './managers/db';
import API from './managers/api';
import Sync from './managers/sync';
import { get, set } from './utils/object';
import Container from './container';
import assert from './utils/assert';
import { debug } from './utils/debug';

/***/
const SYNC_TIME = 60000;

/**
 * instance storage for reference
 * by application class
 *
 * @private
 * @property container
 * @type {Container}
 */
const container = new Container();

/**
 * @class application
 *
 */
export default class Application {
	constructor(worker, options={}) {
		this.options = {
			db: options.db || {},
			api: options.api || {},
			auth: options.auth || {},
			debug: options.debug === true ? true : false
		};

		this.worker = worker;

		this.__events = {};

		this.setupManagers();
	}

	startApp() {
		// sync now the start run loop
		//this.runloop();
		debug('worker created');

		setInterval(() => {
			this.runloop();
		}, SYNC_TIME);
	}

	runloop() {
		this.notify('run');
	}

	post(message) {
		this.worker.postMessage(message);
	}

	notify(name) {
		let listeners = get(this, `__events.${name}`) || {};
		Object.keys(listeners).forEach(key => {
			let evt = listeners[key];
			if (evt) {
				evt.cb.call(evt.target);
			}
		});
	}

	on(name, target, cb) {
		assert("name must be a string", typeof name === 'string');
		assert("target must be a class", typeof target === 'object');
		assert("cb must be a function", typeof cb === 'function');

		let listeners = get(this, `__events.${name}`) || {};
		set(listeners, target.toString(), { target, cb });
		set(this, `__events.${name}`, listeners);
	}

	off(name, target) {
		assert("name must be a string", typeof name === 'string');
		assert("target must be a class", typeof target === 'object');

		let listeners = get(this, `__events.${name}`) || {};
		delete listeners[target.toString()];
	}

	setupManagers() {
		const db = new DB(this);
		const api = new API(this);
		const sync = new Sync(this, db, api);

		container.setManager('db', db);
		container.setManager('api', api);
		container.setManager('sync', sync);
	}

	getContainer() {
		return container;
	}

	getOption(name) {
		return get(this, `options.${name}`);
	}
}
