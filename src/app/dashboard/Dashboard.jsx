import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import * as d3 from 'd3';
import { budgetApiEndpoints, expenseApiEndpoints, incomeApiEndpoints } from './../../API';
import axios from './../../Axios';
import { getItem } from '../../Helpers';
import dayjs from 'dayjs';

const styles = {
  a: {
    display: "flex",
    alignItems:'center',
    fontSize: 16,
    fontWeight: "bold"
  },
  b: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "green",
    marginRight: 5
  }
}
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const margin = { top: 20, right: 30, bottom: 40, left: 40 };

const Dashboard = (props) => {
  const svgRef = useRef(null); // Reference for the SVG element
  const [tooltip, setTooltip] = useState({ display: false, data: {} });
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
  const [data, setData] = useState([]);
  const [recentExpense, setRecentExpense] = useState([]);
  const [recentIncome, setRecentIncome] = useState([]);
  const [recentBudget, setRecentBudget] = useState([]);

  useEffect(() => {
    requestExpense();
    requestIncome();
    requestBudget();
  }, []);

  useEffect(() => {
    processData();
  }, [recentExpense,recentIncome,recentBudget]);

  useEffect(() => {
    // Set initial size
    const handleResize = () => {
      if (svgRef.current) {
        const { width } = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height: 400 }); // You can adjust height dynamically if needed
      }
    };

    // Set the initial size
    handleResize();

    // Resize listener for window resizing
    window.addEventListener('resize', handleResize);

    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!dimensions.width) return; // Don't render if width is 0

    // Set up scales for x and y
    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, dimensions.width - margin.left - margin.right])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.income, d.expense, d.budget))])
      .nice()
      .range([dimensions.height - margin.top - margin.bottom, 0]);

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    svg.selectAll('*').remove(); // Remove any old content before adding new

    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create grouped bars for income, expense, and budget
    const barWidth = x.bandwidth() / 3; // 3 bars per month (income, expense, budget)

    chartGroup.selectAll('.bar')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${x(d.month)}, 0)`)
      .selectAll('rect')
      .data(d => [
        { key: 'income', value: d.income, color: 'green' },
        { key: 'expense', value: d.expense, color: 'red' },
        { key: 'budget', value: d.budget, color: 'blue' }
      ])
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * barWidth) // Offset for each bar within the group
      .attr('y', d => y(d.value))
      .attr('width', barWidth - 5) // Bar width
      .attr('height', d => dimensions.height - margin.top - margin.bottom - y(d.value))
      .attr('fill', d => d.color)
      .on('mouseover', (event, d) => {
        // Show tooltip on hover
        setTooltip({
          display: true,
          data: {
            month: d3.select(event.target.parentNode).datum().month,
            key: d.key,
            value: d.value
          }
        });
      })
      .on('mouseout', () => {
        // Hide tooltip when not hovering
        setTooltip({ display: false, data: {} });
      });

    // Add the X axis
    chartGroup.append('g')
      .attr('transform', `translate(0,${dimensions.height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x));

    // Add the Y axis
    chartGroup.append('g')
      .call(d3.axisLeft(y));

  }, [dimensions, data]);

  const requestExpense = async () => {
    await axios.get(`${expenseApiEndpoints.expense}?user_id=${getItem("user")}`, {})
      .then(response => {
        // console.log(response);
        setRecentExpense(response.data);
      })
      .catch(error => {
        console.log('error', error);
        setRecentExpense([]);
      });
  };

  const requestIncome = async () => {
    await axios.get(`${incomeApiEndpoints.income}?user_id=${getItem("user")}`, {})
      .then(response => {
        // console.log(response.data);
        setRecentIncome(response.data);
      })
      .catch(error => {
        console.log('error', error);
        setRecentIncome([]);
      });
  };

  const requestBudget = async () => {
    await axios.get(`${budgetApiEndpoints.budget}?user_id=${getItem("user")}`, {})
      .then(response => {
        // console.log(response.data);
        setRecentBudget(response.data);
      })
      .catch(error => {
        console.log('error', error);
        setRecentBudget([]);
      });
  };

  const processData = () => {
    const monthMap = {};
    // { month: 'January', income: 1000, expense: 800, budget: 1200 },

    recentExpense.forEach(item => {
      const month = monthNames[new Date(item.date).getMonth()];
      console.log(month);
      
      if(!monthMap.hasOwnProperty(month)){
        monthMap[month] = {
          expense: parseFloat(item.amount),
          income: 0,
          budget: 0,
          month
        };
      }else{
        monthMap[month]["expense"] += parseFloat(item.amount);
      }
    });

    recentIncome.forEach(item => {
      const month = monthNames[new Date(item.date).getMonth()];
      
      if(!monthMap.hasOwnProperty(month)){
        monthMap[month] = {
          expense: 0,
          income: parseFloat(item.amount),
          budget: 0,
          month
        };
      }else{
        monthMap[month]["income"] += parseFloat(item.amount);
      }
    });

    recentBudget.forEach(item => {
      const month = item.month;
      
      if(!monthMap.hasOwnProperty(month)){
        monthMap[month] = {
          expense: 0,
          income: 0,
          budget: parseFloat(item.amount),
          month
        };
      }else{
        monthMap[month]["budget"] += parseFloat(item.amount);
      }
    });

    setData(Object.values(monthMap));
  }

  return (
    <div>
      <Helmet title="Dashboard" />
      <div className="p-grid">
        <div className="p-col-12 p-md-12 p-lg-12">
        <svg ref={svgRef}></svg>
          {tooltip.display && (
            <div
              style={{
                position: 'absolute',
                left: `${tooltip.data.x}px`,
                top: `${tooltip.data.y}px`,
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '5px',
                borderRadius: '4px',
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease-in-out',
              }}>
              <div>Month: {tooltip.data.month}</div>
              <div>{tooltip.data.key.charAt(0).toUpperCase() + tooltip.data.key.slice(1)}: {tooltip.data.value}</div>
            </div>
          )}
        </div>
        <div className="p-col-12 p-md-12 p-lg-12" style={{display:'flex',justifyContent:'space-around'}}>
          <div style={styles.a}><span style={styles.b}></span> Income</div>
          <div style={styles.a}><span style={{...styles.b,backgroundColor: "red"}}></span> Expense</div>
          <div style={styles.a}><span style={{...styles.b,backgroundColor: "blue"}}></span> Budget</div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Dashboard);
