window.addEventListener("load", () => {
  var jsInitChecktimer = setInterval(checkForJS_Finish, 111);

  function checkForJS_Finish () {
    if (document.querySelectorAll("a[class^='TokenWallet_detailLink']").length > 0) {
      clearInterval (jsInitChecktimer);
      const links = document.querySelectorAll("a[class^='TokenWallet_detailLink']");
      links.forEach(link => {
        if (link.textContent.trim() === "ETH") {
          link.innerHTML = `ETH <span style="color: red;">Bearish</span>`;
        }
      });  
    }
  }
});
