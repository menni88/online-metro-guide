
module.exports.pathDetialsDTO =(pathDetails)=>{
 var path = pathDetails.map(station => station.station);
 return path;
};