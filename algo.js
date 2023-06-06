function initMap() {
    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    var mapOptions = {
        zoom: 7,
        center: chicago
    };
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    return;
}
function getBusRoutes(origin, destination) {
    return new Promise(function (resolve, reject) {
        var directionsService = new google.maps.DirectionsService();
        var request = {
            origin: origin,
            destination: destination,
            travelMode: 'TRANSIT',
            provideRouteAlternatives: true,
            transitOptions: {
                routingPreference: 'FEWER_TRANSFERS'
            }
        };
        directionsService.route(request, function (response, status) {
            if (status === 'OK') {
                var routeList_1 = [];
                // Extract bus route information from the response
                response.routes.forEach(function (route) {
                    var routes = [];
                    route.legs.forEach(function (leg) {
                        leg.steps.forEach(function (step) {
                            var busRoute = {
                                name: step.travel_mode === "TRANSIT" ? step.transit.line.name : "WALKING",
                                duration: step.duration.value,
                                agency: step.travel_mode === "TRANSIT" ? step.transit.line.agencies[0].name : "WALKING",
                            };
                            routes.push(busRoute);
                        });
                    });
                    routeList_1.push(routes);
                });
                console.log(response);
                resolve(routeList_1);
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 7,
                    center: { lat: 41.85, lng: -87.65 }
                });
                var directionsRenderer = new google.maps.DirectionsRenderer();
                directionsRenderer.setDirections(response);
                directionsRenderer.setMap(map);
            }
            else {
                reject(status);
            }
        });
    });
}
function find_halfway_point(busRoute) {
    var halfway = 0;
    busRoute.forEach(function (leg) {
        halfway += leg.duration;
    });
    halfway /= 2;
    var index = 0;
    while (halfway > 0) {
        halfway -= busRoute[index].duration;
        index++;
    }
    var distance_in_route = halfway + busRoute[index - 1].duration;
    return { routeDetails: busRoute[index - 1], distanceIntoRoute: distance_in_route };
}
window.onload = function () {
    // Example usage
    var origin = "New York, NY";
    var destination = "San Francisco, CA";
    initMap();
    getBusRoutes(origin, destination)
        .then(function (routes) {
        console.log("Bus routes:", routes);
        routes.forEach(function (route) {
            console.log('halfway point:', find_halfway_point(route));
        });
    })
        .catch(function (error) {
        console.error("Error:", error);
    });
};
