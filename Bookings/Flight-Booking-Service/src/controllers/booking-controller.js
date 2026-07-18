const {BookingService}=require('../services')
const{StatusCodes}=require('http-status-codes')

const{SuccessResponse,ErrorResponse}=require('../utils/common')

function sendError(res,error)
{
    console.log(error)
    ErrorResponse.error=error
    return res
            .status(error.statusCode||StatusCodes.INTERNAL_SERVER_ERROR)
            .json(ErrorResponse)
}

async function createBooking(req,res){
    try{
        if(!req.body.flightId||!req.body.userId)
        {
            ErrorResponse.error={explanation:'flightId and userId are required'}
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse)
        }
        const booking=await BookingService.createBooking({
            flightId:req.body.flightId,
            userId:req.body.userId,
            noOfSeats:+req.body.noOfSeats||1
        })
        SuccessResponse.data=booking
        return res
                .status(StatusCodes.CREATED)
                .json(SuccessResponse)
    }catch(error)
    {
        return sendError(res,error)
    }
}

async function makePayment(req,res){
    try{
        const idempotencyKey=req.headers['x-idempotency-key']
        if(!idempotencyKey)
        {
            ErrorResponse.error={explanation:'x-idempotency-key header is required'}
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse)
        }
        const response=await BookingService.makePayment({
            bookingId:req.body.bookingId,
            userId:req.body.userId,
            totalCost:req.body.totalCost,
            idempotencyKey
        })
        SuccessResponse.data=response
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse)
    }catch(error)
    {
        return sendError(res,error)
    }
}

async function cancelBooking(req,res){
    try{
        const response=await BookingService.cancelBooking(req.params.id)
        SuccessResponse.data=response
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse)
    }catch(error)
    {
        return sendError(res,error)
    }
}

async function getBookingsByUser(req,res){
    try{
        if(!req.query.userId)
        {
            ErrorResponse.error={explanation:'userId query param is required'}
            return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse)
        }
        const bookings=await BookingService.getBookingsByUser(req.query.userId)
        SuccessResponse.data=bookings
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse)
    }catch(error)
    {
        return sendError(res,error)
    }
}

module.exports={
    createBooking,
    makePayment,
    cancelBooking,
    getBookingsByUser
}
