/**
 * @module Managers
 *
 */
import Base from './base';
import { get } from '../utils/object';
//import { debug } from '../utils/debug';

if (typeof Object.assign != 'function') {
	// Must be writable: true, enumerable: false, configurable: true
	Object.defineProperty(Object, "assign", {
		value: function assign(target /*, varArgs */) { // .length of function is 2
			'use strict';
			if (target == null) { // TypeError if undefined or null
				throw new TypeError('Cannot convert undefined or null to object');
			}

			var to = Object(target);

			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index];

				if (nextSource != null) { // Skip over if undefined or null
					for (var nextKey in nextSource) {
						// Avoid bugs when hasOwnProperty is shadowed
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		},
		writable: true,
		configurable: true
	});
}

/**
 * @class Sync
 *
 */
export default class Sync extends Base {
	constructor(app, db, api) {
		super(...arguments);

		this.__className = 'manager:sync';
		this.app = app;
		this.dbInfo = app.getOption('db');
		this.db = db;
		this.api = api;

		this.app.on('run', this, () => this.fetch());
		this.getSyncTime(() => this.fetch());
	}

	getSyncTime(cb=function(){}) {
		this.db.getById('__sync', 'sync-data', data => {
			this.syncData = data;
			cb();
		});
	}

	fetch() {
		let syncTime = 0;
		if (this.syncData) {
			syncTime = this.syncData.timestamp;
		}

		this.save('__sync', { id: 'sync-data', timestamp: parseInt(Date.now()/1000, 10) }, () => {
				this.getSyncTime();
		});

		let tables = get(this, 'dbInfo.sync');
		if (tables) {
			let syncKey = get(this, 'dbInfo.syncKey') || 'syncstamp';
			Object.keys(tables).forEach((modelName) => {
				let tb = tables[modelName];
				let query = Object.assign({}, get(tb, 'query'));
				if (syncTime) {
					let format = '{ "%k": %v }';
					if (get(this, 'dbInfo.syncFormat')) {
						format = get(this, 'dbInfo.syncFormat');
					}

					let key = get(tb, 'key') || syncKey;
					let syncValue = JSON.parse(format.replace(/%k/, key).replace(/%v/, syncTime));
					Object.assign(query, syncValue);
				}

				this.api.get(modelName, query, data => {
					this.lastUpdate = parseInt((new Date()).valueOf() / 1000, 10);
					this.saveAll(modelName, data, () => {
						//if (get(this, `dbInfo.cleanup.${modelName}`)) {
						//	this.cleanup(modelName, get(this, `dbInfo.cleanup.${modelName}`), () => this.postUpdate(modelName, data));
						//} else {
							this.postUpdate(modelName, data);
						//}
					});
				});
			});
		}
	}

	postUpdate(modelName, data) {
		if (data && data.length) {
			this.app.post({ status: "sync", model: modelName });
		}
	}

	cleanup(type, key, value, cb=function(){}) {
		this.db.deleteWhere(type, key, value, () => {
			cb();
		});
	}

	saveAll(type, data, cb=function(){}) {
		let done = data.length;
		if (done === 0) {
			cb();
		} else {
			data.forEach(item => {
				this.save(type, item, () => {
					done = done - 1;
					if (done === 0) {
						cb();
					}
				});
			});
		}
	}

	save(type, data, cb=function(){}) {
		if (data) {
			this.db.put(type, data, (res) => {
				cb(res);
			});
		} else {
			cb();
		}
	}
}
