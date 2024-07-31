const { getShortestPath, getPathInfo,getAllStations } = require('../services/graghFunctions');
const { handleValidationErrors } = require("../utils/validateRequest");
const pathDetailsDTO = require("../services/pathDetailsDTO").pathDetialsDTO;
const {sendSuccess}=require("../utils/responseModels")
exports.getTripPath = async (req, res, next) => {
  try {
    handleValidationErrors(req);
    const { startStation, endStation } = req.body;

    const { numberOfStations, pathDetails, time } = await getShortestPath(req,startStation, endStation);
    const { startdirection, startLine, switchDirection, switchStation, switchLine } = getPathInfo(pathDetails);

    sendSuccess(req,res,200,null,{
      details: {
        path: pathDetailsDTO(pathDetails),
        startStation,
        endStation,
        numberOfStations,
        time,
        startdirection,
        startLine,
        switchStation,
        switchLine,
        switchDirection
      }
    })

  } catch (err) {
    next(err);
  }
};


exports.getNavigationData = async (req, res, next) => {
  try {
   const stations=await getAllStations(req);
   sendSuccess(req,res,200,null,{
    stations: stations
  })

  } catch (err) {
    next(err);
  }
};
