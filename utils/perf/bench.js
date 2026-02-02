import { performance } from 'node:perf_hooks';

const iterations = Number( process.argv[ 2 ] || 5 );

function time( label, fn ) {

	const t0 = performance.now();
	fn();
	const t1 = performance.now();
	console.log( `${label}: ${( t1 - t0 ).toFixed( 2 )}ms` );

}

function run() {

	let sum = 0;
	for ( let i = 0; i < 100000; i ++ ) sum += i;
	return sum;

}

console.log( `three.js perf smoke (${iterations}x)` );

for ( let i = 0; i < iterations; i ++ ) {

	time( `loop-${i + 1}`, run );

}

