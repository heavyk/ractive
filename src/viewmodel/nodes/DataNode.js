import { isEqual } from 'utils/is';
import { removeFromArray } from 'utils/array';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export default class DataNode {
	constructor ( parent, key ) {
		this.parent = parent;
		this.viewmodel = parent.viewmodel || parent;
		this.key = key;

		this.deps = [];

		this.children = [];
		this.childByKey = {};

		this.value = undefined;
		this.update();
	}

	// flush () {
	// 	this.viewmodel._changeHash[ this.keypath ] = this.value;
	// 	this.deps.forEach( dep => dep.bubble() );
	// }

	get () {
		const parentValue = this.parent.value;
		if ( parentValue ) {
			return parentValue[ this.key ];
		}
	}

	getKeypath () {
		return this.parent.isRoot ? this.key : this.parent.getKeypath() + '.' + this.key;
	}

	has ( key ) {
		return hasOwnProperty.call( this.value, key );
	}

	join ( keys ) {
		const key = keys[0];

		if ( !this.childByKey[ key ] ) {
			const child = new DataNode( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		const child = this.childByKey[ key ];

		return keys.length > 1 ?
			child.join( keys.slice( 1 ) ) :
			child;
	}

	mark () {
		const value = this.get();
		if ( !isEqual( value, this.value ) ) {
			this.dirty = true;
			this.value = value;

			this.deps.forEach( dep => dep.handleChange() );
			this.children.forEach( child => child.mark() );
		}
	}

	register ( dep ) {
		this.deps.push( dep );
	}

	set ( value ) {
		if ( isEqual( value, this.value ) ) return;

		const parentValue = this.parent.value || this.parent.createBranch( this.key );
		parentValue[ this.key ] = value;

		this.dirty = true;
		this.value = value;

		this.deps.forEach( dep => dep.handleChange() );
		this.children.forEach( child => child.mark() );

		let parent = this.parent;
		while ( parent ) {
			parent.dirty = true;
			parent = parent.parent;
		}
	}

	unregister ( dependant ) {
		removeFromArray( this.deps, dependant );
	}

	update () {
		const parentValue = this.parent.value;
		if ( parentValue ) {
			this.value = parentValue[ this.key ];
		}
	}
}