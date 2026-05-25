console.log("Simulador ECG iniciado");

const rhythmSelect = document.getElementById("rhythmSelect");

rhythmSelect.addEventListener("change", (e) => {
  setRhythm(e.target.value);
});

const speedSelect = document.getElementById("speedSelect");
speedSelect.addEventListener("change", (e) =>{
  speed = e.target.value === "50" ? 2:1;
});

const gainSelect = document.getElementById("gainSelect");
gainSelect.addEventListener("change", (e) =>{
  gainMult = parseFloat(e.target.value);
});