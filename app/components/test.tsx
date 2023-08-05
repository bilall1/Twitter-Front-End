// import "./App.css";
// import { SetStateAction, useState } from "react";
// import Image from "next/image"
// import { storage } from "../firebase";
// // import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// const test = () => {
//   const [image, setImage] = useState(null);
//   const [url, setUrl] = useState(null);

//   const handleImageChange = (e) => {
//     if (e.target.files[0]) {
//       setImage(e.target.files[0]);
//     }
//   };

//   const handleSubmit = () => {
//     const imageRef = ref(storage, "image");
//     uploadBytes(imageRef, image)
//       .then(() => {
//         getDownloadURL(imageRef)
//           .then((url: SetStateAction<null>) => {
//             setUrl(url);
//           })
//           .catch((error: { message: any; }) => {
//             console.log(error.message, "error getting the image url");
//           });
//         setImage(null);
//       })
//       .catch((error: { message: any; }) => {
//         console.log(error.message);
//       });
//   };

//   return (
//     <div className="App">
//       <input type="file" onChange={handleImageChange} />
//       <button onClick={handleSubmit}>Submit</button>
//     </div>
//   );
// }

// export default test;