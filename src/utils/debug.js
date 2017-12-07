/**
 * @module Utils
 *
 */
function log(...args) {
	if (global.console) {
		args.unshift('color: cornflowerblue;');
		args.unshift("%cWEB WORKER DEBUG: ");
		global.console.log(...args);
	}
}

export function isDebug() {
	if (global.__APP) {
		return global.__APP.getOption('debug');
	}
	return false;
}

export function runInDebug(cb) {
	if (isDebug()) {
		cb.call(null);
	}
}

export function debug(...args) {
	if (isDebug()) {
		log(...args);
	}
}
