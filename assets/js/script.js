window.onload = () => {
  copyrightyear.textContent = new Date().getFullYear();

  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let d = new Date();
  
  function update_time() {
    d = new Date();
    time.textContent = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate().toString().padStart(2, "0")}, ${d.getFullYear()}, ${d.getHours() < 12 ? `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} AM` : `${(d.getHours()-12).toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} PM`}`;
    setInterval(update_time, 60000);
  }

  setTimeout(update_time, 60000 - d.getMilliseconds() - d.getSeconds() * 1000);
  time.textContent = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate().toString().padStart(2, "0")}, ${d.getFullYear()}, ${d.getHours() < 12 ? `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} AM` : `${(d.getHours() - (d.getHours() > 12 ? 12 : 0)).toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} PM`}`;

  let data;
  let datalen;
  let dataindex = 0;

  let fuse;

  function load() {
    let nomore = false;
    let toload = 10;
    
    if (dataindex + toload >= datalen) {
      toload = datalen - dataindex;
      nomore = true;
    }

    let rows = data.slice(dataindex, dataindex + toload);
    for (let index in rows) {
      let row = rows[index];
      
      let title = row.title;
      
      let datetime = new Date(row.time);
      let date = datetime.toLocaleDateString();
      let time = datetime.toLocaleTimeString();

      let description = row.description;
      let category = row.category;
      
      loadmorebutton.insertAdjacentHTML("beforebegin", `<div class="card-link" data-bs-toggle="modal" data-bs-target="#rowmodal${index}"><div class="card"><div class="card-header"><div class="d-flex align-items-center justify-content-between"><div class="d-flex align-items-center"><div><h6 class="card-title mb-0">${title}</h6><p class="small mb-0">${datetime.toLocaleString()}</p></div></div></div></div><div class="card-body"><p class="mb-0">${description}</p></div><div class="card-footer border-0 d-flex justify-content-between align-items-center"><p class="mb-0">Category: ${category}</p><button class="btn btn-primary-soft btn-sm">Learn more</button></div></div></div><div class="modal" tabindex="-1" id="rowmodal${index}"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">${title} <small>on ${date} at ${time}</small></h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><p>${description}</p><p><small>Category: ${category}</small></p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button></div></div></div></div>`);
    }

    dataindex += toload;
    
    if (nomore) {
      loadmorebutton.insertAdjacentHTML("beforebegin", `<div class="card"><div class="alert alert-info mb-0" role="alert">Nothing else to load.</div></div>`);
      loadmorebutton.remove();
    }
  }
  
  fetch("https://script.google.com/macros/s/AKfycbzZtYu_kEXFPXRWgWfCp8qPsP4g3ae7BrGO6f0UjsxqHr2tbKxsBs5Aq8VhS0E-5mlz/exec").then(e => e.json()).then(response => {
    if (typeof response === "object") data = response;
    else data = JSON.parse(response);
    datalen = data.length;
    
    document.querySelectorAll(".disposable").forEach(e => e.remove());
    load();

    if (document.getElementById("loadmorebutton")) {
      loadmorebutton.disabled = false;
      loadmorebutton.classList.remove("disabled");
    }

    fuse = new Fuse(data, {
      threshold: 0.3,
      keys: [
        "title",
        "description"
      ]
    });
  });

  let searchmodal = new bootstrap.Modal(searchresultsmodal);
  
  function search() {
    let query = searchinput.value;
    searchinput.value = "";

    searchresultsbody.innerHTML = fuse.search(query).map(match => `<div class="card"><div class="card-header"><div class="d-flex align-items-center justify-content-between"><div class="d-flex align-items-center"><div><h6 class="card-title mb-0">${match.item.title}</h6><p class="small mb-0">${new Date(match.item.time).toLocaleString()}</p></div></div></div></div><div class="card-body"><p class="mb-0">${match.item.description}</p></div><div class="card-footer border-0 d-flex justify-content-between align-items-center"><p class="mb-0">Category: ${match.item.category}</p></div></div>`).join("");

    searchmodal.show();
  }
  
  searchinput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      search();
    }
  });

  loadmorebutton.addEventListener("click", () => {
    loadmorebutton.setAttribute("aria-pressed", "true");
    loadmorebutton.classList.add("active");

    load();

    if (document.getElementById("loadmorebutton")) {
      loadmorebutton.setAttribute("aria-pressed", "false");
      loadmorebutton.classList.remove("active");
    }
  });
};