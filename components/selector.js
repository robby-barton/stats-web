import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import utilStyles from "../styles/common.module.css";
import styles from './selector.module.css';

let currDiv = null
let currYear = null
let currWeek = null

function DivisionDropdown({ options, initialValue }) {
  const [selected, setSelected] = useState(initialValue.toLowerCase())

  return (
    <select
      className={styles.divisionDropdown}
      value={selected}
      onChange={e => window.location.href=`/ranking/${e.target.value}/${currYear}/${currWeek}`}
    >
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

  return (
    <select
      className={styles.yearDropdown}
      value={selected}
      onChange={e => window.location.href=`/ranking/${currDiv}/${e.target.value}/${currWeek}`}
    >
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
  for (let i = 1; i <= options.weeks; i++) {
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
        onChange={e => window.location.href=`/ranking/${currDiv}/${currYear}/${e.target.value}`}
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
  for (let key in rankList) {
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
