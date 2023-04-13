const mongoose = require('mongoose');
const ImageSchema = new mongoose.Schema({
   image: String
},
{
    collection: "images",
}
);

const Myimage = mongoose.model('images', ImageSchema);

module.exports = Myimage;