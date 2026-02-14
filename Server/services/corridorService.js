const {booleanPointInPolygon} = require("@turf/boolean-point-in-polygon");
const {buffer} = require("@turf/buffer");


function createCorridor(routeLineString,bufferKm=50){
    const corridor= buffer(routeLineString,bufferKm,{units:"kilometers"});

    return {
        type:"Feature",
        geometry:corridor.geometry,
        properties:{bufferKm}
    }
}

function isRideInsideCorridor(ridePoint,corridor){
    return booleanPointInPolygon(ridePoint,corridor);
}

function checkDirectionToHome(pickupPoint, dropPoint, homeLocation) {
    console.log(pickupPoint, dropPoint, homeLocation);
const pickupToHome = Math.sqrt(Math.pow(pickupPoint.geometry.coordinates[0]-homeLocation[0],2)
+Math.pow(pickupPoint.geometry.coordinates[1]-homeLocation[1],2));
const dropToHome = Math.sqrt(Math.pow(dropPoint.geometry.coordinates[0]-homeLocation[0],2)+Math.pow(dropPoint.geometry.coordinates[1]-homeLocation[1],2)); 
return pickupToHome > dropToHome;
}

module.exports={createCorridor,isRideInsideCorridor,checkDirectionToHome};