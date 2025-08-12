

  function checkAdminKey(){
    const keyInput = document.getElementById("adminKey");
    const errorMsg = document.getElementById("errorMsg");
    if(keyInput.value.trim() === "justJimi2027"){
      document.getElementById("adminOverlay").style.display = "none";
    } else {
      errorMsg.style.display = "block";
      keyInput.value = "";
      keyInput.focus();
    }
  }

  // Prevent access if overlay is active
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("adminKey").focus();
  });
