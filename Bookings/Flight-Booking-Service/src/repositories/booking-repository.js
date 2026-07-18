const {StatusCodes}=require('http-status-codes')
const {Op}=require('sequelize')

const {Booking}=require('../models')
const CrudRepository = require('./crud-repository')
const AppError=require('../utils/errors/app-error')
const {Enums}=require('../utils/common')
const {BOOKED,CANCELLED}=Enums.BOOKING_STATUS

class BookingRepository extends CrudRepository{
    constructor()
    {
        super(Booking)
    }

    async createBooking(data,transaction)
    {
        const response=await Booking.create(data,{transaction})
        return response
    }

    async get(id,transaction)
    {
        const response=await Booking.findByPk(id,{transaction})
        if(!response)
        {
            throw new AppError('Not able to find the booking',StatusCodes.NOT_FOUND)
        }
        return response
    }

    async update(id,data,transaction)
    {
        const response=await Booking.update(data,{
            where:{id},
            transaction
        })
        if(response[0]===0)
        {
            throw new AppError('Not able to find the booking',StatusCodes.NOT_FOUND)
        }
        return response
    }

    async getBookingsByUser(userId)
    {
        const response=await Booking.findAll({
            where:{userId},
            order:[['createdAt','DESC']]
        })
        return response
    }

    async getExpiredBookings(cutoffTime)
    {
        const response=await Booking.findAll({
            where:{
                status:{[Op.notIn]:[BOOKED,CANCELLED]},
                createdAt:{[Op.lt]:cutoffTime}
            }
        })
        return response
    }
}

module.exports=BookingRepository
