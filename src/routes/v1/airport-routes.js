const express=require('express')

const{AirportController}=require('../../controllers')

const{AirportMiddlewares}=require('../../middlewares')
const router=express.Router();


router.post('/',AirportMiddlewares.validateCreateRequest,AirportController.createAirport)
router.get('/',AirportController.getAllAirport)
router.get('/:id',AirportController.getAirportById)
router.delete('/:id',AirportController.destroyAirportById)

module.exports=router