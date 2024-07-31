const { formatStandardError } = require('../utils/responseModels');
const driver = require('../config/neo4jDriver').getDriver();



exports.getShortestPath = async (req,src,dest)=>{

  const session = driver.session({database: 'stations'});
  const result = await session.executeRead(tx => {
      return tx.run(`match p= shortestPath((n{name :$src})-[:next*]->(m{name :$dest}))
      return p`,
           { src: src , dest: dest });
  });
  await session.close()

  if(!result || result.records.length==0) throw formatStandardError(req,404,"enter_valid_stations",null);
 
 const segments = result.records.map(row => {
    return row._fields[0].segments;

})


const pathDetails = segments.flat().reduce((acc, segment) => {
 acc.push({
     station: segment.start.properties.name,
     labels: segment.start.labels,
     direction:segment.relationship.properties.direction,
     line:segment.relationship.properties.line
 });

   return acc;
}, []);
 pathDetails.push({
   station: dest,
   line: pathDetails.slice(-1)[0].line
});
 numberOfStations = pathDetails.length;
 let time = 3* (numberOfStations-1);

 return { pathDetails, numberOfStations ,time};
}


exports.getAllStations=async(req)=>{
  const session = driver.session({
    database: 'stations'
});

const result = await session.executeRead(tx => {
    return tx.run(`MATCH (n) RETURN n`);
});
await session.close()

if (!result || result.records.length == 0) throw formatStandardError(req,404, 'no_stations_found',null);


const stations = result.records.map(row => {
    return row._fields[0].properties.name;
});
  return stations

}


exports.getPathLines =  (pathDetails)=>{

  var allLines = pathDetails.map(station=> station.line);
  
  const linesSet = new Set(allLines);
  
  return  linesSet.size;
  }
  
  
exports.getPathInfo =  (pathDetails)=>{
  const startStation = pathDetails[0];
  const startdirection = startStation.direction;
 
  const startLine = startStation.line;
  const endStation = pathDetails.pop();
  var switchStation ="";
  var switchLine ="";
  var switchDirection ="";
  if (startLine !== endStation.line) {
    var intersectionStations = pathDetails.filter(station=> {return station.labels.includes("intersection") && station.line === endStation.line});
    if(intersectionStations && intersectionStations.length > 0){
    switchStation = intersectionStations[0].station;
    switchDirection = intersectionStations[0].direction;
    switchLine = intersectionStations[0].line;
  }} 
    pathDetails.push(endStation);
    return  {startdirection,startLine,switchDirection,switchStation,switchLine};
    }
  

