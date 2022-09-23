import React from 'react'
import {TextField} from '@mui/material'
import {FiSearch} from 'react-icons/fi'
import {BiDotsVerticalRounded} from 'react-icons/bi'

const Searchbar = () => {
  return (
    <div className='searchBar'>
        <input placeholder='Search'></input>
        <FiSearch className='searchIcon'/>
        <BiDotsVerticalRounded className='dotIcon'/>
    </div>
  )
}

export default Searchbar