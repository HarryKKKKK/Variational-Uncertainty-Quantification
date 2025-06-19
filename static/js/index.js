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
    const xmin = -4;
    const xmax = 4;
    const ymin = -4;
    const ymax = 4;
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
    marker: { color: [], size: 10 },
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
      margin: {t:10},
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

  // === Drag balls ===
  document.querySelectorAll('.draggable-ball').forEach(ball => {
    ball.addEventListener('dragstart', e => {
      e.dataTransfer.setData('color', ball.dataset.color);
    });
  });

  const plotDiv = document.getElementById('plot');

  plotDiv.addEventListener('dragover', e => {
    console.log('Drag over event triggered');
    e.preventDefault();
  });

  plotDiv.addEventListener('drop', e => {
    console.log('Drop event triggered');
    e.preventDefault();

    const color = e.dataTransfer.getData('color');
    const [xPix, yPix] = [e.offsetX, e.offsetY];

    const xaxis = plotDiv._fullLayout.xaxis;
    const yaxis = plotDiv._fullLayout.yaxis;

    const xVal = roundToHalf(xaxis.p2c(xPix - xaxis._offset));
    const yVal = roundToHalf(yaxis.p2c(yPix - yaxis._offset));
    
    if (isPointExists(xVal, yVal)) {
      alert('This dot has been added already');
      return;
    }

    // add points
    trace1.x = trace1.x.concat(xVal);
    trace1.y = trace1.y.concat(yVal);
    trace1.marker.color = trace1.marker.color.concat(color);
    Plotly.react('plot', [heatmap, trace1], layout, config);

    // update point info
    const infoDiv = document.getElementById('point-info');
    let infoHTML = '<strong>Added dots:</strong><ul>';
    for (let i = 0; i < trace1.x.length; i++) {
      infoHTML += `<li>Point ${i + 1}: (${trace1.x[i].toFixed(2)}, ${trace1.y[i].toFixed(2)}), ${trace1.marker.color[i]}</li>`;
    }
    infoHTML += '</ul>';
    infoDiv.innerHTML = infoHTML;
  });

  // === Init plot  ===
  Plotly.newPlot('plot', [heatmap, trace1], layout, config);
});