import { AssertionError, strict as assert } from 'assert';

try {
	assert.ok(true);
	console.log('Ok');
} catch (error) {
	if (error instanceof AssertionError) {
		console.error(error);
	}
}
