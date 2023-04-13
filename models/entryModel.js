const mongoose = require('mongoose');
const EntrySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
      aut: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: false
      },
},
{
    collection: "entries",
}
);

const MyEntry = mongoose.model('entries', EntrySchema);

module.exports = MyEntry;