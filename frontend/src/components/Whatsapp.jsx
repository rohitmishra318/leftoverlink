// src/components/common/WhatsAppJoinButton.jsx

import React from 'react';

function WhatsAppJoinButton() {
  const whatsappGroupLink = "https://chat.whatsapp.com/YOUR_GROUP_INVITE_LINK";

  return (
    <a
      href={whatsappGroupLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 transition-transform transform hover:scale-105"
    >
      <img
        src="https://img.icons8.com/color/48/000000/whatsapp--v1.png"
        alt="WhatsApp"
        className="w-6 h-6"
      />
      Join WhatsApp
    </a>
  );
}

export default WhatsAppJoinButton;
