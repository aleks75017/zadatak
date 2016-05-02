(function() {
	'use strict';

	angular
		.module('backoffice')
		.controller('MapController', mapController);

	mapController.$inject = ['$q', 'venueService', 'NgMap', 'mapConfig', '$uibModal'];

	function mapController($q, venueService, NgMap, mapConfig, $uibModal) {

		var vm = this;

		vm.mapConfig = mapConfig;
		vm.venues = [];
		vm.panelOpened = false;

		vm.togglePanel = togglePanel;

		activate();

		///////////////////////////

		function activate() {

			loadMap()
				.then(loadVenues)
				.then(loadMarkers);
		}

		function togglePanel() {

			vm.panelOpened = !vm.panelOpened;
		}

		function loadVenues(mapx) {

			var center = vm.mapConfig.center.split(',');
           // debugger;
			return venueService
				.search(center[0], center[1], 200,mapx)
				.then(function(venues) {
					vm.venues = venues;
					return mapx;
				});
		}

		function loadMap() {

        //debugger;
			return NgMap.getMap()
				.then(function(map) { return map; })
				.catch(function(e) { console.log(e); });
		}

		function loadMarkers(map) {

			return $q.when(function() {

				for (var i in vm.venues) {
					var mark = buildMarker(vm.venues[i]);
					mark.setMap(map);
				}
			}());
		}

		function buildMarker(venue) {

			var latlng = new google.maps.LatLng(venue.latitude, venue.longitude);

			var mark = new google.maps.Marker({
              position: latlng,
              icon: vm.mapConfig.marker
            });

			mark.addListener('click', function() {
              showVenueInfo(venue);
            });

            return mark;
		}

		function showVenueInfo(venue) {

			$uibModal.open({
				animation: true,
                templateUrl: 'views/venues/venues.venue-modal.html',
                controller: 'VenueModalController as vm',
                resolve: {
                    options: function() {
                    	return {
                    		venue: venue
                    	}
                    }
                }
			});
        }
	}
})();