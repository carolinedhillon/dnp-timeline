import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  ɵSWITCH_COMPILE_INJECTABLE__POST_R3__,
} from '@angular/core';
import { selection, select, event as d3Event, selectorAll } from 'd3-selection';
import { axisBottom, axisTop } from 'd3-axis';
import { scaleLinear, scaleTime } from 'd3-scale';
import * as moment from 'moment';
import { timeParse, timeFormat } from 'd3-time-format';
import { min, max } from 'd3-array';
import { timeMonth, timeYear } from 'd3';
import { dimgray } from 'color-name';
import 'd3-selection-multi';
import { config } from 'rxjs';
@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  host: { '(window:resize)': 'onResize()' },
})
export class TimelineComponent implements OnInit {
  @Input() data;
  @ViewChild('gantt', { static: true }) gantt: ElementRef;

  public config: Config = {
    id: '#container',
    svg: { width: 50, height: 50 },
    axis: { heigth: 20 },
    category: {
      padding: { left: 10, right: 10, top: 20, bottom: 0 },
    },
    bar: {
      size: { height: 30 },
      margin: { top: 5, bottom: 5 },
      text: { top: 5 },
    },
    date: {
      format: { in: '%d-%m-%Y', out: 'DD-MM-YYYY' },
    },
    timeline: { offset: { start: 2, end: 5 } },
  };

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.drawTimeline(this.config);
  }
  
  onResize() {
    console.log('resize detected - redrawing');
    this.drawTimeline(this.config);
  }

  processConfig(config: Config) {
    config.date.transform = {
      in: timeParse(config.date.format.in),
      out: timeParse(config.date.format.out),
    };
    config.category.calc = {
      heigth: config.category.padding.top + config.category.padding.bottom,
    };
    config.bar.calc = {
      heigth:
        config.bar.margin.top +
        config.bar.margin.bottom +
        config.bar.size.height,
    };
    return config;
  }

  drawTimeline(_config: Config) {
    const container = select(_config.id);
    let { offsetHeight: height, offsetWidth: width } = container['_groups'][0][0];

    this.config = this.processConfig(this.config);
    let objList = this.assignHeight(this.data, this.config);
    let uniqueList: number[] = Array.from(new Set(objList.map(obj=>obj.height)));
    // height = uniqueList.reduce((acc, obj) => (acc += obj), 0);
    
    height = Math.max(...uniqueList) + _config.axis.heigth + 50;
    objList.forEach(obj=>(obj.height = height - (obj.height + this.config.axis.heigth )));
    // console.log({ objList, uniqueList, height});

    const svgSize = { height, width };
    const svg = this.setupSVG(container, svgSize);

    let svgScale = this.drawAxes(svg, this.data, svgSize, this.config);

    this.drawBoxes(svg, objList, svgSize, svgScale, this.config);
  }

  setupSVG(container, svgSize: SVGSize) {
    return container
      .html('')
      .append('svg')
      .attr('viewBox', `0 0  ${svgSize.width} ${svgSize.height}`)
      .attr('height', svgSize.height)
      .attr('width', svgSize.width);
  }

  drawBoxes(
    svg: any,
    objList: any[],
    svgSize: SVGSize,
    svgScale: SVGScale,
    config: Config
  ) {
    // const box = { height: (svgSize.height - (config.padding.top + config.padding.bottom)) / objList.length};
    // const categories = Array.from(new Set(objList.map(obj=>obj.category)));
    const swimlines = svg
      .append('g')
      .attr('class', 'swinlanes')
      .selectAll('rect')
      .data(objList)
      .enter();

    let swimlane = swimlines.append('g').attr('id', (d) => d.category);

    const bar = swimlane.append('g').attr('id', (d) => d.text);

    bar.append('rect').attrs((d, i) => ({
      class: 'swinlane-bar',
      x: svgScale.xScale(config.date.transform.in(d.start)),
      // y: i* box.height + config.padding.top + 40,
      y: d.height  - config.bar.margin.top,
      rx:2,
      ry:2,
      width:
        svgScale.xScale(config.date.transform.in(d.end)) -
        svgScale.xScale(config.date.transform.in(d.start)),
      height: config.bar.size.height,
    }));

    bar
      .append('text')
      .attrs((d, i) => ({
        class: 'bar-icon fa',
        x: svgScale.xScale(config.date.transform.in(d.start)) +10,
        // y: i* box.height + config.padding.top + 55,
        y: d.height + config.bar.size.height/2 ,
        // y: d.height - config.bar.text.top,
        'font-family': 'FontAwesome',
        'font-size': '2rem',
      }))
      .text((d) => `${d.icon}`);

    bar
      .append('text')
      .attrs((d, i) => ({
        class: 'bar-text',
        x: svgScale.xScale(config.date.transform.in(d.start)) + 30,
        y: d.height + config.bar.size.height / 2,
      }))
      .text((d) => d.text);


      // swimlane.append('rect')
    //   .attrs((d,i)=>({
    //     class: 'swinlane',
    //     icon: d.icon,
    //     x: 0,
    //     y: i* box.height + config.padding.top,
    //     width: svgSize.width,
    //     height: box.height
    //   }))

    // swimlane.append('text')
    //   .attrs((d,i)=>({
    //     class: 'swinlane-text',
    //     x: svgSize.width,
    //     y: (i+1)* box.height + config.padding.top - 5,
    //   }))
    //   .text(d=>`${d.text}`);

    // swimlane.append('text')
    // .attrs((d,i)=>({
    //   class: 'swinlane-icon fa',
    //   x: 0,
    //   y: (i)* box.height + config.padding.top + box.height/2,
    //   "font-family": 'FontAwesome',
    //   "font-size": '2rem'}))
    // .text(d=>`${d.icon}` );  

    swimlane.append('line')
      .attrs((d,i)=>({
        class: 'swinlane-separator',
        x1: 0,
        x2: svgSize.width,
        y1: d.height - (config.bar.margin.bottom + config.bar.margin.top),
        y2: d.height - (config.bar.margin.top + config.bar.margin.top),
        // y1: i === objList.length -1 ? 0 : (i+1)* box.height + config.padding.top,
        // y2: i === objList.length -1 ? 0 : (i+1)* box.height + config.padding.top,
      }));
  }

  assignHeight(objList: any[], config: Config) {
    let objMap = objList.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {});

    let curHeight = 0;
    let prevObj;
    Object.keys(objMap).forEach((key) => {
      objMap[key]
        // .sort((a, b) =>
        //   moment(a.start, config.date.format.out).diff(
        //     moment(b.start, config.date.format.out)
        //   )
        // )
        .forEach((obj, i) => {
          if (!prevObj) curHeight = curHeight + config.bar.size.height + config.bar.margin.bottom + config.bar.margin.top;
          else if (this.isOverLap(prevObj, obj, config))
          curHeight = curHeight + config.bar.size.height + config.bar.margin.bottom + config.bar.margin.top;
            // curHeight = curHeight +  config.bar.calc.heigth;
          else curHeight = curHeight;

          obj['height'] = curHeight;
          prevObj = obj;
          // console.log(obj.text,'>>>', obj.height);
        });
        prevObj = undefined;
    });
    // console.log({objList,objMap});
    return objList;
  }
  isOverLap(a, b, config: Config) {
    const tolerance = 6;
    const diff = moment(b.start, config.date.format.out).diff(moment(a.end, config.date.format.out),'month');
    // console.log(a.category, a.text, b.category, b.text, diff < tolerance ,diff, tolerance);
    console.log(`${a.category} :: ${a.text}(${a.end}) | ${b.text}(${b.start}) >> ${diff} ${diff < tolerance}`);
    return diff < tolerance;
  }
  drawAxes(
    svg: any,
    objList: any[],
    svgSize: SVGSize,
    config: Config
  ): SVGScale {
    let yScale = scaleLinear().rangeRound([svgSize.height, 0]);

    let axisStartDate: Date = min(objList, (d) =>
      config.date.transform.in(d.start)
    );
    let axisEndDate: Date = max(objList, (d) =>
      config.date.transform.in(d.end)
    );

    console.log({ axisStartDate, axisEndDate });
    axisStartDate = timeYear.offset(
      axisStartDate,
      -config.timeline.offset.start
    );
    axisEndDate = timeYear.offset(axisEndDate, config.timeline.offset.end);
    console.log({ axisStartDate, axisEndDate });

    let xScale = scaleTime()
      .domain([axisStartDate, axisEndDate])
      .range([
        config.category.padding.left,
        svgSize.width - config.category.padding.right,
      ]);

    let xAxis = axisBottom(xScale)
      .ticks(timeYear, 2)
      .tickFormat((date: Date) =>
        timeYear(date) < date ? timeFormat('%b')(date) : timeFormat('%Y')(date)
      )
      .tickSizeInner(5)
      .tickSizeOuter(0);

    let axis = svg
      .append('g')
      .attr('class', 'x-axis')
      .attr(
        'transform',
        'translate(0,' +
          (svgSize.height -
            (config.category.padding.top + config.category.padding.bottom)) +
          ')'
      )
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle');

    // setting the axis height dynamically
    // this.config.axis.height = axis._parents[0].getBBox().height;

    // console.log('Axis height updated to', this.config.axis.height);
    return { xScale, yScale };
  }
}

interface SVGSize {
  height: number;
  width: number;
}

interface SVGScale {
  xScale: any;
  yScale: any;
}

interface Config {
  id: string;
  svg: { width: number; height: number };
  axis: { heigth: number };
  category: {
    padding: { left: number; right: number; top: number; bottom: number };
    calc?: { heigth: number };
  };
  bar: {
    size: { height: number };
    margin: { top: number; bottom: number };
    text: { top: number };
    calc?: { heigth: number };
  };
  date: {
    format: { in: string; out: string };
    transform?: { in: Function; out: Function };
  };
  timeline: {
    offset: { start: number; end: number };
  };
}
