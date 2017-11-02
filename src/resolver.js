
export default function(typeName, options) {
	let [ type, name ] = typeName.split(':');

	type = `${type}s`;

	return type;
}
