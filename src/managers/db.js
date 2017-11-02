/**
 * @module Managers
 *
 */
import { debug } from '../utils/debug';
import Base from './base';

/***/

/**
 * @class DB
 *
 */
export default class DB extends Base {
	constructor(app) {
		super(...arguments);
		this.__className = 'manager:db';

		this.indexedDB = app.worker.indexedDB || app.worker.mozIndexedDB || app.worker.webkitIndexedDB || app.worker.msIndexedDB || app.worker.shimIndexedDB;

		this.app = app;
		this.dbInfo = app.getOption('db');
	}

	put(type, data, cb=function(){}) {
		dbOpen(this.indexedDB, this.dbInfo, db => {
			let tx = db.transaction(type, 'readwrite');
			tx.oncomplete = (() => db.close());
			let store = tx.objectStore(type);
			let res = store.put(data);
			res.onsuccess = () => {
				cb(res.result);
			};
		});
	}

	getById(type, id, cb=function(){}) {
		dbOpen(this.indexedDB, this.dbInfo, db => {
			let tx = db.transaction(type, 'readwrite');
			tx.oncomplete = (() => db.close());
			let store = tx.objectStore(type);
			let res = store.get(id);
			res.onsuccess = () => {
				cb(res.result);
			};
		});
	}

	deleteWhere(type, query, cb=function() {}) {
		dbOpen(this.indexedDB, this.dbInfo, db => {
			let tx = db.transaction(type, 'readwrite');
			tx.oncomplete = (() => db.close());
			let store = tx.objectStore(type);
			store.openCursor().onsuccess = (evt) => {
				let cursor = evt.target.result;
				if (cursor) {
					if (validate(cursor.value, query)) {
						cursor.delete();
					}
					cursor.continue();
				} else {
					cb();
				}
			};
		});
	}
}

function validate(data, query) {
	let isValid = true;
	Object.keys(query).forEach(key => {
		let val = query[key];
		let cVal = data[key];
		if (cVal === undefined) {
			isValid = false;
		}

		if (val === '!null' && cVal === null) {
			isValid = false;
		}

		if (val !== cVal) {
			isValid = false;
		}
	});
	return isValid;
}

function dbOpen(indexedDB, dbInfo, cb) {
	const request = indexedDB.open(dbInfo.name, dbInfo.version);
	request.onupgradeneeded = () => {
		// call dbscheme method
		const db = request.result;

		// create sync table def
		if (db.objectStoreNames.contains('__sync')) {
			db.deleteObjectStore('__sync');
		}
		db.createObjectStore('__sync', { keyPath: 'id' });

		// create table defs
		if (dbInfo.tables) {
			dbInfo.tables.forEach(tb => {
				if (db.objectStoreNames.contains(tb.name)) {
					db.deleteObjectStore(tb.name);
				}
				let modelObject = db.createObjectStore(tb.name, { keyPath: tb.keyPath });
				if (tb.indexes && tb.indexes.length) {
					tb.indexes.forEach(idx => {
						if (idx.name) {
							modelObject.createIndex(idx.name, idx.keyPath || '', idx.objectParams || { unique: false });
						}
					});
				}
			});
		}
	};

	request.onsuccess = () => {
		request.result.onerror = (event) => {
			debug('db open error', event, request);
		};

		//debugger;
		cb(request.result);
	};
}
