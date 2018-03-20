import * as dagreD3 from 'dagre-d3'
const d3 = require('d3')
const phantom = require('phantom');
const EventEmitter = require('events');
var eventEmitter = new EventEmitter()

import * as _ from 'lodash';
const timeout = ms => new Promise(res => setTimeout(res, ms))
const loadSvg = async function (g) {
    console.log("loadSvg1");
    // const instance = await phantom.create();
    // console.log("loadSvg2");
    await timeout(5000)
    console.log("loadSvg3");
    // const page = await instance.createPage();
    // await page.property('content', '<html><body></body></html>');
    // console.log("loadSvg4");
    // let html = await page.evaluate(function () {
    //     //let body = d3.select(dom.window.document).select('body'); //get d3 into the dom
    //     const htmlBody = d3.select(document.body);
    //     let svgContainer = htmlBody.append('div');
    //     svgContainer.attr('class', 'container')
    //     let svg = svgContainer.append("svg");
    //     svg.attr("width", 1280)
    //         .attr("height", 1024)
    //         .attr({
    //             xmlns: 'http://www.w3.org/2000/svg'
    //         });
    //     let svgGroup = svg.append('g');

    //     // const layout = dagreD3.layout().rankSep(50).rankDir('BT')
    //     // console.log('svg ' + svg)
    //     // console.log('svgGroup ' + svgGroup)

    //     var zoom = d3.zoom().on('zoom', function () {
    //         svgGroup.attr('transform', 'translate(' + d3.event.translate + ')' + 'scale(' + d3.event.scale + ')')
    //     })
    //     svg.call(zoom)

    //     // Run the renderer. This is what draws the final graph.
    //     dagreRender(svgGroup, g)
    //     // renderer.layout(layout).run(svgGroup, g)
    //     // Center the graph
    //     let initialScale = 0.75
    //     let getSvgWidth = function () {
    //         let positionInfo = svg.node().getBoundingClientRect()
    //         return positionInfo.width
    //     }
    //     zoom
    //         .translate([(getSvgWidth() - g.graph().width * initialScale) / 2, 20])
    //         .scale(initialScale)
    //         .event(svg)
    //     svgGroup.attr('height', g.graph().height * initialScale + 40)

    //     //write out the children of the container div
    //     return window.d3.select('.container').html() //using sync to keep the code simple
    // })
    // console.log("loadSvg5");
    // await instance.exit();
    // return html;
    eventEmitter.emit('myevent', { something: "Bla" });
    return "test";
};

class DagreD3SvgExport {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {
                rankDir: 'BT',
                rankSep: 50,
                nodeSep: 70,
                marginx: 20,
                marginy: 20,
            };
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
    }
    constructor(config) {
        this.name = "DagreD3SvgExport";
        this.config = config;
    }
    run(data) {
        if (data.config) {
            if (data.config.dagre) {
                this.config = data.config.dagre;
            } else if (data.config.DagreD3SvgExport) {
                this.config = data.config.DagreD3SvgExport;
            }
        }
        if (!data.map ||!data.map.nodes ||!data.map.edges) {
            return data;
        }
        data.svg = this.generateSvg(data.map);
        return data;
    }
    generateSvg(map) {
        const g = new dagreD3.graphlib.Graph({ compound: true })
            .setGraph({
                rankdir: this.settings.rankDir,
                rankSep: this.settings.rankSep,
                nodeSep: this.settings.nodeSep,
                marginx: this.settings.marginx,
                marginy: this.settings.marginy
            })
            .setDefaultEdgeLabel(function () { return {} })

        for (let node of map.nodes) {
            this.addNode(node, g)
        }

        for (let edge of map.edges) {
            g.setEdge(edge.from.id, edge.to.id, { class: edge.type })
        }

        const nodes = g.nodes()

        for (let v of nodes) {
            const node = g.node(v)
            // Round the corners of the nodes
            node.rx = node.ry = 5
        }
        // Create the renderer
        const render = new dagreD3.render() // eslint-disable-line new-cap
        eventEmitter.on('myevent', function (myResult) {
            // I needed the result to be written to stdout so that the calling process could get it
            console.log(JSON.stringify(myResult));
        });        
        return loadSvg(g, render).then(svg => { console.log("SVG: " + svg) }, (e) => { console.log("Error: " +e)});
    }
    addNode(node, g, currentGroup) {
        const nodeProperties = {
            labelType: 'html',
            class: node.type,
            paddingBottom: 0,
            paddingTop: 0,
            paddingLeft: 0,
            paddingRight: 0
        }
        nodeProperties.label = '<div class="node-label">'
        if (node.labelTitle) {
            nodeProperties.label += '<h3>' + node.labelTitle + '</h3>'
        }
        if (node.labelText && (node.type === 'statement' || node.type === 'argument')) {
            nodeProperties.label += '<p>' + node.labelText + '</p>'
        }
        if (node.tags) {
            for (let tag of node.tags) {
                nodeProperties.class += ' '
                nodeProperties.class += this.$store.getters.tagsDictionary[tag].cssClass
            }
        }
        nodeProperties.label += '</div>'

        if (node.type === 'group') {
            nodeProperties.clusterLabelPos = 'top'
            nodeProperties.class += ' level-' + node.level
        }
        g.setNode(node.id, nodeProperties)
        if (currentGroup) {
            g.setParent(node.id, currentGroup.id)
        }
        if (node.type === 'group') {
            for (let child of node.nodes) {
                this.addNode(child, g, node)
            }
        }
    }
}
module.exports = {
    DagreD3SvgExport: DagreD3SvgExport
}
