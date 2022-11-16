import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

var currDiv = null
var currYear = null
var currWeek = null

function DivisionDropdown({ options, initialValue }) {
  const [selected, setSelected] = useState(initialValue.toLowerCase())

  const handleChange = event => {
    console.log(event.target.value);
    setSelected(event.target.value);

    window.location.href=`/${event.target.value}/${currYear}/${currWeek}`
  }

  return (
    <select value={selected} onChange={handleChange}>
      {options.map(option => (
        <option key={option} value={option.toLowerCase()}>
          {option.toUpperCase()}
        </option>
      ))}
    </select>
  )
}

function YearDropdown({ options, initialValue }) {
  const [selected, setSelected] = useState(initialValue)

  const handleChange = event => {
    console.log(event.target.value);
    setSelected(event.target.value);

    window.location.href=`/${currDiv}/${event.target.value}/${currWeek}`
  }

  return (
    <select value={selected} onChange={handleChange}>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function WeekDropdown({ options, initialValue }) {
  const optionList = []
  for (var i = 1; i <= options.weeks; i++) {
    optionList.push({ value: i, text: 'Week ' + i })
  }
  if (options.postseason) {
    optionList.push({ value: 'final', text: 'Final' })
  }

  const [selected, setSelected] = useState(initialValue.toLowerCase())

  const handleChange = event => {
    console.log(event.target.value);
    setSelected(event.target.value);

    window.location.href=`/${currDiv}/${currYear}/${event.target.value}`
  }

  return (
    <select value={selected} onChange={handleChange}>
      {optionList.map(option => (
        <option key={option.value} value={option.value}>
          {option.text}
        </option>
      ))}
    </select>
  )
}

export default function Selector({ rankList, division, year, week }) {
  currDiv = division.toLowerCase()
  currYear = year
  currWeek = week.toLowerCase()
  const years = []
  for (var key in rankList) {
    years.push(key)
  }
  years.sort().reverse()
  return (
    <div>
      <DivisionDropdown options={['fbs', 'fcs']} initialValue={division} />
      <YearDropdown options={years} initialValue={year} />
      <WeekDropdown options={rankList[year]} initialValue={week} />
    </div>
  );
}
