module.exports = async (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Test endpoint works!',
    timestamp: new Date().toISOString()
  });
};
