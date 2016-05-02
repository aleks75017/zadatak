(function() {
	'use strict';

	angular
		.module('backoffice')
		.service('venueService', venueService);

	venueService.$inject = ['$http', 'Venue'];

	function venueService($http, Venue) {

		var service = this;

		service.search = search;

		/////////////////////////////////////

		function search(latitude, longitude, radius,mapy) {

            var svc = new google.maps.places.PlacesService(mapy);
            var pyrmont = new google.maps.LatLng(latitude,longitude);
            console.log(svc);
            var request = {
                location: pyrmont,
                radius: 1000,
                types: ["restaurant", "food", "bar","cafe"]
            };
            var deferred = $.Deferred();



                function callback(results, status) {

                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        var rs = new Array();
                        for (var i = 0; i < results.length; i++) {
                            var place = results[i];

                            rs.push({"name": place.name,
                                "address": place.vicinity,
                                "logo": place.icon,
                                "latitude": place.geometry.location.lat(),
                                "longitude": place.geometry.location.lng(),
                                "type": place.types[0]});

                        }
                        deferred.resolve(rs);

                    }
                }

                svc.nearbySearch(request, callback);
            return deferred.promise();
			// TODO: search venues by radius from specific geolocation
			// NOW: return all venues (this is DEMO app)

		}
	}
})();