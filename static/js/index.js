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

  // === Plotly data & layout ===
  const trace1 = {
    x: [],
    y: [],
    mode: 'markers',
    marker: { color: [], size: 10 },
    type: 'scatter',
    hoverinfo: 'none'
  };

  const heatmap = {
    z: [
      [0.1, 0.2, 0.3, 0.4, 0.5],
      [0.2, 0.3, 0.4, 0.5, 0.6],
      [0.3, 0.4, 0.5, 0.6, 0.7],
      [0.4, 0.5, 0.6, 0.7, 0.8],
      [0.5, 0.6, 0.7, 0.8, 0.9]
    ],
    x: [-2, -1, 0, 1, 2],
    y: [-2, -1, 0, 1, 2],
    type: 'heatmap',
    colorscale: 'Blues',
    opacity: 0.6,
    hoverinfo: 'none'
  };

  const layout = {
    margin: { t: 0 },
    xaxis: { range: [-4, 4], fixedrange: true },
    yaxis: { range: [-4, 4], fixedrange: true }
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

  // === Init plot + Click add points ===
  Plotly.newPlot('plot', [heatmap, trace1], layout, config).then(function (gd) {
    const xaxis = gd._fullLayout.xaxis;
    const yaxis = gd._fullLayout.yaxis;

    gd.on('plotly_click', function (data) {
      const x = roundToHalf(data.points[0].x);
      const y = roundToHalf(data.points[0].y);

      if (isPointExists(x, y)) {
        alert('This dot has been added already');
        return;
      }

      const color = prompt('Enter color: red or blue');
      if (!color || !['red', 'blue'].includes(color.toLowerCase())) return;

      const newX = trace1.x.concat(x);
      const newY = trace1.y.concat(y);
      const newColor = trace1.marker.color.concat(color);

      trace1.x = newX;
      trace1.y = newY;
      trace1.marker.color = newColor;

      Plotly.react('plot', [heatmap, trace1], layout, config).then(function (gdNew) {
        gdNew.on('plotly_click', arguments.callee);
      });

      const infoDiv = document.getElementById('point-info');
      let infoHTML = '<strong>Added dots:</strong><ul>';
      for (let i = 0; i < trace1.x.length; i++) {
        infoHTML += `<li>Point ${i + 1}: (${trace1.x[i].toFixed(2)}, ${trace1.y[i].toFixed(2)}), ${trace1.marker.color[i]}</li>`;
      }
      infoHTML += '</ul>';
      infoDiv.innerHTML = infoHTML;
    });
  });
});