function buildMetadata(sample) {
  // define url for metadata
  const url = `/metadata/${sample}`;
  console.log(url);

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  const metaDataPromise = d3.json(url);
  console.log(`Metadata Pending Promise: `, metaDataPromise);

  var testArr = ['Blah', 'Blah', 'Piglet'];

  d3.selectAll('#sample-metadata').enter()
    .data(testArr)
    .text(words => {
      words
    });
    // .html('')
    // .append('p')
  
    metaDataPromise.then(data => {
      Object.entries(data).forEach(([key, value]) => {
        // .append('li')
        `${key}: ${value}`
        console.log(`building metadata: ${key}: ${value}`);
      });
    });

    // Clear existing data
    // selection.remove();

    // {"AGE":24.0,"BBTYPE":"I","ETHNICITY":"Caucasian","GENDER":"F","LOCATION":"Beaufort/NC","WFREQ":2.0,"sample":940}

    // selection.enter()
    //   .html(d => {
    //     `<ul><li>${d.AGE}</li><li>${d.BBTYPE}</li></ul>`
    //   });
 
    // Use d3 to select the panel with id of `#sample-metadata`

    // Use `.html("") to clear any existing metadata

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
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
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    d3.json(url).then((response) => {

      // Define variable for sample values
      var allValues = response.sample_values;

      // Empty list to hold index and value pairs
      var valueAndIndex = [];

      // loop through sample values and pair each value with its index
      for (var i = 0; i < allValues.length; i++) {
        var pair = [allValues[i], i];
        valueAndIndex.push(pair);
      }

      // sort valueAndIndex by the value (index 0), retaining the original index
      var sorted = valueAndIndex.sort((a,b) => b[0] - a[0]);

      // slice top 10 values + their indices
      var topTenValuesIndex = sorted.slice(0,10);
      console.log(topTenValuesIndex);

      // define variables to hold just the values
      var topTenValues = [];
      var topTenLabels = [];
      var topTenIds = [];

      // Loop through the top ten list to extract just the top sample values, and match the labels and ids with the correct index. I feel like this is a hella janky way to do this, and there must be a more streamlined solution, but I can't figure it out.
      for (var j = 0; j < topTenValuesIndex.length; j++) {
        // variable for the sample value and original index pair
        var pair = topTenValuesIndex[j];
        var topIndex = pair[1];
        topTenValues.push(pair[0]);
        topTenLabels.push(response.otu_labels[topIndex]);
        topTenIds.push(response.otu_ids[topIndex]);
      }

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
        title: 'First 10 Belly Button Bacteria Samples',
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
