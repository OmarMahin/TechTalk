import React, { useEffect, useState } from 'react'
import { BiDotsVerticalRounded, BiDotsHorizontalRounded } from 'react-icons/bi'

const BlockedUsers = () => {
  return (
    <div className='groupList'>
            <h2>Blocked Users</h2>
            <BiDotsVerticalRounded className='dotIcon' />
            <div className='lists blockedusers'>


                <div className={'box'}>
                    <div className='img'>
                        <img src='assets/images/FriendImg.png' />
                    </div>
                    <div className='name'>
                        <h2>Test</h2>
                        <h4>Hi Guys, Wassup!</h4>
                    </div>
                    <div className='button'>
                        <div className='info'>
                            <p>"18/09/2022"</p>
                            <br />
                            <button>Blocked</button>
                        </div>
                    </div>
                </div>

                <div className={'box'}>
                    <div className='img'>
                        <img src='assets/images/FriendImg.png' />
                    </div>
                    <div className='name'>
                        <h2>Test</h2>
                        <h4>Hi Guys, Wassup!</h4>
                    </div>
                    <div className='button'>
                        <div className='info'>
                            <p>"18/09/2022"</p>
                            <br />
                            <button>Blocked</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
  )
}

export default BlockedUsers