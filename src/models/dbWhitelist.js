const mongoose = require('mongoose');

const dbWhitelistSchema = new mongoose.Schema({
  serverId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  }
});

const dbWhitelist = mongoose.model('dbWhitelist', dbWhitelistSchema);

module.exports = dbWhitelist;