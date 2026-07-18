const axios=require('axios')
const {StatusCodes}=require('http-status-codes')

const {BookingRepository}=require('../repositories')
const db=require('../models')
const {ServerConfig}=require('../config')
const AppError=require('../utils/errors/app-error')
const {Enums}=require('../utils/common')
const {BOOKED,CANCELLED}=Enums.BOOKING_STATUS

const bookingRepository=new BookingRepository()

const BOOKING_EXPIRY_MS=5*60*1000

const processedIdempotencyKeys=new Set()

function flightServiceError(error)
{
    if(error instanceof AppError) return error
    if(error.response)
    {
        const explanation=error.response.data?.error?.explanation||'Flight service rejected the request'
        return new AppError(explanation,error.response.status)
    }
    console.log(error)
    return new AppError('Flight service is unreachable',StatusCodes.SERVICE_UNAVAILABLE)
}

async function createBooking(data)
{
    const transaction=await db.sequelize.transaction()
    try{
        const flightResponse=await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`)
        const flight=flightResponse.data.data
        if(data.noOfSeats>flight.totalSeats)
        {
            throw new AppError('Not enough seats available',StatusCodes.BAD_REQUEST)
        }
        const totalCost=flight.price*data.noOfSeats
        const booking=await bookingRepository.createBooking({...data,totalCost},transaction)

        // Flight service holds a row lock while decrementing, so concurrent
        // bookings can never oversell; if it refuses, we roll back the booking.
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
            seats:data.noOfSeats
        })

        await transaction.commit()
        return booking
    }catch(error)
    {
        await transaction.rollback()
        throw flightServiceError(error)
    }
}

async function makePayment(data)
{
    if(processedIdempotencyKeys.has(data.idempotencyKey))
    {
        throw new AppError('This payment was already processed',StatusCodes.CONFLICT)
    }
    const transaction=await db.sequelize.transaction()
    try{
        const booking=await bookingRepository.get(data.bookingId,transaction)
        if(booking.status===CANCELLED)
        {
            throw new AppError('The booking has been cancelled',StatusCodes.BAD_REQUEST)
        }
        if(booking.status===BOOKED)
        {
            throw new AppError('The booking is already paid for',StatusCodes.BAD_REQUEST)
        }
        if(Date.now()-new Date(booking.createdAt).getTime()>BOOKING_EXPIRY_MS)
        {
            await transaction.rollback()
            await cancelBooking(data.bookingId)
            throw new AppError('The booking has expired',StatusCodes.BAD_REQUEST)
        }
        if(booking.totalCost!==+data.totalCost)
        {
            throw new AppError('The amount of the payment does not match',StatusCodes.BAD_REQUEST)
        }
        if(booking.userId!==+data.userId)
        {
            throw new AppError('The user corresponding to the booking does not match',StatusCodes.BAD_REQUEST)
        }
        await bookingRepository.update(data.bookingId,{status:BOOKED},transaction)
        processedIdempotencyKeys.add(data.idempotencyKey)
        await transaction.commit()
        return true
    }catch(error)
    {
        if(!transaction.finished) await transaction.rollback()
        if(error instanceof AppError) throw error
        console.log(error)
        throw new AppError('Payment failed',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

async function cancelBooking(bookingId)
{
    const transaction=await db.sequelize.transaction()
    try{
        const booking=await bookingRepository.get(bookingId,transaction)
        if(booking.status===CANCELLED)
        {
            await transaction.commit()
            return true
        }
        // give the seats back to the flight
        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${booking.flightId}/seats`,{
            seats:booking.noOfSeats,
            dec:false
        })
        await bookingRepository.update(bookingId,{status:CANCELLED},transaction)
        await transaction.commit()
        return true
    }catch(error)
    {
        await transaction.rollback()
        throw flightServiceError(error)
    }
}

async function getBookingsByUser(userId)
{
    try{
        return await bookingRepository.getBookingsByUser(userId)
    }catch(error)
    {
        throw new AppError('Cannot fetch the bookings',StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

// Sweeper: cancels unpaid bookings older than the expiry window and restores their seats.
async function cancelOldBookings()
{
    const cutoff=new Date(Date.now()-BOOKING_EXPIRY_MS)
    const expired=await bookingRepository.getExpiredBookings(cutoff)
    for(const booking of expired)
    {
        try{
            await cancelBooking(booking.id)
        }catch(error)
        {
            console.log(`Failed to cancel expired booking ${booking.id}`,error.message)
        }
    }
    return expired.length
}

module.exports={
    createBooking,
    makePayment,
    cancelBooking,
    getBookingsByUser,
    cancelOldBookings
}
