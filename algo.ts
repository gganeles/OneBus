interface BusRoute {
    name: string;
    duration: number;
    agency: string;
}

function initMap() {
    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    var mapOptions = {
        zoom:7,
        center: chicago
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    return
}
function getBusRoutes(origin: string, destination: string): Promise<BusRoute[]> {
    return new Promise<BusRoute[]>((resolve, reject) => {
        const directionsService = new google.maps.DirectionsService();

        const request = {
            origin: origin,
            destination: destination,
            travelMode: 'TRANSIT',
            provideRouteAlternatives: true,
            transitOptions: {
                routingPreference: 'FEWER_TRANSFERS'
            }
        };

        directionsService.route(request, (response, status) => {
            if (status === 'OK') {

                const routeList = []
                // Extract bus route information from the response

                response.routes.forEach((route) => {
                    const routes: BusRoute[] = [];
                    route.legs.forEach((leg) => {
                        leg.steps.forEach((step) => {
                            const busRoute: BusRoute = {
                                name: step.travel_mode === "TRANSIT" ? step.transit.line.name : "WALKING",
                                duration: step.duration.value,
                                agency: step.travel_mode === "TRANSIT" ? step.transit.line.agencies[0].name : "WALKING",
                            };
                            routes.push(busRoute);
                        });
                    });
                    routeList.push(routes);
                });

                console.log(response);
                resolve(routeList);
                var map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 7,
                    center: {lat: 41.85, lng: -87.65}
                });
                var directionsRenderer = new google.maps.DirectionsRenderer();
                directionsRenderer.setDirections(response);
                directionsRenderer.setMap(map);

            } else {
                reject(status);
            }

        });
    });
}
function find_halfway_point(busRoute:BusRoute[]): Object {
    var halfway = 0
    busRoute.forEach((leg) => {
        halfway += leg.duration;
    });
    halfway /= 2
    var index = 0
    while (halfway > 0) {
        halfway -= busRoute[index].duration;
        index++;
    }
    const distance_in_route = halfway + busRoute[index-1].duration;
    return {routeDetails: busRoute[index-1],distanceIntoRoute: distance_in_route}
}

window.onload = () => {
// Example usage
    const origin = "New York, NY";
    const destination = "San Francisco, CA";
    initMap();
    getBusRoutes(origin, destination)
        .then((routes) => {
            console.log("Bus routes:", routes);
            routes.forEach((route) => {
                console.log('halfway point:', find_halfway_point(route));
            });
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    getBusRoutes(destination, origin)
        .then((routes) => {
            console.log("Bus routes:", routes);
            routes.forEach((route) => {
                console.log('halfway point:', find_halfway_point(route));
            });
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}