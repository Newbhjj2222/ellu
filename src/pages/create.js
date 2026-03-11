import { useState, useRef } from "react";
import styles from "../styles/createPost.module.css";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { FaBold, FaItalic, FaLink, FaImage, FaPaperPlane } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function getServerSideProps(){
return { props:{} }
}

const firebaseConfig = {
apiKey: "AIzaSyD9yWK7qWFxtZE8NBWnlDg0QG0MXRjHdQ0",
authDomain: "elluminate-904ac.firebaseapp.com",
projectId: "elluminate-904ac",
storageBucket: "elluminate-904ac.firebasestorage.app",
messagingSenderId: "954424892485",
appId: "1:954424892485:web:6596511e522e87101b572c",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default function CreatePost(){

const [title,setTitle] = useState("");
const [image,setImage] = useState(null);
const [loading,setLoading] = useState(false);

const editorRef = useRef(null);

const formatText = (command,value=null)=>{
document.execCommand(command,false,value);
};

const addLink = ()=>{
const url = prompt("Enter URL");
if(url){
document.execCommand("createLink",false,url);
}
};

const uploadToCloudinary = async (file)=>{

const formData = new FormData();

formData.append("file",file);
formData.append("upload_preset","Newtalents");
formData.append("cloud_name","dilowy3fd");

const endpoint="https://api.cloudinary.com/v1_1/dilowy3fd/image/upload";

const res = await fetch(endpoint,{
method:"POST",
body:formData
});

const data = await res.json();
return data.secure_url;

};

const handleSubmit = async (e)=>{

e.preventDefault();
setLoading(true);

let imageUrl="";

if(image){
imageUrl = await uploadToCloudinary(image);
}

const content = editorRef.current.innerHTML;

await addDoc(collection(db,"posts"),{
title,
content,
image:imageUrl,
createdAt:new Date()
});

editorRef.current.innerHTML="";
setTitle("");
setImage(null);
setLoading(false);

alert("Post published!");

};

return(
    <>
    <Header />

<div className={styles.container}>

<div className={styles.card}>

<h1>Create Post</h1>

<form onSubmit={handleSubmit}>

<input
className={styles.input}
type="text"
placeholder="Post title..."
value={title}
onChange={(e)=>setTitle(e.target.value)}
required
/>

<div className={styles.toolbar}>

<button type="button" onClick={()=>formatText("bold")}><FaBold/></button>

<button type="button" onClick={()=>formatText("italic")}><FaItalic/></button>

<button type="button" onClick={addLink}><FaLink/></button>

<label className={styles.iconUpload}>
<FaImage/>
<input
type="file"
hidden
onChange={(e)=>setImage(e.target.files[0])}
/>
</label>

</div>

<div
ref={editorRef}
className={styles.editor}
contentEditable
suppressContentEditableWarning
placeholder="Write your content..."
></div>

<button className={styles.button}>

<FaPaperPlane/>

{loading ? "Publishing..." : "Publish"}

</button>

</form>

</div>

</div>
<Footer />
</>
)

}