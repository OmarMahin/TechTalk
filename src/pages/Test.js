import {react, useState, useEffect} from 'react'
import {db} from '../FirebaseConfig'
import { collection, getDocs,addDoc, updateDoc,doc, deleteDoc } from 'firebase/firestore'

const Test = ()=> {

    let [user,setUser] = useState([])
    let [name,setName] = useState('')
    let [uname, setUname] = useState('')

    let address = collection(db, "user")

    let addData = async () =>{
      await addDoc(address,{Name: name})
    }

    let updateData = async (id)=>{
      await updateDoc(doc(db, "user", id),{Name: uname})
    }

    let deleteData = async (id)=>{
      await deleteDoc(doc(db, "user", id))
    }


    useEffect(()=>{

        let storeUser = async()=>{
            let info = await getDocs(address)
            setUser(info.docs.map(doc=>({...doc.data(),id:doc.id})))
            info.docs.map(doc=>{console.log(doc.id)})
        }

        storeUser()
        

    },[])


  return (
    <>
      <input placeholder='Name' onChange={(input)=>{setName(input.target.value)}}></input>
      <button onClick={addData}>Add</button>
      {user.map(info=>(
        <div>
          <h1>{info.Name}</h1>
          <input placeholder='Name' onChange={(input)=>{setUname(input.target.value)}}></input>
          <button onClick={()=>{updateData(info.id)}}>Update</button>
          <button onClick={()=>{deleteData(info.id)}}>Delete</button>
        </div>
        
      ))}
      
    </>
    
  )
}


export default Test