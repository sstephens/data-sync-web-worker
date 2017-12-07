/**
 * @module Managers
 *
 */
import Base from './base';
import stringifyQuery from '../utils/stringify-query';
import isNone from '../utils/is-none';
import isEmpty from '../utils/is-empty';
import { debug } from '../utils/debug';

/**
 * @class API
 *
 */
export default class API extends Base {
	constructor(app) {
		super(...arguments);

		this.__className = 'manager:api';
		this.app = app;

		let version = this.app.getOption('api.version');
		if (isNone(version)) {
			version = '';
		}

		this.host = this.app.getOption('api.host');
		this.version = `${version}`; // convert Number versions to strings
		this.headers = this.app.getOption('api.headers');
		this.debug = this.app.getOption('debug');
	}

	/**
	 * TODO:
	 * add debugKey to options for api calls
	 *
	 */
	buildUrl(url) {
		url = url.replace(/^\//, '');
		url = `${this.host}/${url}`;
		if (!isEmpty(this.version)) {
			url += `?_version=${this.version}`
			if (this.debug) {
				url += `&_debug=true`;
			}
		} else {
			if (this.debug) {
				url += `?_debug=true`;
			}
		}
		return url;
	}

	queryString(query) {
		return stringifyQuery(query);
	}

	get(url, data, success=function(){}, error=function(){}) {
		this.request(url, 'GET', data, results => {
			if (results.success) {
				success(results.data);
			} else {
				error(results.error);
			}
		}, error);
	}

	request(url, type='GET', data={}, success=function(){}, error=function(){}) {
		const xhr = new XMLHttpRequest();
		url = this.buildUrl(url);
		url += '&' + this.queryString(data);
		url = url.replace(/&$/, '');

		debug('request', { url, type, data });

		xhr.addEventListener('load', function() {
			if (xhr.status === 200) {
				success(JSON.parse(xhr.responseText));
			} else {
				debug('request.error', xhr);
				error(xhr);
			}
		});

		xhr.addEventListener('error', function() {
			debug('request.error', xhr);
			error(xhr);
		});

		xhr.open(type, url);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		Object.keys(this.headers).forEach(key => {
			xhr.setRequestHeader(key, this.headers[key]);
		});

		xhr.send();
	}
}

