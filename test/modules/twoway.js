define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'Two-way bindings' );

		test( 'Two-way bindings work with index references', function ( t ) {
			var input, ractive;

			ractive = new Ractive({
				el: fixture,
				template: '{{#items:i}}<label><input value="{{items[i].name}}"> {{name}}</label>{{/items}}',
				data: { items: [{ name: 'foo' }, { name: 'bar' }] }
			});

			input = ractive.find( 'input' );

			input.value = 'baz';
			simulant.fire( input, 'change' );
			t.equal( ractive.get( 'items[0].name' ), 'baz' );
			t.htmlEqual( fixture.innerHTML, '<label><input> baz</label><label><input> bar</label>' );
		});

		test( 'Two-way bindings work with foo["bar"] type notation', function ( t ) {
			var input, ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<label><input value={{foo["bar"]["baz"]}}> {{foo.bar.baz}}</label>',
				data: { foo: { bar: { baz: 1 } } }
			});

			input = ractive.find( 'input' );

			input.value = 2;
			simulant.fire( input, 'change' );

			t.equal( ractive.get( 'foo.bar.baz' ), 2 );
			t.htmlEqual( fixture.innerHTML, '<label><input> 2</label>' );
		});

		test( 'Two-way bindings work with arbitrary expressions that resolve to keypaths', function ( t ) {
			var input, ractive;

			ractive = new Ractive({
				el: fixture,
				template: '<label><input value={{foo["bar"][ a+1 ].baz[ b ][ 1 ] }}> {{ foo.bar[1].baz.qux[1] }}</label>',
				data: {
					foo: {
						bar: [
							null,
							{ baz: { qux: [ null, 'yes' ] } }
						]
					},
					a: 0,
					b: 'qux'
				}
			});

			input = ractive.find( 'input' );

			input.value = 'it works';
			simulant.fire( input, 'change' );

			t.equal( ractive.get( 'foo.bar[1].baz.qux[1]' ), 'it works' );
			t.htmlEqual( fixture.innerHTML, '<label><input> it works</label>' );
		});

	};

});