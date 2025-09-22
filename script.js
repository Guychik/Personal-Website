async function loadSidebar() {
  try {
    const res = await fetch("sidebar.html");
    const html = await res.text();
    document.getElementById("sidebar-container").innerHTML = html;
  } catch (err) {
    console.error("Failed to load sidebar:", err);
  }
}

window.addEventListener("DOMContentLoaded", loadSidebar);