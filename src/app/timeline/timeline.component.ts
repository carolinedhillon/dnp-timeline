import { Component, OnInit, Input, ViewChild, ElementRef, ɵSWITCH_COMPILE_INJECTABLE__POST_R3__ } from '@angular/core';
import { selection, select, event as d3Event, selectorAll } from "d3-selection";
import {axisBottom, axisTop} from 'd3-axis';
import { scaleLinear, scaleTime} from 'd3-scale';
import * as moment from 'moment';
import {timeParse, timeFormat} from 'd3-time-format';
import {min, max} from 'd3-array';
import { timeMonth, timeYear } from 'd3';
import { dimgray } from 'color-name';
import 'd3-selection-multi';
@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  host: { "(window:resize)": "onResize()" }
})
export class TimelineComponent implements OnInit {
  @Input() data; 
  @ViewChild('gantt', {static: true}) gantt: ElementRef;

  public config = {
    id: "#container",
    grid: { rows: 6, cols: 10, width: 50, height: 50 },
    padding: { left: 100, right: 10, top: 0, bottom: 20},
    bar: { 
      size: { height: 20},
      margin: { top: 5, bottom: 5}
    },
    dateFormat: undefined,
    dateFunc: undefined,
    offset: { start: 2, end: 3}
  };
  constructor() { }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.drawTimeline(this.config);
  }
  onResize() {
    console.log('resize detected - redrawing');
    this.drawTimeline(this.config);
  }
  drawTimeline(_config: any) {
    const container = select(_config.id);
    let { offsetHeight: height, offsetWidth: width } = container[
      "_groups"
    ][0][0];

    _config.grid.height = Math.floor(height / _config.grid.rows);
    _config.grid.width = Math.floor(width / _config.grid.cols);

    height = Math.floor(height / _config.grid.height) * _config.grid.height;
    width = Math.floor(width / _config.grid.width) * _config.grid.width;

    this.config.dateFormat =  { in: '%d-%m-%Y', out: 'DD-MM-YYYY', func: {in:{}, out:{}}};
    this.config.dateFunc = { in: timeParse(this.config.dateFormat.in), out: timeParse(this.config.dateFormat.out) };
    

    const svg = container
      .html("")
      .append("svg")
      .attr("viewBox", `0 0  ${width} ${height}`)
      .attr("height", height)
      .attr("width", width);

      svg.append("g")
      .attr("class", "rows")
      .selectAll("g")
      .data(this.data)
        .enter()
        .append('g')
        .attr('type',d=>d['icon']);
    let svgSize = {height,width};
    let svgScale = this.drawAxes(svg,this.data,svgSize, this.config);
    let objList = this.assignHeight(this.data,svgSize, this.config)
    this.drawBoxes(svg,objList,svgSize, svgScale, this.config);



  }

  drawBoxes(svg: any, objList: any[],svgSize: SVGSize, svgScale: SVGScale, config){
    const box = { height: (svgSize.height - (config.padding.top + config.padding.bottom)) / objList.length};
    // const categories = Array.from(new Set(objList.map(obj=>obj.category)));
    const swimlines = svg.append("g")
      .attr("class", "swinlanes")
      .selectAll("rect")
      .data(objList)
      .enter();

    let swimlane = swimlines
    .append('g')
    .attr('id',d=>d.icon);


    swimlane.append('rect')
      .attrs((d,i)=>({ 
        class: 'swinlane',
        icon: d.icon,
        x: 0, 
        y: i* box.height + config.padding.top, 
        width: svgSize.width, 
        height: box.height 
      }))

    swimlane.append('text')
      .attrs((d,i)=>({ 
        class: 'swinlane-text',
        x: svgSize.width, 
        y: (i+1)* box.height + config.padding.top - 5, 
      }))
      .text(d=>`${d.text}`);

      // swimlane.append('text')
      // .attrs((d,i)=>({ 
      //   class: 'swinlane-icon fa',
      //   x: 0, 
      //   y: (i)* box.height + config.padding.top + box.height/2, 
      //   "font-family": 'FontAwesome',
      //   "font-size": '2rem'}))
      // .text(d=>`${d.icon}` ); 
    
    const bar = swimlane
      .append('g')
      .attr('id',d=>d.text);

    bar.append('rect')
      .attrs((d,i)=>({ 
        class: 'swinlane-bar',
        x: svgScale.xScale(config.dateFunc.in(d.start)), 
        // y: i* box.height + config.padding.top + 40, 
        y: d.height,
        width: svgScale.xScale(config.dateFunc.in(d.end)) - svgScale.xScale(config.dateFunc.in(d.start)), 
        height: 20 
      }));

    bar.append('text')
      .attrs((d,i)=>({ 
        class: 'bar-icon fa',
        x: svgScale.xScale(config.dateFunc.in(d.start)) - 20, 
        // y: i* box.height + config.padding.top + 55, 
        y: d.height + 15,
        "font-family": 'FontAwesome',
        "font-size": '2rem'}))
      .text(d=>`${d.icon}` );

    bar.append('text')
      .attrs((d,i)=>({ 
        class: 'bar-text',
        x: svgScale.xScale(config.dateFunc.in(d.start)) , 
        // y: i* box.height + config.padding.top + 53, 
        y: d.height + (config.bar.size.height/2 + config.bar.margin.bottom),
      }))
      .text(d=>d.text);
    


    swimlane.append('line')
      .attrs((d,i)=>({ 
        class: 'swinlane-separator',
        x1: 0, 
        x2: svgSize.width, 
        y1: (i+1)* box.height + config.padding.top, 
        y2: (i+1)* box.height + config.padding.top, 
        // y1: i === objList.length -1 ? 0 : (i+1)* box.height + config.padding.top, 
        // y2: i === objList.length -1 ? 0 : (i+1)* box.height + config.padding.top, 
      }));


      
  }

  assignHeight(objList: any[], svgSize: SVGSize, config){
    let objMap = objList.reduce((acc,item)=>{
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    },{});
    
    let curHeight = config.padding.bottom; 
    let prevObj;
    Object.keys(objMap)
      .forEach(key=>{
        objMap[key]
          .sort((a,b)=> moment(a.start,config.dateFormat.out).diff(moment(b.start,config.dateFormat.out)))
          .forEach((obj,i)=>{
          
          if( prevObj && this.isOverLap(prevObj,obj,config)) 
          curHeight =  curHeight + config.bar.size.height 
            + config.bar.margin.top
            + config.bar.margin.bottom;
          
          obj['height'] =  svgSize.height - curHeight - (config.padding.top + config.padding.bottom);
          prevObj = obj;
        });
      });
    console.log({objList,objMap});
    return objList;
  }
  isOverLap(a,b, config){
    let tolerance = 12;
    console.log(
      a.text,
      a.end,
      b.text,
      b.start,
      moment(a.end, config.dateFormat.out).diff(moment(b.start, config.dateFormat.out),'month')
    )
    return moment(a.end, config.dateFormat.out).diff(moment(b.start, config.dateFormat.out),'month') < tolerance;
  }
  drawAxes(svg: any, objList: any[],svgSize: SVGSize, config): SVGScale{
    
    
    let yScale = scaleLinear().rangeRound([svgSize.height, 0]);
    
    let axisStartDate: Date = min(objList, d => config.dateFunc.in(d.start));
    let axisEndDate: Date = max(objList, d => config.dateFunc.in(d.end));
    
    axisStartDate = timeYear.offset(axisStartDate, config.offset.start);
    axisEndDate = timeYear.offset(axisEndDate, config.offset.end);
    
    let xScale = scaleTime()
      .domain([axisStartDate, axisEndDate])
      .range([config.padding.left, svgSize.width- config.padding.right]);

    let xAxis = axisBottom(xScale)
      .ticks(timeYear, 2)
      .tickFormat((date: Date) => timeYear(date) < date ? timeFormat('%b')(date) : timeFormat('%Y')(date))
      .tickSizeInner(5)
      .tickSizeOuter(0);

    let axis = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', 'translate(0,' + (svgSize.height -(config.padding.top+ config.padding.bottom)) + ')')
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "middle");

    // setting the axis height dynamically
    // this.config.axis.height = axis._parents[0].getBBox().height;
    
    // console.log('Axis height updated to', this.config.axis.height);
    return { xScale, yScale };
  }


}

interface SVGSize {height: number, width: number}

interface SVGScale {
  xScale: any;
  yScale: any;
}