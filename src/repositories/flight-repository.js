const CrudRepository=require('./crud-repository')
const {Flight}=require('../models')

const db=require('../models')

const AppError=require('../utils/errors/app-error')
const {StatusCodes}=require('http-status-codes')

class FlightRepository extends CrudRepository{
    constructor()
    {
        super(Flight)
    }

    async getAllFlights(filter,sort)
    {
        const flights= await Flight.findAll({
            where:filter,
            order:sort
        })
        return flights
    }

    async updateRemainingSeats(flightId,seats,dec=true)
    {
        // Row-level lock inside a transaction: concurrent bookings on the same
        // flight queue up here instead of both reading the same seat count.
        const transaction=await db.sequelize.transaction()
        try{
            const flight=await Flight.findByPk(flightId,{
                lock:transaction.LOCK.UPDATE,
                transaction
            })
            if(!flight)
            {
                throw new AppError('Flight not found',StatusCodes.NOT_FOUND)
            }
            if(dec)
            {
                if(flight.totalSeats<+seats)
                {
                    throw new AppError('Not enough seats available',StatusCodes.BAD_REQUEST)
                }
                await flight.decrement('totalSeats',{by:+seats,transaction})
            }
            else{
                await flight.increment('totalSeats',{by:+seats,transaction})
            }
            await transaction.commit()
            await flight.reload()
            return flight
        }catch(error)
        {
            await transaction.rollback()
            throw error
        }
    }
}


module.exports=FlightRepository
