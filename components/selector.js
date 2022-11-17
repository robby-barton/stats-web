import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './selector.module.css';

var currDiv = null
var currYear = null
var currWeek = null

function DivisionDropdown({ options, initialValue }) {
  const [selected, setSelected] = useState(initialValue.toLowerCase())

  return (
    <span>
      <select
        className={styles.divisionDropdown}
        value={selected}
        onChange={e => window.location.href=`/${e.target.value}/${currYear}/${currWeek}`}
      >
        {options.map(option => (
          <option key={option} value={option.toLowerCase()}>
            {option.toUpperCase()}
          </option>
        ))}
      </select>
    </span>
  )
}

function YearDropdown({ options, initialValue }) {
  const [selected, setSelected] = useState(initialValue)

  return (
    <span>
      <select
        className={styles.yearDropdown}
        value={selected}
        onChange={e => window.location.href=`/${currDiv}/${e.target.value}/${currWeek}`}
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </span>
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

  return (
      <select
        className={styles.weekDropdown}
        value={selected}
        onChange={e => window.location.href=`/${currDiv}/${currYear}/${e.target.value}`}
      >
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
    <div className={styles.selectorStyling}>
      <DivisionDropdown options={['fbs', 'fcs']} initialValue={division} />
      <YearDropdown options={years} initialValue={year} />
      <WeekDropdown options={rankList[year]} initialValue={week} />
    </div>
  );
}
