// Mock WhatsApp service
const sendWhatsAppMessage = async (phone, message) => {
  try {
    // In a real implementation, integrate with WhatsApp Business API
    console.log(`📱 WhatsApp message to ${phone}: ${message}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { success: true, messageId: `msg_${Date.now()}` };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsAppMessage };