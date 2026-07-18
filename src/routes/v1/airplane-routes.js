const express=require('express')

const{AirplaneController}=require('../../controllers')

const{AirplaneMiddlewares}=require('../../middlewares')
const router=express.Router();


router.post('/',AirplaneMiddlewares.validateCreateRequest,AirplaneController.createAirplane)
router.get('/',AirplaneController.getAllAirplane)
router.get('/:id',AirplaneController.getAirplaneById)
router.delete('/:id',AirplaneController.destroyAirplaneById)

module.exports=router