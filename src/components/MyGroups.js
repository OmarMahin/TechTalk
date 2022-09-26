import React, { useEffect, useState } from 'react'
import { BiDotsVerticalRounded, BiDotsHorizontalRounded } from 'react-icons/bi'
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database";
import { getAuth, getUser } from "firebase/auth";
import { Modal, Box, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { getStorage, ref as fs_ref, uploadString, getDownloadURL } from "firebase/storage";

const MyGroups = () => {

    const auth = getAuth()
    const db = getDatabase()
    const storage = getStorage();


    let [groupList, setGroupList] = useState([])
    let [loading, setLoading] = useState(false)
    let [groupPhoto, setGroupPhoto] = useState('')
    let [image, setImage] = useState('');
    let [cropper, setCropper] = useState();
    let [openGroupPic, setOpenGroupPic] = useState(false)
    let [currentGroupId, setcurrentGroupId] = useState('')

    let handleGroupPicClose = () => {
        setcurrentGroupId('')
        setOpenGroupPic(false)
        setImage('')
    }

    let openGroupPicModal = (item) => {
        setcurrentGroupId(item.GroupKey)
        setGroupPhoto(item.GroupPhotoUrl)
        setOpenGroupPic(true)
    }

    let handlePicUpload = (e) => {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(files[0]);
    }


    const getCropData = () => {
        setLoading(true)
        const storageRef = fs_ref(storage, currentGroupId);
        console.log(storageRef)
        const image = cropper.getCroppedCanvas().toDataURL()
        uploadString(storageRef, image, 'data_url').then((snapshot) => {
            getDownloadURL(storageRef).then((url) => {

                setOpenGroupPic(false)
                setLoading(false)
                setImage('')

                update(ref(db, "groups/" + currentGroupId), {
                    GroupProfilePicture: url,
                })
            })


        });
    };



    useEffect(() => {


        onValue(ref(db, 'groups'), (snapshot) => {
            let grouplist = []
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

    }, [])

    return (
        <div className='groupList'>
            <h2>MyGroups</h2>
            <BiDotsVerticalRounded className='dotIcon' />
            <div className='lists mygroups'>

                {
                    groupList.map((item) => {
                        if (item.GroupAdmin == auth.currentUser.uid) {
                            return (
                                <div className={'box'}>
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
                                        <div className='info'>
                                            <p>"18/09/2022"</p>
                                            <br />
                                            <button onClick={() => openGroupPicModal(item)}>Edit</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                    })
                }

            </div>

            <Modal
                className="UploadProfilePicModal"
                open={openGroupPic}
                onClose={handleGroupPicClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className="leftBarBox">
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        Change Group Profile Picture
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        {!groupPhoto
                            ?
                            image
                                ?
                                <div className='img-preview'></div>
                                :
                                <img className='currentPic' src={'./assets/images/GroupAvaterPic.png'} alt='profilePic' />
                            :
                            image
                                ?
                                <div className='img-preview'></div>
                                :
                                <img className='currentPic' src={groupPhoto} alt='profilePic' />

                        }

                        <input type={"file"} className='picUpload' onChange={(item) => handlePicUpload(item)}></input>

                        <Cropper
                            style={{ height: 200, width: "50%", margin: "20px auto" }}
                            zoomTo={0.5}
                            initialAspectRatio={1}
                            preview=".img-preview"
                            src={image}
                            viewMode={1}
                            minCropBoxHeight={10}
                            minCropBoxWidth={10}
                            background={false}
                            responsive={true}
                            autoCropArea={1}
                            checkOrientation={false}
                            onInitialized={(instance) => {
                                setCropper(instance);
                            }}
                            guides={true}
                        />

                        {image && <LoadingButton
                            className='cropButton'
                            loading={loading}
                            loadingPosition="end"
                            variant="contained"
                            onClick={() => getCropData(currentGroupId)}
                        >
                            {loading
                                ?
                                "Uploading"
                                :
                                "Upload Image"
                            }
                        </LoadingButton>}



                    </Typography>
                </Box>
            </Modal>

        </div>
    )
}

export default MyGroups