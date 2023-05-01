import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './selector.module.css';

let currDiv = null
let currYear = null
let currWeek = null

function DivisionDropdown({ options, initialValue }) {
  const [selected, setSelected] = useState(initialValue.toLowerCase())
  const router = useRouter()

  const handleChange = e => {
    setSelected(e.target.value)
    router.push(`/ranking/${e.target.value}/${currYear}/${currWeek}`)
  };

  return (
    <select
      className={styles.divisionDropdown}
      value={selected}
      onChange={handleChange}
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
  const router = useRouter()

  const handleChange = e => {
    setSelected(e.target.value)
    router.push(`/ranking/${currDiv}/${e.target.value}/${currWeek}`)
  };

  return (
    <select
      className={styles.yearDropdown}
      value={selected}
      onChange={handleChange}
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
  const router = useRouter()

  const handleChange = e => {
    setSelected(e.target.value)
    router.push(`/ranking/${currDiv}/${currYear}/${e.target.value}`)
  };

  return (
    <select
      className={styles.weekDropdown}
      value={selected}
      onChange={handleChange}
    >
      {optionList.map(option => (
        <option key={option.value} value={option.value}>
          {option.text}
        </option>
      ))}
    </select>
  )
}

export default function Selector({ availRanks, division, year, week }) {
  currDiv = division.toLowerCase()
  currYear = year
  currWeek = week.toLowerCase()
  const years = []
  for (let key in availRanks) {
    years.push(key)
  }
  years.sort().reverse()
  return (
    <div className={styles.selectorStyling}>
      <DivisionDropdown options={['fbs', 'fcs']} initialValue={division} />
      <YearDropdown options={years} initialValue={year} />
      <WeekDropdown options={availRanks[year]} initialValue={week} />
    </div>
  );
}
