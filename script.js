setInterval(function () {
  const devtools = /./;
  devtools.toString = function () {
    throw "Dev tools blocked";
  };
  console.log("%c", devtools);
}, 1000);
