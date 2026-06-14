const canvas = document.getElementById("ecg-canvas");
const ctx = canvas.getContext("2d");

const centerY = canvas.height / 2;
let prevX = 0;
let prevY = centerY;

// Tiempo
let time = 0;
const fps = 120;
const dt = 1 / fps;

let rhythms = {};
let currentRhythm = "sinusal";
let beatConfig = {};
let beatDuration = 1;
let manualHeartRate = null;
let atrialTime = 0; 

function setRhythm(name){
    if (!rhythms[name]) return;
    currentRhythm = name;
    beatConfig = rhythms[currentRhythm];
    beatDuration = 60 / beatConfig.heartRate;
    manualHeartRate = null;
    hrSlider.value = beatConfig.heartRate;
    x = 0;
    prevX = 0;
    prevY = centerY;
    time = 0;
    atrialTime = 0;
    drawGrid();
}

hrSlider.addEventListener("input", (e) => {
  manualHeartRate = parseInt(e.target.value);
});

// Barrido
let x = 0;
let speed = 2;
let gainMult = 1;

// Grilla
function drawGrid() {
    const small = 10;
    const big = 50;

    ctx.fillStyle = "#0a1a0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= canvas.width; i += small) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.strokeStyle = i % big === 0 ? "#1f5c33" : "#123320";
        ctx.lineWidth = i % big === 0 ? 1 : 0.5;
        ctx.stroke();
    }

    for (let i = 0; i <= canvas.height; i += small) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.strokeStyle = i % big === 0 ? "#1f5c33" : "#123320";
        ctx.lineWidth = i % big === 0 ? 1 : 0.5;
        ctx.stroke();
    }
}

function pWave(fase) {
    if (!beatConfig.p.present) return 0;
    const { start, end, amplitude } = beatConfig.p;

    if (fase < start || fase > end) return 0;

    const u = (fase - start) / (end - start);

    return ((1 - Math.cos(2 * Math.PI * u)) / 2) * amplitude;
}

function qrsWave(fase) {
    const { start, end, qAmp, rAmp, shape } = beatConfig.qrs;
    if (fase < start || fase > end) return 0;
    const u = (fase - start) / (end - start);

    // Sinusal / arritmia: QRS estrecho con q, R, s
    if (!shape || shape === "normal") {
        if (u < 0.3) return -qAmp * (u / 0.3);
        if (u < 0.6) return -qAmp + rAmp * ((u - 0.3) / 0.3);
        return rAmp * (1 - (u - 0.6) / 0.4);
    }

    // RIVA: R monofásico ancho, sin onda S
    if (shape === "monoR") {
        if (u < 0.35) return rAmp * Math.sin((Math.PI / 2) * (u / 0.35));
        return rAmp * Math.cos((Math.PI / 2) * ((u - 0.35) / 0.65));
    }

    // Escape VD: patrón rS — R pequeña seguida de S profunda
    if (shape === "rS") {
        if (u < 0.25) return rAmp * Math.sin(Math.PI * (u / 0.25));
        return -qAmp * Math.sin(Math.PI * ((u - 0.25) / 0.75));
    }

    return 0;
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

drawGrid();

function draw() {

    let currentHeartRate = manualHeartRate ?? beatConfig.heartRate;
    if (currentRhythm === "arritmia"){
        const variability = beatConfig.variability;

        currentHeartRate = (manualHeartRate ?? beatConfig.heartRate) + Math.sin(time*0.2) * variability;
    }

    if (beatConfig.special === "fibAuric"){
        const base = manualHeartRate ?? beatConfig.heartRate;
        currentHeartRate = base + (Math.sin(time*7.3)+Math.sin(time*13.7)) *beatConfig.variability*0.5;
    }

    beatDuration = 60 / currentHeartRate;
    const fase = time % beatDuration;

    let yOffset = 0;

    if (beatConfig.atrialRate){
        const atrialBeatDuration = 60 / beatConfig.atrialRate;
        const atrialFase = atrialTime % atrialBeatDuration;
        atrialTime += dt;

        const pCfg = beatConfig.p;
        const pStart = pCfg.start * atrialBeatDuration;
        const pEnd = pCfg.end * atrialBeatDuration;
        if (pCfg.present && atrialFase >= pStart && atrialFase <= pEnd){
            const u = (atrialFase - pStart) / (pEnd-pStart);
            yOffset += ((1-Math.cos(2*Math.PI*u))/2)*pCfg.amplitude;
        }
        yOffset += qrsWave(fase) + tWave(fase);
        yOffset *= gainMult;
    }
    else{
        yOffset = heartbeat(fase)

        if (beatConfig.special === "fibAuric"){
            yOffset += Math.sin(time*52)*2.5
                    + Math.sin(time * 83) * 2
                    + Math.sin(time * 31)*1.5;
        }
    }

    const y = centerY - yOffset;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#39ff6a";
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
    
    const fcDisplay = Math.round(60 / beatDuration);
    ctx.fillStyle = "rgba(10,26,15,0.9)";
    ctx.fillRect(canvas.width - 180, 4, 172, 40);
    ctx.font = "bold 24px monospace";
    ctx.fillStyle = "#39ff6a";
    ctx.textAlign = "right";
    ctx.fillText(`FC: ${fcDisplay} lpm`, canvas.width - 12, 34);

    requestAnimationFrame(draw);
}

fetch("data/rhythms.json")
    .then(res => res.json())
    .then(data => {
        rhythms = data;
        setRhythm("sinusal");
        actualizarTexto("sinusal");
        draw();
    });

