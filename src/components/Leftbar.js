import { React, useEffect, useState } from 'react'
import { BsGear } from 'react-icons/bs';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import { AiOutlineMessage, AiOutlineHome, AiOutlineBell, AiOutlineCloudUpload } from 'react-icons/ai';
import { getAuth, signOut, onAuthStateChanged, updateProfile, getUser } from "firebase/auth";
import { getDatabase, ref as fd_ref, update } from "firebase/database";
import { Link, useNavigate } from 'react-router-dom'
import { Modal, Box, Typography } from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton'
import { getStorage, ref as fs_ref, uploadString, getDownloadURL } from "firebase/storage";

import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const Leftbar = (props) => {

  const db = getDatabase()
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const storage = getStorage();


  let navigate = useNavigate();

  let [displayName, setDisplayName] = useState('')
  let [open, setOpen] = useState(false)
  let [openProfilePic, setOpenProfilePic] = useState(false)
  let [userId, setUserId] = useState('')
  let [userEmail, setUserEmail] = useState('')
  let [userCreationDate, setUserCreationDate] = useState('')
  let [loading, setLoading] = useState(false)

  const [image, setImage] = useState('');
  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState();

  let userLogout = () => {
    signOut(auth).then(() => {

      navigate('/login')
      console.log("Logged out")
    }).catch((error) => {
      console.log("Logout Error")
    });
  }

  let handleClose = () => {
    setOpen(false)
  }

  let handleProfilePicClose = () => {
    setOpenProfilePic(false)
    setImage('')
  }

  let openProfilePicModal = () => {
    setOpenProfilePic(true)
  }

  let openModal = () => {
    setOpen(true)
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
    const storageRef = fs_ref(storage, auth.currentUser.uid);
    const image = cropper.getCroppedCanvas().toDataURL()
    uploadString(storageRef, image, 'data_url').then((snapshot) => {
      getDownloadURL(storageRef).then((url) => {
      
        updateProfile(auth.currentUser, {
          photoURL: url
        }).then(() => {
          setOpenProfilePic(false)
          setLoading(false)
          setImage('')

          update(fd_ref(db, "users/"+auth.currentUser.uid),{
            userProfilePicture: auth.currentUser.photoURL,
          })

        }).catch((error) => {
          console.log(error)
        });
      })


    });
  };


  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setDisplayName(user.displayName)
        setUserCreationDate(user.metadata.creationTime)
        setUserEmail(user.email)
        setUserId(user.uid)
      } else {
        console.log("Error")
      }
    });
  }, [])


  return (
    <div className='leftbar'>
      <div className='profilePic'>
        <img src={auth.currentUser.photoURL != null ? auth.currentUser.photoURL : './assets/images/avaterPic.png'} alt='profilePic' />
        <div className='overlay' onClick={() => openProfilePicModal()} >
          <AiOutlineCloudUpload className='overlayIcon' />
        </div>
      </div>

      <h4 onClick={openModal}>{displayName}</h4>
      <div className='icons'>
        <ul>

          <li className={props.active == 'home' ? 'active' : 'notActive'}>
            <Link to={'/home'}><AiOutlineHome className='icon ' /></Link>
            </li>
          <li className={props.active == 'message' ? 'active' : 'notActive'}>
            <Link to={'/message'}><AiOutlineMessage className='icon' /></Link>
            </li>
          <li className={props.active == 'notifications' ? 'active' : 'notActive'}><AiOutlineBell className='icon' /></li>
          <li className={props.active == 'settings' ? 'active' : 'notActive'}><BsGear className='icon' /></li>
          <li><RiLogoutBoxRLine className='icon' onClick={userLogout} /></li>

        </ul>

      </div>

      <Modal
        className="UploadProfilePicModal"
        open={openProfilePic}
        onClose={handleProfilePicClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="leftBarBox">
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Change Profile Picture
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {!auth.currentUser.photoURL
              ?
              image
                ?
                <div className='img-preview'></div>
                :
                <img className='currentPic' src={'./assets/images/avaterPic.png'} alt='profilePic' />
              :
              image
                ?
                <div className='img-preview'></div>
                :
                <img className='currentPic' src={auth.currentUser.photoURL} alt='profilePic' />

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
                onClick={getCropData}
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

      <Modal
        className="leftBarModal"
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="leftBarBox">
          <Typography id="modal-modal-title" variant="h5" component="h2">
            Account Information
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <ul className='infoList'>
              <li><span>Your Email:</span> {userEmail}</li>
              <li><span>Your ID:</span> {userId}</li>
              <li><span>Account Creation Date:</span> {userCreationDate}</li>
            </ul>
          </Typography>
        </Box>
      </Modal>

    </div>
  )
}

export default Leftbar