const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: false });

const FlashcardSetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  cards: {
    type: [CardSchema], // ✅ fixed: use correct variable name
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("FlashcardSet", FlashcardSetSchema);
