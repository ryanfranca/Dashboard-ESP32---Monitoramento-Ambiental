// Configurações globais
const CONFIG = {
    ESP32_IP: 'http://192.168.1.100', // Altere para o IP do seu ESP32
    UPDATE_INTERVAL: 5000, // 5 segundos
    MAX_DATA_POINTS: 50, // Máximo de pontos nos gráficos
    CHART_COLORS: {
        temperature: {
            background: 'rgba(255, 107, 107, 0.2)',
            border: '#ff6b6b',
            gradient: ['#ff6b6b', '#ff8e8e']
        },
        humidity: {
            background: 'rgba(78, 205, 196, 0.2)',
            border: '#4ecdc4',
            gradient: ['#4ecdc4', '#44a08d']
        },
        soil: {
            background: 'rgba(139, 195, 74, 0.2)',
            border: '#8bc34a',
            gradient: ['#8bc34a', '#689f38']
        }
    }
};

// Variáveis globais
let charts = {};
let sensorData = {
    temperature: [],
    humidity: [],
    soil: [],
    timestamps: []
};
let previousValues = {
    temperature: null,
    humidity: null,
    soil: null
};
let isConnected = false;
let updateInterval;
let startTime = Date.now();

// Elementos DOM
const elements = {
    currentTemp: document.getElementById('currentTemp'),
    currentHumidity: document.getElementById('currentHumidity'),
    currentSoil: document.getElementById('currentSoil'),
    tempTrend: document.getElementById('tempTrend'),
    humidityTrend: document.getElementById('humidityTrend'),
    soilTrend: document.getElementById('soilTrend'),
    connectionStatus: document.getElementById('connectionStatus'),
    statusText: document.getElementById('statusText'),
    lastUpdate: document.getElementById('lastUpdate'),
    uptime: document.getElementById('uptime')
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    startDataCollection();
    setupEventListeners();
    updateUptime();
    setInterval(updateUptime, 1000);
});

// Configuração dos gráficos
function initializeCharts() {
    // Configuração comum para todos os gráficos
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#2d3748',
                bodyColor: '#4a5568',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: function(context) {
                        return formatTime(context[0].label);
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    color: 'rgba(113, 128, 150, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#718096',
                    maxTicksLimit: 8,
                    callback: function(value, index, values) {
                        const timestamp = this.getLabelForValue(value);
                        return formatTime(timestamp, true);
                    }
                }
            },
            y: {
                display: true,
                grid: {
                    color: 'rgba(113, 128, 150, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#718096'
                }
            }
        },
        elements: {
            point: {
                radius: 3,
                hoverRadius: 6,
                borderWidth: 2
            },
            line: {
                borderWidth: 3,
                tension: 0.4
            }
        }
    };

    // Gráfico de Temperatura
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    charts.temperature = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperatura (°C)',
                data: [],
                backgroundColor: CONFIG.CHART_COLORS.temperature.background,
                borderColor: CONFIG.CHART_COLORS.temperature.border,
                pointBackgroundColor: CONFIG.CHART_COLORS.temperature.border,
                pointBorderColor: '#ffffff',
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    title: {
                        display: true,
                        text: 'Temperatura (°C)',
                        color: '#718096'
                    }
                }
            }
        }
    });

    // Gráfico de Umidade do Ar
    const humidityCtx = document.getElementById('humidityChart').getContext('2d');
    charts.humidity = new Chart(humidityCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Umidade do Ar (%)',
                data: [],
                backgroundColor: CONFIG.CHART_COLORS.humidity.background,
                borderColor: CONFIG.CHART_COLORS.humidity.border,
                pointBackgroundColor: CONFIG.CHART_COLORS.humidity.border,
                pointBorderColor: '#ffffff',
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Umidade (%)',
                        color: '#718096'
                    }
                }
            }
        }
    });

    // Gráfico de Umidade do Solo
    const soilCtx = document.getElementById('soilChart').getContext('2d');
    charts.soil = new Chart(soilCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Umidade do Solo (%)',
                data: [],
                backgroundColor: CONFIG.CHART_COLORS.soil.background,
                borderColor: CONFIG.CHART_COLORS.soil.border,
                pointBackgroundColor: CONFIG.CHART_COLORS.soil.border,
                pointBorderColor: '#ffffff',
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Umidade (%)',
                        color: '#718096'
                    }
                }
            }
        }
    });
}

// Buscar dados do ESP32
async function fetchSensorData() {
    try {
        const response = await fetch(`${CONFIG.ESP32_IP}/dados`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Atualizar status de conexão
        updateConnectionStatus(true);
        
        // Processar dados recebidos
        processSensorData(data);
        
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados do sensor:', error);
        updateConnectionStatus(false);
        return null;
    }
}

// Processar dados dos sensores
function processSensorData(data) {
    const timestamp = new Date();
    
    // Adicionar novos dados
    sensorData.timestamps.push(timestamp);
    sensorData.temperature.push(data.temperatura);
    sensorData.humidity.push(data.umidadeAr);
    sensorData.soil.push(data.umidadeSolo);
    
    // Limitar número de pontos
    if (sensorData.timestamps.length > CONFIG.MAX_DATA_POINTS) {
        sensorData.timestamps.shift();
        sensorData.temperature.shift();
        sensorData.humidity.shift();
        sensorData.soil.shift();
    }
    
    // Atualizar interface
    updateCurrentValues(data);
    updateTrends(data);
    updateCharts();
    updateLastUpdateTime();
}

// Atualizar valores atuais
function updateCurrentValues(data) {
    elements.currentTemp.textContent = data.temperatura.toFixed(1);
    elements.currentHumidity.textContent = data.umidadeAr.toFixed(1);
    elements.currentSoil.textContent = data.umidadeSolo.toFixed(0);
}

// Atualizar tendências
function updateTrends(data) {
    updateTrend(elements.tempTrend, data.temperatura, previousValues.temperature);
    updateTrend(elements.humidityTrend, data.umidadeAr, previousValues.humidity);
    updateTrend(elements.soilTrend, data.umidadeSolo, previousValues.soil);
    
    // Salvar valores anteriores
    previousValues.temperature = data.temperatura;
    previousValues.humidity = data.umidadeAr;
    previousValues.soil = data.umidadeSolo;
}

// Atualizar tendência individual
function updateTrend(element, currentValue, previousValue) {
    if (previousValue === null) {
        element.innerHTML = '<i class="fas fa-minus"></i>';
        element.className = 'trend';
        return;
    }
    
    const difference = currentValue - previousValue;
    
    if (Math.abs(difference) < 0.1) {
        element.innerHTML = '<i class="fas fa-minus"></i>';
        element.className = 'trend';
    } else if (difference > 0) {
        element.innerHTML = '<i class="fas fa-arrow-up"></i>';
        element.className = 'trend up';
    } else {
        element.innerHTML = '<i class="fas fa-arrow-down"></i>';
        element.className = 'trend down';
    }
}

// Atualizar gráficos
function updateCharts() {
    const labels = sensorData.timestamps.map(ts => ts.toISOString());
    
    // Atualizar gráfico de temperatura
    charts.temperature.data.labels = labels;
    charts.temperature.data.datasets[0].data = sensorData.temperature;
    charts.temperature.update('none');
    
    // Atualizar gráfico de umidade do ar
    charts.humidity.data.labels = labels;
    charts.humidity.data.datasets[0].data = sensorData.humidity;
    charts.humidity.update('none');
    
    // Atualizar gráfico de umidade do solo
    charts.soil.data.labels = labels;
    charts.soil.data.datasets[0].data = sensorData.soil;
    charts.soil.update('none');
}

// Atualizar status de conexão
function updateConnectionStatus(connected) {
    isConnected = connected;
    
    if (connected) {
        elements.connectionStatus.className = 'status-dot connected';
        elements.statusText.textContent = 'Conectado';
    } else {
        elements.connectionStatus.className = 'status-dot disconnected';
        elements.statusText.textContent = 'Desconectado';
    }
}

// Atualizar horário da última atualização
function updateLastUpdateTime() {
    const now = new Date();
    elements.lastUpdate.textContent = formatTime(now);
}

// Atualizar uptime
function updateUptime() {
    const uptime = Date.now() - startTime;
    const seconds = Math.floor(uptime / 1000) % 60;
    const minutes = Math.floor(uptime / (1000 * 60)) % 60;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    
    elements.uptime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Formatar tempo
function formatTime(timestamp, short = false) {
    const date = new Date(timestamp);
    
    if (short) {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Iniciar coleta de dados
function startDataCollection() {
    // Primeira busca imediata
    fetchSensorData();
    
    // Configurar intervalo de atualização
    updateInterval = setInterval(fetchSensorData, CONFIG.UPDATE_INTERVAL);
}

// Parar coleta de dados
function stopDataCollection() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Controles de período dos gráficos
    document.querySelectorAll('.btn-control').forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões do mesmo container
            const container = this.closest('.chart-controls');
            container.querySelectorAll('.btn-control').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            // Implementar lógica de filtro por período (futuro)
            const period = this.dataset.period;
            console.log(`Período selecionado: ${period}`);
        });
    });
    
    // Detectar quando a página perde/ganha foco
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopDataCollection();
        } else {
            startDataCollection();
        }
    });
    
    // Detectar quando a janela é redimensionada
    window.addEventListener('resize', function() {
        Object.values(charts).forEach(chart => {
            chart.resize();
        });
    });
}

// Função para alterar IP do ESP32 (pode ser chamada via console)
function setESP32IP(newIP) {
    CONFIG.ESP32_IP = newIP;
    console.log(`IP do ESP32 alterado para: ${newIP}`);
    
    // Reiniciar coleta de dados
    stopDataCollection();
    startDataCollection();
}

// Função para exportar dados (pode ser expandida no futuro)
function exportData() {
    const dataToExport = {
        timestamp: new Date().toISOString(),
        data: sensorData,
        config: CONFIG
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esp32-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Expor funções globalmente para debug
window.ESP32Dashboard = {
    setIP: setESP32IP,
    exportData: exportData,
    getData: () => sensorData,
    getCharts: () => charts,
    isConnected: () => isConnected
};

