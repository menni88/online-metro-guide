exports.calculatePhase=(numberOfStations)=> {
    if(numberOfStations >0 && numberOfStations<9){
        return "onePhase";
    }
    else if (numberOfStations <= 16) {
        return "twoPhases";
    } else if (numberOfStations <= 25) {
        return "threePhases";
    } else {
        return "fourPhases";
    
}}
 
exports.calcAnnualPhase=(numberOfLines)=>{
    
    if(numberOfLines<=2){
        return "twoLines"
    }else{
        return "threeLines"
    }
}