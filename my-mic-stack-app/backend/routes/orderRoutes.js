
const express = require('express');
const router = express.Router();
router.post("/:orderId/update-payment", async (req, res) => {
    const { orderId } = req.params;
    const { isPaid } = req.body;
  
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      order.isPaid = isPaid;
      console.log("order:", order);
  
      await order.save();
      return res
        .status(200)
        .json({ message: "Order updated successfully", order });
    } catch (error) {
      console.error("Error updating order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
 
  

  module.exports = router;
