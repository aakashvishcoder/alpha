const mongoose = require('mongoose'); // initialize mongoose

const ProjectSchema = new mongoose.Schema({
    /* Required Items:
        - title
        - data (graphs, tables and such)
        - user
    */
   title: {
    type: String,
    default: 'Untitled Project',
    trim: true,
   },
   data: {
    type: Object,
    required: true,
    default: {}
   },
   user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
   }
}, {
    timestamps: true
});

ProjectSchema.index({ user: 1 }); // for project lookups eventually

module.exports = mongoose.model('Project', ProjectSchema);