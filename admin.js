
  const CODES_SHEET_URL = "https://sheetdb.io/api/v1/YOUR_CODES_SHEET_ID"; // replace with your codes sheet ID

  document.getElementById("assignGeneralBtn").addEventListener("click", () => {
    const ward = document.getElementById("assignWard").value.trim();
    const code = document.getElementById("assignGeneralCode").value.trim();

    if (!ward || !code) {
      alert("Please enter both Ward and Code.");
      return;
    }

    // First check if this ward already exists in codes sheet
    fetch(`${CODES_SHEET_URL}/search?ward=${encodeURIComponent(ward)}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          // Ward exists → Update
          fetch(`${CODES_SHEET_URL}/ward/${encodeURIComponent(ward)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code })
          })
            .then(() => alert(`Code updated for ${ward}`))
            .catch(err => console.error(err));
        } else {
          // Ward doesn't exist → Create new
          fetch(CODES_SHEET_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ ward: ward, code: code }])
          })
            .then(() => alert(`Code assigned to ${ward}`))
            .catch(err => console.error(err));
        }
      });
  });

