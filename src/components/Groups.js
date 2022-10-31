import { React, useEffect, useState } from 'react'
import { BiDotsVerticalRounded } from 'react-icons/bi'
import { TiMessages } from 'react-icons/ti'
import { MdGroup } from 'react-icons/md'
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database";
import { getAuth, getUser } from "firebase/auth";
import { useSelector, useDispatch } from 'react-redux'
import { activeChat } from '../Slice/activeChatUser'
import { notification } from '../Slice/notificationSlice'
import { Modal, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Alert } from '@mui/material'

const Groups = () => {

    const auth = getAuth()
    const db = getDatabase()
    const dispatch = useDispatch()

    let [groupList, setGroupList] = useState([])
    let [refresh, setRefresh] = useState(false)
    let [openSeeMembers, setOpenSeeMembers] = useState(false)
    let [groupMembers, setGroupMembers] = useState([])
    let [currentOpenGroup, setCurrentOpenGroup] = useState("")
    let [membersList, setMembersList] = useState([])

    let handleActiveUser = (item) => {
        let userInfo = {}
        userInfo.status = "group"
        userInfo.id = item.GroupKey
        userInfo.name = item.GroupName
        userInfo.Admin = item.GroupAdmin
        userInfo.Members = item.GroupMembers

        if (item.GroupPhotoUrl) { userInfo.photoUrl = item.GroupPhotoUrl }
        else { userInfo.photoUrl = './assets/images/GroupAvaterPic.png' }

        dispatch(activeChat(userInfo))
    }

    let seeMemberList = (item) => {
        let mem = []
        groupMembers.map((memberInfo) => {
            if (item.GroupKey == memberInfo.GroupKey) {
                mem.push(memberInfo)
            }
        })

        setMembersList(mem)
        setOpenSeeMembers(true)
        setCurrentOpenGroup(item.GroupKey)

    }

    let seeMembersClose = () => {
        setOpenSeeMembers(false)
        setCurrentOpenGroup("")
        setMembersList([])
    }

    let removeMember = (item, index) =>{
        
        let members = ""
        onValue(ref(db, "groups/" + item.GroupKey), (item2) => {
            members = item2.val().Members
        })
        update(ref(db, "groups/" + item.GroupKey), {
            Members: members.replace("," + item.MemberId, '')
        })
        membersList.splice(index,1)
    }


    useEffect(() => {

        let grouplist = []

        onValue(ref(db, 'groups'), (snapshot) => {

            snapshot.forEach((item) => {
                grouplist.push({
                    GroupName: item.val().GroupName,
                    GroupTagline: item.val().GroupTagline,
                    GroupAdmin: item.val().GroupAdmin,
                    GroupKey: item.key,
                    GroupPhotoUrl: item.val().GroupProfilePicture,
                })


            })
            setGroupList(grouplist)
        })

    }, [refresh])


    useEffect(() => {


        onValue(ref(db, 'groups'), (snapshot) => {
            let grouplist = []
            let members = []
            snapshot.forEach((item) => {
                grouplist.push({
                    GroupName: item.val().GroupName,
                    GroupTagline: item.val().GroupTagline,
                    GroupAdmin: item.val().GroupAdmin,
                    GroupKey: item.key,
                    GroupPhotoUrl: item.val().GroupProfilePicture,
                    GroupMembers: item.val().Members
                })

                item.val().Members.split(",").map((member) => {
                    if (member != "") {
                        let memberInfo = {}

                        memberInfo.GroupAdminId = item.val().GroupAdmin
                        memberInfo.GroupKey = item.key
                        memberInfo.MemberId = member
                        memberInfo.GroupTagline = item.val().GroupTagline
                        memberInfo.GroupName = item.val().GroupName


                        onValue(ref(db, 'users/' + member), (item2) => {

                            memberInfo.MemberName = item2.val().username
                            memberInfo.MemberProfilePic = item2.val().userProfilePicture
                        })

                        members.push(memberInfo)

                    }

                })

                setGroupMembers(members)


            })
            setGroupList(grouplist)
        })

    }, [])


    return (
        <div className='groupList groups'>
            <div className='top'>
                <h2>Groups</h2>
            </div>

            <BiDotsVerticalRounded className='dotIcon' />
            <div className='lists'>
                {groupList.map((item) => {
                    return (
                        <div className='box' onClick={() => handleActiveUser(item)}>
                            <div className='img'>
                                {
                                    item.GroupPhotoUrl
                                        ?
                                        <img src={item.GroupPhotoUrl} />
                                        :
                                        <img src={'./assets/images/GroupAvaterPic.png'} />
                                }
                            </div>
                            <div className='name'>
                                <h2>{item.GroupName}</h2>
                                <h4>{item.GroupTagline}</h4>
                            </div>
                            <div className='button'>
                                <button className='chat'><TiMessages /></button>
                                <button className='memberList' onClick={() => { seeMemberList(item) }}><MdGroup /></button>
                            </div>
                        </div>
                    )
                })}


            </div>

            <Modal
                className="GroupJoinReq"
                open={openSeeMembers}
                onClose={seeMembersClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="leftBarBox">
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        Group Members: {membersList.length}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <List sx={{ width: '100%', maxWidth: 400, bgcolor: 'background.paper' }}>


                            {
                                membersList.length > 0
                                    ?
                                    membersList.map((item, index) => (

                                        <ListItem alignItems="center">
                                            <ListItemAvatar>
                                                <Avatar alt="Profile Pic" src={item.MemberProfilePic} sx={{ width: 60, height: 60, marginRight: 4 }} />
                                            </ListItemAvatar>
                                            <ListItemText sx={{ marginRight: 35 }}
                                                primary={item.MemberName}

                                                secondary={item.GroupAdminId == item.MemberId ? "Admin" :
                                                    ""}

                                            />
                                            {item.GroupAdminId == auth.currentUser.uid && item.MemberId != auth.currentUser.uid
                                                ?
                                                <button className='groupReqRejectButton'
                                                onClick={()=>{removeMember(item, index)}}>Remove</button>
                                                :
                                                ""
                                            }



                                        </ListItem>

                                    ))
                                    :
                                    <Alert severity="info" sx={{width: "100%"}}>No Members</Alert>
                            }

                        </List>
                    </Typography>
                </Box>
            </Modal>

        </div>


    )
}

export default Groups