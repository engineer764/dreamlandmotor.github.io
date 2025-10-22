// === DREAMLAND SMART INVENTORY ===
fetch("cars.json")
  .then(response => response.json())
  .then(cars => {
    const container = document.querySelector(".listings");
    cars.forEach(car => {
      const box = document.createElement("div");
      box.className = "car-box";
      box.innerHTML = `
        <div class="car-header">
          <img src="${car.image}" alt="${car.year} ${car.make} ${car.model}">
          <div class="car-details">
            <h2>${car.year} ${car.make} ${car.model}</h2>
            <p class="price">NGN ${car.price}</p>
            <div class="specs">
              <div>Engine: ${car.engine}</div>
              <div>Transmission: ${car.transmission}</div>
              <div>Mileage: ${car.mileage}</div>
              <div>Year: ${car.year}</div>
              <div>VIN: ${car.vin}</div>
            </div>
            <div class="condition">
              <h4>Condition Summary</h4>
              <ul class="good">
                ${car.good.map(g => `<li>${g}</li>`).join("")}
              </ul>
              <ul class="bad">
                ${car.bad.map(b => `<li>${b}</li>`).join("")}
              </ul>
            </div>
            <div class="cta">
              <a href="https://wa.me/2349066616152?text=Hello%20Dreamland!%20I'm%20interested%20in%20the%20${car.year}%20${car.make}%20${car.model}." class="buy-btn">💬 Buy Now on WhatsApp</a>
              ${
                car.report
                  ? `<a href="${car.report}" class="report-link">📄 View Analyzer Report</a>`
                  : `<span class="report-link">📄 Analyzer Report Pending</span>`
              }
            </div>
          </div>
        </div>
      `;
      container.appendChild(box);
    });
  })
  .catch(err => {
    document.querySelector(".listings").innerHTML =
      "<p style='text-align:center;color:#ff5555;'>⚠️ Unable to load car listings.</p>";
    console.error("Dreamland inventory error:", err);
  });
