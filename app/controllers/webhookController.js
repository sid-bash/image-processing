const webhookFunction = (req, res) => {
  console.log("Webhook received:", req.body);
  res.status(200).send("Webhook received");
};

module.exports = { webhookFunction };
