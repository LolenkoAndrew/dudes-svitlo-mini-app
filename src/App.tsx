import React, {useEffect, useState} from 'react';
import './App.css';
import api from './api';

// Helper function to format time correctly
const formatTime = (hour: number) => {
  if (hour === 24) {
    return "24:00";
  } else if (hour < 10) {
    return `0${hour}:00`;
  } else {
    return `${hour}:00`;
  }
};

const parseTimesIntoIntervals = (timesList: string | any[]) => {
  if (timesList.length === 0) {
    return [];
  }
  const intervals = [];

  let interval = { start: timesList[0], end: "" };

  for (let i = 0; i < timesList.length; i++) {
    const time = timesList[i];
    const [timeHour] = time.split(":").map(Number); // Extract hour part and convert to number

    if (i + 1 !== timesList.length) {
      const timeNext = timesList[i + 1];
      const [timeHourNext] = timeNext.split(":").map(Number); // Extract next hour part and convert to number

      if (timeHour + 1 !== timeHourNext) {
        interval.end = formatTime(timeHour + 1);
        intervals.push({ ...interval });
        interval = { start: timeNext, end: "" }; // Reset interval for next iteration
      }
    } else {
      // Last item, set end time and push to intervals
      interval.end = formatTime(timeHour + 1);
      intervals.push({ ...interval });
    }
  }

  return intervals;
};

const parseHtmlFromEnergyUa = (htmlContent: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const divs = doc.querySelectorAll('div.scale_block > div');

  const schedule = { good: [], bad: [], potential: [] };

  divs.forEach(div => {
    const text = div.textContent;
    if (div.classList.contains("scale_el") && !div.classList.contains("scale_el_r") && !div.classList.contains("scale_el_y")) {
      // @ts-ignore
      schedule.good.push(text);
    } else if (div.classList.contains("scale_el_r")) {
      // @ts-ignore
      schedule.bad.push(text);
    } else if (div.classList.contains("scale_el_y")) {
      // @ts-ignore
      schedule.potential.push(text);
    }
  });

  // Assuming parseTimesIntoIntervals is implemented similarly to Java version
  const intervalsGood = parseTimesIntoIntervals(schedule.good);
  const intervalsBad = parseTimesIntoIntervals(schedule.bad);
  const intervalsPotential = parseTimesIntoIntervals(schedule.potential);

  return { intervalsGood, intervalsPotential, intervalsBad };
};


const getFromEnergyUa = async (address: string) => {
  const url = `${address}`;

  try {
    const myHeaders = new Headers();


    const response = await fetch(url, {
      method: 'GET',
      //mode: 'no-cors',
      headers: myHeaders,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text(); // Get the HTML content as text
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
    throw error; // Rethrow or handle as needed
  }
};

const fetchData = () => {
  const url = 'https://kharkiv.energy-ua.info/grafik/Харків/Волонтерська/60';


  getFromEnergyUa(url)
      .then(response => {
        const intervals = parseHtmlFromEnergyUa(response);
        // Format the intervals into a readable string
        const intervalsGoodStr = intervals.intervalsGood.map(interval => `${interval.start} - ${interval.end}`).join(", ");
        const intervalsBadStr = intervals.intervalsBad.map(interval => `${interval.start} - ${interval.end}`).join(", ");
        const intervalsPotentialStr = intervals.intervalsPotential.map(interval => `${interval.start} - ${interval.end}`).join(", ");

        // Construct the final result message
        const result = `
                        Світло є: ${intervalsGoodStr}
                        Можливо відключення: ${intervalsPotentialStr}
                        Світла немає: ${intervalsBadStr}
                    `;

        return result
      })
      .catch(error => {
        return error
      });
};

function App() {
  const [content, setContent] = useState("");

  useEffect(() => {
    const data = fetchData();
    // @ts-ignore
    setContent(data);

  });

  // @ts-ignore
  return (
    <div className="App">
      <header className="App-header">
        <section id="top_sect" className="second">

          <div id="content">{content}</div>
        </section>
      </header>

    </div>
  );
}

export default App;
