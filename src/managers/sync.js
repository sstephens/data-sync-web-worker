/**
 * @module Managers
 *
 */
import Base from './base';
import { debug } from '../utils/debug';

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

		this.organization = this.app.getOption('auth.organizationId');
		this.member = this.app.getOption('auth.memberId');

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
			debug('lastSync', this.syncData.timestamp);
			syncTime = this.syncData.timestamp;
		}

		this.save('__sync', { id: 'sync-data', timestamp: parseInt(Date.now()/1000, 10) }, () => {
				this.getSyncTime();
		});

		let tables = this.dbInfo.tables;
		if (tables && tables.length) {
			let syncKey = this.dbInfo.syncKey || 'syncstamp';
			tables.forEach(tb => {
				if (tb.sync) {
					let query = tb.sync.query || {};

					if (syncTime) {
						// TODO: generalize this for apis
						// that do not support _gte query
						let key = tb.sync.key || syncKey;
						query._gte = { [key]: syncTime };
					}

					this.api.get(tb.name, query, data => {
						this.lastUpdate = parseInt((new Date()).valueOf() / 1000, 10);
						this.saveAll(tb.name, data, () => {
							if (tb.cleanup) {
								this.cleanup(tb.name, tb.cleanup);
							}
						});
					});
				}
			});
		}
	}

	cleanup(type, key, value, cb=function(){}) {
		this.db.deleteWhere(type, key, value, () => {
			cb();
		});
	}

	saveAll(type, data, cb=function(){}) {
		debug('save all', type, data);
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
