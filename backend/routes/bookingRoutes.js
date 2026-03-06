const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (User)
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, seats, attendeeInfo } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status === 'cancelled') return res.status(400).json({ success: false, message: 'Event is cancelled' });
    if (event.availableSeats < seats) return res.status(400).json({ success: false, message: `Only ${event.availableSeats} seats available` });

    // Check if user already booked this event
    const existingBooking = await Booking.findOne({ user: req.user.id, event: eventId, status: 'confirmed' });
    if (existingBooking) return res.status(400).json({ success: false, message: 'You have already booked this event' });

    const totalAmount = event.price * seats;

    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      seats,
      totalAmount,
      attendeeInfo,
      paymentStatus: event.price === 0 ? 'paid' : 'unpaid'
    });

    // Update available seats
    event.availableSeats -= seats;
    await event.save();

    await booking.populate(['user', 'event']);

    res.status(201).json({ success: true, message: 'Booking confirmed!', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/my
// @desc    Get current user's bookings
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('event')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event user');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (booking.status === 'cancelled') return res.status(400).json({ success: false, message: 'Booking is already cancelled' });

    booking.status = 'cancelled';
    await booking.save();

    // Restore seats
    await Event.findByIdAndUpdate(booking.event, { $inc: { availableSeats: booking.seats } });

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
