const{AirportRepository}=require('../repositories')
const AppError=require('../utils/errors/app-error')
const {StatusCodes}=require('http-status-codes')
const airportRepository=new AirportRepository()


async function createAirport(data)
{
    try{
        const airport= await airportRepository.create(data)
        return airport
    }catch(error)
    {
        if(error.name==='SequelizeValidationError')
        {
            let explanation=[]
            error.errors.forEach((err)=>{
                explanation.push(err.message)
            })
            throw new AppError(explanation,StatusCodes.BAD_REQUEST)
        }
        throw error
    }
}

async function getAirports()
{
    try{
        const airport=airportRepository.get()
        return airport
    }catch(error)
    {
        throw new AppError('Cannot fetch data of all the airports',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}
async function getAirportById(data)
{
    try{
        const airport=await airportRepository.get(data)
        return airport
    }catch(error)
    {
        if(error.statusCode == StatusCodes.NOT_FOUND)
        {
            throw new AppError('The airport you requested is not present',error.statusCode)
        }
        throw new AppError('Cannot able to fetch the airport details with the provided Id',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}
async function destroyAirportById(data)
{
    try{
        const airport=await airportRepository.destory(data)
        return airport

    }catch(error)
    {
        if(error.statusCode == StatusCodes.NOT_FOUND)
        {
            throw new AppError('The airplane you requested is not present',error.statusCode)
        }
        throw new AppError('Cannot able to delete the airplane details with the provided Id',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}


module.exports={
    createAirport,
    getAirports,
    getAirportById,
    destroyAirportById
}


