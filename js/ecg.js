const canvas = document.getElementById("ecg-canvas");
const ctx = canvas.getContext("2d");

const centerY = canvas.height / 2;
let prevX = 0;
let prevY = centerY;

// Tiempo
let time = 0;
const fps = 120;
const dt = 1 / fps;

const rhythms = {
    sinusal: {
        heartRate: 75,
        texto: "Ritmo sinusal normal. Frecuencia cardíaca entre 60–160 lpm en perros. Ondas P presentes y uniformes precediendo cada QRS. Intervalo PR constante. QRS estrecho. Ritmo regular.",
        p: { present: true, start: 0.11, end: 0.22, amplitude: 14 },
        qrs: { start: 0.27, end: 0.34, qAmp: 20, rAmp: 80 },
        t: { present: true, start: 0.37, end: 0.6, amplitude: 22 },
    },
    riva: {
        heartRate: 80,
        texto: "Ritmo idioventricular acelerado (RIVA). FC entre 60–100 lpm. Ausencia de onda P. QRS ancho y bizarro por despolarización ventricular anómala. Onda T discordante (polaridad opuesta al QRS). Frecuentemente asociado a reperfusión miocárdica o desequilibrios electrolíticos.",
        p: { present: false },
        qrs: { start: 0.20, end: 0.42, qAmp: 8, rAmp: 65 },
        t: { present: true, start: 0.45, end: 0.78, amplitude: -28 },
    },
    escapeVentricular: {
        heartRate: 30,
        texto: "Complejo de escape ventricular. FC menor a 40 lpm. Ritmo de rescate ante falla del marcapasos sinusal. Ausencia de onda P. QRS muy ancho con morfología aberrante. Onda T discordante. Requiere evaluación urgente de la causa subyacente.",
        p: { present: false },
        qrs: { start: 0.15, end: 0.48, qAmp: 45, rAmp: 55 },
        t: { present: true, start: 0.52, end: 0.88, amplitude: -35 },
    },
    arritmia: {
        heartRate: 65,
        variability: 6,
        texto: "Arritmia sinusal respiratoria. Variación cíclica de la FC asociada a la respiración. Frecuente y normal en perros. Ondas P presentes y constantes. QRS estrecho. El ritmo se acelera en inspiración y enlentece en espiración.",
        p: { present: true, start: 0.11, end: 0.22, amplitude: 14 },
        qrs: { start: 0.27, end: 0.34, qAmp: 20, rAmp: 80 },
        t: { present: true, start: 0.37, end: 0.6, amplitude: 22 },
    },
};

let currentRhythm = "sinusal";
let beatConfig = rhythms[currentRhythm];
let beatDuration = 60 / beatConfig.heartRate;

function setRhythm(name){
    if (!rhythms[name]) return;
    currentRhythm = name;
    beatConfig = rhythms[currentRhythm];
    beatDuration = 60 / beatConfig.heartRate;
}

hrSlider.addEventListener("input", (e) => {
  beatConfig.heartRate = parseInt(e.target.value);
});

// Barrido
let x = 0;
let speed = 2;
let gainMult = 1;

// Grilla
function drawGrid() {
    const small = 10;
    const big = 50;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= canvas.width; i += small) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.strokeStyle = i % big === 0 ? "#cccccc" : "#eeeeee";
        ctx.lineWidth = i % big === 0 ? 1 : 0.5;
        ctx.stroke();
    }

    for (let i = 0; i <= canvas.height; i += small) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.strokeStyle = i % big === 0 ? "#cccccc" : "#eeeeee";
        ctx.lineWidth = i % big === 0 ? 1 : 0.5;
        ctx.stroke();
    }
}

// Valor de la onda P
function pWave(fase) {
    if (!beatConfig.p.present) return 0;
    const { start, end, amplitude } = beatConfig.p;

    if (fase < start || fase > end) return 0;

    const u = (fase - start) / (end - start);

    return ((1 - Math.cos(2 * Math.PI * u)) / 2) * amplitude;
}

function qrsWave(fase) {
    const { start, end, qAmp, rAmp } = beatConfig.qrs;

    if (fase < start || fase > end) return 0;

    const u = (fase - start) / (end - start);

    // comportamiento normal
    if (!beatConfig.type || beatConfig.type !== "qrsAncha") {

        if (u < 0.3) return -qAmp * (u / 0.3);
        if (u < 0.6) return -qAmp + rAmp * ((u - 0.3) / 0.3);
        return rAmp * (1 - (u - 0.6) / 0.4);
    }

    // QRS ancho (más redondeado y largo)
    if (u < 0.5) {
        return rAmp * Math.sin(Math.PI * (u / 0.5));
    }

    return rAmp * Math.sin(Math.PI * (1 - (u - 0.5) / 0.5));
}

function tWave(fase) {
    if (!beatConfig.t.present) return 0;
    const { start, end, amplitude } = beatConfig.t;

    if (fase < start || fase > end) return 0;

    const u = (fase - start) / (end - start);

    return ((1 - Math.cos(2 * Math.PI * u)) / 2) * amplitude;
}

function heartbeat(fase){
    let value = 0;
    value += pWave(fase);
    value += qrsWave(fase);
    value += tWave(fase);

    return value*gainMult;
}

// Inicializar
drawGrid();

function draw() {

    let currentHeartRate = beatConfig.heartRate;
    if (currentRhythm === "arritmia"){
        const variability = beatConfig.variability;

        currentHeartRate = beatConfig.heartRate + Math.sin(time*0.2) * variability;
    } 
    beatDuration = 60 / currentHeartRate;
    const fase = time % beatDuration;

    const yOffset = heartbeat(fase);
    const y = centerY - yOffset;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    ctx.stroke();

    prevX = x;
    prevY = y;

    x += speed;
    time += dt;

    if (x >= canvas.width) {
        prevX = 0;
        prevY = centerY;
        x = 0;
        drawGrid();
    }

    requestAnimationFrame(draw);
}

draw();
