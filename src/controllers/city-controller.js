const {StatusCodes}=require('http-status-codes')
const {CityService}=require('../services')

const {SuccessResponse,ErrorResponse}=require('../utils/common')



async function createCity(req,res){
    try{
        const city=await CityService.createCity({
            name:req.body.name
        })
        SuccessResponse.data=city
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

async function destroyCityById(req,res)
{
    try{
        const city=await CityService.destroyCityById(req.params.id)
         SuccessResponse.data=city
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
async function updateCityById(req,res){
     try{
        const city=await CityService.updateCityById(req.params.id,{
            name:req.body.name
        })
         SuccessResponse.data=city
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
    createCity,
    destroyCityById,
    updateCityById
}