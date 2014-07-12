
describe("org.korsakow.Storage", function() {
	JsMockito.Integration.importTo(window);
	
	describe('WebStorage', function() {
		var underlying, storage;
		beforeEach(function() {
			underlying = mock({
				getItem: function(){},
				setItem: function(){},
				removeItem: function(){},
				clear: function(){}
			});
			storage = new org.korsakow.WebStorage(underlying);
		});
		
		it("length should return the number of items stores", function() {
			underlying.length = 11;
			expect(storage.length()).toEqual(11);
		});
		it("get should return item by key", function() {
			when(underlying).getItem('bob').thenReturn('guardian');
			
			expect(storage.get('bob')).toEqual('guardian');
		});
		it("get should return null for keys not found", function() {
			when(underlying).getItem().thenReturn(null);
			
			expect(storage.get('bob')).toEqual(null);
		});
		it("set save the value under the specified key", function() {
			storage.set('dot', 'matrix');
			verify(underlying).setItem('dot', 'matrix');
		});
		it("remove should delete the value under the specified key", function() {
			storage.remove('enzo');
			verify(underlying).removeItem('enzo');
		});
		it("clear should remove all items", function() {
			storage.clear();
			verify(underlying).clear();
		});
	});
	
	describe('MemoryStorage', function() {
		var storage;
		beforeEach(function() {
			storage = new org.korsakow.MemoryStorage();
		});
		it("length should return the number of items stores", function() {
			storage.heap['mario'] = 'mario';
			storage.heap['luigi'] = 'luigi';
			expect(storage.length()).toEqual(2);
		});
		it("get should return item by key", function() {
			storage.heap['link'] = 'past';
			expect(storage.get('link')).toEqual('past');
		});
		it("get should return null for keys not found", function() {
			expect(storage.get('something')).toEqual(null);
		});
		it("set should save the value under the specified key", function() {
			storage.set('tri', 'force');
			expect(storage.heap['tri']).toEqual('force');
		});
		it("remove should delete the value under the specified key", function() {
			storage.heap['morph'] = 'ball';
			storage.remove('morph');
			expect(storage.heap['morph']).toBeUndefined();
		});
		it("clear should remove all items", function() {
			storage.heap['tatsumaki'] = 'senpuu kyaku';
			storage.heap['hadou'] = 'ken';
			storage.clear();
			expect(storage.heap).toEqual({});
		});
	});
});
