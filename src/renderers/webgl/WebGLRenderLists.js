function painterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.material.id !== b.material.id ) {

		return a.material.id - b.material.id;

	} else if ( a.materialVariant !== b.materialVariant ) {

		return a.materialVariant - b.materialVariant;

	} else if ( a.z !== b.z ) {

		return a.z - b.z;

	} else {

		return a.id - b.id;

	}

}

function reversePainterSortStable( a, b ) {

	if ( a.groupOrder !== b.groupOrder ) {

		return a.groupOrder - b.groupOrder;

	} else if ( a.renderOrder !== b.renderOrder ) {

		return a.renderOrder - b.renderOrder;

	} else if ( a.z !== b.z ) {

		return b.z - a.z;

	} else {

		return a.id - b.id;

	}

}

function prependItems( target, prepends ) {

	const count = prepends.length;
	if ( count === 0 ) return;

	const length = target.length;
	target.length = length + count;

	for ( let i = length - 1; i >= 0; i -- ) {

		target[ i + count ] = target[ i ];

	}

	for ( let i = 0; i < count; i ++ ) {

		target[ i ] = prepends[ count - 1 - i ];

	}

	prepends.length = 0;

}

function prependItem( target, item ) {

	const length = target.length;
	target.length = length + 1;

	for ( let i = length; i > 0; i -- ) {

		target[ i ] = target[ i - 1 ];

	}

	target[ 0 ] = item;

}

function WebGLRenderList() {

	const renderItems = [];
	let renderItemsIndex = 0;

	const opaque = [];
	const transmissive = [];
	const transparent = [];

	const opaquePre = [];
	const transmissivePre = [];
	const transparentPre = [];

	let isBuilding = false;

	function init() {

		renderItemsIndex = 0;

		opaque.length = 0;
		transmissive.length = 0;
		transparent.length = 0;

		opaquePre.length = 0;
		transmissivePre.length = 0;
		transparentPre.length = 0;

		isBuilding = true;

	}

	function materialVariant( object ) {

		let variant = 0;
		if ( object.isInstancedMesh ) variant += 2;
		if ( object.isSkinnedMesh ) variant += 1;
		return variant;

	}

	function getNextRenderItem( object, geometry, material, groupOrder, z, group ) {

		let renderItem = renderItems[ renderItemsIndex ];

		if ( renderItem === undefined ) {

			renderItem = {
				id: object.id,
				object: object,
				geometry: geometry,
				material: material,
				materialVariant: materialVariant( object ),
				groupOrder: groupOrder,
				renderOrder: object.renderOrder,
				z: z,
				group: group
			};

			renderItems[ renderItemsIndex ] = renderItem;

		} else {

			renderItem.id = object.id;
			renderItem.object = object;
			renderItem.geometry = geometry;
			renderItem.material = material;
			renderItem.materialVariant = materialVariant( object );
			renderItem.groupOrder = groupOrder;
			renderItem.renderOrder = object.renderOrder;
			renderItem.z = z;
			renderItem.group = group;

		}

		renderItemsIndex ++;

		return renderItem;

	}

	function push( object, geometry, material, groupOrder, z, group ) {

		const renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );

		if ( material.transmission > 0.0 ) {

			transmissive.push( renderItem );

		} else if ( material.transparent === true ) {

			transparent.push( renderItem );

		} else {

			opaque.push( renderItem );

		}

	}

	function unshift( object, geometry, material, groupOrder, z, group ) {

		const renderItem = getNextRenderItem( object, geometry, material, groupOrder, z, group );

		if ( material.transmission > 0.0 ) {

			if ( isBuilding ) {

				transmissivePre.push( renderItem );

			} else {

				prependItem( transmissive, renderItem );

			}

		} else if ( material.transparent === true ) {

			if ( isBuilding ) {

				transparentPre.push( renderItem );

			} else {

				prependItem( transparent, renderItem );

			}

		} else {

			if ( isBuilding ) {

				opaquePre.push( renderItem );

			} else {

				prependItem( opaque, renderItem );

			}

		}

	}

	function sort( customOpaqueSort, customTransparentSort ) {

		if ( opaque.length > 1 ) opaque.sort( customOpaqueSort || painterSortStable );
		if ( transmissive.length > 1 ) transmissive.sort( customTransparentSort || reversePainterSortStable );
		if ( transparent.length > 1 ) transparent.sort( customTransparentSort || reversePainterSortStable );

	}

	function finish() {

		prependItems( opaque, opaquePre );
		prependItems( transmissive, transmissivePre );
		prependItems( transparent, transparentPre );
		isBuilding = false;

		// Clear references from inactive renderItems in the list

		for ( let i = renderItemsIndex, il = renderItems.length; i < il; i ++ ) {

			const renderItem = renderItems[ i ];

			if ( renderItem.id === null ) break;

			renderItem.id = null;
			renderItem.object = null;
			renderItem.geometry = null;
			renderItem.material = null;
			renderItem.group = null;

		}

	}

	return {

		opaque: opaque,
		transmissive: transmissive,
		transparent: transparent,

		init: init,
		push: push,
		unshift: unshift,
		finish: finish,

		sort: sort
	};

}

function WebGLRenderLists() {

	let lists = new WeakMap();

	function get( scene, renderCallDepth ) {

		const listArray = lists.get( scene );
		let list;

		if ( listArray === undefined ) {

			list = new WebGLRenderList();
			lists.set( scene, [ list ] );

		} else {

			if ( renderCallDepth >= listArray.length ) {

				list = new WebGLRenderList();
				listArray.push( list );

			} else {

				list = listArray[ renderCallDepth ];

			}

		}

		return list;

	}

	function dispose() {

		lists = new WeakMap();

	}

	return {
		get: get,
		dispose: dispose
	};

}


export { WebGLRenderLists, WebGLRenderList };
