window.HELP_IMPROVE_VIDEOJS = false;

$(document).ready(function () {
  // For photo display
  var options = {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  var carousels = bulmaCarousel.attach('.carousel', options);
  bulmaSlider.attach();

  // Plotly behavior
  const trace1 = {
    x: [],
    y: [],
    mode: 'markers',
    marker: { color: [], size: 10 },
    type: 'scatter'
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
    opacity: 0.6
  };

  Plotly.newPlot('plot', [heatmap, trace1], {
    margin: { t: 0 },
    xaxis: { range: [-2, 2] },
    yaxis: { range: [-2, 2] }
  }, {
    displayModeBar: false 
  });

  const plotDiv = document.getElementById('plot');
  plotDiv.on('plotly_click', function (data) {
  const x = data.points[0].x;
  const y = data.points[0].y;

  // Reduce Repeated ones
  const alreadyExists = trace1.x.some((xi, i) => {
    return Math.abs(xi - x) < 1e-6 && Math.abs(trace1.y[i] - y) < 1e-6;
  });

  if (alreadyExists) {
    alert('This dot has been added already');
    return;
  }

  const color = prompt('Enter color: red or blue）');
  if (!color) return;

  const newX = trace1.x.concat(x);
  const newY = trace1.y.concat(y);
  const newColor = trace1.marker.color.concat(color);

  trace1.x = newX;
  trace1.y = newY;
  trace1.marker.color = newColor;

  Plotly.react('plot', [heatmap, trace1]);

  const infoDiv = document.getElementById('point-info');
  let infoHTML = '<strong>Added dots:</strong><ul>';
  for (let i = 0; i < newX.length; i++) {
    infoHTML += `<li>Point ${i + 1}: (${newX[i].toFixed(2)}, ${newY[i].toFixed(2)}), ${newColor[i]}</li>`;
  }
  infoHTML += '</ul>';
  infoDiv.innerHTML = infoHTML;
});
});


