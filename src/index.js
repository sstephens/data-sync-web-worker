/**
 * @busybusy/data-sync-web-worker
 *
 * @copyright all rights reserved, busy inc. 2017
 */
import Application from './application';

(function() {
	global.onmessage = function(message) {
		const worker = this;
		global.__APP = new Application(worker, message.data[0] || {});
		global.__APP.startApp();
	};
})();
