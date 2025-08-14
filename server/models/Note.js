const mongoose = require('mongoose');

// Schema for each page inside a note
const PageSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, default: '' },
    content: { type: String, default: '' } // HTML content from editor
  },
  { _id: false } // Don't create a separate _id for each page entry
);

// Main Note schema
const NoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // Improve query performance for user-specific notes
    },
    fileName: { type: String, default: 'Untitled' }, // Name shown in the tab
    title: { type: String, default: '' },            // Optional display title
    pages: { type: [PageSchema], default: [] },      // Array of pages
    fontSize: { type: Number, default: 16 },
    currentTextColor: { type: String, default: '#000000' },
    currentHighlightColor: { type: String, default: '#ffff00' },
    lastModified: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }     // Soft delete flag
  },
  {
    timestamps: true // Adds createdAt and updatedAt fields automatically
  }
);

// Optional: text index for fast searching in fileName, title, and page contents
NoteSchema.index({
  fileName: 'text',
  title: 'text',
  'pages.title': 'text',
  'pages.content': 'text'
});

module.exports = mongoose.model('Note', NoteSchema);
