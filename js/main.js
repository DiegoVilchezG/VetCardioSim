console.log("Simulador ECG iniciado");

const rhythmSelect = document.getElementById("rhythmSelect");

rhythmSelect.addEventListener("change", (e) => {
  setRhythm(e.target.value);
});