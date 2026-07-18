
const {StatusCodes}=require('http-status-codes')
const {AirportService}=require('../services')

const {SuccessResponse,ErrorResponse}=require('../utils/common')

/**
 * POST:/airplanes
 * req-body:{modelNumber:'airbus320',capacity:200}
 */

async function createAirport(req,res){
    try{
        const airport=await AirportService.createAirport({
            name:req.body.name,
            code:req.body.code,
            address:req.body.address,
            cityId:req.body.cityId
        })
        SuccessResponse.data=airport
        return res
                .status(StatusCodes.CREATED)
                .json(SuccessResponse)

    }catch(error)
    {
        ErrorResponse.error=error
            res
                .status(error.statusCode)
                .json(ErrorResponse)
    }
}

async function getAllAirport(req,res)
{
    try{
        const airport=await AirportService.getAllAirport()
         SuccessResponse.data=airport
         return res
                .status(StatusCodes.OK)
                .json(SuccessResponse)
    }catch(error)
    {
        ErrorResponse.error=error
            res
                .status(error.statusCode)
                .json(ErrorResponse)
    }
}

async function getAirportById(req,res)
{
    try{
        const airport=await AirportService.getAirportById(req.params.id)
         SuccessResponse.data=airport
         return res
                .status(StatusCodes.OK)
                .json(SuccessResponse)
    }catch(error)
    {
            ErrorResponse.error=error
            res
                .status(error.statusCode)
                .json(ErrorResponse)
    }
}

async function destroyAirportById(req,res)
{
    try{
        const airport=await AirportService.destroyAirportById(req.params.id)
         SuccessResponse.data=airport
         return res
                .status(StatusCodes.OK)
                .json(SuccessResponse)
    }catch(error)
    {
            
            ErrorResponse.error=error
            res
                .status(error.statusCode)
                .json(ErrorResponse)
    }
}

module.exports={
    createAirport,
    getAllAirport,
    getAirportById,
    destroyAirportById
}