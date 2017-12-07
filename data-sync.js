(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module Application
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _db = require('./managers/db');

var _db2 = _interopRequireDefault(_db);

var _api = require('./managers/api');

var _api2 = _interopRequireDefault(_api);

var _sync = require('./managers/sync');

var _sync2 = _interopRequireDefault(_sync);

var _object = require('./utils/object');

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _assert = require('./utils/assert');

var _assert2 = _interopRequireDefault(_assert);

var _debug = require('./utils/debug');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * instance storage for reference
 * by application class
 *
 * @private
 * @property container
 * @type {Container}
 */
var container = new _container2.default();

/**
 * @class application
 *
 */

var Application = function () {
	function Application(worker) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		_classCallCheck(this, Application);

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

	_createClass(Application, [{
		key: 'startApp',
		value: function startApp() {
			var _this = this;

			// sync now the start run loop
			//this.runloop();
			(0, _debug.debug)('worker created');

			setInterval(function () {
				_this.runloop();
			}, 60000);
		}
	}, {
		key: 'runloop',
		value: function runloop() {
			this.notify('run');
		}
	}, {
		key: 'post',
		value: function post(message) {
			postMessage(message);
		}
	}, {
		key: 'notify',
		value: function notify(name) {
			var listeners = (0, _object.get)(this, '__events.' + name) || {};
			Object.keys(listeners).forEach(function (key) {
				var evt = listeners[key];
				if (evt) {
					evt.cb.call(evt.target);
				}
			});
		}
	}, {
		key: 'on',
		value: function on(name, target, cb) {
			(0, _assert2.default)("name must be a string", typeof name === 'string');
			(0, _assert2.default)("target must be a class", (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object');
			(0, _assert2.default)("cb must be a function", typeof cb === 'function');

			var listeners = (0, _object.get)(this, '__events.' + name) || {};
			(0, _object.set)(listeners, target.toString(), { target: target, cb: cb });
			(0, _object.set)(this, '__events.' + name, listeners);
		}
	}, {
		key: 'off',
		value: function off(name, target) {
			(0, _assert2.default)("name must be a string", typeof name === 'string');
			(0, _assert2.default)("target must be a class", (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object');

			var listeners = (0, _object.get)(this, '__events.' + name) || {};
			delete listeners[target.toString()];
		}
	}, {
		key: 'setupManagers',
		value: function setupManagers() {
			var db = new _db2.default(this);
			var api = new _api2.default(this);
			var sync = new _sync2.default(this, db, api);

			container.setManager('db', db);
			container.setManager('api', api);
			container.setManager('sync', sync);
		}
	}, {
		key: 'getContainer',
		value: function getContainer() {
			return container;
		}
	}, {
		key: 'getOption',
		value: function getOption(name) {
			return (0, _object.get)(this, 'options.' + name);
		}
	}]);

	return Application;
}();

exports.default = Application;

},{"./container":2,"./managers/api":4,"./managers/db":6,"./managers/sync":7,"./utils/assert":8,"./utils/debug":9,"./utils/object":13}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module Container
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _object = require('./utils/object');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class Container
 *
 */
var Container = function () {
	function Container() {
		_classCallCheck(this, Container);

		this.__managers = {};
	}

	_createClass(Container, [{
		key: 'setManager',
		value: function setManager(name, inst) {
			(0, _object.set)(this.__managers, name, inst);
		}
	}, {
		key: 'getManager',
		value: function getManager(name) {
			return (0, _object.get)(this.__managers, name);
		}
	}]);

	return Container;
}();

exports.default = Container;

},{"./utils/object":13}],3:[function(require,module,exports){
(function (global){
'use strict';

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
	global.onmessage = function (message) {
		var worker = this;
		global.__APP = new _application2.default(worker, message.data[0] || {});
		global.__APP.startApp();
	};
})(); /**
       * @busybusy/data-sync-web-worker
       *
       * @copyright all rights reserved, busy inc. 2017
       */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./application":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _stringifyQuery = require('../utils/stringify-query');

var _stringifyQuery2 = _interopRequireDefault(_stringifyQuery);

var _isNone = require('../utils/is-none');

var _isNone2 = _interopRequireDefault(_isNone);

var _isEmpty = require('../utils/is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _debug = require('../utils/debug');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @module Managers
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * @class API
 *
 */
var API = function (_Base) {
	_inherits(API, _Base);

	function API(app) {
		_classCallCheck(this, API);

		var _this = _possibleConstructorReturn(this, (API.__proto__ || Object.getPrototypeOf(API)).apply(this, arguments));

		_this.__className = 'manager:api';
		_this.app = app;

		var version = _this.app.getOption('api.version');
		if ((0, _isNone2.default)(version)) {
			version = '';
		}

		_this.host = _this.app.getOption('api.host');
		_this.version = '' + version; // convert Number versions to strings
		_this.headers = _this.app.getOption('api.headers');
		_this.debug = _this.app.getOption('debug');
		return _this;
	}

	/**
  * TODO:
  * add debugKey to options for api calls
  *
  */


	_createClass(API, [{
		key: 'buildUrl',
		value: function buildUrl(url) {
			url = url.replace(/^\//, '');
			url = this.host + '/' + url;
			if (!(0, _isEmpty2.default)(this.version)) {
				url += '?_version=' + this.version;
				if (this.debug) {
					url += '&_debug=true';
				}
			} else {
				if (this.debug) {
					url += '?_debug=true';
				}
			}
			return url;
		}
	}, {
		key: 'queryString',
		value: function queryString(query) {
			return (0, _stringifyQuery2.default)(query);
		}
	}, {
		key: 'get',
		value: function get(url, data) {
			var success = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
			var error = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};

			this.request(url, 'GET', data, function (results) {
				if (results.success) {
					success(results.data);
				} else {
					error(results.error);
				}
			}, error);
		}
	}, {
		key: 'request',
		value: function request(url) {
			var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GET';
			var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			var _this2 = this;

			var success = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};
			var error = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : function () {};

			var xhr = new XMLHttpRequest();
			url = this.buildUrl(url);
			url += '&' + this.queryString(data);
			url = url.replace(/&$/, '');

			(0, _debug.debug)('request', { url: url, type: type, data: data });

			xhr.addEventListener('load', function () {
				if (xhr.status === 200) {
					success(JSON.parse(xhr.responseText));
				} else {
					(0, _debug.debug)('request.error', xhr);
					error(xhr);
				}
			});

			xhr.addEventListener('error', function () {
				(0, _debug.debug)('request.error', xhr);
				error(xhr);
			});

			xhr.open(type, url);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
			Object.keys(this.headers).forEach(function (key) {
				xhr.setRequestHeader(key, _this2.headers[key]);
			});

			xhr.send();
		}
	}]);

	return API;
}(_base2.default);

exports.default = API;

},{"../utils/debug":9,"../utils/is-empty":11,"../utils/is-none":12,"../utils/stringify-query":14,"./base":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Base = function () {
	function Base() {
		_classCallCheck(this, Base);
	}

	_createClass(Base, [{
		key: 'toString',
		value: function toString() {
			var name = this.constructor.toString().replace(/^function ([^(]*)[\s\S]*/, '$1');
			name = name.replace(/([A-Z])/g, '_$1');
			name = name.replace(/^_/, '');
			name = name.toLowerCase();
			return 'manager:' + name;
		}
	}]);

	return Base;
}();

exports.default = Base;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('../utils/debug');

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @module Managers
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/***/

/**
 * @class DB
 *
 */
var DB = function (_Base) {
	_inherits(DB, _Base);

	function DB(app) {
		_classCallCheck(this, DB);

		var _this = _possibleConstructorReturn(this, (DB.__proto__ || Object.getPrototypeOf(DB)).apply(this, arguments));

		_this.__className = 'manager:db';

		_this.indexedDB = app.worker.indexedDB || app.worker.mozIndexedDB || app.worker.webkitIndexedDB || app.worker.msIndexedDB || app.worker.shimIndexedDB;

		_this.app = app;
		_this.dbInfo = app.getOption('db');
		return _this;
	}

	_createClass(DB, [{
		key: 'put',
		value: function put(type, data) {
			var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

			dbOpen(this.indexedDB, this.dbInfo, function (db) {
				var tx = db.transaction(type, 'readwrite');
				tx.oncomplete = function () {
					return db.close();
				};
				var store = tx.objectStore(type);
				var res = store.put(data);
				res.onsuccess = function () {
					cb(res.result);
				};
			});
		}
	}, {
		key: 'getById',
		value: function getById(type, id) {
			var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

			dbOpen(this.indexedDB, this.dbInfo, function (db) {
				var tx = db.transaction(type, 'readwrite');
				tx.oncomplete = function () {
					return db.close();
				};
				var store = tx.objectStore(type);
				var res = store.get(id);
				res.onsuccess = function () {
					cb(res.result);
				};
			});
		}
	}, {
		key: 'deleteWhere',
		value: function deleteWhere(type, query) {
			var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

			dbOpen(this.indexedDB, this.dbInfo, function (db) {
				var tx = db.transaction(type, 'readwrite');
				tx.oncomplete = function () {
					return db.close();
				};
				var store = tx.objectStore(type);
				store.openCursor().onsuccess = function (evt) {
					var cursor = evt.target.result;
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
	}]);

	return DB;
}(_base2.default);

exports.default = DB;


function validate(data, query) {
	var isValid = true;
	Object.keys(query).forEach(function (key) {
		var val = query[key];
		var cVal = data[key];
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
	var request = indexedDB.open(dbInfo.name, dbInfo.version);
	request.onupgradeneeded = function () {
		// call dbscheme method
		var db = request.result;

		// create sync table def
		if (db.objectStoreNames.contains('__sync')) {
			db.deleteObjectStore('__sync');
		}
		db.createObjectStore('__sync', { keyPath: 'id' });

		// create table defs
		if (dbInfo.tables) {
			dbInfo.tables.forEach(function (tb) {
				if (db.objectStoreNames.contains(tb.name)) {
					db.deleteObjectStore(tb.name);
				}
				var modelObject = db.createObjectStore(tb.name, { keyPath: tb.keyPath });
				if (tb.indexes && tb.indexes.length) {
					tb.indexes.forEach(function (idx) {
						if (idx.name) {
							modelObject.createIndex(idx.name, idx.keyPath || '', idx.objectParams || { unique: false });
						}
					});
				}
			});
		}
	};

	request.onsuccess = function () {
		request.result.onerror = function (event) {
			(0, _debug.debug)('db open error', event, request);
		};

		//debugger;
		cb(request.result);
	};
}

},{"../utils/debug":9,"./base":5}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _object = require('../utils/object');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @module Managers
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


//import { debug } from '../utils/debug';

if (typeof Object.assign != 'function') {
	// Must be writable: true, enumerable: false, configurable: true
	Object.defineProperty(Object, "assign", {
		value: function assign(target /*, varArgs */) {
			// .length of function is 2
			'use strict';

			if (target == null) {
				// TypeError if undefined or null
				throw new TypeError('Cannot convert undefined or null to object');
			}

			var to = Object(target);

			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index];

				if (nextSource != null) {
					// Skip over if undefined or null
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

var Sync = function (_Base) {
	_inherits(Sync, _Base);

	function Sync(app, db, api) {
		_classCallCheck(this, Sync);

		var _this = _possibleConstructorReturn(this, (Sync.__proto__ || Object.getPrototypeOf(Sync)).apply(this, arguments));

		_this.__className = 'manager:sync';
		_this.app = app;
		_this.dbInfo = app.getOption('db');
		_this.db = db;
		_this.api = api;

		_this.app.on('run', _this, function () {
			return _this.fetch();
		});
		_this.getSyncTime(function () {
			return _this.fetch();
		});
		return _this;
	}

	_createClass(Sync, [{
		key: 'getSyncTime',
		value: function getSyncTime() {
			var _this2 = this;

			var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

			this.db.getById('__sync', 'sync-data', function (data) {
				_this2.syncData = data;
				cb();
			});
		}
	}, {
		key: 'fetch',
		value: function fetch() {
			var _this3 = this;

			var syncTime = 0;
			if (this.syncData) {
				syncTime = this.syncData.timestamp;
			}

			this.save('__sync', { id: 'sync-data', timestamp: parseInt(Date.now() / 1000, 10) }, function () {
				_this3.getSyncTime();
			});

			var tables = this.dbInfo.tables;
			if (tables && tables.length) {
				var syncKey = (0, _object.get)(this, 'dbInfo.syncKey') || 'syncstamp';
				tables.forEach(function (tb) {
					if (tb.sync) {
						var modelName = (0, _object.get)(tb, 'name');
						var query = Object.assign({}, (0, _object.get)(tb, 'sync.query'));
						if (syncTime) {
							var format = '{ "%k": %v }';
							if ((0, _object.get)(_this3, 'dbInfo.syncFormat')) {
								format = (0, _object.get)(_this3, 'dbInfo.syncFormat');
							}

							var key = (0, _object.get)(tb, 'sync.key') || syncKey;
							var syncValue = JSON.parse(format.replace(/%k/, key).replace(/%v/, syncTime));
							Object.assign(query, syncValue);
						}

						_this3.api.get(modelName, query, function (data) {
							_this3.lastUpdate = parseInt(new Date().valueOf() / 1000, 10);
							_this3.saveAll(modelName, data, function () {
								if ((0, _object.get)(tb, 'cleanup')) {
									_this3.cleanup(modelName, (0, _object.get)(tb, 'cleanup'), function () {
										return _this3.postUpdate(modelName, data);
									});
								} else {
									_this3.postUpdate(modelName, data);
								}
							});
						});
					}
				});
			}
		}
	}, {
		key: 'postUpdate',
		value: function postUpdate(modelName, data) {
			if (data && data.length) {
				this.app.post({ status: "sync", model: modelName });
			}
		}
	}, {
		key: 'cleanup',
		value: function cleanup(type, key, value) {
			var cb = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function () {};

			this.db.deleteWhere(type, key, value, function () {
				cb();
			});
		}
	}, {
		key: 'saveAll',
		value: function saveAll(type, data) {
			var _this4 = this;

			var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

			var done = data.length;
			if (done === 0) {
				cb();
			} else {
				data.forEach(function (item) {
					_this4.save(type, item, function () {
						done = done - 1;
						if (done === 0) {
							cb();
						}
					});
				});
			}
		}
	}, {
		key: 'save',
		value: function save(type, data) {
			var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};

			if (data) {
				this.db.put(type, data, function (res) {
					cb(res);
				});
			} else {
				cb();
			}
		}
	}]);

	return Sync;
}(_base2.default);

exports.default = Sync;

},{"../utils/object":13,"./base":5}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = assert;
/**
 * @module Utils
 *
 */
function assert(message, test) {
  if (!test) {
    throw new Error(message);
  }
}

},{}],9:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isDebug = isDebug;
exports.runInDebug = runInDebug;
exports.debug = debug;
/**
 * @module Utils
 *
 */
function log() {
	if (global.console) {
		var _global$console;

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		args.unshift('color: cornflowerblue;');
		args.unshift("%cWEB WORKER DEBUG: ");
		(_global$console = global.console).log.apply(_global$console, args);
	}
}

function isDebug() {
	if (global.__APP) {
		return global.__APP.getOption('debug');
	}
	return false;
}

function runInDebug(cb) {
	if (isDebug()) {
		cb.call(null);
	}
}

function debug() {
	if (isDebug()) {
		log.apply(undefined, arguments);
	}
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isArray;

var _isNone = require('./is-none');

var _isNone2 = _interopRequireDefault(_isNone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isArray(val) {
  return !(0, _isNone2.default)(val) && Array.isArray(val);
} /**
   * @module utils
   *
   */

},{"./is-none":12}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isEmpty;

var _isNone = require('./is-none');

var _isNone2 = _interopRequireDefault(_isNone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isEmpty(value) {
  return !(!(0, _isNone2.default)(value) && value.length > 0);
} /**
   * @module Utils
   *
   */

},{"./is-none":12}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isNone;
/**
 * @module utils
 *
 */
function isNone(val) {
  return val === null || val === undefined;
}

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @module utils
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */


exports.get = get;
exports.set = set;

var _isNone = require('./is-none');

var _isNone2 = _interopRequireDefault(_isNone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function splitOnce(str, delim) {
	if (str.indexOf(delim) === -1) {
		return [str];
	}
	var p1 = str.substr(0, str.indexOf(delim));
	var p2 = str.substr(str.indexOf(delim) + 1);
	return [p1, p2];
}

function get(target, key) {
	var _splitOnce = splitOnce(key, '.'),
	    _splitOnce2 = _slicedToArray(_splitOnce, 2),
	    k = _splitOnce2[0],
	    m = _splitOnce2[1];

	var sub = target[k];
	if ((0, _isNone2.default)(sub)) {
		return sub;
	}

	if (!(0, _isNone2.default)(m)) {
		if (!(0, _isNone2.default)(sub) && (typeof sub === 'undefined' ? 'undefined' : _typeof(sub)) !== 'object') {
			throw new Error("You cant get property on non object type: " + (typeof target === 'undefined' ? 'undefined' : _typeof(target)));
		}
		return get(sub, m);
	}

	return sub;
}

function set(target, key, val) {
	if ((0, _isNone2.default)(target) || (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') {
		throw new Error("You cant set property on non object type: " + (typeof target === 'undefined' ? 'undefined' : _typeof(target)));
	}

	var _splitOnce3 = splitOnce(key, '.'),
	    _splitOnce4 = _slicedToArray(_splitOnce3, 2),
	    k = _splitOnce4[0],
	    m = _splitOnce4[1];

	if (!(0, _isNone2.default)(m)) {
		set(get(target, k), m, val);
	} else {
		target[key] = val;
	}
}

},{"./is-none":12}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               * @module utils
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               */


exports.default = stringifyQuery;

var _isNone = require('./is-none');

var _isNone2 = _interopRequireDefault(_isNone);

var _isArray = require('./is-array');

var _isArray2 = _interopRequireDefault(_isArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function stringifyQuery(query) {
	var queryStr = '';
	Object.keys(query).forEach(function (key) {
		var value = query[key];
		if (value !== undefined) {
			if ((0, _isArray2.default)(value)) {
				value.forEach(function (val) {
					return queryStr += '&' + key + '[]=' + val;
				});
			} else if (!(0, _isNone2.default)(value) && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
				var subStr = stringifyQuery(value);
				queryStr += '&' + subStr.replace(/^([^=]*)/, key + '[$1]').replace(/&([^=]*)/g, '&' + key + '[$1]');
			} else {
				if (value === null) {
					value = '';
				}
				queryStr += '&' + key + '=' + value;
			}
		}
	});
	return queryStr.replace(/^&/, '');
}

},{"./is-array":10,"./is-none":12}]},{},[3]);
