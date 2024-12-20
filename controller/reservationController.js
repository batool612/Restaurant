const reservationModel = require('../models/reservationModel');
const tableModel = require('../models/tableModel');
//const { Roles } = require('../middlewares/authMiddleware');

// create  --user 
const createReservation = async (req,res)=>{
    try {
        const { table_number, time } = req.body;
        const user_id = req.user.id; 
         
        const table = await tableModel.findOne({ table_number });
        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }
        if (!table.isAvailable) {
            return res.status(400).json({ error: 'Table is already reserved' });
        }

        const newReservation = new reservationModel({
            user_id,
            table_number,
            time,
          });

          const savedReservation = await newReservation.save();
          table.isAvailable = false;
          await table.save();
          res.status(201).json({
            message: 'Reservation created successfully',
            reservation: savedReservation,
          });
    }
    catch (error){
        res.status(400).json({ error: error.message });
    }
};

// edit --user 

const editReservation = async (req,res)=>{
    try {
        const { reservationId } = req.params;
        const { table_number, time } = req.body;
      //  const customer_id = req.user.id;

        // Find the reservation by ID
       const reservation = await reservationModel.findById(reservationId);
       if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
       }

    //    if (reservation.customer_id.toString() !== customer_id) {
    //     return res.status(403).json({ error: 'You are not authorized to cancel this reservation' });
    //   }

      if (table_number) reservation.table_number = table_number;
      if (time) reservation.time = time;

       
      const updatedReservation = await reservation.save();
   
       res.status(200).json({
         message: 'Reservation updated successfully',
         reservation: updatedReservation,
       });
    }catch(error){
        res.status(400).json({ error: error.message });
    }
};

// cancel --both

const cancelReservation = async(req,res)=>{
    try{
        const { reservationId } = req.params;
       // const user_id = req.user.id;
        
        const reservation = await reservationModel.findById(reservationId);
        if (!reservation) {
         return res.status(404).json({ error: 'Reservation not found' });
        }
        
        // Mark the table as available
        const table = await tableModel.findOne({ table_number: reservation.table_number });
        if (table) {
            table.isAvailable = true;
            await table.save();
        } 

        reservation.status = 'canceled';
        const canceledReservation = await reservation.save();

        res.status(200).json({
        message: 'Reservation canceled successfully',
        reservation: canceledReservation,
    });
    }catch(error){
        res.status(400).json({ error: error.message });
    }
}

// manage -- admin 

const manageReservation = async (req, res) => {
  try {
      const { reservationId } = req.params;
      const { status } = req.body;


      console.log('Updating reservation:', reservationId, 'to status:', status);


      // Validate status
      const validStatuses = ['active', 'canceled', 'completed'];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status value' });
      }

      const reservation = await reservationModel.findById(reservationId);
      if (!reservation) {
          return res.status(404).json({ error: 'Reservation not found' });
      }

      reservation.status = status;

      // Update table availability when status is 'completed' or 'canceled'
      if (['completed', 'canceled'].includes(status)) {
          const table = await tableModel.findOne({ table_number: reservation.table_number });
          if (table) {
              table.isAvailable = true;
              await table.save();
          }
      }

      const updatedReservation = await reservation.save();

      res.status(200).json({
          message: 'Reservation status updated successfully',
          reservation: updatedReservation,
      });
  } catch (error) {
      console.error('Error updating reservation:', error.message);
      res.status(400).json({ error: error.message });
  }
};


// view (user)
const viewReservations = async (req, res) => {
    try {
      const user_id = req.user.id;
  
      // Find reservations for the logged-in user
      const reservations = await reservationModel.find({ user_id });
  
      if (!reservations.length) {
        return res.status(404).json({ message: 'No reservations found for this user' });
      }
  
      res.status(200).json({
        message: 'Reservations retrieved successfully',
        reservations,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }


  };



// get all (admin)
const getAllReservations = async (req, res) => {
    try {
        const reservations = await reservationModel.find(); // Filter reservations by the user

        res.status(200).json({
            message: 'Reservations retrieved successfully',
            reservations,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAvailableTables = async (req, res) => {
    try {
      // Fetch tables where isAvailable is true
      const availableTables = await tableModel.find({ isAvailable: true });
      res.status(200).json({
        message: 'Available tables retrieved successfully',
        tables: availableTables,
      });
    } catch (error) {
      console.error('Error fetching available tables:', error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = {
    getAvailableTables,
  };


module.exports = {
    createReservation,
    editReservation,
    cancelReservation,
    manageReservation,
    getAllReservations,
    viewReservations,getAvailableTables

};