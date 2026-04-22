let canvas;
let history = [];
let redoStack = [];
let isRestoring = false;

window.addEventListener('load', function () {

    canvas = new fabric.Canvas('canvas', {
        preserveObjectStacking: true
    });

    resizeCanvas();
    createRoomStructure();

    canvas.on('object:added', saveState);
    canvas.on('object:modified', saveState);
    canvas.on('object:removed', saveState);

    saveState();

    const selectedLayout = JSON.parse(localStorage.getItem('selectedLayout'));

    if(selectedLayout){
    loadLayout(selectedLayout);
    localStorage.removeItem('selectedLayout');
    }

    const params = new URLSearchParams(window.location.search);
    const designId = params.get('design_id');

    if (designId) {
        fetch(`/api/load-design/${designId}`)
            .then(res => res.json())
            .then(data => {
                canvas.loadFromJSON(data, () => {
                    canvas.renderAll();
                });
            });
    }
});

/* ================= ROOM STRUCTURE ================= */

function createRoomStructure(){

    const wall = new fabric.Rect({
        left: 0,
        top: 0,
        width: canvas.getWidth(),
        height: canvas.getHeight() * 0.7,
        fill: '#f1efe9',  // soft beige wall
        selectable: false,
        evented: false
    });

    const floor = new fabric.Rect({
        left: 0,
        top: canvas.getHeight() * 0.7,
        width: canvas.getWidth(),
        height: canvas.getHeight() * 0.3,
        fill: '#c8b89c',  // warm wooden tone
        selectable: false,
        evented: false
    });

    canvas.add(wall);
    canvas.add(floor);

    wall.sendToBack();
    floor.sendToBack();
}

/* ================= RESIZE ================= */

function resizeCanvas() {
    if (!canvas) return;

    const workspace = document.querySelector('.workspace');
    if (!workspace) return;

    const rect = workspace.getBoundingClientRect();

    canvas.setWidth(rect.width * 0.9);
    canvas.setHeight(rect.height * 0.9);
    canvas.renderAll();
}

window.addEventListener('resize', resizeCanvas);

/* ================= ADD FURNITURE MANUALLY ================= */

function addItem(imgElement) {

    fabric.Image.fromURL(imgElement.src, function (img) {

        const maxSize = 180;
        const scale = Math.min(
            maxSize / img.width,
            maxSize / img.height
        );

        img.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() * 0.7,
            originX: 'center',
            originY: 'bottom',
            scaleX: scale,
            scaleY: scale,
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.2)',
                blur: 25,
                offsetY: 15
            })
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
    });
}

/* ================= HISTORY ================= */

function saveState() {
    if (!canvas || isRestoring) return;
    history.push(JSON.stringify(canvas));
    redoStack = [];
}

function undo() {
    if (history.length > 1) {

        isRestoring = true;

        redoStack.push(history.pop());

        canvas.loadFromJSON(history[history.length - 1], () => {
            canvas.renderAll();
            isRestoring = false;
        });
    }
}

function redo() {
    if (redoStack.length > 0) {

        isRestoring = true;

        const state = redoStack.pop();
        history.push(state);

        canvas.loadFromJSON(state, () => {
            canvas.renderAll();
            isRestoring = false;
        });
    }
}

/* ================= SAVE ================= */

function saveDesign() {
    document.getElementById('saveModal').style.display = 'flex';
}

function closeSaveModal() {
    document.getElementById('saveModal').style.display = 'none';
}

function confirmSaveDesign() {
    const name = document.getElementById('designNameInput').value.trim();

    if (!name) {
        alert("Please enter design name");
        return;
    }

    fetch('/api/save-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            canvas: canvas.toJSON()
        })
    })
    .then(() => {
        closeSaveModal();
        showToast("Design saved successfully ✨", "success");
    })
    .catch(() => {
        showToast("Error saving design", "error");
    });
    let recent = JSON.parse(localStorage.getItem("recentDesigns")) || [];

recent.push({
    name: name,
    time: new Date().toLocaleString()
});

localStorage.setItem("recentDesigns", JSON.stringify(recent));

}

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    toast.innerHTML = `
        <div class="toast-content ${type}">
            <span>${message}</span>
        </div>
    `;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* ================= LAYOUT ENGINE ================= */
function showLayoutOptions(layouts){

    const layoutModal = document.createElement("div");
    layoutModal.className = "layout-modal";

    layoutModal.innerHTML = `
        <div class="layout-box">
            <h2>✨ Choose Your Interior Style</h2>

            <div class="layout-options">
                <div class="layout-card" data-index="0">
                    <h3>Modern Minimal</h3>
                    <p>Clean balanced composition</p>
                </div>

                <div class="layout-card" data-index="1">
                    <h3>Cozy Warm Living</h3>
                    <p>Comfort-focused arrangement</p>
                </div>

                <div class="layout-card" data-index="2">
                    <h3>Luxury Lounge</h3>
                    <p>Premium spacious layout</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(layoutModal);

    document.querySelectorAll(".layout-card").forEach(card => {
        card.addEventListener("click", function(){

            const index = this.dataset.index;
            loadLayout(layouts[index]);

            layoutModal.remove();
        });
    });
}

function loadLayout(layout){

    canvas.clear();

    createRoomStructure(); // keep room structure

    const cw = canvas.getWidth();
    const ch = canvas.getHeight();

    const centerX = cw / 2;
    const floorY = ch * 0.7;

    layout.forEach(item => {

        fabric.Image.fromURL(item.src, function(obj){

            let scaleFactor = 0.5;

            // Detect furniture type from filename
            if(item.src.includes("sofa")){
                scaleFactor = cw / 1200;
                obj.set({
                    left: centerX,
                    top: floorY - 120,
                    originX: 'center',
                    originY: 'bottom'
                });
            }

            else if(item.src.includes("coffee") || item.src.includes("t1") || item.src.includes("t2")){
                scaleFactor = cw / 1800;
                obj.set({
                    left: centerX,
                    top: floorY - 40,
                    originX: 'center',
                    originY: 'bottom'
                });
            }

            else if(item.src.includes("tv")){
                scaleFactor = cw / 1500;
                obj.set({
                    left: centerX,
                    top: ch * 0.35,
                    originX: 'center',
                    originY: 'bottom'
                });
            }

            else if(item.src.includes("plant")){
                scaleFactor = cw / 2500;
                obj.set({
                    left: cw * 0.85,
                    top: floorY - 20,
                    originX: 'center',
                    originY: 'bottom'
                });
            }

            else{
                obj.set({
                    left: centerX,
                    top: floorY - 60,
                    originX: 'center',
                    originY: 'bottom'
                });
            }

            obj.scale(scaleFactor);

            obj.set({
                shadow: new fabric.Shadow({
                    color: 'rgba(0,0,0,0.25)',
                    blur: 30,
                    offsetY: 20
                }),
                opacity: 0
            });

            canvas.add(obj);

            obj.animate('opacity', 1, {
                duration: 700,
                onChange: canvas.renderAll.bind(canvas)
            });

        });

    });

}

function calculateDesignScore() {
    const items = document.querySelectorAll('.furniture-item');

    if (items.length === 0) return 0;

    let score = 5;

    const types = new Set();
    items.forEach(i => types.add(i.dataset.type));

    score += types.size * 0.6;

    if (items.length >= 3) score += 1.5;

    return Math.min(10, score).toFixed(1);
}

function updateAIScore() {
    document.getElementById("aiScore").textContent =
        calculateDesignScore();
}

function generateInsight() {
    const items = document.querySelectorAll('.furniture-item');
    const insightBox = document.getElementById("designerInsights");
    const text = document.getElementById("insightText");

    if (items.length < 2) {
        text.innerText = "Try adding more furniture for better balance.";
    } else if (items.length < 4) {
        text.innerText = "Nice start! Add decorative elements like plants or lamps.";
    } else {
        text.innerText = "Great layout! Maintain spacing for a premium interior feel.";
    }

    insightBox.classList.remove("hidden");
}

function showRecommendations() {
    const items = [...document.querySelectorAll('.furniture-item')]
        .map(i => i.dataset.type);

    let recommendations = [];

    if (items.includes("sofa")) {
        recommendations.push("☕ Add a coffee table");
        recommendations.push("🪔 Add a floor lamp");
    }

    if (items.includes("bed")) {
        recommendations.push("🛏 Add side tables");
    }

    const box = document.getElementById("insightText");

    if (recommendations.length > 0) {
        box.innerHTML += "<br><br><b>Live AI Recommendations:</b><br>"
            + recommendations.join("<br>");
    }
}

// ================= AI DESIGN GENERATOR =================

async function generateDesign() {

    const prompt = document.getElementById("promptInput").value;

    if(!prompt){
        alert("Please enter a prompt");
        return;
    }

    try{

        const response = await fetch("/generate_design", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: prompt
            })
        });

        const data = await response.json();

        displayResults(data);

    }catch(error){
        console.error(error);
        alert("AI generation failed");
    }
}


function displayResults(data){

    const suggestionBox = document.getElementById("suggestions");

    if(!suggestionBox) return;

    suggestionBox.innerHTML = "";

    data.suggestions.forEach(item => {

        const li = document.createElement("li");
        li.innerText = item;

        suggestionBox.appendChild(li);

    });

}