var svgWidth = 960;
var svgHeight = 600; 

var margin = {
    top: 20, 
    right: 80, 
    bottom: 80, 
    left: 100
}; 

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom; 

var svg = d3
    .select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

var chartGroup = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = 'poverty';
var chosenYAxis = 'obesity';

function xScale(health_data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(health_data, d => d[chosenXAxis]) * 0.8,
            d3.max(health_data, d => d[chosenXAxis] * 1.2)
        ])
        .range([0, width]); 

    return xLinearScale;
}

function yScale(health_data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(health_data, d => d[chosenYAxis]) *0.8,
            d3.max(health_data, d => d[chosenYAxis]* 1.2)
        ])
        .range([height,0]);

    return yLinearScale;    
}

function renderAxes(newXscale, xAxis) {
    var bottomAxis = d3.axisBottom(newXscale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis; 
}

function renderYAxes(newYscale, yAxis) {
    var leftAxis = d3.axisLeft(newYscale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
}

function renderXCircles(circlesGroup, newXscale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr('cx', d => newXscale(d[chosenXAxis]));

    return circlesGroup;
}

function renderYCircles(circlesGroup, newYscale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr('cy', d => newYscale(d[chosenYAxis]));
    
    return circlesGroup;
}

function renderYTextLabels(textLabels, newYScale, chosenYAxis) {

    textLabels.transition()
        .duration(1000)
        .attr('dy', d => newYScale(d[chosenYAxis]));
    
    return textLabels;
}

function renderXTextLabels(textLabels, newXScale, chosenXAxis) {

    textLabels.transition()
        .duration(1000)
        .attr('dx', d => newXScale(d[chosenXAxis]));
    
    return textLabels;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    
    var xlabel; 

    if (chosenXAxis === 'poverty') {
        xlabel = 'Poverty:';
    } else if (chosenXAxis === 'age') {
        xlabel = 'Age:';
    } else {
        xlabel = 'Household Income:';
    }

    var ylabel; 

    if (chosenYAxis === 'obesity') {
        ylabel = 'Obesity:';
    } else if (chosenYAxis === 'smokes') {
        ylabel = 'Smokes:';
    } else {
        ylabel = 'Lacks Healthcare:'
    }

    var toolTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });
    
        circlesGroup.call(toolTip);

        circlesGroup.on('mouseover', function(data) {
            toolTip.show(data);
    })      
            .on('mouseout', function(data,index) {
                toolTip.hide(data);
            });

    return circlesGroup; 
}

d3.csv('data.csv').then(function(health_data, err) {
    if (err) throw err; 

    // parse data 
    health_data.forEach(data => {
        data.poverty = parseFloat(data.poverty); 
        data.age = parseInt(data.age);
        data.income = parseInt(data.income);
        data.obesity = parseFloat(data.obesity);
        data.smokes = parseFloat(data.smokes);
        data.healthcare = parseFloat(data.healthcare);
    });
    console.log(health_data);

    var xLinearScale = xScale(health_data, chosenXAxis);
    var yLinearScale = yScale(health_data, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append('g')
        .classed('y-axis', true)
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll('.stateCircle')
        .data(health_data)
        .enter()
        .append('circle')
        .attr('class', 'stateCircle')
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', 20)
        // .attr('fill', 'blue')
        // .attr('opacity', '0.5');

    var textLabels = chartGroup.selectAll('.stateText')
        .data(health_data)
        .enter()
        .append('text')
        .attr('class', 'stateText')
        .attr('dx', d => xLinearScale(d[chosenXAxis])-1)
        .attr('dy', d => yLinearScale(d[chosenYAxis])+5)
        .text(d=>d.abbr)

    var xlabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width/2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .classed('active', true)
        .text('In Poverty(%)');
        
     var ageLabel = xlabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')
        .classed('inactive', true)
        .text('Age (Median)');

    var incomeLabel = xlabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')
        .classed('inactive', true)
        .text('Household Income (Median)');

    var ylabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(-30,${height/2}), rotate(-90)`);
        

    var obesityLabel = ylabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('value', 'obesity')
        .classed('active', true)
        .text('Obese (%)');
        
     var smokesLabel = ylabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', -30)
        .attr('value', 'smokes')
        .classed('inactive', true)
        .text('Smokes (%)');

    var healthcareLabel = ylabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', -60)
        .attr('value', 'healthcare')
        .classed('inactive', true)
        .text('Lacks Healthcare (%)');

    // update ToolTip function above csv import 
    var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

    //x axis labels event listener 
    xlabelsGroup.selectAll('text')
        .on('click', function() {
            //get value of selection 
            var xvalue = d3.select(this).attr('value');
            if (xvalue !== chosenXAxis) {

                // replaces chosen x axis with value 
                chosenXAxis = xvalue; 

                console.log(chosenXAxis)

                //update x scale with chosen data 
                xLinearScale = xScale(health_data, chosenXAxis);

                //update x axis 
                xAxis = renderAxes(xLinearScale, xAxis);

                //update circles with new x values 
                circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
                textLabels = renderXTextLabels(textLabels, xLinearScale, chosenXAxis);

                circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup); 

                if (chosenXAxis === 'poverty') {
                    povertyLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                } else if 
                    (chosenXAxis === 'age') {
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                } else {
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', true)
                        .classed('inactive', false);
                }
            }
        });
    
    //y axis labels event listener 
    ylabelsGroup.selectAll('text')
        .on('click', function() {
            //get value of selection 
            var yvalue = d3.select(this).attr('value');
            if (yvalue !== chosenYAxis) {

                // replaces chosen y axis with value 
                chosenYAxis = yvalue; 

                console.log(chosenYAxis)

                //update y scale with chosen data 
                yLinearScale = yScale(health_data, chosenYAxis);

                //update y axis 
                yAxis = renderYAxes(yLinearScale, yAxis);

                //update circles with new y values 
                circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
                textLabels = renderYTextLabels(textLabels, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup); 

                if (chosenYAxis === 'obesity') {
                    obesityLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);
                } else if 
                    (chosenYAxis === 'smokes') {
                    obesityLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    smokesLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);
                } else {
                    obesityLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', true)
                        .classed('inactive', false);
                }
            }
        });
}).catch(error => {
    console.log(error);
}); 
