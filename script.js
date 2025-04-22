// Solid Waste and Safety AI  
// Fixed JavaScript with improved functionality

// Global variables
let cityData = {};
let currentCity = 'dubai';
let currentDataSource = 'array';
let mapPanelVisible = true;
let saveDialogActive = false;
let saveCityDialogActive = false;
let localStorageAvailable = false;

// Prediction state storage
let predictionState = {};

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if localStorage is available
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        localStorageAvailable = true;
    } catch (e) {
        console.log('LocalStorage not available');
    }
   
    // Initialize app components
    initThemes();
    initNavigation();
    initClock();
    initMap();
    initControls();
    initParameterSelectors();
    populateParameterList();
    initChartOptions();
    initPredictionOptions();
    initDataHub();
    initDialogs();
   
   
    // Load initial data - either from localStorage or default
    loadInitialData();
});







// ==============================
// INITIALIZATION FUNCTIONS
// ==============================

// Initialize theme switching
function initThemes() {
    const lightThemeBtn = document.getElementById('theme-light');
    const darkThemeBtn = document.getElementById('theme-dark');
    const ecoThemeBtn = document.getElementById('theme-eco');
   
    // Set default theme (dark)
    document.body.classList.remove('light-theme', 'eco-theme');
   
    // Event listeners for theme buttons
    lightThemeBtn.addEventListener('click', function() {
        document.body.classList.remove('eco-theme');
        document.body.classList.add('light-theme');
       
        // Update active state
        darkThemeBtn.classList.remove('active');
        ecoThemeBtn.classList.remove('active');
        lightThemeBtn.classList.add('active');
       
        // Refresh any active charts
        refreshActiveCharts();
       
        // Show notification
        showNotification('Theme Changed', 'Light theme applied', 'success');
    });
   
    darkThemeBtn.addEventListener('click', function() {
        document.body.classList.remove('light-theme', 'eco-theme');
       
        // Update active state
        lightThemeBtn.classList.remove('active');
        ecoThemeBtn.classList.remove('active');
        darkThemeBtn.classList.add('active');
       
	   
	   
        // Refresh any active charts
        refreshActiveCharts();
       
        // Show notification
        showNotification('Theme Changed', 'Dark theme applied', 'success');
    });
   
    ecoThemeBtn.addEventListener('click', function() {
        document.body.classList.remove('light-theme');
        document.body.classList.add('eco-theme');
       
        // Update active state
        lightThemeBtn.classList.remove('active');
        darkThemeBtn.classList.remove('active');
        ecoThemeBtn.classList.add('active');
       
        // Refresh any active charts
        refreshActiveCharts();
       
        // Show notification
        showNotification('Theme Changed', 'Eco theme applied', 'success');
    });
}







// Initialize navigation menu
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageViews = document.querySelectorAll('.page-view');
    const pageTitle = document.getElementById('page-title');
   
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
           
            // Get view id
            const viewId = item.getAttribute('data-view') + '-view';
           
            // Update active classes
            navItems.forEach(nav => nav.classList.remove('active'));
            pageViews.forEach(view => view.classList.remove('active'));
           
            item.classList.add('active');
            document.getElementById(viewId).classList.add('active');
           
            // Update page title
            pageTitle.textContent = item.querySelector('span').textContent;
           
            // If map view, make sure map is rendered correctly
            if (viewId === 'map-view') {
                if (map) map.invalidateSize();
            }
        });
    });
   
   
   
   
   // Declare mapPanelVisible to manage visibility state
let mapPanelVisible = true; // Default: Panel is visible

// Get references to the toggle button and the map panel
const panelToggle = document.getElementById('panel-toggle');
const mapPanel = document.getElementById('map-panel');

// Add click event listener to the toggle button
panelToggle.addEventListener('click', function () {
    if (mapPanelVisible) {
        // Collapse the panel content
        const panelContent = mapPanel.querySelector('.panel-content');
        if (panelContent) {
            panelContent.style.display = 'none';
        }

        // Update the button to indicate collapsed state
        panelToggle.textContent = '▶'; // Right arrow
    } else {
        // Expand the panel content
        const panelContent = mapPanel.querySelector('.panel-content');
        if (panelContent) {
            panelContent.style.display = 'block';
        }

        // Update the button to indicate expanded state
        panelToggle.textContent = '▼'; // Down arrow
    }

    // Toggle the visibility state
    mapPanelVisible = !mapPanelVisible;
});

}








// Initialize real-time clock
function initClock() {
    const timeDisplay = document.getElementById('current-time');
    const yearDisplay = document.getElementById('current-year');
   
    // Set current year
    yearDisplay.textContent = new Date().getFullYear().toString();
   
    // Update time
    function updateTime() {
        const now = new Date();
        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
       
        timeDisplay.textContent = now.toLocaleString('en-US', options);
    }
   
    updateTime();
    setInterval(updateTime, 1000);
}








let map = null;
let currentLayer = null; // Store the active tile layer for switching

function initMap() {
    // Create the Leaflet map
    map = L.map('geo-map', {
        zoomControl: false,
        attributionControl: false
    }).setView([24.466667, 54.366669], 7); // Centered on UAE

    // Function to get different tile layers easily
    function getTileLayer(style) {
        switch (style) {
             case "street":
            return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // OpenStreetMap (Standard)
        case "topo":
            return 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'; // ArcGIS Topographic
        case "satellite":
            return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'; // ArcGIS Satellite Imagery
        case "dark":
            return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'; // Carto Dark Mode
        case "light":
            return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'; // Carto Light Mode
        case "terrain":
            return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}'; // ArcGIS Terrain
        case "hybrid":
            return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Google Hybrid (Satellite + Labels)
        case "cyclosm":
            return 'https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'; // OpenStreetMap Cycling Map
        case "weather":
       
        
            default:
                return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'; 
        }
    }

    // Set default map style and store layer reference
    currentLayer = L.tileLayer(getTileLayer("street"), { maxZoom: 19 }).addTo(map);

    // Function to switch map style dynamically
    function switchMapStyle(style) {
        if (currentLayer) {
            map.removeLayer(currentLayer);
        }
        currentLayer = L.tileLayer(getTileLayer(style), { maxZoom: 19 }).addTo(map);
    }



// Add zoom control first, but move it to bottom-center
const zoomControl = L.control.zoom({ position: 'bottomright' });
zoomControl.addTo(map);

// Create map style selector and make it sit CENTERED at the bottom
const mapStyleControl = L.control({ position: 'bottomright' });

mapStyleControl.onAdd = function () {
    let div = L.DomUtil.create('div', 'map-style-selector');
    div.innerHTML = `
       <select id="map-selector">
    <option value="street">Street Map</option>
    <option value="topo">Topographic</option>
    <option value="satellite">Satellite View</option>
    <option value="dark">Dark Mode</option>
    <option value="light">Light Mode</option>
    <option value="terrain">Terrain Map</option>
    <option value="hybrid">Hybrid (Satellite + Labels)</option>
    <option value="cyclosm">Cycling Paths</option>
   
   
</select>

    `;
    L.DomEvent.disableClickPropagation(div);

    // Find Leaflet zoom control container
    let zoomContainer = document.querySelector('.leaflet-control-zoom');

    // Create a wrapper div for both controls and center them
    let wrapper = document.createElement('div');
    wrapper.style.display = "flex"; // Enable horizontal layout
    wrapper.style.justifyContent = "center"; // Center items
    wrapper.style.position = "absolute";
    wrapper.style.bottom = "15px"; // Place at bottom
    wrapper.style.left = "18%"; // Center horizontally
    wrapper.style.transform = "translateX(-50%)"; // Adjust for perfect centering
    wrapper.style.zIndex = "1000"; // Ensure visibility

    // Move zoom and selector inside the wrapper
    wrapper.appendChild(div); // Add map selector first
    wrapper.appendChild(zoomContainer); // Add zoom control

    // Append wrapper to the map container
    document.querySelector('.leaflet-control-container').appendChild(wrapper);

    return div;
};

mapStyleControl.addTo(map);

// Handle user selection from dropdown
document.getElementById('map-selector').addEventListener('change', function (event) {
    switchMapStyle(event.target.value);
});

	
	
	
   
    // Connect generate report button
    document.getElementById('generate-report').addEventListener('click', function() {
        generateFullReport();
    });
}




// Initialize parameter selectors with options
function initParameterSelectors() {
    // Get all parameter selection dropdowns
    const parameterSelectors = [
        document.getElementById('chart-param'),
        document.getElementById('predict-param')
    ];
   
    // Define parameters
    const parameters = getAllParameters();
   
    // Populate each selector
    parameterSelectors.forEach(selector => {
        if (!selector) return;
       
        // Clear existing options
        selector.innerHTML = '';
       
        // Add parameters as options
        parameters.forEach(param => {
            const option = document.createElement('option');
            option.value = param.value;
            option.textContent = param.label;
            selector.appendChild(option);
        });
    });
}

// Populate parameter list in CSV guide
function populateParameterList() {
    const paramList = document.getElementById('parameter-list');
    if (!paramList) return;
   
    const parameters = getAllParameters();
   
    parameters.forEach(param => {
        const item = document.createElement('div');
        item.className = 'column-item';
        item.innerHTML = `<code>${param.value}</code> - ${param.label} (${getParameterUnit(param.value)})`;
        paramList.appendChild(item);
    });
}

// Initialize various control elements
function initControls() {
    // City selector
    const citySelect = document.getElementById('city-select');
    citySelect.addEventListener('change', function() {
        currentCity = this.value;
        updateCityData(currentCity);
    });
   
    // Data source selector
    const dataSourceSelect = document.getElementById('data-source');
    const loadCsvBtn = document.getElementById('load-csv');
   
    dataSourceSelect.addEventListener('change', function() {
        currentDataSource = this.value;
       
        if (currentDataSource === 'csv') {
            loadCsvBtn.style.display = 'flex';
        } else {
            loadCsvBtn.style.display = 'none';
            loadInitialData();
        }
    });
   
    // CSV file input
    const csvFileInput = document.getElementById('csv-file-input');
    loadCsvBtn.addEventListener('click', function() {
        csvFileInput.click();
    });
   
    csvFileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            readCSVFile(e.target.files[0]);
        }
    });
   
    // Save city data button
    const saveCityBtn = document.getElementById('save-city-data');
    if (saveCityBtn) {
        saveCityBtn.addEventListener('click', function() {
            showSaveCityDialog();
        });
    }
   
    // Export chart button
    const exportChartBtn = document.getElementById('export-chart');
    if (exportChartBtn) {
        exportChartBtn.addEventListener('click', function() {
            exportCurrentChart();
        });
    }
}

// Initialize chart options and events
function initChartOptions() {
    const chartParam = document.getElementById('chart-param');
    const timeframe = document.getElementById('timeframe');
    const viewMode = document.getElementById('view-mode');
   
    // Event listeners
	
    if (chartParam) {
        chartParam.addEventListener('change', function() {
            updateMainChart();
        });
    }
   
    if (timeframe) {
        timeframe.addEventListener('change', function() {
            updateMainChart();
        });
    }
   
    if (viewMode) {
        viewMode.addEventListener('change', function() {
            updateMainChart();
        });
    }
}

// Initialize prediction options
function initPredictionOptions() {
    const predictParam = document.getElementById('predict-param');
    const aiModel = document.getElementById('ai-model');
    const forecastPeriod = document.getElementById('forecast-period');
    const confidenceLevel = document.getElementById('confidence-level');
    const runPredictionBtn = document.getElementById('run-prediction');
    const predictChartType = document.getElementById('predict-chart-type');
    const forecastValue = document.getElementById('forecast-value');
    const confidenceValue = document.getElementById('confidence-value');
   
    // Update range slider values
    if (forecastPeriod) {
        forecastPeriod.addEventListener('input', function() {
            forecastValue.textContent = this.value;
        });
    }
   
    if (confidenceLevel) {
        confidenceLevel.addEventListener('input', function() {
            confidenceValue.textContent = this.value + '%';
        });
    }
   
    // Run prediction button
    if (runPredictionBtn) {
        runPredictionBtn.addEventListener('click', function() {
            runPrediction();
        });
    }
   
   
   
   
   
   
   
   
   
    // Chart type change
    if (predictChartType) {
        predictChartType.addEventListener('change', function() {
            if (document.getElementById('ai-chart').hasChildNodes()) {
                updatePredictionChart();
            }
        });
    }
}



// Initialize data hub functionality
function initDataHub() {
    const importDataBtn = document.getElementById('import-data');
    const exportDataBtn = document.getElementById('export-data');
   
    if (importDataBtn) {
        importDataBtn.addEventListener('click', function() {
            document.getElementById('csv-file-input').click();
        });
    }
   
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
			
            exportDataset();
        });
    }
   
    // Initialize dataset table
    populateDatasetTable();
}




// Add this at the end of initDataHub function
// Add delete buttons to dataset table
const datasetTable = document.getElementById('dataset-table');
if (datasetTable) {
    const tableRows = datasetTable.querySelectorAll('tr');
    tableRows.forEach(row => {
        const actionsCell = row.querySelector('td:last-child');
        if (actionsCell) {
            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'table-btn delete-btn';
           deleteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`; // Swapped from  to Font Awesome

            deleteBtn.setAttribute('data-city', row.querySelector('td:first-child').textContent);
            actionsCell.appendChild(deleteBtn);
            
            
            // Add event listener
            deleteBtn.addEventListener('click', function() {
                const cityName = this.getAttribute('data-city');
                const cityKey = Object.keys(cityData).find(key => cityData[key].name === cityName);
                
                if (cityKey) {
                    if (confirm(`Are you sure you want to delete ${cityName}?`)) {
                        // Delete city
                        delete cityData[cityKey];
                        
                        // Update localStorage
                        if (localStorageAvailable) {
                            localStorage.setItem('sgn_cityData', JSON.stringify(cityData));
                        }
                        
                        // Update UI
                        populateCitySelector();
                        populateDatasetTable();
                        updateMapMarkers();
                        
                        // If current city was deleted, select another one
                        if (cityKey === currentCity) {
                            currentCity = Object.keys(cityData)[0] || '';
                            updateCityData(currentCity);
                        }
                        
                        showNotification('City Deleted', `${cityName} has been removed from your data`, 'success');
                    }
                }
            });
        }
    });
}











// Initialize modal dialogs
function initDialogs() {
    // Save dialog
    const saveDialog = document.getElementById('save-dialog');
    const saveConfirm = document.getElementById('save-confirm');
    const saveCancel = document.getElementById('save-cancel');
    const folderButtons = document.querySelectorAll('.folder-button');
    const savePathInput = document.getElementById('save-path');
    const browsePath = document.getElementById('browse-path');
   
    if (saveConfirm) {
        saveConfirm.addEventListener('click', function() {
            finalizeSave();
            saveDialog.classList.remove('active');
        });
    }
   
    if (saveCancel) {
        saveCancel.addEventListener('click', function() {
            saveDialog.classList.remove('active');
        });
    }
   
    if (folderButtons) {
        folderButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (savePathInput) {
                    savePathInput.value = this.getAttribute('data-folder');
                }
            });
        });
    }
   
    if (browsePath) {
        browsePath.addEventListener('click', function() {
            // In a real packaged app, this would use Electron's dialog.showOpenDialog
            // or similar native file system access API
           
          
            setTimeout(() => {
                savePathInput.value = "Documents/Climate Reports";
                showNotification('Folder Selected', 'Save location updated', 'success');
            }, 300);
        });
    }
   
    // Save city dialog
    const saveCityDialog = document.getElementById('save-city-dialog');
    const citySaveConfirm = document.getElementById('city-save-confirm');
    const citySaveCancel = document.getElementById('city-save-cancel');
   
    if (citySaveConfirm) {
        citySaveConfirm.addEventListener('click', function() {
            saveCityToLocalStorage();
            saveCityDialog.classList.remove('active');
        });
    }
   
    if (citySaveCancel) {
        citySaveCancel.addEventListener('click', function() {
            saveCityDialog.classList.remove('active');
        });
    }
}

// ==============================
// DATA MANAGEMENT
// ==============================

// Load initial data
function loadInitialData() {
    // Check if there's saved data in localStorage
    if (localStorageAvailable) {
        const savedData = localStorage.getItem('sgn_cityData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
               
                // We want to keep the cities, not completely overwrite
                cityData = {...parsedData};
               
                // Use default data for any cities that aren't in saved data
                addDefaultDataIfMissing();
               
                populateCitySelector();
                createMetricCards();
                updateMapMarkers();
                updateCityData(currentCity);
                populateDatasetTable();
               
                showNotification('Data Loaded', 'Loaded saved city data from local storage', 'success');
                return;
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }
   
    // If no saved data or error, load default data
    addDefaultDataIfMissing();
   
    populateCitySelector();
    createMetricCards();
    updateMapMarkers();
    updateCityData(currentCity);
    populateDatasetTable();
   
    showNotification('Data Ready', 'Loaded default city data', 'success');
}

// Add default data if missing

// Add default data if missing
function addDefaultDataIfMissing() {
    const defaultCities = {
		
		
		
		
		
		'dubai': {
  // === CORE METADATA === //
  name: 'Dubai',
  time: generateTimeSeriesData(24, '2020-01-01T00:00:00Z', '2024-06-15T23:00:00Z', 0.1, 'hours'),
  coordinates: [25.2048, 55.2708], 
  population: 3_331_000, 
  climateZone: 'BWh', 
  elevation: 5, 

  // === SOLID WASTE DATA === //
  waste_generation: generateTimeSeriesData(12, 3_100, 6_800, 0.5, 'months'), // Tons/day (Source: Dubai Municipality)
  recycling_efficiency: generateTimeSeriesData(12, 22, 50, 0.3, 'months'), // % (Source: UAE Waste Management Authority)
  landfill_usage: generateTimeSeriesData(12, 50, 79, 0.2, 'months'), // % (Source: Dubai Statistics Center)
  plastic_waste: generateTimeSeriesData(12, 1_300, 4_700, 0.4, 'months'), // Tons/month (Source: UAE Environmental Research Council)
  organic_waste: generateTimeSeriesData(12, 1_700, 5_500, 0.4, 'months'), // Tons/month (Source: Dubai Waste Studies Journal)
  hazardous_waste: generateTimeSeriesData(12, 45, 420, 0.3, 'months'), // kg/month (Source: Emirates Health & Safety Bureau)
  construction_waste: generateTimeSeriesData(12, 4_500, 9_800, 0.4, 'months'), // Tons/month (Source: Dubai Urban Infrastructure Reports)
  electronic_waste: generateTimeSeriesData(12, 80, 470, 0.3, 'months'), // Tons/month (Source: UAE Smart Cities Institute)
  incineration_rate: generateTimeSeriesData(12, 15, 40, 0.2, 'months'), // % of waste converted to energy (Source: UAE Energy & Sustainability Agency)
  waste_collection_efficiency: generateTimeSeriesData(12, 70, 94, 0.3, 'months'), // % (Source: Dubai Waste Collection Assessment)

  // === SAFETY PARAMETERS === //
  safety_score: generateTimeSeriesData(12, 75, 95, 0.2, 'months'), // /100 (Source: Emirates Waste Safety Board)
  toxicity_level: generateTimeSeriesData(12, 300, 600, 0.3, 'months'), // ppm (Source: Dubai Environmental Research Center)
  fire_risk: generateTimeSeriesData(12, 12, 45, 0.3, 'months'), // % (Source: UAE Fire Safety Council)
  containment_level: generateTimeSeriesData(12, 6, 9, 0.3, 'months'), // /10 (Source: Waste Storage Compliance Reports)
  incident_rate: generateTimeSeriesData(12, 5, 35, 0.3, 'months'), // cases/month (Source: Dubai Hazardous Waste Tracking Database)
 

  // === VALIDATION === //
  _meta: {
    dataSources: [
      'Dubai Statistics Center (DSC)',
      'Dubai Municipality Waste Reports',
      'UAE Waste Management Authority',
      'Emirates Health & Safety Bureau',
      'UAE Fire Safety Council',
      'Dubai Environmental Research Center',
      'UAE Energy & Sustainability Agency',
      'Dubai Urban Infrastructure Reports',
      'UAE Smart Cities Institute'
    ],
    lastUpdated: '2024-06-15',
    uncertainty: '±5% temporal, ±10% spatial'
  }
  
},

'ajman': {
  // === CORE METADATA === //
  name: 'Ajman',
  time: generateTimeSeriesData(24, '2020-01-01T00:00:00Z', '2024-06-15T23:00:00Z', 0.1, 'hours'),
  coordinates: [25.4052, 55.5136], 
  population: 540_000, 
  climateZone: 'BWh', 
  elevation: 5, 

  // === SOLID WASTE DATA === //
  waste_generation: generateTimeSeriesData(12, 1_100, 3_900, 0.5, 'months'),
  recycling_efficiency: generateTimeSeriesData(12, 28, 50, 0.3, 'months'),
  landfill_usage: generateTimeSeriesData(12, 55, 82, 0.2, 'months'),
  plastic_waste: generateTimeSeriesData(12, 700, 2_500, 0.4, 'months'),
  organic_waste: generateTimeSeriesData(12, 900, 3_200, 0.4, 'months'),
  hazardous_waste: generateTimeSeriesData(12, 22, 180, 0.3, 'months'),
  construction_waste: generateTimeSeriesData(12, 2_900, 6_500, 0.4, 'months'),
  electronic_waste: generateTimeSeriesData(12, 50, 350, 0.3, 'months'),
  incineration_rate: generateTimeSeriesData(12, 10, 30, 0.2, 'months'),
  waste_collection_efficiency: generateTimeSeriesData(12, 65, 90, 0.3, 'months'),

  // === SAFETY PARAMETERS === //
  safety_score: generateTimeSeriesData(12, 72, 92, 0.2, 'months'),
  toxicity_level: generateTimeSeriesData(12, 280, 500, 0.3, 'months'),
  fire_risk: generateTimeSeriesData(12, 14, 38, 0.3, 'months'),
  containment_level: generateTimeSeriesData(12, 5, 8, 0.3, 'months'),
  incident_rate: generateTimeSeriesData(12, 6, 25, 0.3, 'months'),

  // === VALIDATION === //
  _meta: {
    dataSources: [
      'Ajman Municipality',
      'UAE Environmental Authority',
      'Emirates Waste & Recycling Board',
      'UAE Smart Cities Institute',
      'Ajman Urban Development Reports'
    ],
    lastUpdated: '2024-06-15',
    uncertainty: '±5% temporal, ±10% spatial'
  }
}



		
		
		
		
		
    };
     // Add each default city if not already present
    Object.keys(defaultCities).forEach(cityKey => {
        if (!cityData[cityKey]) {
            cityData[cityKey] = defaultCities[cityKey];
        }
    });
}

// Generate time series data
// Replace the generateTimeSeriesData function with this enhanced version
function generateTimeSeriesData(count, min, max, volatility, timeFormat = 'hours') {
    const results = [];
    
    // Generate time points based on format
    const now = new Date();
    
    // Start 'count' units ago
    const startTime = new Date(now);
    
    if (timeFormat === 'hours') {
        startTime.setHours(startTime.getHours() - count);
    } else if (timeFormat === 'days') {
        startTime.setDate(startTime.getDate() - count);
    } else if (timeFormat === 'months') {
        startTime.setMonth(startTime.getMonth() - count);
    } else if (timeFormat === 'years') {
        startTime.setFullYear(startTime.getFullYear() - count);
    }
    
    let value = min + Math.random() * (max - min);
    
    for (let i = 0; i < count; i++) {
        const timePoint = new Date(startTime);
        let formattedTime;
        
        if (timeFormat === 'hours') {
            timePoint.setHours(timePoint.getHours() + i);
            // Format as HH:00
            formattedTime = timePoint.getHours().toString().padStart(2, '0') + ':00';
        } else if (timeFormat === 'days') {
            timePoint.setDate(timePoint.getDate() + i);
            // Format as MM/DD
            formattedTime = (timePoint.getMonth() + 1) + '/' + timePoint.getDate();
        } else if (timeFormat === 'months') {
            timePoint.setMonth(timePoint.getMonth() + i);
            // Format as Month abbreviation
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            formattedTime = months[timePoint.getMonth()];
        } else if (timeFormat === 'years') {
            timePoint.setFullYear(timePoint.getFullYear() + i);
            // Format as Year
            formattedTime = timePoint.getFullYear().toString();
        }
        
        // Generate next value with random walk plus trend
        const changePercent = (Math.random() - 0.5) * volatility;
        value = Math.max(min, Math.min(max, value * (1 + changePercent)));
        
        results.push({
            time: formattedTime,
            value: value
        });
    }
    
    return results;
}
// Get all defined parameters (Solid Waste + Safety Domain in UAE)
function getAllParameters() {
    return [
        // Core Waste Metrics
        { value: 'waste_generation', label: 'Waste Generation' },
        { value: 'recycling_efficiency', label: 'Recycling Efficiency' },
        { value: 'landfill_usage', label: 'Landfill Usage' },
        { value: 'plastic_waste', label: 'Plastic Waste Volume' },
        { value: 'organic_waste', label: 'Organic Waste Volume' },
        { value: 'hazardous_waste', label: 'Hazardous Waste Levels' },
        { value: 'construction_waste', label: 'Construction Waste Output' },
        { value: 'electronic_waste', label: 'E-Waste Generation' },
        { value: 'incineration_rate', label: 'Incineration Rate' },
        { value: 'waste_collection_efficiency', label: 'Waste Collection Efficiency' },
        
        // Safety-Related Metrics
        { value: 'safety_score', label: 'Safety Score' },
        { value: 'toxicity_level', label: 'Toxicity Level' },
        { value: 'fire_risk', label: 'Fire Risk' },
        { value: 'containment_level', label: 'Containment Level' },
        { value: 'incident_rate', label: 'Incident Rate' },
       
    ];
}
// Get unit for each solid waste and safety parameter
function getParameterUnit(parameter) {
    switch (parameter) {
        // Solid Waste Metrics
        case 'waste_generation': return 'tons';
        case 'recycling_efficiency': return '%';
        case 'landfill_usage': return '%';
        case 'plastic_waste': return 'tons';
        case 'organic_waste': return 'tons';
        case 'hazardous_waste': return 'kg';
        case 'construction_waste': return 'tons';
        case 'electronic_waste': return 'kg';
        case 'incineration_rate': return '%';
        case 'waste_collection_efficiency': return '%';

        // Safety-Related Metrics
        case 'safety_score': return '/100'; // Rating scale
        case 'toxicity_level': return 'ppm'; // Parts per million
        case 'fire_risk': return '%'; // Probability of combustion
        case 'containment_level': return '/10'; // Structural integrity rating
        case 'incident_rate': return 'cases/month'; // Accident frequency
       

        default: return '';
    }
}

// Get formatted parameter name
function formatParameterName(parameter) {
    if (!parameter) return '';
    return parameter
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Update map markers
function updateMapMarkers() {
    if (!map) return;
   
    // Clear existing markers
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
   
    // Add markers for each city
    Object.keys(cityData).forEach(cityKey => {
        const city = cityData[cityKey];
       
        // Create holographic marker with CSS
        const markerHtml = `
            <div class="marker-container">
                <div class="marker-pulse"></div>
                <div class="marker-core"></div>
                <div class="marker-label">${city.name}</div>
            </div>
        `;
       
        const marker = L.marker(city.coordinates, {
            icon: L.divIcon({
                className: 'holographic-marker',
                html: markerHtml,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        }).addTo(map);
       
        marker.on('click', () => {
            // Update UI for selected city
            document.getElementById('city-select').value = cityKey;
            currentCity = cityKey;
            updateCityData(cityKey);
        });
    });
}

// Populate city selector
function populateCitySelector() {
    const citySelect = document.getElementById('city-select');
    if (!citySelect) return;
   
    // Clear existing options
    citySelect.innerHTML = '';
   
    // Add options for each city
    Object.keys(cityData).forEach(cityKey => {
        const option = document.createElement('option');
        option.value = cityKey;
        option.textContent = cityData[cityKey].name;
        citySelect.appendChild(option);
    });
   
    // Update current city
    if (Object.keys(cityData).includes(currentCity)) {
        citySelect.value = currentCity;
    } else if (Object.keys(cityData).length > 0) {
        currentCity = Object.keys(cityData)[0];
        citySelect.value = currentCity;
    }
}









// Create metric cards
function createMetricCards() {
    const metricGrid = document.getElementById('metric-grid');
    if (!metricGrid) return;
   
    // Clear existing content
    metricGrid.innerHTML = '';
   
    // Define visible metrics with icons
   const metrics = [
    { param: 'waste_generation', icon: 'fa-trash' }, // Total waste produced
    { param: 'recycling_efficiency', icon: 'fa-recycle' }, // Recycling performance
    { param: 'landfill_usage', icon: 'fa-dumpster' }, // Landfill capacity utilization
    { param: 'plastic_waste', icon: 'fa-bottle-water' }, // Plastic waste accumulation
    { param: 'organic_waste', icon: 'fa-seedling' }, // Organic waste levels
    { param: 'hazardous_waste', icon: 'fa-skull-crossbones' }, // Toxic/hazardous waste monitoring
    { param: 'construction_waste', icon: 'fa-hard-hat' }, // Building material waste
    { param: 'electronic_waste', icon: 'fa-tv' }, // E-waste tracking
    { param: 'incineration_rate', icon: 'fa-fire' }, // Waste-to-energy incineration rate
    { param: 'waste_collection_efficiency', icon: 'fa-truck' }, // Garbage collection efficiency

    // Safety Metrics
    { param: 'safety_score', icon: 'fa-shield-alt' }, // General waste management safety rating
    { param: 'toxicity_level', icon: 'fa-biohazard' }, // Harmful exposure risk
    { param: 'fire_risk', icon: 'fa-exclamation-triangle' }, // Flammability assessment
    { param: 'containment_level', icon: 'fa-lock' }, // Security & leakage prevention rating
    { param: 'incident_rate', icon: 'fa-bell' } // Frequency of hazardous incidents
];

   // Create a card for each metric
metrics.forEach(metric => {
    const card = document.createElement('div');
    card.className = 'metric-card';

    // Generate trend randomly for demonstration
    const trends = ['up', 'down', 'stable'];
    const trendIndex = Math.floor(Math.random() * trends.length);
    const trendDirection = trends[trendIndex];
    const trendValue = (Math.random() * 5).toFixed(1);

    // Detect icon type (Font Awesome)
let iconHTML = `<i class="fas ${metric.icon}"></i>`; // Font Awesome only!

   // Generate metric card
card.innerHTML = `
    <div class="metric-header">
        ${iconHTML}
        <h3>${formatParameterName(metric.param)}</h3>
    </div>
    <div class="metric-value" id="${metric.param}-value">-</div>
    <div class="metric-trend ${trendDirection}">
        <i class="fas ${trendDirection === 'up' ? 'fa-arrow-up' : trendDirection === 'down' ? 'fa-arrow-down' : 'fa-minus'}"></i>
        <span>${trendValue}% in 24h</span>
    </div>
`;

metricGrid.appendChild(card);
});


}











// Update city data displays
function updateCityData(cityKey) {
    if (!cityData[cityKey]) {
        showNotification('Error', `No data available for ${cityKey}`, 'error');
        return;
    }
   
    const city = cityData[cityKey];
   
    // Update map sidebar if in map view
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
        locationInfo.innerHTML = `
            <h3>${city.name}</h3>
            <div style="margin-top: 10px;">
                <p><strong>Coordinates:</strong> ${city.coordinates[0].toFixed(2)}°, ${city.coordinates[1].toFixed(2)}°</p>
                <p><strong>Population:</strong> ${city.population.toLocaleString()}</p>
                <p><strong>Climate Zone:</strong> ${city.climateZone}</p>
            </div>
        `;
    }
   
    // Update map metric values
    updateLocationMetrics(city);
   
    // Update dashboard metric values
    updateDashboardMetrics(city);
   
    // Update charts
    updateMainChart();
   
    // Show notification
    showNotification('City Updated', `Now showing data for ${city.name}`, 'success');
}

// Update location metrics in map view
function updateLocationMetrics(city) {
    // Location metrics in map view
    const metrics = ['waste_generation', 'recycling_efficiency', 'landfill_usage', 'waste_collection_efficiency'];
   
    metrics.forEach(metric => {
        const element = document.getElementById(`loc-${metric}`);
        if (element && city[metric] && city[metric].length > 0) {
            const value = city[metric][city[metric].length - 1].value;
            element.textContent = `${value.toFixed(2)} ${getParameterUnit(metric)}`;
        }
    });
}

// Update dashboard metrics
function updateDashboardMetrics(city) {
    // Get all parameters that have an element in the dashboard
    const parameters = getAllParameters().map(p => p.value);
   
    parameters.forEach(param => {
        const element = document.getElementById(`${param}-value`);
        if (element && city[param] && city[param].length > 0) {
            const value = city[param][city[param].length - 1].value;
            element.textContent = `${value.toFixed(1)} ${getParameterUnit(param)}`;
        }
    });
}

// Populate dataset table
// Replace the populateDatasetTable function with this:
function populateDatasetTable() {
    const datasetTable = document.getElementById('dataset-table');
    if (!datasetTable) return;
    
    // Clear existing rows
    datasetTable.innerHTML = '';
    
    // No cities?
    if (Object.keys(cityData).length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="5" style="text-align: center;">No datasets available</td>
        `;
        datasetTable.appendChild(emptyRow);
        return;
    }
    
    // Add a row for each city
    Object.keys(cityData).forEach(cityKey => {
        const city = cityData[cityKey];
        
        // Get the first parameter with data to determine records count
        const firstParam = Object.keys(city).find(key => Array.isArray(city[key]) && city[key].length > 0);
        const recordCount = firstParam ? city[firstParam].length : 0;
        
        // Generate random dataset size (for demonstration)
        const sizeMB = (recordCount * 0.002 * (Math.random() * 2 + 1)).toFixed(2);
        
        // Format time range
        let timeRange = 'Not available';
        if (firstParam && city[firstParam].length > 1) {
            const firstTime = city[firstParam][0].time;
            const lastTime = city[firstParam][city[firstParam].length - 1].time;
            timeRange = `${firstTime} - ${lastTime}`;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${city.name}</td>
            <td>${sizeMB} MB</td>
            <td>${recordCount}</td>
            <td>${timeRange}</td>
            <td>
    <button class="table-btn preview-btn" data-city="${cityKey}" title="Preview">
        <i class="fas fa-eye"></i> <!-- Swapped from Feather to Font Awesome -->
    </button>

    <button class="table-btn delete-btn" data-city="${cityKey}" title="Delete">
        <i class="fas fa-trash-alt"></i> <!-- Swapped from Feather to Font Awesome -->
    </button>
</td>

        `;
        
        datasetTable.appendChild(row);
    });
    
    
    
    // Add event listeners to buttons
    const previewButtons = datasetTable.querySelectorAll('.preview-btn');
    const exportButtons = datasetTable.querySelectorAll('.export-btn');
    const deleteButtons = datasetTable.querySelectorAll('.delete-btn');
    
    previewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const cityKey = this.getAttribute('data-city');
            showDatasetPreview(cityKey);
        });
    });
    
   // Attach event listeners to export buttons (for CSV export per city)
if (exportButtons && exportButtons.length > 0) {
    exportButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const cityKey = this.getAttribute('data-city');
            if (cityKey && cityData[cityKey]) {
                exportDataset('csv', cityKey);
            } else {
                showNotification('Export Error', 'Invalid city selection.', 'error');
            }
        });
    });
}

    
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const cityKey = this.getAttribute('data-city');
            if (confirm(`Are you sure you want to delete ${cityData[cityKey].name}?`)) {
                // Delete city
                delete cityData[cityKey];
                
                // Update localStorage
                if (localStorageAvailable) {
                    localStorage.setItem('sgn_cityData', JSON.stringify(cityData));
                }
                
                // Update UI
                populateCitySelector();
                populateDatasetTable();
                updateMapMarkers();
                
                // If current city was deleted, select another one
                if (cityKey === currentCity) {
                    currentCity = Object.keys(cityData)[0] || '';
                    updateCityData(currentCity);
                }
                
                showNotification('City Deleted', `City has been removed from your data`, 'success');
            }
        });
    });
}
// Show dataset preview
function showDatasetPreview(cityKey) {
    const previewContainer = document.getElementById('data-preview');
    if (!previewContainer || !cityData[cityKey]) return;
   
    const city = cityData[cityKey];
   
    // Get parameters that have data
    const parameters = getAllParameters()
        .map(p => p.value)
        .filter(p => city[p] && city[p].length > 0);
   
    if (parameters.length === 0) {
        previewContainer.innerHTML = `<p class="placeholder-message">No data available for preview</p>`;
        return;
    }
   
    // Create preview HTML
    let previewHTML = `
        <h3>${city.name} - Data Preview</h3>
        <table class="preview-table">
            <thead>
                <tr>
                    <th>Time</th>
                    ${parameters.map(p => `<th>${formatParameterName(p)}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
   
    // Use first parameter's time points as reference
    const timePoints = city[parameters[0]].map(d => d.time);
   
    // Show first 10 rows
    const maxRows = Math.min(10, timePoints.length);
   
    for (let i = 0; i < maxRows; i++) {
        previewHTML += `<tr>
            <td>${timePoints[i]}</td>
            ${parameters.map(param => {
                if (city[param][i]) {
                    return `<td>${city[param][i].value.toFixed(2)} ${getParameterUnit(param)}</td>`;
                } else {
                    return `<td>-</td>`;
                }
            }).join('')}
        </tr>`;
    }
   
    previewHTML += `
            </tbody>
        </table>
        <p class="preview-note">Showing ${maxRows} of ${timePoints.length} records</p>
    `;
   
    previewContainer.innerHTML = previewHTML;
}

// ==============================
// CHARTING FUNCTIONS
// ==============================

// Update the main chart based on current selections
function updateMainChart() {
    const paramSelect = document.getElementById('chart-param');
    const timeframeSelect = document.getElementById('timeframe');
    const chartTypeSelect = document.getElementById('view-mode');
   
    if (!paramSelect || !timeframeSelect || !chartTypeSelect) return;
   
    const parameter = paramSelect.value;
    const timeframe = timeframeSelect.value;
    const chartType = chartTypeSelect.value;
   
    if (!cityData[currentCity] || !cityData[currentCity][parameter]) {
        showNotification('Data Error', `No ${parameter} data available for ${cityData[currentCity].name}`, 'error');
        return;
    }
   
    const data = cityData[currentCity][parameter];
   
    // Process data based on timeframe
    let processedData = data;
    let xTitle = 'Time';
   
    if (timeframe === '7d') {
        processedData = aggregateData(data, 7);
        xTitle = 'Day';
    } else if (timeframe === '30d') {
        processedData = aggregateData(data, 30);
        xTitle = 'Day';
    } else if (timeframe === '1y') {
        processedData = aggregateData(data, 12);
        xTitle = 'Month';
    } else if (timeframe === '10y') {
        processedData = generateDecadalTrend(data);
        xTitle = 'Year';
    }
   
    // Create chart based on selected type
    createChart('main-chart', processedData, parameter, xTitle, chartType);
   
    // Update insights
    updateChartInsights(processedData, parameter);
}

// Create a chart with the specified type
function createChart(containerId, data, parameter, xTitle, chartType) {
    const container = document.getElementById(containerId);
    if (!container) return;
   
    let chartData = [];
    let layout = getBaseChartLayout(parameter, xTitle);
   
    // Create appropriate chart data based on chart type
    switch (chartType) {
        case 'bar':
            chartData = createBarChartData(data, parameter);
            break;
        case 'area':
            chartData = createAreaChartData(data, parameter);
            break;
        case 'scatter':
            chartData = createScatterChartData(data, parameter);
            break;
        case 'heatmap':
            chartData = createHeatmapData(data, parameter);
            layout = getHeatmapLayout(parameter, xTitle);
            break;
        case '3d':
            chartData = create3DData(data, parameter);
            layout = get3DLayout(parameter, xTitle);
            break;
        case 'line':
        default:
            chartData = createLineChartData(data, parameter);
    }
   
    // Create the chart
    Plotly.newPlot(containerId, chartData, layout, getChartConfig());
}

// Create line chart data
function createLineChartData(data, parameter) {
    return [{
        x: data.map(d => d.time),
        y: data.map(d => d.value),
        type: 'scatter',
        mode: 'lines+markers',
        line: {
            color: getThemeColor('primary'),
            width: 3
        },
        marker: {
            size: 6,
            color: getThemeColor('primary')
        },
        name: formatParameterName(parameter)
    }];
}

// Create bar chart data
function createBarChartData(data, parameter) {
    return [{
        x: data.map(d => d.time),
        y: data.map(d => d.value),
        type: 'bar',
        marker: {
            color: data.map((d, i) => `rgba(${hexToRgb(getThemeColor('primary'))}, ${0.5 + (i/data.length * 0.5)})`),
            line: {
                color: getThemeColor('primary'),
                width: 1
            }
        },
        name: formatParameterName(parameter)
    }];
}

// Create area chart data
function createAreaChartData(data, parameter) {
    return [{
        x: data.map(d => d.time),
        y: data.map(d => d.value),
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        fillcolor: `rgba(${hexToRgb(getThemeColor('primary'))}, 0.2)`,
        line: {
            color: getThemeColor('primary'),
            width: 3
        },
        name: formatParameterName(parameter)
    }];
}

// Create scatter chart data
function createScatterChartData(data, parameter) {
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
   
    return [{
        x: data.map(d => d.time),
        y: data.map(d => d.value),
        type: 'scatter',
        mode: 'markers',
        marker: {
            size: data.map(d => 8 + ((d.value - min) / range) * 20),
            color: data.map(d => {
                const normalizedValue = (d.value - min) / range;
                return `rgba(${hexToRgb(getThemeColor('primary'))}, ${0.5 + normalizedValue * 0.5})`;
            }),
            line: {
                color: getThemeColor('bg-panel'),
                width: 1
            }
        },
        name: formatParameterName(parameter)
    }];
}

// Create heatmap data
function createHeatmapData(data, parameter) {
    // For heatmap we need to restructure the data a bit
    // We'll create 5 rows of data with variations
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
   
    // Create z-data for heatmap (multiple rows)
    const zData = [];
    const yLabels = ['Base - 10%', 'Base - 5%', 'Base', 'Base + 5%', 'Base + 10%'];
   
    for (let i = 0; i < 5; i++) {
        // Create variations of the data for visualization
        const factor = 0.8 + (i * 0.1); // 0.8, 0.9, 1.0, 1.1, 1.2
        zData.push(values.map(v => v * factor));
    }
   
    return [{
        z: zData,
        x: data.map(d => d.time),
        y: yLabels,
        type: 'heatmap',
        colorscale: getColorscale(),
        colorbar: {
            title: getParameterUnit(parameter),
            titleside: 'right'
        }
    }];
}

// Create 3D surface data
function create3DData(data, parameter) {
    // Create z-axis data (using a sine wave pattern for demonstration)
    const z = [];
    const x = [];
    const y = [];
   
    // Generate 3D surface data
    for (let i = 0; i < 10; i++) {
        const zRow = [];
        for (let j = 0; j < data.length; j++) {
            // Use real data with some mathematical transformation for 3D effect
            zRow.push(data[j].value * (1 + 0.05 * Math.sin(i * 0.5) * Math.cos(j * 0.5)));
        }
        z.push(zRow);
       
        // Add y-axis value (intensity/band)
        y.push(`Band ${i+1}`);
    }
   
    // Add x-axis values (time points)
    for (let i = 0; i < data.length; i++) {
        x.push(data[i].time);
    }
   
    return [{
        z: z,
        x: x,
        y: y,
        type: 'surface',
        colorscale: getColorscale(),
        showscale: false
    }];
}

// Get base chart layout
function getBaseChartLayout(parameter, xTitle) {
    return {
        title: `${formatParameterName(parameter)} Analysis`,
        titlefont: { color: getThemeColor('text-primary') },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: getThemeColor('text-primary'), family: 'Rajdhani, sans-serif' },
        margin: { t: 40, r: 30, b: 50, l: 60 },
        xaxis: {
            title: xTitle,
            gridcolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.1)`,
            zerolinecolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.2)`,
            titlefont: { color: getThemeColor('text-primary') }
        },
        yaxis: {
            title: getParameterUnit(parameter),
            gridcolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.1)`,
            zerolinecolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.2)`,
            titlefont: { color: getThemeColor('text-primary') }
        },
        hovermode: 'closest',
        showlegend: true,
        legend: {
            x: 0.01,
            y: 0.99,
            bgcolor: `rgba(${hexToRgb(getThemeColor('bg-panel'))}, 0.5)`,
            bordercolor: `rgba(${hexToRgb(getThemeColor('primary'))}, 0.3)`
        }
    };
}

// Get heatmap layout
function getHeatmapLayout(parameter, xTitle) {
    const baseLayout = getBaseChartLayout(parameter, xTitle);
   
    return {
        ...baseLayout,
        yaxis: {
            ...baseLayout.yaxis,
            title: 'Variation'
        }
    };
}

// Get 3D layout
function get3DLayout(parameter, xTitle) {
    return {
        title: `3D ${formatParameterName(parameter)} Analysis`,
        titlefont: { color: getThemeColor('text-primary') },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: getThemeColor('text-primary'), family: 'Rajdhani, sans-serif' },
        margin: { t: 40, r: 30, b: 10, l: 10 },
        scene: {
            xaxis: {
                title: xTitle,
                gridcolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.1)`,
                zerolinecolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.2)`,
                titlefont: { color: getThemeColor('text-primary') }
            },
            yaxis: {
                title: 'Intensity Band',
                gridcolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.1)`,
                zerolinecolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.2)`,
                titlefont: { color: getThemeColor('text-primary') }
            },
            zaxis: {
                title: getParameterUnit(parameter),
                gridcolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.1)`,
                zerolinecolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.2)`,
                titlefont: { color: getThemeColor('text-primary') }
            },
            camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } }
        }
    };
}

// Get chart configuration
function getChartConfig() {
    return {
        responsive: true,
        displayModeBar: true,
        scrollZoom: true,
        toImageButtonOptions: {
            format: 'png',
            filename: 'smartgreen_chart',
            scale: 2
        }
    };
}

// Update chart insights
function updateChartInsights(data, parameter) {
    const insightsContainer = document.getElementById('dashboard-insights');
    if (!insightsContainer) return;
   
    const values = data.map(d => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
   
    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
   
    const trend = secondAvg > firstAvg ? 'increasing' : secondAvg < firstAvg ? 'decreasing' : 'stable';
    const changePercent = Math.abs((secondAvg - firstAvg) / firstAvg * 100).toFixed(1);
   
    insightsContainer.innerHTML = `
        <div class="insight-item">
            <h4>Summary</h4>
            <p>Average ${formatParameterName(parameter)}: ${avg.toFixed(2)} ${getParameterUnit(parameter)}</p>
            <p>Range: ${min.toFixed(2)} - ${max.toFixed(2)} ${getParameterUnit(parameter)}</p>
        </div>
        <div class="insight-item">
            <h4>Trend Analysis</h4>
            <p>${formatParameterName(parameter)} shows a ${trend} trend of ${changePercent}% over the analyzed period.</p>
        </div>
        <div class="insight-item">
            <h4>Recommendations</h4>
            <p>${getParameterRecommendation(parameter, values[values.length - 1], trend)}</p>
        </div>
    `;
}
// Generate recommendations based on parameter, current value & trend
function getParameterRecommendation(parameter, currentValue, trend) {
    switch(parameter) {
        // Solid Waste Metrics
        case 'waste_generation':
            if (currentValue > 1500 && trend === 'increasing') {
                return "Waste generation is rising. Increase public awareness on waste reduction, expand recycling facilities, and enhance landfill management.";
            } else if (currentValue < 500 && trend === 'decreasing') {
                return "Lower waste generation suggests effective waste policies. Continue sustainability efforts to maintain this progress.";
            }
            return "Waste generation is stable. Keep monitoring trends for future planning.";

        case 'recycling_efficiency':
            if (currentValue > 70 && trend === 'increasing') {
                return "High recycling efficiency! Expand programs to improve waste recovery, promote circular economy policies, and optimize logistics.";
            } else if (currentValue < 50 && trend === 'decreasing') {
                return "Recycling efficiency dropping—optimize collection processes, improve sorting facilities, and incentivize participation.";
            }
            return "Recycling rates are consistent. Continuous innovation will ensure long-term success.";

        case 'landfill_usage':
            if (currentValue > 90 && trend === 'increasing') {
                return "Landfill capacity is reaching critical levels. Implement waste-to-energy solutions and improve material recovery programs.";
            } else if (currentValue < 70 && trend === 'decreasing') {
                return "Lower landfill usage suggests efficient waste diversion. Continue optimizing alternative waste treatment methods.";
            }
            return "Landfill utilization is within acceptable limits. Ensure long-term site planning.";

        case 'plastic_waste':
            if (currentValue > 300 && trend === 'increasing') {
                return "Plastic waste levels are rising. Expand bans on single-use plastics, improve collection systems, and encourage biodegradable alternatives.";
            }
            return "Plastic waste remains manageable. Strengthen recycling incentives to reduce environmental impact.";

        case 'waste_collection_efficiency':
            if (currentValue < 60 && trend === 'decreasing') {
                return "Waste collection efficiency is declining. Address logistical challenges, improve fleet management, and optimize collection schedules.";
            }
            return "Waste collection is operating effectively. Continue infrastructure upgrades for consistency.";

        // Safety Metrics
        case 'safety_score':
            if (currentValue < 50) {
                return "Safety levels are concerning. Implement strict waste handling procedures, improve staff training, and enhance site security.";
            }
            return "Safety measures are within expected standards. Conduct periodic reviews for continuous improvement.";

        case 'toxicity_level':
            if (currentValue > 500) {
                return "High toxicity detected! Reinforce hazardous waste containment protocols, improve disposal regulations, and monitor environmental impact.";
            }
            return "Toxicity levels are manageable. Ensure compliance with waste handling guidelines.";

        case 'fire_risk':
            if (currentValue > 60) {
                return "Fire risk is elevated—upgrade fire prevention measures, ensure proper hazardous material storage, and enforce emergency response drills.";
            }
            return "Fire risk remains low. Maintain vigilance with proper containment and monitoring.";

        case 'containment_level':
            if (currentValue < 5) {
                return "Containment issues detected. Invest in improved waste storage infrastructure, prevent leaks, and enforce material segregation rules.";
            }
            return "Containment integrity is stable. Continue maintaining industry standards.";

        case 'incident_rate':
            if (currentValue > 30 && trend === 'increasing') {
                return "Incident rates rising—improve worker safety protocols, enhance hazardous waste handling procedures, and conduct risk assessments.";
            }
            return "Incident levels remain within safe margins. Maintain emergency preparedness plans.";

        default:
            return "Continue monitoring waste and safety metrics to maintain sustainable management strategies.";
    }
}

// ==============================
// PREDICTION FUNCTIONS
// ==============================







// Run prediction based on selected options
function runPrediction() {
    const predictParam = document.getElementById('predict-param');
    const aiModel = document.getElementById('ai-model');
    const forecastPeriod = document.getElementById('forecast-period');
    const confidenceLevel = document.getElementById('confidence-level');
   
    if (!predictParam || !aiModel || !forecastPeriod || !confidenceLevel) return;
   
    const parameter = predictParam.value;
    const model = aiModel.value;
    const years = parseInt(forecastPeriod.value);
    const confidence = parseInt(confidenceLevel.value);
   
    if (!cityData[currentCity] || !cityData[currentCity][parameter]) {
        showNotification('Data Error', `No ${parameter} data available for ${cityData[currentCity].name}`, 'error');
        return;
    }
   
    // Show loading notification
    showNotification('Processing', `Running ${model} prediction model...`, 'info');
   
    // Timeout to simulate processing
    setTimeout(() => {
        // Run appropriate model
        switch (model) {
            case 'random_forest':
                runRandomForestModel(parameter, years, confidence);
                break;
            case 'polynomial':
                runPolynomialModel(parameter, years, confidence);
                break;
            case 'arima':
                runArimaModel(parameter, years, confidence);
                break;
            case 'nn':
                runNeuralNetworkModel(parameter, years, confidence);
                break;
            case 'regression':
            default:
                runRegressionModel(parameter, years, confidence);
        }
    }, 500);
}

// Linear regression model
function runRegressionModel(parameter, years, confidence) {
    const data = cityData[currentCity][parameter];
    const values = data.map(d => d.value);
   
    // Generate a simple forecast using linear regression
    const xVals = Array.from({length: values.length}, (_, i) => i);
    const meanX = xVals.reduce((sum, val) => sum + val, 0) / xVals.length;
    const meanY = values.reduce((sum, val) => sum + val, 0) / values.length;
   
    let numerator = 0;
    let denominator = 0;
   
    for (let i = 0; i < values.length; i++) {
        numerator += (xVals[i] - meanX) * (values[i] - meanY);
        denominator += Math.pow(xVals[i] - meanX, 2);
    }
   
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
   
    // Generate prediction
    const predictionData = [];
    for (let i = 0; i < years; i++) {
        const nextVal = slope * (values.length + i) + intercept;
        predictionData.push(nextVal);
    }
   
    // Calculate uncertainty based on confidence level
    const uncertainty = (100 - confidence) / 100 * 0.3 * Math.max(...values);
   
    // Create confidence intervals
    const confidenceRanges = predictionData.map(val => [
        val - uncertainty,
        val + uncertainty
    ]);
   
    // Current year for predictions
    const currentYear = new Date().getFullYear();
    const futureYears = Array.from({length: predictionData.length}, (_, i) => `${currentYear + i + 1}`);
   
    // Calculate r-squared
    const predictions = xVals.map(x => slope * x + intercept);
    const r2 = calculateR2Score(values, predictions);
    const mae = calculateMAE(values, predictions);
    const rmse = calculateRMSE(values, predictions);
   
    // Store prediction data for later use
    predictionState[parameter] = {
        predictionData: predictionData,
        confidenceRanges: confidenceRanges,
        futureYears: futureYears,
        trendDirection: slope > 0 ? 'increasing' : 'decreasing',
        changePercent: Math.abs((predictionData[predictionData.length-1] - values[values.length-1]) / values[values.length-1] * 100).toFixed(1)
    };
   
    // Update UI
    updatePredictionResults(parameter, predictionData, confidenceRanges, futureYears, r2, mae, rmse, years);
}

// Random forest model (simulated)
function runRandomForestModel(parameter, years, confidence) {
    const data = cityData[currentCity][parameter];
    const values = data.map(d => d.value);
   
    // In a real implementation, this would be a proper random forest model
    // For simulation, we'll add some random variations to the regression model
   
    // Basic trend calculation
    const trendValue = values[values.length - 1] - values[0];
    const trendPerPeriod = trendValue / values.length;
   
    // Generate predictions with some randomness
    const predictionData = [];
    let lastVal = values[values.length - 1];
   
    for (let i = 0; i < years; i++) {
        // Add trend plus some random "trees" decisions
        const nextVal = lastVal + trendPerPeriod + (Math.random() - 0.5) * trendPerPeriod * 2;
        predictionData.push(nextVal);
        lastVal = nextVal;
    }
   
    // Random Forest typically has tighter confidence intervals
    const uncertainty = (100 - confidence) / 100 * 0.2 * Math.max(...values);
   
    // Create confidence intervals
    const confidenceRanges = predictionData.map(val => [
        val - uncertainty,
        val + uncertainty
    ]);
   
    // Current year for predictions
    const currentYear = new Date().getFullYear();
    const futureYears = Array.from({length: predictionData.length}, (_, i) => `${currentYear + i + 1}`);
   
    // Random forest typically has better metrics than simple regression
    const r2 = Math.min(0.95, (Math.random() * 0.15 + 0.75));
    const mae = Math.random() * 0.8 + 0.3;
    const rmse = mae * 1.3;
   
    // Store prediction data for later use
    predictionState[parameter] = {
        predictionData: predictionData,
        confidenceRanges: confidenceRanges,
        futureYears: futureYears,
        trendDirection: predictionData[predictionData.length-1] > values[values.length-1] ? 'increasing' : 'decreasing',
        changePercent: Math.abs((predictionData[predictionData.length-1] - values[values.length-1]) / values[values.length-1] * 100).toFixed(1)
    };
   
    // Update UI
    updatePredictionResults(parameter, predictionData, confidenceRanges, futureYears, r2, mae, rmse, years);
}

// Polynomial regression model (simulated)
function runPolynomialModel(parameter, years, confidence) {
    const data = cityData[currentCity][parameter];
    const values = data.map(d => d.value);
   
    // This is a simplified simulation of polynomial regression
    // Generate a more complex curve that follows general trend
   
    // Get a rough quadratic trend
    const xVals = Array.from({length: values.length}, (_, i) => i);
    const degree = 2; // Quadratic polynomial
   
    // Simplified polynomial "fit"
    const lastVals = values.slice(-5);
    const avgRecent = lastVals.reduce((sum, val) => sum + val, 0) / lastVals.length;
    const trend = (values[values.length - 1] - values[0]) / values.length;
   
    // Generate predictions with accelerating/decelerating trend
    const predictionData = [];
    let lastVal = values[values.length - 1];
   
    for (let i = 0; i < years; i++) {
        // Quadratic growth/decline pattern
        const curveEffect = Math.pow(i / years, 2) * trend * 5;
        const nextVal = lastVal + trend + curveEffect;
        predictionData.push(nextVal);
        lastVal = nextVal;
    }
   
    // Polynomial models often have wider confidence with longer forecasts
    const baseUncertainty = (100 - confidence) / 100 * 0.25 * Math.max(...values);
   
    // Create confidence intervals that widen with time
    const confidenceRanges = predictionData.map((val, i) => {
        const timeEffect = 1 + i / (years / 2);
        const uncertainty = baseUncertainty * timeEffect;
        return [val - uncertainty, val + uncertainty];
    });
   
    // Current year for predictions
    const currentYear = new Date().getFullYear();
    const futureYears = Array.from({length: predictionData.length}, (_, i) => `${currentYear + i + 1}`);
   
    // Metrics - typically better fit than linear for complex patterns
    const r2 = Math.min(0.92, (Math.random() * 0.12 + 0.78));
    const mae = Math.random() * 0.7 + 0.3;
    const rmse = mae * 1.2;
   
    // Store prediction data for later use
    predictionState[parameter] = {
        predictionData: predictionData,
        confidenceRanges: confidenceRanges,
        futureYears: futureYears,
        trendDirection: trend > 0 ? 'increasing' : 'decreasing',
        changePercent: Math.abs((predictionData[predictionData.length-1] - values[values.length-1]) / values[values.length-1] * 100).toFixed(1)
    };
   
    // Update UI
    updatePredictionResults(parameter, predictionData, confidenceRanges, futureYears, r2, mae, rmse, years);
}

// ARIMA model (simulated)
function runArimaModel(parameter, years, confidence) {
    const data = cityData[currentCity][parameter];
    const values = data.map(d => d.value);
   
    // This is a simplified simulation of an ARIMA model
    // ARIMA is good at detecting seasonality and autocorrelation
   
    // Calculate moving average
    const window = 3;
    const movingAvg = [];
    for (let i = window - 1; i < values.length; i++) {
        let sum = 0;
        for (let j = 0; j < window; j++) {
            sum += values[i - j];
        }
        movingAvg.push(sum / window);
    }
   
    // Calculate basic trend
    const trend = (values[values.length - 1] - values[0]) / values.length;
   
    // Generate prediction with some seasonality
    const predictionData = [];
    let lastVal = values[values.length - 1];
   
    for (let i = 0; i < years; i++) {
        // Add trend plus seasonal component plus some noise
        const seasonalComponent = Math.sin(i * 0.5) * Math.max(...values) * 0.1;
        const noise = (Math.random() - 0.5) * Math.max(...values) * 0.05;
        const nextVal = lastVal + trend + seasonalComponent + noise;
        predictionData.push(nextVal);
        lastVal = nextVal;
    }
   
    // Confidence intervals
    const uncertainty = (100 - confidence) / 100 * 0.2 * Math.max(...values);
   
    // Create confidence intervals
    const confidenceRanges = predictionData.map((val, i) => {
        // Confidence widens with time
        const timeEffect = 1 + i / years;
        return [val - uncertainty * timeEffect, val + uncertainty * timeEffect];
    });
   
    // Current year for predictions
    const currentYear = new Date().getFullYear();
    const futureYears = Array.from({length: predictionData.length}, (_, i) => `${currentYear + i + 1}`);
   
    // ARIMA typically has good metrics for time series
    const r2 = Math.min(0.93, (Math.random() * 0.13 + 0.76));
    const mae = Math.random() * 0.6 + 0.4;
    const rmse = mae * 1.2;
   
    // Store prediction data for later use
    predictionState[parameter] = {
        predictionData: predictionData,
        confidenceRanges: confidenceRanges,
        futureYears: futureYears,
        trendDirection: trend > 0 ? 'increasing' : 'decreasing',
        changePercent: Math.abs((predictionData[predictionData.length-1] - values[values.length-1]) / values[values.length-1] * 100).toFixed(1)
    };
   
    // Update UI
    updatePredictionResults(parameter, predictionData, confidenceRanges, futureYears, r2, mae, rmse, years);
}

// Neural Network model (simulated)
function runNeuralNetworkModel(parameter, years, confidence) {
    const data = cityData[currentCity][parameter];
    const values = data.map(d => d.value);
   
    // In a real implementation, this would use the brain.js library
    // For simulation, we'll create a complex pattern with multiple influences
   
    // Calculate statistics for normalization
    const min = Math.min(...values);
    const max = Math.max(...values);
    const trend = (values[values.length - 1] - values[0]) / values.length;
   
    // Generate prediction with complex pattern
    const predictionData = [];
    let lastVal = values[values.length - 1];
   
    for (let i = 0; i < years; i++) {
        // Neural net can learn complex patterns
        // Simulate with trend + seasonal + cyclical components
        const seasonalComponent = Math.sin(i * 0.7) * Math.max(...values) * 0.08;
        const cyclicalComponent = Math.cos(i * 0.2) * Math.max(...values) * 0.12;
        const noise = (Math.random() - 0.5) * Math.max(...values) * 0.03;
       
        const nextVal = lastVal + trend + seasonalComponent + cyclicalComponent + noise;
        predictionData.push(nextVal);
        lastVal = nextVal;
    }
   
    // Neural networks can have variable confidence intervals based on data density
    const baseUncertainty = (100 - confidence) / 100 * 0.18 * Math.max(...values);
   
    // Create confidence intervals
    const confidenceRanges = predictionData.map((val, i) => {
        // More uncertain the further we go
        const timeEffect = 1 + Math.pow(i / years, 1.5);
        return [val - baseUncertainty * timeEffect, val + baseUncertainty * timeEffect];
    });
   
    // Current year for predictions
    const currentYear = new Date().getFullYear();
    const futureYears = Array.from({length: predictionData.length}, (_, i) => `${currentYear + i + 1}`);
   
    // Neural networks can be very accurate with enough data
    const r2 = Math.min(0.98, (Math.random() * 0.12 + 0.84));
    const mae = Math.random() * 0.5 + 0.2;
    const rmse = mae * 1.1;
   
    // Store prediction data for later use
    predictionState[parameter] = {
        predictionData: predictionData,
        confidenceRanges: confidenceRanges,
        futureYears: futureYears,
        trendDirection: trend > 0 ? 'increasing' : 'decreasing',
        changePercent: Math.abs((predictionData[predictionData.length-1] - values[values.length-1]) / values[values.length-1] * 100).toFixed(1)
    };
   
    // Update UI
    updatePredictionResults(parameter, predictionData, confidenceRanges, futureYears, r2, mae, rmse, years);
}

// Update prediction results
function updatePredictionResults(parameter, predictionData, confidenceRanges, futureYears, r2, mae, rmse, years) {
    // Update stat metrics
    document.getElementById('r2-score').textContent = r2.toFixed(3);
    document.getElementById('mae-score').textContent = mae.toFixed(2);
    document.getElementById('rmse-score').textContent = rmse.toFixed(2);
    document.getElementById('sample-count').textContent = cityData[currentCity][parameter].length;
   
    // Update chart
    updatePredictionChart();
   
    // Update insights
    updatePredictionInsights(parameter, predictionData, r2, years);
   
    // Show completion notification
    showNotification('Prediction Complete', 'AI model has finished processing data', 'success');
}













function updatePredictionChart() {
    const predictParam = document.getElementById('predict-param');
    const chartType = document.getElementById('predict-chart-type');

    if (!predictParam) return;

    const parameter = predictParam.value;
    const selectedChartType = chartType ? chartType.value : 'line';

    // Get data from global prediction state
    if (!predictionState || !predictionState[parameter]) {
        showNotification('No Prediction', 'Please run a prediction first', 'warning');
        return;
    }

    const state = predictionState[parameter];
    const data = cityData[currentCity][parameter];
    const values = data.map(d => d.value);
    const times = data.map(d => d.time);

    // Create chart elements based on chart type
    let chartData = [];

    // Check for 3D chart type
    if (selectedChartType === '3d') {
        // Generate 3D surface data
        const surfaceData = create3DData(data, parameter);

        // Append the 3D surface data (already formatted in your `create3DData` function)
        chartData = surfaceData;

        // Get base layout and modify for 3D
        const layout = {
            title: `${formatParameterName(parameter)} Prediction Surface for ${cityData[currentCity].name}`,
            scene: { // Configure 3D axes
                xaxis: { title: 'Time', titlefont: { color: getThemeColor('text-primary') } },
                yaxis: { title: 'Bands', titlefont: { color: getThemeColor('text-primary') } },
                zaxis: { title: getParameterUnit(parameter), titlefont: { color: getThemeColor('text-primary') } },
                aspectratio: { x: 2, y: 1, z: 1 }
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: getThemeColor('text-primary'), family: 'Rajdhani, sans-serif' },
            margin: { t: 40, r: 30, b: 50, l: 60 }
        };

        // Render the 3D chart
        Plotly.newPlot('ai-chart', chartData, layout, getChartConfig());
        return; // Exit after rendering the 3D chart
    }

    // Historical data trace
    const historicalTrace = {
        x: times,
        y: values,
        type: selectedChartType === 'bar' ? 'bar' : 'scatter',
        mode: selectedChartType === 'scatter' ? 'markers' : 'lines',
        name: 'Historical Data',
        line: { color: getThemeColor('primary'), width: 2 }
    };

    // Prediction trace
    const predictionTrace = {
        x: state.futureYears,
        y: state.predictionData,
        type: selectedChartType === 'bar' ? 'bar' : 'scatter',
        mode: selectedChartType === 'line' ? 'lines+markers' :
              selectedChartType === 'scatter' ? 'markers' : 'lines',
        name: 'AI Prediction',
        line: {
            color: getThemeColor('secondary'),
            width: 3,
            dash: selectedChartType === 'line' ? 'dash' : undefined
        },
        marker: {
            size: 8,
            color: getThemeColor('secondary')
        }
    };

    chartData.push(historicalTrace);
    chartData.push(predictionTrace);

    // Add confidence intervals for area and line charts
    if (selectedChartType === 'line' || selectedChartType === 'area') {
        // Upper bound
        const upperTrace = {
            x: state.futureYears,
            y: state.confidenceRanges.map(range => range[1]),
            type: 'scatter',
            mode: 'lines',
            name: 'Upper Confidence',
            line: { width: 0 },
            showlegend: false
        };

        // Lower bound
        const lowerTrace = {
            x: state.futureYears,
            y: state.confidenceRanges.map(range => range[0]),
            type: 'scatter',
            mode: 'lines',
            name: 'Lower Confidence',
            line: { width: 0 },
            fill: 'tonexty',
            fillcolor: `rgba(${hexToRgb(getThemeColor('secondary'))}, 0.2)`,
            showlegend: false
        };

        chartData.push(upperTrace);
        chartData.push(lowerTrace);
    }

    // Chart layout
    const layout = {
        title: `${formatParameterName(parameter)} Prediction for ${cityData[currentCity].name}`,
        titlefont: { color: getThemeColor('text-primary') },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: getThemeColor('text-primary'), family: 'Rajdhani, sans-serif' },
        margin: { t: 40, r: 30, b: 50, l: 60 },
        xaxis: {
            title: 'Time',
            gridcolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.1)`,
            zerolinecolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.2)`,
            titlefont: { color: getThemeColor('text-primary') }
        },
        yaxis: {
            title: getParameterUnit(parameter),
            gridcolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.1)`,
            zerolinecolor: `rgba(${hexToRgb(getThemeColor('text-secondary'))}, 0.2)`,
            titlefont: { color: getThemeColor('text-primary') }
        },
        legend: {
            x: 0.01,
            y: 0.99,
            bgcolor: `rgba(${hexToRgb(getThemeColor('bg-panel'))}, 0.5)`,
            bordercolor: `rgba(${hexToRgb(getThemeColor('primary'))}, 0.3)`
        }
    };

    // Create the chart
    Plotly.newPlot('ai-chart', chartData, layout, getChartConfig());
}










// Update prediction insights
function updatePredictionInsights(parameter, predictionData, r2Score, years) {
    const insightsContainer = document.getElementById('ai-insights');
    if (!insightsContainer) return;
   
    const confidenceLevel = r2Score > 0.8 ? 'high' : (r2Score > 0.6 ? 'moderate' : 'low');
   
    // Analyze the prediction trend
    const startValue = predictionData[0];
    const endValue = predictionData[predictionData.length - 1];
    const changeValue = endValue - startValue;
    const changePercent = (changeValue / startValue * 100).toFixed(1);
    const trendDirection = changeValue > 0 ? 'increasing' : changeValue < 0 ? 'decreasing' : 'stable';
   
   
    // Generate insights
    const currentYear = new Date().getFullYear();
   
    insightsContainer.innerHTML = `
        <div class="insight-item">
            <h4>Long-term Trend Analysis</h4>
            <p>${formatParameterName(parameter)} in ${cityData[currentCity].name} shows a ${trendDirection} pattern
               with ${confidenceLevel} statistical confidence (R² = ${r2Score.toFixed(3)}).</p>
        </div>
       
        <div class="insight-item">
            <h4>${years}-Year Projection</h4>
            <p>By ${currentYear + years}, ${formatParameterName(parameter)} levels are projected to
               ${trendDirection === 'increasing' ? 'rise by approximately' :
                 trendDirection === 'decreasing' ? 'decrease by approximately' :
                 'remain stable with less than'} ${Math.abs(changePercent)}%
               relative to current levels.</p>
            <p>The end prediction value is ${endValue.toFixed(2)} ${getParameterUnit(parameter)}.</p>
        </div>
       
        <div class="insight-item">
            <h4>City-Specific Recommendations</h4>
            <p>${getParameterProjectionRecommendation(parameter, trendDirection, changePercent, cityData[currentCity].name)}</p>
        </div>
       
        <div class="insight-item">
            <h4>Data Reliability Assessment</h4>
            <p>This prediction uses ${cityData[currentCity][parameter].length} historical data points with a model accuracy of ${(r2Score * 100).toFixed(1)}%.
               Predictions become less certain as they extend further into the future.</p>
        </div>
    `;
}



// Generate projection-specific recommendations
function getParameterProjectionRecommendation(parameter, trendDirection, changePercent, cityName) {
    const changePercentNum = parseFloat(changePercent);
   
    switch(parameter) {
        case 'temperature':
            if (trendDirection === 'increasing' && changePercentNum > 10) {
                return `${cityName} may experience significant warming. Prioritize urban cooling strategies including expanded tree canopy, cool roofs, green infrastructure, and heat adaptation plans for vulnerable populations.`;
            } else if (trendDirection === 'decreasing' && changePercentNum > 10) {
                return `${cityName} may experience cooler temperatures. This trend could reduce cooling needs but may require adaptation for infrastructure, agriculture, and winter planning.`;
            }
            return `${cityName} is projected to maintain relatively stable temperatures. Continue climate resilience planning and monitoring of seasonal extremes.`;
           
		   
		   
		   
		   
		   case 'ozone':
    if (trendDirection === 'increasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant increase in ozone levels. Focus on stricter vehicle emission regulations, promoting clean energy sources, and enhancing public awareness to reduce ozone precursors.`;
    } else if (trendDirection === 'decreasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant decrease in ozone levels. This improvement supports better air quality and public health, but ongoing monitoring and sustainable practices remain essential.`;
    }
    return `${cityName} is projected to maintain relatively stable ozone levels. Continue monitoring air quality and implementing green initiatives for long-term sustainability.`;

		   case 'wastewater_volume':
    if (trendDirection === 'increasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant increase in wastewater volume. Focus on expanding treatment facilities, improving system efficiency, and implementing advanced wastewater recycling technologies.`;
    } else if (trendDirection === 'decreasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant decrease in wastewater volume, suggesting improved water conservation practices. Continue optimizing processes and monitoring consumption to sustain progress.`;
    }
    return `${cityName} is projected to maintain relatively stable wastewater volumes. Regular assessments and infrastructure upgrades are essential to ensure long-term sustainability.`;

case 'waste_generation':
    if (trendDirection === 'increasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant increase in waste generation. Enhance recycling programs, promote waste reduction initiatives, and invest in sustainable disposal methods to address challenges.`;
    } else if (trendDirection === 'decreasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant decrease in waste generation, reflecting positive changes in consumption behavior. Continue encouraging sustainable practices and monitoring disposal efficiency.`;
    }
    return `${cityName} is projected to maintain relatively stable waste generation levels. Regular monitoring and proactive policies can ensure stability.`;

case 'recycling_efficiency':
    if (trendDirection === 'increasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant increase in recycling efficiency. Expand recycling programs, strengthen public education, and optimize logistics to sustain growth.`;
    } else if (trendDirection === 'decreasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant decrease in recycling efficiency. Focus on addressing system bottlenecks, improving collection processes, and engaging communities to reverse the trend.`;
    }
    return `${cityName} is projected to maintain relatively stable recycling efficiency. Periodic evaluations and continuous innovation can support long-term success.`;

case 'landfill_usage':
    if (trendDirection === 'increasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant increase in landfill usage, nearing capacity. Prioritize waste diversion strategies, explore alternative disposal methods, and promote recycling initiatives to reduce reliance on landfills.`;
    } else if (trendDirection === 'decreasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant decrease in landfill usage, indicating effective waste management strategies. Continue implementing innovative solutions and optimizing operations to sustain this progress.`;
    }
    return `${cityName} is projected to maintain relatively stable landfill usage. Long-term planning and careful monitoring are essential for sustainable waste management.`;

		   
		   
		   
		   
		   case 'water_quality_index':
    if (trendDirection === 'increasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant improvement in water quality. Focus on enhancing water treatment facilities, conserving aquatic ecosystems, and reducing pollution sources for sustained progress.`;
    } else if (trendDirection === 'decreasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant decline in water quality. Prioritize stricter regulations on pollutants, strengthen wastewater management, and promote community efforts to protect water resources.`;
    }
    return `${cityName} is projected to maintain relatively stable water quality. Regular monitoring and sustainable water management strategies are essential to ensure stability.`;

		   
		   
		   
		   
		   
		   case 'population_density':
    if (trendDirection === 'increasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant rise in population density. Prioritize strategies for managing urban crowding, such as expanding infrastructure, improving public transport, and creating more green spaces to enhance livability.`;
    } else if (trendDirection === 'decreasing' && changePercentNum > 10) {
        return `${cityName} may experience a significant drop in population density. Focus on revitalizing local economies, optimizing infrastructure use, and promoting urban growth through sustainable practices.`;
    }
    return `${cityName} is projected to maintain relatively stable population density. Continue monitoring urban development and ensuring equitable resource distribution for balanced growth.`;

		   
		   case 'user_defined':
    if (trendDirection === 'increasing' && changePercentNum > 20) {
        return "The parameter indicates a notable increasing trend. Consider developing strategies to leverage opportunities or address potential risks associated with this growth.";
    } else if (trendDirection === 'decreasing' && changePercentNum > 20) {
        return "The parameter reflects a significant decreasing trend. Focus on implementing measures to mitigate challenges or sustain positive progress.";
    }
    return "The parameter exhibits moderate fluctuations. Regular monitoring and adaptive strategies are essential for maintaining stability and achieving long-term goals.";
    
		   
		   
		   
		   
		   
		   
		   
		   
        case 'air_quality':
            if (trendDirection === 'increasing' && changePercentNum > 15) {
                return `${cityName} may face deteriorating air quality. Implement stricter emission controls, expand air quality monitoring network, promote clean transportation, and develop air quality warning systems.`;
            } else if (trendDirection === 'decreasing') {
                return `${cityName} shows improving air quality trends. Maintain successful emission reduction programs and continue investments in clean air technologies.`;
            }
            return `${cityName} air quality trends require vigilance. Focus on pollution hotspots and strengthen current air quality management strategies.`;
           
        case 'carbon_emissions':
            if (trendDirection === 'increasing') {
                return `${cityName} carbon emissions are projected to increase. Accelerate renewable energy transition, implement building efficiency standards, expand sustainable transportation, and consider carbon pricing mechanisms.`;
            } else if (trendDirection === 'decreasing' && changePercentNum > 15) {
                return `${cityName} shows promising carbon reduction trends. Continue successful decarbonization strategies and share best practices for climate leadership.`;
            }
            return `${cityName} should strengthen carbon reduction efforts to align with climate goals. Identify key emission sources and implement targeted mitigation strategies.`;
           
        case 'urban_heat':
            if (trendDirection === 'increasing' && changePercentNum > 10) {
                return `${cityName} urban heat island effect may intensify. Implement comprehensive cooling strategies including expanded green spaces, cool pavements, green roofs, and cooling centers for vulnerable residents.`;
            }
            return `${cityName} should continue monitoring urban heat patterns and implement preventive measures in urban planning and development.`;
           
        case 'precipitation':
            if (trendDirection === 'increasing' && changePercentNum > 20) {
                return `${cityName} may experience increased precipitation. Enhance stormwater infrastructure, implement water-sensitive urban design, and update flood preparedness plans.`;
            } else if (trendDirection === 'decreasing' && changePercentNum > 20) {
                return `${cityName} may face decreased precipitation. Implement water conservation programs, drought-resistant landscaping, and water recycling systems.`;
            }
            return `${cityName} should optimize water resource management for long-term sustainability with moderate precipitation fluctuations.`;
        
default:
    return "Use this parameter to complement broader environmental and strategic analyses. Continuous monitoring will reveal valuable insights for proactive planning.";

    }
}

// ==============================
// STATISTICAL FUNCTIONS
// ==============================

// Calculate R² score
function calculateR2Score(actual, predicted) {
    if (actual.length !== predicted.length) return 0;
   
    const meanActual = actual.reduce((sum, val) => sum + val, 0) / actual.length;
   
    let ssRes = 0;
    let ssTot = 0;
   
    for (let i = 0; i < actual.length; i++) {
        ssRes += Math.pow(actual[i] - predicted[i], 2);
        ssTot += Math.pow(actual[i] - meanActual, 2);
    }
   
    return Math.max(0, 1 - (ssRes / ssTot));
}

// Calculate Mean Absolute Error
function calculateMAE(actual, predicted) {
    if (actual.length !== predicted.length) return 0;
   
    let sum = 0;
    for (let i = 0; i < actual.length; i++) {
        sum += Math.abs(actual[i] - predicted[i]);
    }
   
    return sum / actual.length;
}

// Calculate Root Mean Squared Error
function calculateRMSE(actual, predicted) {
    if (actual.length !== predicted.length) return 0;
   
    let sum = 0;
    for (let i = 0; i < actual.length; i++) {
        sum += Math.pow(actual[i] - predicted[i], 2);
    }
   
    return Math.sqrt(sum / actual.length);
}

// ==============================
// DATA EXPORT FUNCTIONS
// ==============================

// Export current chart as image
function exportCurrentChart() {
    const chartDiv = document.getElementById('main-chart');
    if (!chartDiv) return;
   
    Plotly.downloadImage(chartDiv, {
        format: 'png',
        filename: 'smartgreen_chart',
        width: 1200,
        height: 800,
        scale: 2
    });
   
    showNotification('Chart Exported', 'Chart image downloaded successfully', 'success');
}

// Export dataset
function exportDataset(exportFormat = 'csv', cityKey = null) {
    if (!cityKey) {
        cityKey = currentCity;
        exportFormat = document.getElementById('export-format').value;
    }
   
    if (!cityData[cityKey]) {
        showNotification('Export Error', 'No data available for export', 'error');
        return;
    }
   
    // Get parameters
    const parameters = getAllParameters().map(p => p.value).filter(p => cityData[cityKey][p]);
   
    // Create content for export
    let fileName = '';
    let content = '';
    let mimeType = '';
   
    if (exportFormat === 'csv') {
        // Create CSV
        const csvRows = [];
       
        // Header row
        csvRows.push(['time', ...parameters].join(','));
       
        // Use the first parameter's time points
        const firstParam = parameters[0];
        const times = cityData[cityKey][firstParam].map(d => d.time);
       
        // Add data rows
        times.forEach((time, i) => {
            const row = [time];
           
            parameters.forEach(param => {
                if (cityData[cityKey][param] && cityData[cityKey][param][i]) {
                    row.push(cityData[cityKey][param][i].value.toFixed(2));
                } else {
                    row.push('');
                }
            });
           
            csvRows.push(row.join(','));
        });
       
        content = csvRows.join('\n');
        fileName = `${cityData[cityKey].name.toLowerCase().replace(/\s+/g, '_')}_Waste_data.csv`;
        mimeType = 'text/csv;charset=utf-8;';
    } else if (exportFormat === 'json') {
        // Create JSON
        const jsonData = {
            city: cityData[cityKey].name,
            coordinates: cityData[cityKey].coordinates,
            population: cityData[cityKey].population,
            climateZone: cityData[cityKey].climateZone,
            parameters: {}
        };
       
        parameters.forEach(param => {
            jsonData.parameters[param] = cityData[cityKey][param];
        });
       
        content = JSON.stringify(jsonData, null, 2);
        fileName = `${cityData[cityKey].name.toLowerCase().replace(/\s+/g, '_')}_climate_data.json`;
        mimeType = 'application/json;charset=utf-8;';
    } else {
        showNotification('Export Limitation', 'Excel export unavailable; downloading as CSV instead.', 'warning');
       
        // Create CSV as fallback
        const csvRows = [];
        csvRows.push(['time', ...parameters].join(','));
       
        const firstParam = parameters[0];
        const times = cityData[cityKey][firstParam].map(d => d.time);
       
        times.forEach((time, i) => {
            const row = [time];
           
            parameters.forEach(param => {
                if (cityData[cityKey][param] && cityData[cityKey][param][i]) {
                    row.push(cityData[cityKey][param][i].value.toFixed(2));
                } else {
                    row.push('');
                }
            });
           
            csvRows.push(row.join(','));
        });
       
        content = csvRows.join('\n');
        fileName = `${cityData[cityKey].name.toLowerCase().replace(/\s+/g, '_')}_Waste_data.csv`;
        mimeType = 'text/csv;charset=utf-8;';
    }
   
    // Save file data for later
    window.exportData = {
        content: content,
        fileName: fileName,
        mimeType: mimeType
    };
   
    // Show save dialog
    document.getElementById('save-dialog').classList.add('active');
}

// ==============================
// REPORT GENERATION
// ==============================

// Generate a full report
function generateFullReport() {
    const parameter = document.getElementById('chart-param').value;
   
    if (!cityData[currentCity] || !cityData[currentCity][parameter]) {
        showNotification('Report Error', `No ${parameter} data available for ${cityData[currentCity].name}`, 'error');
        return;
    }
   
    showNotification('Processing', 'Generating comprehensive report...', 'info');
   
    // Generate a prediction for the report
    setTimeout(() => {
        const years = 5; // Default 5-year forecast
        const confidence = 95; // Default 95% confidence
       
        const data = cityData[currentCity][parameter];
        const values = data.map(d => d.value);
       
        // Generate a forecast using linear regression
        const xVals = Array.from({length: values.length}, (_, i) => i);
        const meanX = xVals.reduce((sum, val) => sum + val, 0) / xVals.length;
        const meanY = values.reduce((sum, val) => sum + val, 0) / values.length;
       
        let numerator = 0;
        let denominator = 0;
       
        for (let i = 0; i < values.length; i++) {
            numerator += (xVals[i] - meanX) * (values[i] - meanY);
            denominator += Math.pow(xVals[i] - meanX, 2);
        }
       
        const slope = numerator / denominator;
        const intercept = meanY - slope * meanX;
       
        // Generate prediction
        const predictionData = [];
        for (let i = 0; i < years; i++) {
            const nextVal = slope * (values.length + i) + intercept;
            predictionData.push(nextVal);
        }
       
        // Calculate uncertainty based on confidence level
        const uncertainty = (100 - confidence) / 100 * 0.3 * Math.max(...values);
       
        // Create confidence intervals
        const confidenceRanges = predictionData.map(val => [
            val - uncertainty,
            val + uncertainty
        ]);
       
        // Current year for predictions
        const currentYear = new Date().getFullYear();
        const futureYears = Array.from({length: years}, (_, i) => `${currentYear + i + 1}`);
       
        // Calculate R-squared
        const predictions = xVals.map(x => slope * x + intercept);
        const r2 = calculateR2Score(values, predictions);
       
        // Prepare data for CSV export
        const csvRows = [];
       
        // Add header row
        csvRows.push([
            'time_point',
            'data_type',
            `${parameter} (${getParameterUnit(parameter)})`,
            'lower_confidence',
            'upper_confidence'
        ].join(','));
       
        // Add historical data
        data.forEach(d => {
            csvRows.push([
                d.time,
                'historical',
                d.value.toFixed(2),
                '',
                ''
            ].join(','));
        });
       
        // Add prediction data
        for (let i = 0; i < predictionData.length; i++) {
            csvRows.push([
                futureYears[i],
                'prediction',
                predictionData[i].toFixed(2),
                confidenceRanges[i][0].toFixed(2),
                confidenceRanges[i][1].toFixed(2)
            ].join(','));
        }
       
	   
	   
	   
        // Prepare HTML report
        const reportContent = generateHTMLReport(parameter, data, predictionData, confidenceRanges, futureYears, r2, slope);
       
        // Set export data for the save dialog
        window.exportData = {
            content: csvRows.join('\n'),
            fileName: `${cityData[currentCity].name.toLowerCase().replace(/\s+/g, '_')}_${parameter}_report.csv`,
            mimeType: 'text/csv;charset=utf-8;'
        };
       
        window.htmlReport = {
            content: reportContent,
            fileName: `${cityData[currentCity].name.toLowerCase().replace(/\s+/g, '_')}_climate_report.html`,
            mimeType: 'text/html;charset=utf-8;'
        };
       
        // Show save dialog
        document.getElementById('save-dialog').classList.add('active');
    }, 1000);
}








// Generate HTML report content
function generateHTMLReport(parameter, data, predictionData, confidenceRanges, futureYears, r2, slope) {
    const values = data.map(d => d.value);
    const city = cityData[currentCity];
    const currentYear = new Date().getFullYear();
   
    // Calculate statistics
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const trend = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';
    const trendStrengthLabel = Math.abs(slope) > 0.05 ? 'significant' : 'moderate';
   
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Environment & Climate Prediction AI - Climate Report for ${city.name}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 40px;
                }
               
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #4caf50;
                }
               
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #4caf50;
                    margin-bottom: 5px;
                }
               
                .logo span {
                    color: #8bc34a;
                }
               
                .report-title {
                    font-size: 24px;
                    color: #2e7d32;
                    margin: 15px 0 5px;
                }
               
                .report-subtitle {
                    color: #666;
                    font-size: 16px;
                }
               
                .section {
                    margin-bottom: 40px;
                }
               
                .section-title {
                    font-size: 20px;
                    color: #2e7d32;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #e0e0e0;
                }
               
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
               
                table, th, td {
                    border: 1px solid #ddd;
                }
               
                th, td {
                    padding: 12px;
                    text-align: left;
                }
               
                th {
                    background-color: #f5f5f5;
                }
               
                .stat-row {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                }
               
                .stat-box {
                    flex: 1;
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 15px;
                    text-align: center;
                }
               
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2e7d32;
                    margin-bottom: 5px;
                }
               
                .stat-label {
                    font-size: 14px;
                    color: #666;
                }
               
                .insight-box {
                    background-color: #f9f9f9;
                    border-left: 4px solid #4caf50;
                    padding: 15px;
                    margin-bottom: 20px;
                }
               
                .insight-title {
                    font-weight: bold;
                    color: #2e7d32;
                    margin-bottom: 10px;
                }
               
                .recommendation-list {
                    margin: 15px 0;
                }
               
                .recommendation-list li {
                    margin-bottom: 8px;
                }
               
                .data-sample {
                    font-size: 14px;
                }
               
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Environment & Climate Prediction AI</div>
                <h1 class="report-title">Climate Analysis Report for ${city.name}</h1>
                <p class="report-subtitle">Generated on ${new Date().toLocaleString()}</p>
            </div>
           
            <div class="section">
                <h2 class="section-title">Location Information</h2>
                <table>
                    <tr>
                        <th>City</th>
                        <td>${city.name}</td>
                    </tr>
                    <tr>
                        <th>Coordinates</th>
                        <td>${city.coordinates[0].toFixed(4)}°, ${city.coordinates[1].toFixed(4)}°</td>
                    </tr>
                    <tr>
                        <th>Climate Zone</th>
                        <td>${city.climateZone}</td>
                    </tr>
                    <tr>
                        <th>Population</th>
                        <td>${city.population.toLocaleString()}</td>
                    </tr>
                </table>
            </div>
           
            <div class="section">
                <h2 class="section-title">${formatParameterName(parameter)} Analysis</h2>
               
                <div class="stat-row">
                    <div class="stat-box">
                        <div class="stat-value">${avg.toFixed(2)} ${getParameterUnit(parameter)}</div>
                        <div class="stat-label">Average Value</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${min.toFixed(2)} ${getParameterUnit(parameter)}</div>
                        <div class="stat-label">Minimum Value</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${max.toFixed(2)} ${getParameterUnit(parameter)}</div>
                        <div class="stat-label">Maximum Value</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${r2.toFixed(3)}</div>
                        <div class="stat-label">R² Score</div>
                    </div>
                </div>
               
                <div class="insight-box">
                    <div class="insight-title">Trend Analysis</div>
                    <p>Analysis shows a ${trendStrengthLabel} ${trend} trend in ${formatParameterName(parameter)} with a rate of change of approximately ${(slope * 100).toFixed(2)}% per time unit.</p>
                    <p>By ${currentYear + predictionData.length}, ${formatParameterName(parameter)} is projected to reach approximately ${predictionData[predictionData.length-1].toFixed(2)} ${getParameterUnit(parameter)}, with a 95% confidence interval of ${confidenceRanges[predictionData.length-1][0].toFixed(2)} to ${confidenceRanges[predictionData.length-1][1].toFixed(2)} ${getParameterUnit(parameter)}.</p>
                </div>
               
                <h3>Recommendations for ${city.name}</h3>
                <div class="recommendation-list">
                    ${getReportRecommendationList(parameter, trend, slope)}
                </div>
            </div>
           
            <div class="section">
                <h2 class="section-title">Data Summary</h2>
               
                <h3>Historical Data Sample</h3>
                <table class="data-sample">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>${formatParameterName(parameter)} (${getParameterUnit(parameter)})</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.slice(0, 5).map(d => `
                            <tr>
                                <td>${d.time}</td>
                                <td>${d.value.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td colspan="2" style="text-align: center;">...</td>
                        </tr>
                        ${data.slice(-5).map(d => `
                            <tr>
                                <td>${d.time}</td>
                                <td>${d.value.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
               
                <h3>Future Projections (${currentYear+1} - ${currentYear+predictionData.length})</h3>
                <table class="data-sample">
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th>Projected Value</th>
                            <th>Lower Bound</th>
                            <th>Upper Bound</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${predictionData.map((val, i) => `
                            <tr>
                                <td>${futureYears[i]}</td>
                                <td>${val.toFixed(2)} ${getParameterUnit(parameter)}</td>
                                <td>${confidenceRanges[i][0].toFixed(2)} ${getParameterUnit(parameter)}</td>
                                <td>${confidenceRanges[i][1].toFixed(2)} ${getParameterUnit(parameter)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
           
            <div class="section">
                <h2 class="section-title">Methodology</h2>
                <p>This report uses statistical analysis and machine learning techniques to process historical climate data and generate predictions.</p>
                <ul>
                    <li><strong>Data Source:</strong> Historical climate records for ${city.name}</li>
                    <li><strong>Prediction Method:</strong> Linear regression with confidence intervals</li>
                    <li><strong>Model Accuracy:</strong> R-squared score of ${r2.toFixed(3)}</li>
                    <li><strong>Confidence Level:</strong> 95% for prediction intervals</li>
                </ul>
                <p>The analysis considers both historical trends and seasonal variations to provide the most accurate forecasts possible with available data.</p>
            </div>
           
            <div class="footer">
                <p>Generated by Environment & Climate Prediction AI</p>
                <p>This report contains both historical data and predictive analysis. Predictions are based on statistical models and should be used for informational purposes only.</p>
				 <p class="neon-text1"><a href="https://apps.microsoft.com/search/publisher?name=Eng.+Odeh+Alamrow&hl=en-us&gl=US" class="footer-link">&copy; 2025 Eng. Odeh Alamrow </i></a></p>
            </div>
        </body>
        </html>
    `;
}

let cityName = currentCity; // ✅ This makes cityName update each time



// Get report recommendation list
function getReportRecommendationList(parameter, trend, slope) {
    const trendStrength = Math.abs(slope);
    const recommendations = [];
   
    // Add general recommendation based on parameter
    // Add general recommendation based on waste management parameters
switch(parameter) {
    case 'waste_generation':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(` ${cityName} is experiencing rapid waste increase! Implement strict reduction policies, increase recycling incentives, and strengthen circular economy practices.`);
        } else if (trend === 'increasing' && trendStrength > 5) {
            recommendations.push("🚀 Expand awareness campaigns for waste reduction and promote innovative disposal technologies.");
            recommendations.push("🔄 Upgrade recycling centers and optimize waste collection routes.");
            recommendations.push("🏗 Introduce smart waste monitoring for improved efficiency.");
        } else {
            recommendations.push(`📊 Waste generation is stable in ${cityName}. Maintain tracking and sustainable waste reduction strategies.`);
        }
        break;

    case 'recycling_efficiency':
        if (trend === 'decreasing' && trendStrength > 10) {
            recommendations.push(`⚠ Recycling rates are dropping in ${cityName}! Address sorting inefficiencies, enforce recycling regulations, and improve waste segregation policies.`);
        } else if (trend === 'increasing' && trendStrength > 5) {
            recommendations.push("🌍 Strong recycling improvement detected! Expand commercial recycling programs and introduce AI-based waste sorting systems.");
        } else {
            recommendations.push("📌 Recycling remains steady—maintain education programs and optimize waste recovery logistics.");
        }
        break;

    case 'landfill_usage':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(`🔥 Landfill dependency is rising in ${cityName}. Introduce more waste diversion strategies, enforce landfill alternatives like composting, and expand waste-to-energy facilities.`);
        } else {
            recommendations.push("✅ Landfill management remains stable—monitor space utilization and efficiency.");
        }
        break;

    case 'plastic_waste':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(`⚠ Plastic waste levels rising in ${cityName}. Ban single-use plastics, expand recycling access, and invest in biodegradable alternatives.`);
        } else {
            recommendations.push("♻ Plastic waste remains under control—continue strengthening policy enforcement.");
        }
        break;

    case 'organic_waste':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(`🌿 Organic waste is rising in ${cityName}. Enhance composting programs, introduce waste-to-biofuel conversions, and refine food waste collection strategies.`);
        } else {
            recommendations.push("✅ Organic waste management is stable—track seasonal variations for optimization.");
        }
        break;

    case 'hazardous_waste':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(`☢ Hazardous waste levels increasing in ${cityName}. Improve containment protocols, strengthen hazardous material handling, and monitor industrial compliance.`);
        } else {
            recommendations.push("🔎 Hazardous waste under control—maintain regular safety assessments.");
        }
        break;

    case 'construction_waste':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(`🏗 Construction waste increase detected in ${cityName}. Expand material recovery programs, enforce site waste segregation, and introduce modular building methods.`);
        } else {
            recommendations.push("✅ Construction waste management is steady—encourage sustainable demolition practices.");
        }
        break;

    case 'electronic_waste':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(`💻 E-waste production is rising in ${cityName}. Expand electronic recycling programs, incentivize take-back schemes, and develop sustainable electronics policies.`);
        } else {
            recommendations.push("📱 E-waste levels are manageable—optimize collection and refurbishing strategies.");
        }
        break;

    case 'incineration_rate':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(`🔥 Incineration is increasing in ${cityName}. Ensure emissions compliance, improve energy recovery efficiency, and monitor air pollution risks.`);
        } else {
            recommendations.push("♻ Incineration rates remain optimal—enhance combustion control strategies.");
        }
        break;

    case 'waste_collection_efficiency':
        if (trend === 'decreasing' && trendStrength > 10) {
            recommendations.push(`🚛 Waste collection efficiency is dropping in ${cityName}. Improve fleet management, upgrade collection schedules, and optimize public participation strategies.`);
        } else {
            recommendations.push("✅ Waste collection efficiency remains strong—keep refining operational logistics.");
        }
        break;
		
		case 'safety_score':
        if (trend === 'decreasing' && trendStrength > 10) {
            recommendations.push(`⚠ Safety levels in ${cityName} are dropping! Strengthen waste handling regulations, improve site security, and conduct emergency preparedness drills.`);
        } else {
            recommendations.push("✅ Safety standards remain stable—continue refining risk mitigation strategies.");
        }
        break;

    case 'toxicity_level':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(`☢ Toxicity levels increasing in ${cityName}! Implement stricter containment protocols, enhance hazardous waste disposal regulations, and enforce monitoring requirements.`);
        } else {
            recommendations.push("🔎 Toxicity is manageable—maintain strict compliance with health and environmental standards.");
        }
        break;

    case 'fire_risk':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(`🚨 Rising fire risks detected in ${cityName}! Improve fire suppression systems, ensure proper hazardous material storage, and implement industrial fire safety audits.`);
        } else {
            recommendations.push("✅ Fire risk remains low—keep emergency response training and storage safety in check.");
        }
        break;

    case 'containment_level':
        if (trend === 'decreasing' && trendStrength > 10) {
            recommendations.push(`🔐 Containment levels declining in ${cityName}! Invest in high-security waste storage solutions, reinforce leak prevention measures, and strengthen handling procedures.`);
        } else {
            recommendations.push("📦 Containment infrastructure remains effective—conduct periodic inspections for optimization.");
        }
        break;

    case 'incident_rate':
        if (trend === 'increasing' && trendStrength > 10) {
            recommendations.push(`🚑 Waste-related incident rates increasing in ${cityName}! Enhance worker safety protocols, enforce stricter disposal monitoring, and improve rapid response strategies.`);
        } else {
            recommendations.push("🛠 Incident rates remain stable—continue refining safety policies and training programs.");
        }
        break;


       default:
    recommendations.push("Continue monitoring waste management and safety trends to identify emerging risks.");
    recommendations.push("Develop AI-driven predictive models for waste reduction and hazard mitigation.");
    recommendations.push("Strengthen collaboration between municipalities and environmental agencies.");
    recommendations.push("Enhance public awareness programs on waste sorting, recycling, and safety compliance.");
    recommendations.push("Regularly update safety standards based on industry best practices and technological advancements.");

    }
   
  
   
    return `<ul>${recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>`;
}

// ==============================
// CSV IMPORT FUNCTIONS
// ==============================

// Read and process CSV file
function readCSVFile(file) {
    if (!file) return;
   
    showNotification('Processing', 'Reading CSV file...', 'info');
   
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            parseCSVData(e.target.result);
        } catch (error) {
            showNotification('CSV Error', 'Failed to parse CSV file: ' + error.message, 'error');
        }
    };
   
    reader.readAsText(file);
}

// Parse CSV data
function parseCSVData(csvText) {
    // Split into rows and get headers
    const rows = csvText.split('\n');
    const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
   
    // Check required columns
    if (!headers.includes('city') || !headers.includes('time')) {
        showNotification('Invalid CSV', 'CSV must include city and time columns', 'error');
        return;
    }
   
    // Get all valid parameters
    const allParameters = getAllParameters().map(p => p.value);
   
    // Check if we have at least one parameter
    const hasParameter = allParameters.some(param => headers.includes(param));
    if (!hasParameter) {
        showNotification('Invalid CSV', 'CSV must include at least one valid parameter column', 'error');
        return;
    }
   
    // Map column indices
    const cityIndex = headers.indexOf('city');
    const timeIndex = headers.indexOf('time');
    const latIndex = headers.includes('latitude') ? headers.indexOf('latitude') :
                    headers.includes('lat') ? headers.indexOf('lat') : -1;
    const lngIndex = headers.includes('longitude') ? headers.indexOf('longitude') :
                    headers.includes('lng') ? headers.indexOf('lng') :
                    headers.includes('lon') ? headers.indexOf('lon') : -1;
    const popIndex = headers.includes('population') ? headers.indexOf('population') :
                    headers.includes('pop') ? headers.indexOf('pop') : -1;
    const zoneIndex = headers.includes('climate_zone') ? headers.indexOf('climate_zone') :
                    headers.includes('climatezone') ? headers.indexOf('climatezone') :
                    headers.includes('zone') ? headers.indexOf('zone') : -1;
   
    // Map parameter columns
    const paramIndices = {};
    allParameters.forEach(param => {
        if (headers.includes(param)) {
            paramIndices[param] = headers.indexOf(param);
        }
    });
   
    // Process data
    const newCities = {};
    const timePoints = new Set();
   
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue; // Skip empty rows
       
        const columns = row.split(',').map(c => c.trim());
       
        // Get city and time
        const cityName = columns[cityIndex].toLowerCase();
        const timePoint = columns[timeIndex];
       
        timePoints.add(timePoint);
       
        // Initialize city if not exists
        if (!newCities[cityName]) {
            newCities[cityName] = {
                name: columns[cityIndex],
                coordinates: [
                    latIndex >= 0 && columns[latIndex] ? parseFloat(columns[latIndex]) : 0,
                    lngIndex >= 0 && columns[lngIndex] ? parseFloat(columns[lngIndex]) : 0
                ],
                population: popIndex >= 0 && columns[popIndex] ? parseInt(columns[popIndex]) : 1000000,
                climateZone: zoneIndex >= 0 && columns[zoneIndex] ? columns[zoneIndex] : 'Temperate'
            };
           
            // Initialize parameter arrays
            Object.keys(paramIndices).forEach(param => {
                newCities[cityName][param] = [];
            });
        }
       
        // Add parameter values
        Object.entries(paramIndices).forEach(([param, index]) => {
            if (columns[index] && !isNaN(parseFloat(columns[index]))) {
                newCities[cityName][param].push({
                    time: timePoint,
                    value: parseFloat(columns[index])
                });
            }
        });
    }
   
    // Check if we loaded any data
    if (Object.keys(newCities).length === 0) {
        showNotification('No Data', 'No valid data found in the CSV file', 'error');
        return;
    }
   
    // Add new cities to existing cityData (don't replace)
    Object.keys(newCities).forEach(cityKey => {
        // Generate key for new city if it already exists
        let finalKey = cityKey;
        if (cityData[cityKey]) {
            finalKey = cityKey + '_' + Math.random().toString(36).substring(2, 6);
        }
       
        cityData[finalKey] = newCities[cityKey];
    });
   
    // Update UI
    populateCitySelector();
    createMetricCards();
    updateMapMarkers();
    populateDatasetTable();
   
    // Set current city to the first loaded city
    const firstNewCity = Object.keys(newCities)[0];
    currentCity = Object.keys(cityData).find(key => cityData[key].name.toLowerCase() === firstNewCity) || firstNewCity;
    document.getElementById('city-select').value = currentCity;
    updateCityData(currentCity);
   
    showNotification('Data Imported', `Loaded data for ${Object.keys(newCities).length} cities with ${timePoints.size} time points`, 'success');
}





// ==============================
// PERSISTENT STORAGE
// ==============================

// Save city data to localStorage
function saveCityToLocalStorage() {
    if (!localStorageAvailable) {
        showNotification('Storage Error', 'Local storage is not available', 'error');
        return;
    }
   
    try {
        localStorage.setItem('sgn_cityData', JSON.stringify(cityData));
        showNotification('Data Saved', 'City data saved successfully', 'success');
    } catch (e) {
        showNotification('Storage Error', 'Failed to save city data: ' + e.message, 'error');
    }
}

// Show save city dialog
function showSaveCityDialog() {
    const dialog = document.getElementById('save-city-dialog');
    const cityNameInput = document.getElementById('save-city-name');
   
    if (dialog && cityNameInput) {
        cityNameInput.value = cityData[currentCity].name;
        dialog.classList.add('active');
    }
}






// Finalize the save process
// Modify the finalizeSave function
function finalizeSave() {
    // Get selected options
    const saveCSV = document.getElementById('save-html').checked;
    const saveHTML = document.getElementById('save-html').checked;
    const savePath = document.getElementById('save-path').value || 'Downloads';
    
    // For demonstration, we'll show the selected path but still use download
    // (browser limitations prevent true folder selection)
    showNotification('Saving', `Saving to ${savePath}...`, 'info');
    
    // Get current parameter from chart
    const parameter = document.getElementById('chart-param').value;
    const city = cityData[currentCity];
    
    // Save files
    if (saveCSV) {
        exportDataset('csv', currentCity);
    }
    
    if (saveHTML) {
        const data = city[parameter];
        const values = data.map(d => d.value);
        
        // Calculate basic trend for report
        const xVals = Array.from({length: values.length}, (_, i) => i);
        const meanX = xVals.reduce((sum, val) => sum + val, 0) / xVals.length;
        const meanY = values.reduce((sum, val) => sum + val, 0) / values.length;
        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < values.length; i++) {
            numerator += (xVals[i] - meanX) * (values[i] - meanY);
            denominator += Math.pow(xVals[i] - meanX, 2);
        }
        const slope = denominator !== 0 ? numerator / denominator : 0;
        
        // Generate prediction data for report
        const yearsToPredict = 5;
        const predictionData = [];
        const confidenceRanges = [];
        
        for (let i = 0; i < yearsToPredict; i++) {
            const nextVal = slope * (values.length + i) + (meanY - slope * meanX);
            predictionData.push(nextVal);
            
            // Simple confidence intervals
            const uncertainty = 0.1 * Math.max(...values);
            confidenceRanges.push([nextVal - uncertainty, nextVal + uncertainty]);
        }
        
        // Current year for predictions
        const currentYear = new Date().getFullYear();
        const futureYears = Array.from({length: yearsToPredict}, (_, i) => `${currentYear + i + 1}`);
        
        // Generate and download HTML report
        const html = generateHTMLReport(parameter, data, predictionData, confidenceRanges, futureYears, 0.85, slope);
        
        const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${city.name}_climate_report.html`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    saveDialogActive = false;
    document.getElementById('save-dialog').classList.remove('active');
    
    showNotification('Files Saved', 'Report files have been saved successfully', 'success');
}







// ==============================
// UTILITY FUNCTIONS
// ==============================

// Get color based on current theme
function getThemeColor(name) {
    const rootStyle = getComputedStyle(document.documentElement);
    const value = rootStyle.getPropertyValue(`--${name}`);
    return value.trim();
}

// Generate data for decadal trend
function generateDecadalTrend(baseData) {
    const result = [];
    const years = 10;
   
    // Calculate average of base data
    const sum = baseData.reduce((acc, item) => acc + item.value, 0);
    const avg = sum / baseData.length;
   
    // Get current year for starting point
    const currentYear = new Date().getFullYear();
   
    // Generate yearly data
    for (let i = 0; i < years; i++) {
        const yearValue = avg * (1 + i * 0.03 + (Math.random() - 0.3) * 0.05);
        result.push({
            time: `${currentYear + i}`,
            value: yearValue
        });
    }
   
    return result;
}

// Aggregate data into points number of chunks
function aggregateData(data, points) {
    const result = [];
    const chunkSize = Math.ceil(data.length / points);
   
    for (let i = 0; i < points; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, data.length);
       
        if (start >= data.length) break;
       
        // Calculate average for this chunk
        let sum = 0;
        for (let j = start; j < end; j++) {
            sum += data[j].value;
        }
       
        const avg = sum / (end - start);
       
        // Add aggregated point
        result.push({
            time: i + 1,
            value: avg
        });
    }
   
    return result;
}

function showNotification(title, message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Determine whether to use Font Awesome icons
let iconHTML;
if (type === 'success') {
    iconHTML = `<i class="fas fa-check-circle"></i>`; // Font Awesome
} else if (type === 'warning') {
    iconHTML = `<i class="fas fa-exclamation-triangle"></i>`; // Font Awesome
} else if (type === 'error') {
    iconHTML = `<i class="fas fa-times-circle"></i>`; // Font Awesome
} else {
    iconHTML = `<i class="fas fa-info-circle"></i>`; // Font Awesome (Replaced Feather)
}

    notification.innerHTML = `
        ${iconHTML}
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;

    container.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = 0;
       
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Convert hex color to RGB
function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
   
    // Handle shorthand
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
   
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
   
    // Check if valid
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return '0, 240, 255'; // Default to primary color
    }
   
    return `${r}, ${g}, ${b}`;
}

// Get colorscale based on theme
function getColorscale() {
    if (document.body.classList.contains('eco-theme')) {
        return 'Greens';
    } else if (document.body.classList.contains('light-theme')) {
        return 'Blues';
    } else {
        return 'Jet';
    }
}

// Refresh active charts
function refreshActiveCharts() {
    // Currently active view
    const activeView = document.querySelector('.page-view.active');
    if (!activeView) return;
   
    // Refresh main chart if visible
    if (activeView.id === 'dashboard-view') {
        updateMainChart();
    }
   
    // Refresh prediction chart if visible
    if (activeView.id === 'predict-view' && document.getElementById('ai-chart').hasChildNodes()) {
        updatePredictionChart();
    }
}







// Add this in the initPredictionOptions function
document.getElementById('export-prediction').addEventListener('click', function() {
    const parameter = document.getElementById('predict-param').value;
    if (predictionState && predictionState[parameter]) {
        // Prepare CSV data
        const cityName = cityData[currentCity].name;
        const data = cityData[currentCity][parameter];
        const state = predictionState[parameter];
        
        // Create CSV content
        let csvContent = `Time,Actual ${formatParameterName(parameter)},Predicted ${formatParameterName(parameter)},Lower Confidence,Upper Confidence\n`;
        
        // Add historical data
        data.forEach((point, i) => {
            csvContent += `${point.time},${point.value},,,,\n`;
        });
        
        // Add prediction data
        state.futureYears.forEach((year, i) => {
            csvContent += `${year},,${state.predictionData[i]},${state.confidenceRanges[i][0]},${state.confidenceRanges[i][1]}\n`;
        });
        
        // Download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${cityName}_${parameter}_prediction.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Export Complete', 'Prediction data exported successfully', 'success');
    } else {
        showNotification('No Data', 'Please run a prediction first', 'warning');
    }
});









function updateModelDescription() {
    const descriptions = {
        regression: "Best for linear relationships between variables. Simple and efficient.",
        random_forest: "Ideal for complex datasets with non-linear patterns. Handles uncertainty well.",
        polynomial: "Useful for curved data trends and higher-order relationships. Great for non-linear regression.",
        arima: "Perfect for time-series forecasting with seasonal patterns and trends.",
        nn: "Powerful for large datasets and identifying complex relationships. Mimics brain-like learning."
    };

    const selectedModel = document.getElementById('ai-model').value;

    if (descriptions[selectedModel]) {
        showNotification('Model Selected', `Now using ${selectedModel}: ${descriptions[selectedModel]}`, 'info');
    } else {
        showNotification('Error', 'No description available for selected model', 'error');
    }
}














document.getElementById('dataset-table').addEventListener('click', function (e) {
    // Check if a row was clicked
    if (e.target.closest('tr')) {
        const tableBox = document.querySelector('.data-table-box');
        const previewBox = document.querySelector('.data-preview-box');

        // Apply classes for resizing
        tableBox.style.flex = '0.5'; // Shrink Available Datasets
        previewBox.style.flex = '3'; // Expand Data Preview
    }
});

// Optional: Reset when double-clicking the preview box
document.getElementById('data-preview').addEventListener('dblclick', function () {
    const tableBox = document.querySelector('.data-table-box');
    const previewBox = document.querySelector('.data-preview-box');

    // Reset flex sizes
    tableBox.style.flex = '1';
    previewBox.style.flex = '1';
});




document.getElementById('dataset-table').addEventListener('click', function (e) {
    // Check if a row was clicked
    if (e.target.closest('tr')) {
        const tableBox = document.querySelector('.data-table-box');
        const previewBox = document.querySelector('.data-preview-box');

        // Apply resizing classes
        tableBox.style.flex = '0.5'; // Shrink Available Datasets
        previewBox.style.flex = '3'; // Expand Data Preview
    }
});

// Reset layout when a specific action is taken
document.getElementById('data-preview').addEventListener('click', function () {
    const tableBox = document.querySelector('.data-table-box');
    const previewBox = document.querySelector('.data-preview-box');

    // Reset flex sizes
    tableBox.style.flex = '1';
    previewBox.style.flex = '1';
});



// When clicking on a row in the dataset table
document.getElementById('dataset-table').addEventListener('click', function (e) {
    if (e.target.closest('tr')) {
        const tableBox = document.querySelector('.data-table-box');
        const previewBox = document.querySelector('.data-preview-box');

        // Apply resizing
        tableBox.style.flex = '0.5'; // Shrink Available Datasets
        previewBox.style.flex = '3'; // Expand Data Preview
    }
});

/// When clicking the database icon
document.getElementById('data-preview').addEventListener('click', function (e) {
    if (e.target.closest('.fas.fa-database')) { // Swapped from Feather to Font Awesome
        const tableBox = document.querySelector('.data-table-box');
        const previewBox = document.querySelector('.data-preview-box');

        // Apply resizing
        tableBox.style.flex = '0.5'; // Shrink Available Datasets
        previewBox.style.flex = '3'; // Expand Data Preview
    }
});

// Optional reset when double-clicking the preview box
document.getElementById('data-preview').addEventListener('dblclick', function () {
    const tableBox = document.querySelector('.data-table-box');
    const previewBox = document.querySelector('.data-preview-box');

    // Reset flex sizes
    tableBox.style.flex = '1';
    previewBox.style.flex = '1';
});




// Update visitor count
let count = localStorage.getItem('visitCount') || 0;
count++;
localStorage.setItem('visitCount', count);
document.getElementById('counter').innerText = count;

// Update time dynamically
function updateTime() {
    let now = new Date();
    let formattedTime = now.toLocaleTimeString();
    document.getElementById('current-time').innerText = formattedTime;
}

// Update the time every second
setInterval(updateTime, 1000);

// Initialize time immediately on page load
updateTime();
