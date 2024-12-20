const express = require('express');
const router = express.Router();
const { createReservation, editReservation,cancelReservation, manageReservation,viewReservations ,getAllReservations,getAvailableTables} = require('../controller/reservationController');

const { auth, Roles } = require('../middleware/authMiddleware');

// cancel reservation (both)
router.patch('/cancel/:reservationId', cancelReservation); 

router.get('/tables', fetchAvailableTables);

// User Routes
// create reservation
router.post('/create', auth([Roles.User]), createReservation); 
// edit reservation
router.put('/edit/:reservationId', auth([Roles.User]), editReservation); 
// View user's reservations
router.get('/view', auth([Roles.User]), viewReservations);


router.get('/tables', auth([Roles.User]), getAvailableTables);


// Admin Routes
// manage reservations 
router.put('/manage/:reservationId', auth([Roles.Admin]), manageReservation); // Admin Manage Reservation (Edit or Cancel)

router.get('/reservations', auth([Roles.Admin]), getAllReservations);


module.exports = router;
