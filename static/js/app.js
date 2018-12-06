function buildMetadata(sample) {
  // define url for metadata
  const url = `/metadata/${sample}`;
  console.log(url);

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  const metaDataPromise = d3.json(url);
  console.log(`Metadata Pending Promise: `, metaDataPromise);

  // Remove any existing html 'p' tags from previous data
  d3.select('#sample-metadata').selectAll('p').remove();
  
  metaDataPromise.then(data => {
    // empty list to hold the key value pairs of the metadata object as single strings
    var metaDataStr = [];

    // use object.entries and foorEach to populate the empty list with the concatenated metadata strings
    Object.entries(data).forEach(([key, value]) => {
      metaDataStr.push(`${key.toUpperCase()}: ${value}`);
    });

    // dynamically update the sample metadata div with the required info
    d3.select('#sample-metadata')
      .selectAll('p')
      .data(metaDataStr)
      .enter()
      .append('p')
      .text(d => {
        return(d);
      })

    function buildGauge (response) {
      // The level of the needle is based off response.wfreq
      var wfreq = response.WFREQ;
      console.log(`Washing freq: ${wfreq}`);

      //0 is on the left of the chart, so we need to flip 180 deg to make low values on the right
      var deg = 180 - (180*wfreq/9),
            radius = 0.5;
      // Convert deg to radians
      var rad = deg * Math.PI/180;
      // Convert polar coordinates to cartesian
      var x = radius * Math.cos(rad);
      var y = radius * Math.sin(rad);

      // Define path for the needle triangle
      var mainPath = 'M -.0 -.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
      var path = mainPath.concat(pathX,space,pathY,pathEnd);

      // Define variable for gauge sections
      var numSections = 9;
      var gaugeSections = [];

      // For loop to populate array with n values of 50/n
      for (var i=0; i<numSections; i++) {
        gaugeSections.push(50/numSections);
      }

      // Add 50 to end of the array
      gaugeSections.push(50);

      var data = [
        { type: 'scatter',
          x: [0], 
          y: [0],
          marker: { size: 28, color:'850000'},
          showlegend: false,
          name: 'Times per Week',
          text: wfreq,
          hoverinfo: 'text+name'
        },
        {
          values: gaugeSections,
          rotation: 90,
          text: ['Hella Clean', 'Very Clean', 'Kinda Clean', 'Almost Clean', 'Medium Cleanliness', 'Almost Dirty', 'Kinda Dirty', 'Very Dirty', 'Hella Dirty', ''],
          textinfo: 'text',
          textposition: 'inside',
          marker: {
            colors: [
              'rgba(14, 127, 0, .5)', 
              'rgba(110, 154, 22, .5)',
              'rgba(140, 170, 32, .5)', // new
              'rgba(170, 202, 42, .5)', 
              'rgba(190, 205, 62, .5)', // new
              'rgba(202, 209, 95, .5)',
              'rgba(210, 206, 145, .5)', 
              'rgba(222, 210, 180, .5)', // new
              'rgba(232, 226, 202, .5)',
              'rgba(255, 255, 255, 0)'
            ]
          },
          labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
          hoverinfo: 'label',
          hole: 0.5,
          type: 'pie',
          showlegend: false
        }];
      var layout = {
        shapes: [{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
        title: 'Belly Button <br> Weekly Washing Frequency',
        height: 500,
        width: 500,
        xaxis: {
          zeroline: false,
          showticklabels: false,
          showgrid: false,
          range: [-1, 1]},
        yaxis: {
          zeroline: false,
          showticklabels: false,
          showgrid: false,
          range: [-1, 1]},
      };

      Plotly.newPlot('gauge', data, layout);
      }
      buildGauge(data);
  });
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var url = `/samples/${sample}`;
  console.log(url);

    // @TODO: Build a Bubble Chart using the sample data
    d3.json(url).then((response) => {
      
      // log the response for verification
      console.log(response);

      var trace1 = {
        x: response.otu_ids,
        y: response.sample_values,
        mode: 'markers',
        text: response.otu_labels,
        marker: {
          size: response.sample_values,
          color: response.otu_ids
        },
        type: 'scatter'
      };

      var data =  [trace1];

      var layout = {
        title: 'Belly Button Bacteria Counts by OTU ID',
        xaxis: {
          title: 'OTU ID'
        },
        yaxis: {
          title: 'Belly Button Bacteria'
        }
      };

      Plotly.newPlot('bubble', data, layout);
    });


    // @TODO: Build a Pie Chart
    d3.json(url).then((response) => {
      // Sort the by sample_values. However, 'response.sort()' doesn't work, so my next solution is quite convoluted. Here we go...

      // Define variable for sample values
      var allValues = response.sample_values;

      // Empty list to hold index and value pairs
      var valueAndIndex = [];

      // Use .map to get the values and the original index from the smaple values
      valueAndIndex = allValues.map((value, index) => [value, index]);

      // sort valueAndIndex by the value (index 0), retaining the original index
      var sorted = valueAndIndex.sort((a,b) => b[0] - a[0]);

      // slice top 10 values + their indices
      var topTenValuesIndex = sorted.slice(0,10);
      console.log(topTenValuesIndex);

      // define empty lists to hold just the toop ten values/labels/ids
      var topTenValues = [];
      var topTenLabels = [];
      var topTenIds = [];

      // Use .map to iterate through each value-original_index pair in topTenValuesIndex list and use the original index to get the correct labels and ids. I feel like this is a hella janky way to do this, and there must be a more streamlined solution, but I can't figure it out.
      topTenValuesIndex.map(pair => {
        var topIndex = pair[1];
        topTenValues.push(pair[0]);
        topTenLabels.push(response.otu_labels[topIndex]);
        topTenIds.push(response.otu_ids[topIndex]);
      })

      // verify in console
      console.log(`Sorted data: ${topTenValues}`);
      console.log(`Top Ten labels: ${topTenLabels}`);
      console.log(`Ids: ${topTenIds}`);

      // Take the top 10 results for the data, labels, and hoverinfo
      var trace1 = { 
        values: topTenValues,
        labels: topTenLabels,
        hoverinfo: topTenIds,
        type: 'pie'
      };

      var layout = {
        title: 'Top 10 Belly Button Bacteria Samples',
        showlegend: false
      };

      data = [trace1];

      Plotly.newPlot('pie', data, layout);
    });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
