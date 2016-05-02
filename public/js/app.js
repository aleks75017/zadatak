(function() {
  'use strict';

  angular
    .module('backoffice', [
      'ui.router',
      'ui.bootstrap',
      'ngMap'
    ])
    .constant('config', {})
    .run(setupConfig);

  function setupConfig($http, config) {
    $http({
      method: 'GET',
      url: 'data/config.json'
    })
    .then(function(res) {
      angular.extend(config, res.data);
    });
  }

})();

(function() {
    'use strict';

  angular
    .module('backoffice')
    .directive('altImage', altImage);

  function altImage() {
    return {
      link: link,
      restrict: 'A',
    };

    function link(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.altImage);
      });
    }
  }

})();

(function() {
  'use strict';
  
  angular
    .module('backoffice')
    .directive('pacConfirmAction', pacConfirmAction)
    .controller('ConfirmActionController', ConfirmActionController);

  pacConfirmAction.$inject = ['$uibModal'];
  function pacConfirmAction($uibModal) {
    return {
      link: link,
      restrict: 'A',
      scope: {
        action: '=pacConfirmAction',
      }
    };

    function link(scope, element, attrs) {
      element.on('click', function(e) {
        e.preventDefault();
        $uibModal.open({
          templateUrl: 'views/directives/pac.confirm.action.html',
          controller: 'ConfirmActionController',
          controllerAs: 'vm',
          backdrop: 'static',
          resolve: {
            action: function() {
              return scope.action;
            },
          },
        });
     });
    }
  }

  ConfirmActionController.$inject = ['$scope', 'action'];
  function ConfirmActionController($scope, action) {
    var vm = this;

    // public methods
    vm.applyAction = applyAction;
    vm.dismissModal = dismissModal;

    //////////////////////////////
    
    /**
     * Calls referenced action
     */
    function applyAction() {
      action();
      dismissModal();
    }

    /**
     * Dismisses modal instance
     */
    function dismissModal() {
      $scope.$dismiss();
    }
  }

})();

(function() {
    'use strict';

    angular
        .module('backoffice')
        .directive('pacDaterange', pacDaterange);

    function pacDaterange() {
        return {
            link: link,
            restrict: 'A'
        };

        function link(scope, element, attrs) {

            var drp = angular.element(element.find('input'));

            // initialize daterangepicker
            drp.daterangepicker({
              opens: 'left',
              format: 'DD/MM/YYYY',
            });

            // binder for clearing filter values
            element.find('.clearDaterange').on('click', function() {
              clearValues();
              hideClearer();
            });

            // binder for selecting daterange
            drp.on('apply.daterangepicker', function(ev, picker) {
              showClearer();
              setValues(picker.startDate, picker.endDate);
            });

            
            function showClearer() {
              element.find('.clearDaterange').removeClass('hide');
            }

            function hideClearer() {
              element.find('.clearDaterange').addClass('hide');
            }

            /**
            *   Applies selected values to input field in specific format
            *   @param {Date} start - Selected start date
            *   @param {Date} end - Selected end date
            */
            function setValues(start, end) {
              element.find('input')
                .val(start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY'))
                .trigger('change'); // must be present in order for daterangepicker to trigger change event
            }

            // removes all values from input element
            function clearValues() {
              element.find('input')
                .val('')
                .trigger('change'); // must be present in order for daterangepicker to trigger change event
            }
        }
    }

})();

(function(moment) {
    'use strict';

    angular
        .module('backoffice')
        .directive('pacDateTime', pacDateTime);

    function pacDateTime() {
        // Usage:
        // Put as an attribute in tag whose value is expected to be time in UTC format
        // pac-format parameter can have one of these values"
        //  1. 'D' - this will return Date in EU format (DD/MM/YYYY)
        //  2. 'T' - this will return Time (HH:mm:ss)
        //  3. 'DT' - this will return DateTime
        // When no pac-format is supplied, defaults to 'D'
        // Creates:
        // Localized date/time/datetime based on environment (OS) localization settings

        return {
            link: link,
            restrict: 'A',
            scope: {
                pacDateTime: '=',
                pacFormat: '='
            }
        };

        function link(scope, element, attrs) {

            scope.$watch('pacDateTime', function dateTimeWatch(newVal, oldVal) {

                if (!!newVal) {

                    if (isValidDateString(newVal)) {

                        var time = moment(newVal);

                        // set value based on the 'pacFormat' attribute
                        switch (scope.pacFormat) {

                            case 'DT':

                                setValue(element, time.format('DD/MM/YYYY HH:mm:ss'));

                                break;

                            case 'D':

                                setValue(element, time.format('DD/MM/YYYY'));

                                break;

                            case 'T':

                                setValue(element, time.format('HH:mm:ss'));

                                break;

                            default:

                                setValue(element, time.format('DD/MM/YYYY'));
                        }
                    }
                    else {

                        setValue(element, newVal);
                    }
                }
            });
        }

        function setValue(element, value) {

            element.text(value);
            element.val(value);
        }

        /**
        *   Checks if provided date string is valid date format
        *   @param {string} date - Expected date in string format
        *   @returns {bool} - True if parameter can be parsed as Date, otherwise false
        */
        function isValidDateString(date) {

            if (!isNaN(Date.parse(date))) {

                return true;
            }

            return false;
        }
    }

})(moment);

(function() {
  'use strict';

  angular
    .module('backoffice')
    .directive('pacEnter', pacEnter);

  function pacEnter() {
    return {
      link: link,
      restrict: 'A',
      scope: {
        pacEnter: '='
      }
    };
  }

  function link(scope, element, attrs) {
    element.on("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.pacEnter();
        event.preventDefault();
      }
    });
  }

}());

(function() {
  'use strict';

  angular
    .module('backoffice')
    .directive('pacMatchPasswords', pacMatchPasswords);

  function pacMatchPasswords() {
    var errorProperty = 'match';

    return {
      link: link,
      restrict: 'A',
      require: 'ngModel'
    };

    function link(scope, element, attrs, ctrl) {
      scope.$watch(attrs.ngModel, function() {
        validate();
      });

      attrs.$observe('pacMatchPasswords', function(val) {
        validate();
      });

      function validate() {
        if (ctrl.$modelValue === attrs.pacMatchPasswords) {
          ctrl.$setValidity(errorProperty, true);
        }
        else {
          ctrl.$setValidity(errorProperty, false);
        }
      }
    }
  }

})();

(function() {
  'use strict';

  angular
    .module('backoffice')
    .controller('EventNotificationController', EventNotificationController);

  EventNotificationController.$inject = ['$q', '$timeout', '$rootScope', 'eventService', 'events'];

  function EventNotificationController($q, $timeout, $rootScope, eventService, events) {
    var vm = this;

    // public methods
    vm.removeNotification = removeNotification;

    // variables and properties
    vm.message = {};

    activate();

    ////////////////////////////////////////////////

    function activate() {

      eventService.subscribe(events.SUCCESS, function (event, message) {
        populateVM(event.name, message)
          .then(removeNotificationDelayed);
      });

      eventService.subscribe(events.ERROR, function (event, message) {
        populateVM(event.name, message)
          .then(removeNotificationDelayed);
      });
    }

    ////////////////////////////////////////////////
    
    /**
     * Populates videmodel data with appropriate type and message
     * @param  {string}   type      error/success
     * @param  {string}   message   Message to be shown to User
     * @return {void}
     */
    function populateVM(type, message) {
      return $q.when((function() {
        vm.message.type = type;
        vm.message.contents = message;
      })());
    }

    /**
     * Resets notification object, thus removing the notification from UI
     * @return {void}
     */
    function removeNotification() {
      vm.message = {};
      $rootScope.notificationActive = false;
    }

    /**
     * Removes notification after X seconfs
     * @return {void}
     */
    function removeNotificationDelayed() {
      $timeout(removeNotification, events.notificationDisplayTime);
    }
  }

})();

(function() {
  'use strict';

  angular
    .module('backoffice')
    .service('eventService', eventService);

  eventService.$inject = ['$q', '$rootScope', 'events'];

  function eventService($q, $rootScope, events) {

    var service = this;

    service.broadcast = broadcast;
    service.subscribe = subscribe;
    service.unsubscribe = unsubscribe;
    service.notifySuccess = notifySuccess;
    service.notifyError = notifyError;

    service.events = events;

    var unsubscribeTriggers = [];

    function broadcast(event, data) {

      return $q.when(function() {
        if (!!event) {
          if (event === events.ERROR || event === events.SUCCESS) {
            $rootScope.notificationActive = true;
          }

          return $rootScope.$broadcast(event, data);
        }
        return false;  
      }());
    }

    function subscribe(event, callback) {

      return $q.when(function() {
        var unsubscribeFunction = $rootScope.$on(event, callback);
        unsubscribeTriggers.push(unsubscribeFunction);
        return (unsubscribeTriggers.length - 1);
      }());      
    }

    function unsubscribe(index) {

      $q.when(function() {
        try {
          if (!!unsubscribeTriggers[index] && angular.isFunction(unsubscribeTriggers[index])) {

            unsubscribeTriggers[index]();
            unsubscribeTriggers.splice(index, 1);
          }
          return true;
        } catch(e) {

          return false;
        }  
      }());
    }

    /**
     * Broadcasts success event with message
     * @param  {string}   message     Success message
     * @return {void}
     */
    function notifySuccess(message) {
      broadcast(events.SUCCESS, message);
    }

    /**
     * Broadcasts error event with message
     * @param  {string}   message     Error message
     * @return {void}
     */
    function notifyError(message) {
      broadcast(events.ERROR, message);
    }
  }
}());
(function() {
  'use strict';

  angular
    .module('backoffice')
    .constant('events', {
      SESSION_EXPIRED: 'SESSION_EXPIRED',
      USER_LOGGED_IN: 'USER_LOGGED_IN',
      USER_LOGGED_OUT: 'USER_LOGGED_OUT',
      ERROR: 'ERROR',
      SUCCESS: 'SUCCESS',
      notificationDisplayTime: 6000,
    });
}());
(function() {
  'use strict';

  angular
      .module('backoffice')
      .constant('mapConfig', {

          'zoom': 13,
          'maxZoom': 16,
          'center': '44.7866,20.4489',
          'panControl': true,
          'zoomControl': true,
          'scaleControl': true,
          'markers': [],
          'marker': {
            'path': 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z',
            'fillColor': '#252830',
            'fillOpacity': 0.8,
            'scale': 0.8,
            'strokeColor': '#252830',
            'strokeWeight': 2
          },
          mapItems: [],
          'style': [{"elementType":"geometry","stylers":[{"hue":"#ff4400"},{"saturation":-68},{"lightness":-4},{"gamma":0.72}]},{"featureType":"road","elementType":"labels.icon"},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"hue":"#0077ff"},{"gamma":3.1}]},{"featureType":"water","stylers":[{"hue":"#00ccff"},{"gamma":0.44},{"saturation":-33}]},{"featureType":"poi.park","stylers":[{"hue":"#44ff00"},{"saturation":-23}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"hue":"#007fff"},{"gamma":0.77},{"saturation":65},{"lightness":99}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"gamma":0.11},{"weight":5.6},{"saturation":99},{"hue":"#0091ff"},{"lightness":-86}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"lightness":-48},{"hue":"#ff5e00"},{"gamma":1.2},{"saturation":-23}]},{"featureType":"transit","elementType":"labels.text.stroke","stylers":[{"saturation":-64},{"hue":"#ff9100"},{"lightness":16},{"gamma":0.47},{"weight":2.7}]}]
      });
}());
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
(function() {
	'use strict';

	angular
		.module('backoffice')
		.factory('Venue', venueFactory);

	venueFactory.$inject = [];

	function venueFactory() {

		return Venue;
	}

	function Venue(data) {

		this.name = data && data.name ? data.name : '';
		this.address = data && data.address ? data.address : '';
		this.logo = data && data.logo ? data.logo : '';
		this.latitude = data && data.latitude ? data.latitude : 0;
		this.longitude = data && data.longitude ? data.longitude : 0;
		this.type = data && data.type ? data.type : '';
	}
})();
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
(function() {
	'use strict';

	angular
		.module('backoffice')
		.controller('VenueModalController', venueModalController);

	venueModalController.$inject = ['$uibModalInstance', 'options'];

	function venueModalController($uibModalInstance, options) {

		var vm = this;

		vm.venue = options.venue;

		vm.close = close;

		////////////////////////////////////////

		function close() {

			if (options.onClose) {
				options.onClose(vm.venue);
			}
			$uibModalInstance.dismiss();
		}
	}
})();
(function() {
  'use strict';

  angular
    .module('backoffice')
    .service('countriesAPI', countriesAPI);

  countriesAPI.$inject = ['$q', '$http', 'config'];
  function countriesAPI($q, $http, config) {
    var service = this;

    // public methods
    service.getCountries = getCountries;

    // variables and properties
    var _allCountries;

    /////////////////////////////////

    function getCountries() {
      // serve from memory
      if (!!_allCountries && !!_allCountries.length) {
        return $q.when(function() {
          return _allCountries;
        }());
      }

      // call API, save results in memory
      return $http({
        method: config.httpMethods.GET,
        url: config.COUNTRIES,
      })
      .then(function(response) {
        _allCountries = response.data;
        return _allCountries;
      });
    }
  }

}());

(function() {
  'use strict';

  angular
    .module('backoffice')
    .service('packatorAPI', packatorApiProxy);

  packatorApiProxy.$inject = ['$http', 'config', '$rootScope'];
  function packatorApiProxy($http, config, $rootScope) {
    var service = this;

    // public methods
    service.http = submitRequest;

    /////////////////////////////////

    function submitRequest(request) {
      request.url = config.HOST + ensureSingleSlash(request.url);

      if (!request.params) {
        request.params = {};
      }

      if ($rootScope.user) {
        request.params.access_token = $rootScope.user.access_token;
      }
      
      return $http(request)
        .then(function(response) {
          return response.data;
        });
    }

    function ensureSingleSlash(str) {
      return  str.replace(/\/\//g, '/');
    }
  }

}());

(function() {
  'use strict';

  angular
    .module('backoffice')
    .config(function ($stateProvider, $urlRouterProvider) {

      $stateProvider
        .state('app', {
          abstract: true,
          url: '/',
          templateUrl: 'views/layout/layout.html'
        })
        .state('app.map', {
          url: 'map',
          templateUrl: 'views/map/map.html'
        });

      $urlRouterProvider.otherwise('/map');

  });

})();

(function () {
  'use strict';
  
  angular
    .module('backoffice')
    .run(stateChangeEvents);

  stateChangeEvents.$inject = ['$window', '$rootScope', '$state'];
  function stateChangeEvents($window, $rootScope, $state, authService) {

    /*function onStateChangeStart(event, toState, toParams, fromState) {
      if (!authService.isUserLoggedIn() && toState.name !== 'login') {
        event.preventDefault();
        $state.go('login');
      }

      if (authService.isUserLoggedIn() && (toState.name === 'app' || toState.name === 'login')) {
        event.preventDefault();
        $state.go('app.orders');
      }
    }

    $rootScope.$on('$stateChangeStart', onStateChangeStart);*/
  }

})();

//# sourceMappingURL=app.js.map
