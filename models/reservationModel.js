const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Refers to the Users table
      required: true,
    },
    table_number: {
      type: Number,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'completed'], // Possible reservation statuses
      default: 'active',
    },
  },
);

const reservationModel = mongoose.model('Reservation', reservationSchema);

module.exports = reservationModel;
