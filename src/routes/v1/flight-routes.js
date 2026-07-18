const express=require('express')

const{FlightController}=require('../../controllers')

const{FlightMiddlewares}=require('../../middlewares')
const router=express.Router();


router.post('/',FlightMiddlewares.validateCreateRequest,FlightController.createFlight)
router.get('/',FlightController.getAllFlights)
router.get('/:id',FlightController.getFlightById)

router.patch('/:id/seats',FlightMiddlewares.validateUpdateSeatsRequest,FlightController.updateSeats)
// router.get('/:id',AirportController.getAirportById)
// router.delete('/:id',AirportController.destroyAirportById)

module.exports=router