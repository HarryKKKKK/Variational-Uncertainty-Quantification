window.HELP_IMPROVE_VIDEOJS = false;

$(document).ready(function () {
  // === Bulma Carousel ===
  var options = {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
  };
  bulmaCarousel.attach('.carousel', options);
  bulmaSlider.attach();

  // === Plotly axis and heatmap preparation ===
  const xmin = -4.5;
  const xmax = 4.5;
  const ymin = -4.5;
  const ymax = 4.5;
  const step = 0.5;

  const x = [];
  const y = [];
  for (let val = xmin; val <= xmax; val += step) {
    x.push(val);
  }
  for (let val = ymin; val <= ymax; val += step) {
    y.push(val);
  }

  const z = [];
  for (let i = 0; i < y.length; i++) {
    const row = [];
    for (let j = 0; j < x.length; j++) {
      row.push(0);
    }
    z.push(row);
  }

  const trace1 = {
    x: [],
    y: [],
    mode: 'markers',
    marker: {
      color: [],
      size: [],
      line: { width: 2, color: 'white' }
    },
    type: 'scatter',
    hoverinfo: 'none'
  };

  const customColorscale = [
    [0, 'white'],
    [0.2, 'rgba(220,230,247,1)'],
    [0.4, 'rgba(189,215,231,1)'],
    [0.6, 'rgba(107,174,214,1)'],
    [0.8, 'rgba(49,130,189,1)'],
    [1, 'rgba(8,81,156,1)']
  ];

  const heatmap = {
    z: z,
    x: x,
    y: y,
    type: 'heatmap',
    colorscale: customColorscale,
    zmin: 0,
    zmax: 1,
    opacity: 0.6,
    hoverinfo: 'none'
  };

  // === Plotly axis and layout setup ===
  const allTickValsX = [];
  const allTickTextX = [];
  const allTickValsY = [];
  const allTickTextY = [];

  for (let val = xmin; val <= xmax; val += step) {
    allTickValsX.push(val);
    allTickTextX.push(Number.isInteger(val) ? val.toString() : '');
  }
  for (let val = ymin; val <= ymax; val += step) {
    allTickValsY.push(val);
    allTickTextY.push(Number.isInteger(val) ? val.toString() : '');
  }

  const layout = {
    height: 600,
    margin: { t: 10 },
    xaxis: {
      range: [xmin, xmax],
      fixedrange: true,
      tickvals: allTickValsX,
      ticktext: allTickTextX,
      gridcolor: 'rgba(200, 200, 200, 0.8)',
      tickcolor: 'rgba(200, 200, 200, 0.8)',
      ticks: 'outside',
      ticklen: 8,
      tickwidth: 1.5
    },
    yaxis: {
      range: [ymin, ymax],
      fixedrange: true,
      tickvals: allTickValsY,
      ticktext: allTickTextY,
      gridcolor: 'rgba(200, 200, 200, 0.8)',
      tickcolor: 'rgba(200, 200, 200, 0.8)',
      ticks: 'outside',
      ticklen: 8,
      tickwidth: 1.5
    }
  };
  const config = { displayModeBar: false };

  // === Helper Functions ===
  function roundToHalf(num) {
    return Math.round(num * 2) / 2;
  }

  function isPointExists(x, y) {
    return trace1.x.some((xi, i) => Math.abs(xi - x) < 1e-6 && Math.abs(trace1.y[i] - y) < 1e-6);
  }

  function updatePlot() {
    if (!Array.isArray(trace1.marker.size)) {
      trace1.marker.size = Array(trace1.x.length).fill(trace1.marker.size || 12);
    }

    Plotly.deleteTraces('plot', 1);
    Plotly.addTraces('plot', trace1);

    updatePointInfo();
  }

  function updatePointInfo() {
    const infoDiv = document.getElementById('point-info');
    let infoHTML = '<strong>Added dots:</strong><ul>';
    for (let i = 0; i < trace1.x.length; i++) {
      infoHTML += `<li>Point ${i + 1}: (${trace1.x[i].toFixed(2)}, ${trace1.y[i].toFixed(2)}), ${trace1.marker.color[i]}</li>`;
    }
    infoHTML += '</ul>';
    infoDiv.innerHTML = infoHTML;
  }

  // === Drag balls ===
  document.querySelectorAll('.draggable-ball').forEach(ball => {
    ball.addEventListener('dragstart', e => {
      e.dataTransfer.setData('color', ball.dataset.color);
    });
  });

  const plotDiv = document.getElementById('plot');

  plotDiv.addEventListener('dragover', e => {
    e.preventDefault();
  });

  plotDiv.addEventListener('drop', e => {
    e.preventDefault();

    const color = e.dataTransfer.getData('color');
    const [xPix, yPix] = [e.offsetX, e.offsetY];

    const xaxis = plotDiv._fullLayout.xaxis;
    const yaxis = plotDiv._fullLayout.yaxis;

    const xVal = roundToHalf(xaxis.p2c(xPix - xaxis._offset));
    const yVal = roundToHalf(yaxis.p2c(yPix - yaxis._offset));

    if (isPointExists(xVal, yVal) || xVal <= xmin || xVal >= xmax || yVal <= ymin || yVal >= ymax) {
      return;
    }

    // add point
    trace1.x.push(xVal);
    trace1.y.push(yVal);
    trace1.marker.color.push(color);
    trace1.marker.size.push(12);

    updatePlot();
  });

  // === Click to delete existing point ===
  Plotly.newPlot('plot', [heatmap, trace1], layout, config).then(plot => {
    plot.on('plotly_click', function (data) {
      if (!data.points || data.points.length === 0) return;

      // obtain coord and closest point
      const xPix = data.event.offsetX;
      const yPix = data.event.offsetY;

      const xaxis = plotDiv._fullLayout.xaxis;
      const yaxis = plotDiv._fullLayout.yaxis;
      const clickX = xaxis.p2c(xPix - xaxis._offset);
      const clickY = yaxis.p2c(yPix - yaxis._offset);

      let minDistance = Infinity;
      let closestPointIndex = -1;

      trace1.x.forEach((x, i) => {
        const y = trace1.y[i];
        const distance = Math.sqrt(Math.pow(x - clickX, 2) + Math.pow(y - clickY, 2));

        if (distance < minDistance) {
          minDistance = distance;
          closestPointIndex = i;
        }
      });

      // point deletion
      const threshold = 0.15
      if (closestPointIndex !== -1 && minDistance <= threshold) {

        // Animation
        const newMarker = JSON.parse(JSON.stringify(trace1.marker));
        newMarker.size[closestPointIndex] = 16;
        Plotly.restyle(plotDiv, 'marker', [newMarker]);

        setTimeout(() => {
          trace1.x.splice(closestPointIndex, 1);
          trace1.y.splice(closestPointIndex, 1);
          trace1.marker.color.splice(closestPointIndex, 1);
          trace1.marker.size.splice(closestPointIndex, 1);

          updatePlot();
        }, 200);
      }
    });
  });

  document.getElementById('reset-btn').addEventListener('click', function () {
    trace1.x = [];
    trace1.y = [];
    trace1.marker.color = [];
    trace1.marker.size = [];

    updatePlot();
  });

  document.getElementById('heatmap-intensity').addEventListener('input', function (e) {
    const intensity = parseFloat(e.target.value);
    heatmap.opacity = intensity;
    Plotly.restyle(plotDiv, 'opacity', intensity, 0); 
  });

  document.getElementById('zoom-reset').addEventListener('click', function () {
    Plotly.relayout(plotDiv, {
      'xaxis.range': [xmin, xmax],
      'yaxis.range': [ymin, ymax]
    });
  });

  document.getElementById('save-plot').addEventListener('click', function () {
    Plotly.downloadImage(plotDiv, { format: 'png', width: 1200, height: 800 });
  });
});