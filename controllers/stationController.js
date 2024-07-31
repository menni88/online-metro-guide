const { formatStandardError } = require('../utils/responseModels');
const {sendSuccess}=require("../utils/responseModels")

const driver = require('../config/neo4jDriver').getDriver();




exports.getAllLines = async (req, res ,next) => {
    try {
        const session = driver.session({
            database: 'stations'
        });
     
        const result = await session.run('call db.labels;');
        await session.close()
       
        if (!result || result.records.length ==0) throw formatStandardError(req,404, 'Lines_not_found',null);
          

        const labels = result.records
        .map(row => {
            return row._fields[0];
        })
        .filter(label => {
            return label !== 'intersection';
        })
        .map(label => {
            return label.replace("_", " ");
        });

        sendSuccess(req,res,200,null,{ lines: labels })

    } catch (err) {
       next(err);
    
    }


}
 
exports.getLine = async (req, res ,next) => {
    try {
        const line = req.params.line;

        const session = driver.session({
            database: 'stations'
        });

        const result = await session.executeRead(tx => {
            return tx.run(`MATCH (n:${line}) RETURN n`);
        });
        await session.close()

        if (!result || result.records.length == 0) throw formatStandardError(req,404, 'no_stations_found',null);


        const stations = result.records.map(row => {
            return row._fields[0].properties.name;
        });

       return  sendSuccess(req,res,200,null,{ stations: stations })


    } catch (err) {
      next(err);
    }


}
         

