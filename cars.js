// === DREAMLAND SMART INVENTORY + FILTER SYSTEM ===

let allCars = [];

function renderCars(cars) {
  const container = document.querySelector(".listings");
  container.innerHTML = "";
  if (!cars.length) {
    container.innerHTML = "<p style='text-align:center;color:#ff5555;'>🚫 No cars match your filters.</p>";
    return;
  }

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
            <ul class="good">${car.good.map(g => `<li>${g}</li>`).join("")}</ul>
            <ul class="bad">${car.bad.map(b => `<li>${b}</li>`).join("")}</ul>
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
}

function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const brand = document.getElementById("brandFilter").value;
  const price = document.getElementById("priceFilter").value;

  let filtered = allCars.filter(c => 
    (!search || c.make.toLowerCase().includes(search) || c.model.toLowerCase().includes(search)) &&
    (!brand || c.make === brand)
  );

  if (price) {
    const p = parseInt(price);
    filtered = filtered.filter(c => {
      const cp = parseInt(c.price.replace(/,/g, ""));
      if (p === 5000000) return cp < 5000000;
      if (p === 10000000) return cp >= 5000000 && cp <= 10000000;
      if (p === 20000000) return cp >= 10000000 && cp <= 20000000;
      if (p === 30000000) return cp > 20000000;
      return true;
    });
  }

  renderCars(filtered);
}

// Fetch car data
fetch("cars.json")
  .then(res => res.json())
  .then(data => {
    allCars = data;
    renderCars(allCars);
  })
  .catch(err => {
    document.querySelector(".listings").innerHTML = "<p style='text-align:center;color:#ff5555;'>⚠️ Could not load inventory.</p>";
    console.error(err);
  });
