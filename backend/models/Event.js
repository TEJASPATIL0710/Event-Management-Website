const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Conference', 'Workshop', 'Concert', 'Sports', 'Festival', 'Networking', 'Exhibition', 'Webinar', 'Other']
  },
  date: {
    type: Date,
    required: [true, 'Event start date is required']
  },
  endDate: {
    type: Date,
    default: null   // null = single day event
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  endTime: {
    type: String
  },
  isMultiDay: {
    type: Boolean,
    default: false
  },
  location: {
    venue: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: 'India' }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  isFree: {
    type: Boolean,
    default: false
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'Must have at least 1 seat']
  },
  availableSeats: {
    type: Number
  },
  image: {
    type: String,
    default: ''
  },
  tags: [{ type: String }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Set availableSeats and isMultiDay before saving
eventSchema.pre('save', function (next) {
  if (this.isNew) {
    this.availableSeats = this.totalSeats;
  }
  if (this.price === 0) this.isFree = true;
  // Auto-set isMultiDay if endDate is provided and different from start date
  if (this.endDate) {
    const start = new Date(this.date).toDateString();
    const end = new Date(this.endDate).toDateString();
    this.isMultiDay = start !== end;
  } else {
    this.isMultiDay = false;
  }
  next();
});

// Virtual: number of days for multi-day events
eventSchema.virtual('durationDays').get(function () {
  if (!this.isMultiDay || !this.endDate) return 1;
  const ms = new Date(this.endDate) - new Date(this.date);
  return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
});

// Virtual for booked seats
eventSchema.virtual('bookedSeats').get(function () {
  return this.totalSeats - this.availableSeats;
});

module.exports = mongoose.model('Event', eventSchema);
