// URL for the earthquake data (past 7 days)
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the data from the USGS API
d3.json(queryUrl).then(function(data) {
    // Process the data to display on the map
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Function to create popups for each feature
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // Function to determine marker size based on magnitude
    function markerSize(magnitude) {
        return magnitude * 4;
    }

    // Function to determine marker color based on depth
    function markerColor(depth) {
        return depth > 90 ? "#FF0000" :
               depth > 70 ? "#FF8C00" :
               depth > 50 ? "#FFD700" :
               depth > 30 ? "#ADFF2F" :
               depth > 10 ? "#9ACD32" :
                            "#00FF00";
    }

    // GeoJSON layer containing the features array
    const earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8 
            });
        },
        onEachFeature: onEachFeature // Bind popups to each marker
    });

    // Call function to create the map and add the layers
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Define the tile layer that will be the background of the map
    const streetmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    });

    // Define a baseMaps object to hold the streetmap layer
    const baseMaps = {
        "Street Map": streetmap
    };

    // OverlayMaps object to hold the earthquakes layer
    const overlayMaps = {
        Earthquakes: earthquakes
    };

    // The map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // A layer control, pass in the baseMaps and overlayMaps, and add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // The legend and add it to the map
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend");
        div.style.backgroundColor = "white"; 
        div.style.padding = "6px 8px";
        div.style.fontSize = "12px";
        const depths = [-10, 10, 30, 50, 70, 90];
        const colors = ["#00FF00", "#9ACD32", "#ADFF2F", "#FFD700", "#FF8C00", "#FF0000"];
    
        // Loop through our depth intervals and generate a label with a colored square for each interval
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                `<i style="background:${colors[i]}; width: 18px; height: 18px; display: inline-block;"></i> ${depths[i]}${(depths[i + 1] ? '&ndash;' + depths[i + 1] : '+')}<br>`;
        }
        return div;
    };
    legend.addTo(myMap);
}
