let _context;

/**
 * Manages the global audio context in the engine.
 *
 * @hideconstructor
 */
class AudioContext {

	/**
	 * Returns the global native audio context.
	 *
	 * @return {AudioContext} The native audio context.
	 */
	static getContext() {

		if ( _context === undefined ) {

			const globalScope = ( typeof globalThis !== 'undefined' ) ? globalThis : ( typeof window !== 'undefined' ? window : null );
			const NativeAudioContext = ( globalScope && ( globalScope.AudioContext || globalScope.webkitAudioContext ) ) || null;

			if ( NativeAudioContext === null ) {

				throw new Error( 'THREE.AudioContext: AudioContext is not available in this environment.' );

			}

			_context = new NativeAudioContext();

		}

		return _context;

	}

	/**
	 * Allows to set the global native audio context from outside.
	 *
	 * @param {AudioContext} value - The native context to set.
	 */
	static setContext( value ) {

		_context = value;

	}

}

export { AudioContext };
