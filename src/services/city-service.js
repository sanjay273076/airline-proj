const{CityRepository}=require('../repositories')
const AppError=require('../utils/errors/app-error')
const {StatusCodes}=require('http-status-codes')
const cityRepository=new CityRepository()


async function createCity(data){

    try{
        const city=await cityRepository.create(data)

        return city
    }catch(error)
    {
        console.log(error)
        if(error.name==='SequelizeUniqueConstraintError')
        {
            let explanation=[]
            error.errors.forEach((err)=>{
                explanation.push(err.value+' '+err.message)
            })
            throw new AppError(explanation,StatusCodes.BAD_REQUEST)
        }
        throw new AppError('Cannot able to create city object',StatusCodes.INTERNAL_SERVER_ERROR)
    }

}

async function destroyCityById(data)
{
    try{
        const city= await cityRepository.destroy(data);
        return city
    }catch(error)
    {
        if(error.statusCode==StatusCodes.NOT_FOUND)
        {
            throw new AppError('The city data you requested to delete is not present',error.statusCode)
        }
        throw new AppError('Cannot able to delete the city details with the provided Id',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}
async function updateCityById(id,data)
{
    try{
        const city= await cityRepository.update(id,data)
        return city
    }catch(error)
    {
        if(error.statusCode==StatusCodes.NOT_FOUND)
        {
            throw new AppError('The city data you requested to update is not present',error.statusCode)
        }
        throw new AppError('Cannot able to update the city details with the provided Id',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}
module.exports={
    createCity,
    destroyCityById,
    updateCityById
}