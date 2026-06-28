const mongoose = require("mongoose");

const birthdaySchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },

    contact: {
        type: String,
        default: ""
    },

   
    gift: {
        type: String,
        default: ""
    },

    reminder: {
        type: Number,
        default: 0
    },

    image: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Birthday", birthdaySchema);