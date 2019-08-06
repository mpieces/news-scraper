const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var HeadlineSchema = new Schema({
   title: {
       type: String,
       required: true,
       unique: true
   },
   link: {
       type: String,
       required: true
   },
   photo: {
       type: String,
       required: true
   },
   saved: {
       type: Boolean,
       default: false
   },
   note: {
       type: Schema.Types.ObjectId,
       ref: "Note"
   }
});
// This creates our model from the above schema, using mongoose's model method
const Headline = mongoose.model("Headline", HeadlineSchema);
// Export the Headline model
module.exports = Headline;