

export default class Base {
	toString() {
		let name = this.constructor.toString().replace(/^function ([^(]*)[\s\S]*/, '$1');
		name = name.replace(/([A-Z])/g, '_$1');
		name = name.replace(/^_/, '');
		name = name.toLowerCase();
		return (`manager:${name}`);
	}
}
