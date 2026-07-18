const{FlightRepository}=require('../repositories')
const AppError=require('../utils/errors/app-error')
const {StatusCodes}=require('http-status-codes')
const { Op } = require('sequelize');
const flightRepository=new FlightRepository()


async function createFlight(data)
{
    try{
        if(data.arrivalTime<data.departureTime)
            {
                throw new AppError('Arrival time should not be greater than departure time',StatusCodes.BAD_REQUEST)
            }
        const flight= await flightRepository.create(data)
        return flight
    }catch(error)
    {
        if (error instanceof AppError) {
        throw error;
        }
        if(error.name==='SequelizeValidationError')
        {
            let explanation=[]
            error.errors.forEach((err)=>{
                explanation.push(err.message)
            })
            throw new AppError(explanation,StatusCodes.BAD_REQUEST)
        }
        throw new AppError('Cannot able to create the flight object',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

async function getAllFlights(query)
{
    let customFilter={}
    let sortFilter=[]

    if(query.trips){
        [departureAirportId,arrivalAirportId]=query.trips.split("-")
        customFilter.departureAirportId=departureAirportId,
        customFilter.arrivalAirportId=arrivalAirportId
    }
    console.log(customFilter)
    if(query.price)
    {
        [minprice,maxprice]=query.price.split("-")
        customFilter.price={
            [Op.between]:[minprice,((maxprice==undefined)?20000:maxprice)]
        } 
    }
    if(query.travellers)
    {
        customFilter.totalSeats={
            [Op.gte]:query.travellers
        }
    }
    if(query.tripDate)
    {
        customFilter.departureTime={
            [Op.between]:[query.tripDate,query.tripDate+" 23:59:00"]
        }
    }
    if(query.sort)
    {
        const params=query.sort.split(",")

        sortFilter=params.map((param)=>param.split("_"))
        
    }
    try{
        const flights=await flightRepository.getAllFlights(customFilter,sortFilter)
        return flights

    }catch(error)
    {
        throw new AppError('Cannot fetch data of all the flights',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

async function getFlightById(data)
{
    try{
        const flight=await flightRepository.get(data)
        return flight
    }catch(error)
    {
        if(error.statusCode == StatusCodes.NOT_FOUND)
        {
            throw new AppError('The flight you requested is not present',error.statusCode)
        }
        throw new AppError('Cannot able to fetch the flight details with the provided Id',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

async function updateSeats(data)
{
    try{
        const response=await flightRepository.updateRemainingSeats(data.flightId,data.seats,data.dec)
        return response
    }catch(error)
    {
        if(error instanceof AppError)
        {
            throw error
        }
        console.log(error)
         throw new AppError('Cannot update data of the flight',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}
module.exports={
    createFlight,
    getAllFlights,
    getFlightById,
    updateSeats
}