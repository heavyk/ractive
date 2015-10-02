import Hook from '../../events/Hook';
import Promise from '../../utils/Promise';
import { removeFromArray } from '../../utils/array';
import { cancel } from '../../shared/methodCallers';

const teardownHook = new Hook( 'teardown' );

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

export default function Ractive$teardown () {
	this.fragment.unbind();
	this.viewmodel.teardown();

	this._observers.forEach( cancel );

	if ( this.fragment.rendered && this.el.__ractive_instances__ ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}

	this.shouldDestroy = true;
	const promise = ( this.fragment.rendered ? this.unrender() : Promise.resolve() );

	Object.keys( this._links ).forEach( k => this._links[k].unlink() );

	teardownHook.fire( this );

	return promise;
}
