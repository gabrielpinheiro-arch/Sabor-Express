/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI, Type } from '@google/genai';

// --- Type Definitions ---
// Using declare to inform TypeScript about the global L object from the Leaflet CDN
declare const L: any;
declare const Chart: any;

interface Stop {
  address: string;
  lat: number;
  lng: number;
  distanceFromPreviousStopKm: number;
  minutesFromStart: number;
}

interface Route {
  driverId: number;
  estimatedTimeMinutes: number;
  stops: Stop[];
}

interface ApiResponse {
  routes: Route[];
}

interface SavedPlan {
    hqAddress: string;
    deliveryAddresses: string;
    driverCount: string;
    stopDuration: string;
    trafficCondition: string;
    routes: Route[];
}

// --- DOM Element References ---
const form = document.getElementById('route-form') as HTMLFormElement;
const hqAddressInput = document.getElementById('hq-address') as HTMLInputElement;
const deliveryAddressesTextarea = document.getElementById('delivery-addresses') as HTMLTextAreaElement;
const driverCountInput = document.getElementById('driver-count') as HTMLInputElement;
const stopDurationInput = document.getElementById('stop-duration') as HTMLInputElement;
const trafficConditionSelect = document.getElementById('traffic-condition') as HTMLSelectElement;
const optimizeBtn = document.getElementById('optimize-btn') as HTMLButtonElement;
const btnText = optimizeBtn.querySelector('.btn-text') as HTMLSpanElement;
const spinner = optimizeBtn.querySelector('.spinner') as HTMLSpanElement;
const resultsPlaceholder = document.getElementById('results-placeholder') as HTMLDivElement;
const resultsWrapper = document.getElementById('results-wrapper') as HTMLDivElement;
const resultsContainer = document.getElementById('results-container') as HTMLDivElement;
const routeSelector = document.getElementById('route-selector') as HTMLSelectElement;
const mapContainer = document.getElementById('map') as HTMLDivElement;
const chartCanvas = document.getElementById('time-chart') as HTMLCanvasElement;
const selectedRouteDetailsContainer = document.getElementById('selected-route-details') as HTMLDivElement;
const savePlanBtn = document.getElementById('save-plan-btn') as HTMLButtonElement;
const loadPlanBtn = document.getElementById('load-plan-btn') as HTMLButtonElement;


// --- Global State ---
let map: any | null = null; // To hold the Leaflet map instance
let timeChart: any | null = null; // To hold the Chart.js instance
let currentRoutes: Route[] = [];
const LOCAL_STORAGE_KEY = 'saborExpressLastPlan';

// --- Gemini AI Configuration ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  handleError('API_KEY não encontrada. Verifique a configuração do ambiente.');
}
const ai = new GoogleGenAI({apiKey: API_KEY});

// --- Event Listeners ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await optimizeRoutes();
});

routeSelector.addEventListener('change', (e) => {
    const selectedDriverId = parseInt((e.target as HTMLSelectElement).value, 10);
    const selectedRoute = currentRoutes.find(r => r.driverId === selectedDriverId);
    if(selectedRoute) {
        drawRouteOnMap(selectedRoute);
        renderSelectedRouteDetails(selectedRoute);
    }
});

savePlanBtn.addEventListener('click', savePlanToLocalStorage);
loadPlanBtn.addEventListener('click', loadPlanFromLocalStorage);


// --- Main Application Logic ---
async function optimizeRoutes() {
  const hqAddress = hqAddressInput.value.trim();
  const deliveryAddresses = deliveryAddressesTextarea.value.trim().split('\n').filter(addr => addr.trim() !== '');
  const driverCount = driverCountInput.value;
  const stopDuration = stopDurationInput.value;
  const trafficCondition = trafficConditionSelect.value;

  if (!hqAddress || deliveryAddresses.length === 0) {
    alert('Por favor, preencha o endereço da sede e pelo menos um endereço de entrega.');
    return;
  }

  setLoading(true);

  const prompt = `
    Você é um especialista em otimização logística para uma empresa de delivery de comida chamada Sabor Express.
    Sua tarefa é pegar o endereço de uma sede, uma lista de endereços de entrega, um número de entregadores e uma duração de parada para retornar um plano de entrega otimizado.

    Detalhes da Tarefa:
    - Sede: "${hqAddress}"
    - Endereços de Entrega:
      ${deliveryAddresses.map(addr => `- "${addr}"`).join('\n')}
    - Número de Entregadores: ${driverCount}
    - Duração do Serviço por Parada de Entrega: ${stopDuration} minutos.

    Por favor, execute os seguintes passos:
    1. Para todos os endereços (sede e entregas), encontre suas coordenadas geográficas (latitude, longitude).
    2. Agrupe os endereços de entrega em ${driverCount} clusters com base na proximidade geográfica.
    3. Para cada cluster, determine a rota de entrega ideal começando na sede, visitando todos os endereços do cluster e, finalmente, retornando à sede. Este é um Problema do Caixeiro Viajante (TSP).
    4. Para cada rota, estime o tempo total de viagem em minutos, considerando as condições de trânsito: "${trafficCondition}". O tempo total deve incluir o tempo de viagem MAIS o tempo total de serviço (número de paradas de entrega multiplicado por ${stopDuration} minutos).
    5. Para cada parada em cada rota, calcule e inclua a distância em quilômetros desde a parada *anterior* e o tempo de viagem acumulado em minutos desde o início ('minutesFromStart'). Para a primeira parada (sede), ambos os valores são 0. Para as paradas subsequentes, 'minutesFromStart' deve ser o tempo total desde a partida da sede, incluindo o tempo de viagem ATÉ a parada e o tempo de serviço gasto em TODAS as paradas de entrega ANTERIORES.

    Retorne o plano final como um único objeto JSON que adere ao esquema fornecido. Para cada parada ('stop'), você DEVE incluir o endereço, as coordenadas, a distância do trecho anterior e o tempo acumulado desde o início.
    A primeira e a última parada em cada rota DEVE ser o endereço da sede.
  `;

  const schema: any = {
    type: Type.OBJECT,
    properties: {
      routes: {
        type: Type.ARRAY,
        description: "Um array de rotas otimizadas, uma para cada entregador.",
        items: {
          type: Type.OBJECT,
          properties: {
            driverId: { type: Type.INTEGER },
            estimatedTimeMinutes: { type: Type.INTEGER },
            stops: {
              type: Type.ARRAY,
              description: "A sequência de paradas na ordem otimizada, cada uma com todos os metadados necessários.",
              items: {
                type: Type.OBJECT,
                properties: {
                  address: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  distanceFromPreviousStopKm: {
                    type: Type.NUMBER,
                    description: "A distância em quilômetros desde a parada anterior. Para a primeira parada (sede), este valor é 0."
                  },
                  minutesFromStart: {
                    type: Type.INTEGER,
                    description: "O tempo de viagem acumulado em minutos desde a partida da sede até a chegada nesta parada."
                  }
                },
                required: ["address", "lat", "lng", "distanceFromPreviousStopKm", "minutesFromStart"],
              },
            },
          },
          required: ["driverId", "estimatedTimeMinutes", "stops"],
        },
      },
    },
    required: ["routes"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const resultText = response.text.trim();
    // A simple fix for a potential JSON formatting issue from the API
    const cleanedJson = resultText.replace(/^'\\''\\''json\\s*|'\\''\\''$/g, '').replace(/```json\s*|```/g, '');
    const result: ApiResponse = JSON.parse(cleanedJson);

    renderResults(result.routes);
  } catch (error) {
    console.error('Erro ao chamar a API Gemini:', error);
    handleError('Falha ao otimizar. Verifique se todos os endereços são válidos e estão em um formato completo (Ex: Rua, Número, Cidade).');
  } finally {
    setLoading(false);
  }
}

// --- Local Storage Functions ---

function savePlanToLocalStorage() {
    if (currentRoutes.length === 0) return;

    const planToSave: SavedPlan = {
        hqAddress: hqAddressInput.value,
        deliveryAddresses: deliveryAddressesTextarea.value,
        driverCount: driverCountInput.value,
        stopDuration: stopDurationInput.value,
        trafficCondition: trafficConditionSelect.value,
        routes: currentRoutes,
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(planToSave));

    // UI feedback
    const originalText = savePlanBtn.textContent;
    savePlanBtn.textContent = 'Salvo!';
    setTimeout(() => {
        savePlanBtn.textContent = originalText;
    }, 1500);
}

function loadPlanFromLocalStorage() {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedData) {
        alert('Nenhum plano salvo encontrado.');
        return;
    }

    try {
        const savedPlan: SavedPlan = JSON.parse(savedData);

        // Repopulate form
        hqAddressInput.value = savedPlan.hqAddress;
        deliveryAddressesTextarea.value = savedPlan.deliveryAddresses;
        driverCountInput.value = savedPlan.driverCount;
        stopDurationInput.value = savedPlan.stopDuration || '5'; // Default to 5 if not present
        trafficConditionSelect.value = savedPlan.trafficCondition;

        // Render results
        renderResults(savedPlan.routes);
    } catch (error) {
        console.error("Erro ao carregar o plano salvo:", error);
        alert("Não foi possível carregar o plano. Os dados salvos podem estar corrompidos.");
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
}


// --- Map and UI Rendering Functions ---

function initMap() {
    if (map) return; // Initialize only once
    map = L.map(mapContainer).setView([-23.5505, -46.6333], 12); // Default to São Paulo
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function drawRouteOnMap(route: Route) {
    if (!map) return;

    // Clear previous layers
    map.eachLayer((layer: any) => {
        if (!!layer.toGeoJSON) {
            map.removeLayer(layer);
        }
    });
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    if (!route.stops || route.stops.length === 0) return;

    const latLngs = route.stops.map(stop => [stop.lat, stop.lng]);

    // Create and add markers
    route.stops.forEach((stop, index) => {
        const isHq = index === 0 || index === route.stops.length - 1;
        const iconHtml = isHq ? '🏠' : `<b>${index}</b>`;
        const customIcon = L.divIcon({
            html: iconHtml,
            className: isHq ? 'marker-icon hq-marker' : 'marker-icon delivery-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        L.marker([stop.lat, stop.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<b>${isHq ? 'Sede' : `Parada ${index}`}</b><br>${stop.address}`);
    });

    // Create and add polyline
    const polyline = L.polyline(latLngs, { color: '#FF6B00', weight: 4 }).addTo(map);

    // Zoom map to fit the route
    map.fitBounds(polyline.getBounds().pad(0.1));
}

function renderTimeChart(routes: Route[]) {
    if (timeChart) {
        timeChart.destroy();
    }

    const ctx = chartCanvas.getContext('2d');
    if (!ctx) return;

    const labels = routes.map(route => `Entregador ${route.driverId}`);
    const data = routes.map(route => route.estimatedTimeMinutes);

    timeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tempo Estimado (minutos)',
                data: data,
                backgroundColor: 'rgba(255, 107, 0, 0.6)', // Primary color with transparency
                borderColor: 'rgba(255, 107, 0, 1)',     // Solid primary color
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Tempo Estimado por Entregador',
                    font: {
                        size: 16
                    },
                    padding: {
                        bottom: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Minutos'
                    }
                }
            }
        }
    });
}

function renderSelectedRouteDetails(route: Route) {
    if (!route || !route.stops) {
        selectedRouteDetailsContainer.classList.add('hidden');
        return;
    }

    selectedRouteDetailsContainer.innerHTML = `
        <h4>Detalhes da Rota ${route.driverId}</h4>
        <ul>
            ${route.stops.map((stop, index) => {
                const isHq = index === 0 || index === route.stops.length - 1;
                const step = isHq ? '🏠' : index;
                const distanceText = stop.distanceFromPreviousStopKm > 0 ? `+${stop.distanceFromPreviousStopKm.toFixed(1)} km` : 'Ponto de partida';
                const timeText = ` Chegada em ${stop.minutesFromStart} min`;

                return `
                    <li class="${isHq ? 'hq-stop' : ''}">
                         <span class="step-marker">${step}</span>
                         <div class="stop-info">
                             <span class="address">${stop.address}</span>
                             <span class="meta">${distanceText} &bull; ${timeText}</span>
                         </div>
                    </li>
                `;
            }).join('')}
        </ul>
    `;
    selectedRouteDetailsContainer.classList.remove('hidden');
}


function renderResults(routes: Route[]) {
    if (!routes || routes.length === 0) {
        handleError("A IA não retornou nenhuma rota. Verifique se os endereços são válidos ou tente novamente com dados diferentes.");
        return;
    }

    resultsPlaceholder.style.display = 'none';
    resultsWrapper.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    routeSelector.innerHTML = '';
    savePlanBtn.hidden = false;
    currentRoutes = routes.sort((a, b) => a.driverId - b.driverId);

    // Initialize map
    initMap();
    
    // Render chart
    renderTimeChart(currentRoutes);

    // Populate route selector and render cards
    currentRoutes.forEach(route => {
        // Add option to selector
        const option = document.createElement('option');
        option.value = String(route.driverId);
        option.textContent = `Entregador ${route.driverId}`;
        routeSelector.appendChild(option);

        // Render route card
        const card = document.createElement('div');
        card.className = 'route-card';
        card.innerHTML = `
            <h3>Rota do Entregador ${route.driverId}</h3>
            <p>Tempo estimado: ${route.estimatedTimeMinutes} minutos</p>
            <ol>
                ${route.stops.map((stop, index) => {
                    const isHq = index === 0 || index === route.stops.length - 1;
                    const step = isHq ? '🏠' : index;
                    return `<li class="${isHq ? 'hq-stop' : ''}" data-step="${step}">${stop.address}</li>`;
                }).join('')}
            </ol>
        `;
        resultsContainer.appendChild(card);
    });

    // Draw the first route and show its details by default
    if (currentRoutes.length > 0) {
        drawRouteOnMap(currentRoutes[0]);
        renderSelectedRouteDetails(currentRoutes[0]);
    } else {
        selectedRouteDetailsContainer.classList.add('hidden');
    }
}

function setLoading(isLoading: boolean) {
  optimizeBtn.disabled = isLoading;
  spinner.hidden = !isLoading;
  btnText.textContent = isLoading ? 'Otimizando...' : 'Otimizar Rotas';
  
  if (isLoading) {
    resultsContainer.innerHTML = '';
    resultsWrapper.classList.add('hidden');
    selectedRouteDetailsContainer.classList.add('hidden');
    resultsPlaceholder.style.display = 'flex';
    savePlanBtn.hidden = true;
  }
}

function handleError(message: string) {
    resultsWrapper.classList.add('hidden');
    selectedRouteDetailsContainer.classList.add('hidden');
    resultsPlaceholder.style.display = 'flex';
    savePlanBtn.hidden = true;
    const h3 = resultsPlaceholder.querySelector('h3');
    const p = resultsPlaceholder.querySelector('p');
    if(h3) h3.textContent = 'Ocorreu um Erro';
    if(p) p.textContent = message;
}