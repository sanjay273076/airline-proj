
const {StatusCodes}=require('http-status-codes')
const {FlightService}=require('../services')

const {SuccessResponse,ErrorResponse}=require('../utils/common')

/**
 * POST:/airplanes
 * req-body:{modelNumber:'airbus320',capacity:200}
 */

async function createFlight(req,res){
    try{
        const flight=await FlightService.createFlight({
            flightNumber:req.body.flightNumber,
            airplaneId:req.body.airplaneId,
            departureAirportId:req.body.departureAirportId,
            arrivalAirportId:req.body.arrivalAirportId,
            arrivalTime:req.body.arrivalTime,
            departureTime:req.body.departureTime,
            price:req.body.price,
            boardingGate:req.body.boardingGate,
            totalSeats:req.body.totalSeats
        })
        SuccessResponse.data=flight
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

async function getAllFlights(req,res){
    try{
        console.log(req.query)
        const flights= await FlightService.getAllFlights(req.query)
        SuccessResponse.data=flights
        return res
                .status(StatusCodes.CREATED)
                .json(SuccessResponse)
    }catch(error)
    {
        console.log(error)
        ErrorResponse.error=error
            res
                .status(error.statusCode)
                .json(ErrorResponse)
    }
}

async function getFlightById(req,res)
{
    try{
        const flight=await FlightService.getFlightById(req.params.id)
         SuccessResponse.data=flight
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

async function updateSeats(req,res)
{
     try{
        const flights= await FlightService.updateSeats({
            flightId:req.params.id,
            seats:req.body.seats,
            dec:req.body.dec
        })
        SuccessResponse.data=flights
        return res
                .status(StatusCodes.CREATED)
                .json(SuccessResponse)
    }catch(error)
    {
        console.log(error)
        ErrorResponse.error=error
            res
                .status(error.statusCode)
                .json(ErrorResponse)
    }
}
module.exports={
    createFlight,
    getAllFlights,
    getFlightById,
    updateSeats
}