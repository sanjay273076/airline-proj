const{AirplaneRepository}=require('../repositories')
const AppError=require('../utils/errors/app-error')
const {StatusCodes}=require('http-status-codes')
const airplaneRepository=new AirplaneRepository()


async function createAirplane(data)
{
    try{
        const airplane=await airplaneRepository.create(data)
        
        return airplane
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
async function getAllAirplane()
{
    try
    {
    const airplane=await airplaneRepository.getAll()
    return airplane
    }catch(error)
    {
        throw new AppError('Cannot fetch data of all the airplanes',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

async function getAirplaneById(data)
{
    try{
        const airplane=await airplaneRepository.get(data)
        return airplane
    }catch(error)
    {
        if(error.statusCode == StatusCodes.NOT_FOUND)
        {
            throw new AppError('The airplane you requested is not present',error.statusCode)
        }
        throw new AppError('Cannot able to fetch the airplane details with the provided Id',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

async function destroyAirplaneById(data)
{
    try{
        const airplane=await airplaneRepository.destory(data)
        return airplane

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
    createAirplane,
    getAllAirplane,
    getAirplaneById,
    destroyAirplaneById
}