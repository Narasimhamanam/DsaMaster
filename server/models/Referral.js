const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referralCode: { type: String, required: true },
    xpRewarded: { type: Number, default: 100 },
    isRewarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Referral', referralSchema);
