import mongoose from 'mongoose';

const userIgnoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  ignoredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
},{timestamps:true});

export default mongoose.model('UserIgnore', userIgnoreSchema);