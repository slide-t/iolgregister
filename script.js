setInterval(function () {
  const devtools = /./;
  devtools.toString = function () {
    throw "Dev tools blocked";
  };
  console.log("%c", devtools);
}, 1000);

if (window.outerWidth - window.innerWidth > 100) {
  alert("Developer tools are open. Access denied.");
  window.location.href = "about:blank";
}
