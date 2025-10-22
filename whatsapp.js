// === Dreamland Floating WhatsApp Button (with tooltip) ===
document.addEventListener("DOMContentLoaded", function () {
  // Create button
  const btn = document.createElement("a");
  btn.href = "https://wa.me/2349066616152";
  btn.target = "_blank";
  btn.className = "whatsapp-float";
  btn.title = "Chat with Dreamland on WhatsApp";
  btn.innerHTML = "💬";
  document.body.appendChild(btn);

  // Create tooltip
  const tooltip = document.createElement("div");
  tooltip.className = "whatsapp-tooltip";
  tooltip.textContent = "Chat with a Dreamland mechanic now 🚗";
  document.body.appendChild(tooltip);

  // Position tooltip dynamically
  btn.addEventListener("mouseenter", function () {
    tooltip.style.opacity = "1";
    tooltip.style.transform = "translateY(0)";
  });
  btn.addEventListener("mouseleave", function () {
    tooltip.style.opacity = "0";
    tooltip.style.transform = "translateY(10px)";
  });

  // Inject styles
  const style = document.createElement("style");
  style.innerHTML = `
    .whatsapp-float {
      position: fixed;
      width: 60px;
      height: 60px;
      bottom: 25px;
      right: 25px;
      background-color: #25D366;
      color: white;
      border-radius: 50%;
      text-align: center;
      font-size: 32px;
      box-shadow: 0 0 20px #25D36690;
      z-index: 1000;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      text-decoration: none;
    }
    .whatsapp-float:hover {
      transform: scale(1.1);
      box-shadow: 0 0 30px #25D366b0;
    }
    .whatsapp-tooltip {
      position: fixed;
      bottom: 95px;
      right: 25px;
      background-color: #11131a;
      color: #eaf6ff;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 0.9em;
      white-space: nowrap;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      box-shadow: 0 0 15px #00b4ff40;
      border: 1px solid #00b4ff60;
      z-index: 999;
    }
    @media (max-width: 600px) {
      .whatsapp-tooltip {
        font-size: 0.8em;
        bottom: 90px;
        right: 15px;
      }
    }
  `;
  document.head.appendChild(style);
});  `;
  document.head.appendChild(style);
});
