
  
/*
  const data = {
    ogun: {
      "Ijebu Ode": {
        "Ward-1": [
          "001-Beside Co-Operative Building (Existing)",
          "002-Emmanuel School I, Italupe (Existing)",
          "003-Moslem School, Isoku (Existing)"
        ],
        "Ward-2": [
          "001-Baptist Day School, Ereko (Existing)",
          "002-Front of Our Lady’s School (Existing)",
          "003-Front of Alhaji Kukoyi’s House (Existing)"
        ]
        // Add Ward-3 to Ward-11 as needed...
      }
    }
  };*/
const data = {
  ogun: {
    "Ijebu Ode": {
      "Ward-1": [
        "001-BESIDE CO-OP BUILDING EXISTING PU",
        "002-EMMANUEL SCHOOL I ITALUPE EXISTING PU",
        "003-MOSLEM SCHOOL, ISOKU EXISTING PU",
        "004-FRONT OF TALABI’S HOUSE OLISA STREET I EXISTING PU",
        "005-IMORU ROAD JUNCTION EXISTING PU",
        "006-OKE-OLA ILORIN EXISTING PU",
        "007-EMMANUEL SCHOOL II EXISTING PU",
        "008-FRONT OF TALABI’S HOUSE OLISA STREET II EXISTING PU",
        "009-ADJACENT A. B SUNMOLA HOUSE, IJAGUN ROAD NEW PU",
        "010-BESIDE 3A’S HOTEL, IMORU ROAD NEW PU",
        "011-MOSLEM SCHOOL II ONDO ROAD NEW PU"
      ]
    }
  }
};
  // ====== DOM elements ======
  const stateEl = document.getElementById("state");
  const lgaEl = document.getElementById("lga");
  const wardEl = document.getElementById("ward");
  const unitEl = document.getElementById("unit");
  const lgaGroup = document.getElementById("lga-group");
  const wardGroup = document.getElementById("ward-group");
  const unitGroup = document.getElementById("unit-group");
  const biodataForm = document.getElementById("biodata-form");
  const dobEl = document.getElementById("dob");
  const ageEl = document.getElementById("age");
  const isVoterEl = document.getElementById("isVoter");
  const vinGroup = document.getElementById("vin-group");
  const vinEl = document.getElementById("vin");
  const isPartyEl = document.getElementById("isPartyMember");
  const partyIdGroup = document.getElementById("party-id-group");
  const regTime = document.getElementById("regTime");
  const timestampGroup = document.getElementById("timestamp-group");

  // ====== SheetDB endpoint ======
  const sheetDB_URL = "https://sheetdb.io/api/v1/ji8u767etbjge";

  // ====== Populate dropdowns ======
  stateEl.addEventListener("change", () => {
    const state = stateEl.value.toLowerCase();
    resetDropdown(lgaEl);
    resetDropdown(wardEl);
    resetDropdown(unitEl);
    hideElement(biodataForm);
    hideElement(wardGroup);
    hideElement(unitGroup);
    if (data[state]) {
      lgaGroup.classList.remove("hidden");
      for (let lga in data[state]) {
        const opt = document.createElement("option");
        opt.value = lga;
        opt.textContent = lga;
        lgaEl.appendChild(opt);
      }
    } else lgaGroup.classList.add("hidden");
  });

  lgaEl.addEventListener("change", () => {
    const state = stateEl.value.toLowerCase();
    const lga = lgaEl.value;
    resetDropdown(wardEl);
    resetDropdown(unitEl);
    hideElement(biodataForm);
    hideElement(unitGroup);
    if (data[state] && data[state][lga]) {
      wardGroup.classList.remove("hidden");
      for (let ward in data[state][lga]) {
        const opt = document.createElement("option");
        opt.value = ward;
        opt.textContent = ward;
        wardEl.appendChild(opt);
      }
    } else wardGroup.classList.add("hidden");
  });

  wardEl.addEventListener("change", () => {
    const state = stateEl.value.toLowerCase();
    const lga = lgaEl.value;
    const ward = wardEl.value;
    resetDropdown(unitEl);
    hideElement(biodataForm);
    if (data[state] && data[state][lga] && data[state][lga][ward]) {
      unitGroup.classList.remove("hidden");
      data[state][lga][ward].forEach(unit => {
        const opt = document.createElement("option");
        opt.value = unit;
        opt.textContent = unit;
        unitEl.appendChild(opt);
      });
    } else unitGroup.classList.add("hidden");
  });

  unitEl.addEventListener("change", () => {
    if (unitEl.value) biodataForm.classList.remove("hidden");
    else biodataForm.classList.add("hidden");
  });

  // ====== Age calculation ======
  dobEl.addEventListener("change", () => {
    if (!dobEl.value) {
      ageEl.value = "";
      return;
    }
    const dob = new Date(dobEl.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    ageEl.value = age;
  });

  // ====== VIN & Party toggles ======
  isVoterEl.addEventListener("change", () => {
    vinGroup.classList.toggle("hidden", isVoterEl.value !== "yes");
    if (isVoterEl.value !== "yes") vinEl.value = "";
  });

  isPartyEl.addEventListener("change", () => {
    partyIdGroup.classList.toggle("hidden", isPartyEl.value !== "yes");
    if (isPartyEl.value !== "yes") document.getElementById("partyId").value = "";
  });

  // ====== Admin timestamp ======
  document.addEventListener("DOMContentLoaded", () => {
    const isAdmin = true;
    if (isAdmin) {
      timestampGroup.classList.remove("hidden");
      regTime.value = new Date().toLocaleString();
    }
  });

  // ====== Utilities ======
  function resetDropdown(dropdown) {
    dropdown.innerHTML = '<option value="">-- Select --</option>';
  }
  function hideElement(el) {
    el.classList.add("hidden");
  }

  // ====== Form submit with VIN duplicate check ======
  biodataForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      fullname: document.getElementById("fullname").value.trim(),
      phoneNumber: (() => {
        let rawPhone = document.getElementById("phone").value.trim();
        if (!rawPhone.startsWith("+234")) {
          rawPhone = "+234" + rawPhone.replace(/^0/, "");
        }
        return rawPhone;
      })(),
      address: document.getElementById("address").value.trim(),
      ward: wardEl.value,
      pollingUnit: unitEl.value,
      vin: vinEl.value.trim(),
      gender: document.getElementById("gender").value
    };

    // Basic validation
    const required = ["fullname", "phoneNumber", "address", "ward", "pollingUnit", "vin"];
    for (const id of required) {
      if (!formData[id]) {
        alert("Please fill in all required fields.");
        return;
      }
    }

    // VIN length check (optional, adjust if needed)
    if (formData.vin.length !== 19) {
      alert("VIN must be exactly 19 characters.");
      return;
    }

    try {
      // Check for duplicate VIN
      const checkRes = await fetch(`${sheetDB_URL}/search?vin=${encodeURIComponent(formData.vin)}`);
      if (!checkRes.ok) throw new Error("Failed to check VIN");

      const existing = await checkRes.json();

      if (existing.length > 0) {
        alert("This VIN has already been registered. Duplicate registrations are not allowed.");
        return;
      }

      // Submit new record
      const sheetPayload = { data: [formData] };
      const sheetRes = await fetch(sheetDB_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetPayload)
      });

      if (!sheetRes.ok) throw new Error("SheetDB submission failed");

      alert("Member registered successfully!");
      e.target.reset();
      hideElement(biodataForm);
      resetDropdown(lgaEl);
      resetDropdown(wardEl);
      resetDropdown(unitEl);
      lgaGroup.classList.add("hidden");
      wardGroup.classList.add("hidden");
      unitGroup.classList.add("hidden");
    } catch (err) {
      console.error(err);
      alert("Error submitting data.");
    }
  });

  
