console.log("Simulador ECG iniciado");

const rhythmSelect = document.getElementById("rhythmSelect");
const interpretacionEl = document.getElementById("interpretacionTexto");

function actualizarTexto(nombreRitmo) {
    const ritmo = rhythms[nombreRitmo];
    if (ritmo && interpretacionEl) {
        interpretacionEl.textContent = ritmo.texto;
    }
}

rhythmSelect.addEventListener("change", (e) => {
    setRhythm(e.target.value);
    actualizarTexto(e.target.value);
});

const speedSelect = document.getElementById("speedSelect");
speedSelect.addEventListener("change", (e) => {
    speed = e.target.value === "50" ? 2 : 1;
});

const gainSelect = document.getElementById("gainSelect");
gainSelect.addEventListener("change", (e) => {
    gainMultiplier = parseFloat(e.target.value);
});

// Mostrar texto del ritmo inicial al cargar
actualizarTexto("sinusal");