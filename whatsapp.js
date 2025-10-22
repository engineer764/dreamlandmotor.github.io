// === Dreamland Floating WhatsApp Button ===
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.createElement("a");
  btn.href = "https://wa.me/2349066616152";
  btn.target = "_blank";
  btn.className = "whatsapp-float";
  btn.title = "Chat with Dreamland on WhatsApp";
  btn.innerHTML = "💬";
  document.body.appendChild(btn);

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
    .whatsapp-float i, .whatsapp-float span {
      margin-top: 14px;
      display: inline-block;
    }
  `;
  document.head.appendChild(style);
});
