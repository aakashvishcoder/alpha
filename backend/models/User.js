// creating the user schema to save the data into the database

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // initialize mongoose and bcryptjs

const UserSchema = new mongoose.Schema({ // creating the user schema
    /*
        Required items:
        - name
        - email
        - password
        - school name (might remove)
        - year level
    */ 
   name: {
    type: String,
    required: true,
    trim: true,
   },
   email: {
    type: String, 
    required: true,
    unique: true, 
    lowercase: true, 
    trim: true,
   },
   password: {
    type: String,
    required: true,
    minlength: 6, // subject to change
   },
   schoolName: {
    type: String,
    required: false,
    trim: true,
   },
   yearLevel: {
    type: String,
    enum: ["Year 9", "Year 10", "Year 11", "Year 12"],
    default: ["Year 11"]
   }
}, {
    timestamps: true
});

// to encrypt the password, we create a hash then save
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12); // hash the password
    next();
});

// comparing the password to make sure its correct
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);