import { useMainDapp } from "providers/MainDapp/MainDapp";
import { useMoralis } from "react-moralis";
import { Moralis } from 'moralis'

import { Card, Image, Tooltip, Modal, Input, Alert, Spin, Button, Select, Upload, Avatar, notification  } from "antd";
import React, { useEffect, useState, useRef, FC } from "react";
import Profile from "./Profile/Profile";
import { SelectOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import { useMoralisFile } from 'react-moralis'
import { useChain } from "react-moralis";



const styles = {
  account: {
    height: "42px",
    padding: "0 15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "fit-content",
    borderRadius: "12px",
    backgroundColor: "rgb(244, 244, 244)",
    cursor: "pointer",
  },
  text: {
    color: "#1890ff",
  },
};

function Account() {
  const { authenticate, isAuthenticated, logout, user } = useMoralis();
  const { walletAddress} = useMainDapp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { switchNetwork, chainId } = useChain(); 
  const {saveFile} = useMoralisFile();
  const [file, setFile] = useState("");
  const [UserEmail, setUserEmail] = useState("");
  const [UserName, setUserName] = useState("");
  const [alertDat, setalertDat] = useState("");
  const [alertDat2, setalertDat2] = useState("");
  const [alertDat3, setalertDat3] = useState("");
  const ImageThumb = ({ image }) => {
    return <img src={URL.createObjectURL(image)} alt={image.name}/>;
  };
  



    const loginNswitch = async () => {
    
      await authenticate({ signingMessage: "Connect To NFTeam Market!" })
          .then(function () {
            switchNetwork("0x13881");
          })
          .catch(function (error) {
            //console.log(error);
          });
      
    }

    

  if (!isAuthenticated) {
    return (
      <div
        style={styles.account}
        onClick={() => { if(chainId === "0x13881") { authenticate({ signingMessage: "Connect To NFTeam Market!" }) } else {  loginNswitch() } } }
      >
        <p style={styles.text}>Authenticate</p>
      </div>
    );
  }


 
  const handleUserInfo = async () => {
   
    const email = user.get('email'); 

   if (email) { 

    setUserEmail(email);
     
   } else {
       
    setUserEmail("");

   }
    
   setUserName(user.get('username'));
   setalertDat(""); 
   setalertDat2("");
  };

  const handleUpload = async () => {
    if(validateForm()) {
        await saveUserInfo(file);
    }
  }
  const saveUserInfo = async (f) => {

    const userExists = await Moralis.Cloud.run("check_username",{ checkedUser: UserName });
    const tempU = user.get('username');
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
   if(UserEmail === "") { //skip  
    }
     else if (reg.test(UserEmail) === true){
      user.set('email', UserEmail);
      //setalertDat2("provide a correct email address");
     }
     else{
      setalertDat2("provide a correct email address");
     }




     if (userExists === true) {

      if (tempU !== UserName) {
       // console.log("username exist");
        setalertDat("the username you typed already exists"); 
    
       }

      } else {

    user.set('username', UserName);
     }
    
        
  

     var sizeOFfile = f.size / 1024 / 1024;


    if(f==="" || f === null || f === undefined){
       // console.log("File is null or undefined. Skipping upload");
        
    } else { 
      if (sizeOFfile > 10) {  
        setalertDat3("Your file size is too big");
        
     
        }
      
     else if (f.type === "image/png" || f.type === "image/jpeg" || f.type === "image/bmp" ){
      const fileLower = f.name.toLowerCase();
      if(fileLower){
          const nameF = makeid(5);
          const pfp = await saveFile(nameF, file, {saveIPFS: true})
          user.set('avatar', pfp);
         // console.log('file ipfs:',pfp._ipfs); 
      } 
      
    } else {
      setalertDat3("Please Select A supported file type (png, jpg or bmb)");
    } 
   }
    
    await user.save();
    notification.success({
    message: `Success`,
    description:
      'User Info saved succesfully.',
      placement: 'bottomRight',
  });
  setTimeout(() => {
    notification.destroy();
   }, 15 * 1000);

  // await handleUserInfo();
  }

  function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
   }

  const validateForm = () => {
 
  if (UserName === "") {
    setalertDat("Please provide a valid username name.");
    return false;
  }
    return true;
    }

  return (
    <>
    
      <div style={styles.account} onClick={() => {setIsModalVisible(true);  handleUserInfo();}}>
        <p style={{ marginRight: "5px", ...styles.text }}>
          
        </p>
       

        <Profile
            size={6}
            style={{ color: "black" }}
            
          />
   
   
      </div>
      <Profile  avatar="outer" />
      <Modal
        visible={isModalVisible}
        footer={null}
        onCancel={() => {setIsModalVisible(false); handleUserInfo(); setalertDat("");setalertDat2("");setalertDat3("");}}
        onClick= {() => handleUserInfo()}
        bodyStyle={{
          padding: "15px",
          fontSize: "17px",
          fontWeight: "500",
        }}
        style={{ fontSize: "16px", fontWeight: "500" }}
        width="400px"
      >
        Account
        <Card
          style={{
            marginTop: "10px",
            borderRadius: "1rem",
          }}
          bodyStyle={{ padding: "15px" }}
        >
          <Profile
            avatar="left"
            size={6}
            copyable
            style={{ fontSize: "20px" }}
          />
          <div style={{ marginTop: "10px", padding: "0 10px" }}>
            <a
              href={`${getExplorer(chainId)}/address/${walletAddress}`}
              target="_blank"
              rel="noreferrer"
            >
              <SelectOutlined style={{ marginRight: "5px" }} />
              View on Explorer
            </a>
          </div>
        </Card>

        <Card
          style={{
            marginTop: "10px",
            borderRadius: "1rem",
          }}
          bodyStyle={{ padding: "15px" }}
        >
           <a style={{ marginRight: "5px" }}> Enter Username   </a>
          <Input
            size={6}
            style={{ fontSize: "20px" }}
            value={UserName}
            onChange={e => {setUserName(e.target.value); setalertDat(""); }}

          />
          <div style={{ color:'red' }} dangerouslySetInnerHTML={{ __html: alertDat }}/>
          <a style={{ marginRight: "5px" }}> Enter Email   </a>

            <Input
            size={6}
            type="email"
            style={{ fontSize: "20px" }}
            value={UserEmail}
            
            onChange={e=> {setUserEmail(e.target.value); setalertDat2(""); }}
          />
          <div style={{ color:'red' }} dangerouslySetInnerHTML={{ __html: alertDat2 }}/>
           <a style={{ marginRight: "5px" }}> Select Profile Picture   </a>

           <div id="upload-box"  style={{ fontSize: "20px" }}>
                    <Input type="file" id="fileUpload" onChange={(e) => { setFile(e.target.files[0]); setalertDat3(""); }} style = {{marginBottom:"12px"}}/>
                    {file && <ImageThumb image={file} style = {{marginRight:"30px"}}/>}
                    <div style={{  fontSize:"14px", color:'red' }} dangerouslySetInnerHTML={{ __html: alertDat3 }}/>
           </div>
           <div style={{ marginTop: "10px", padding: "0 10px" }}>

           <Button variant="contained" id="saveProfile" onClick={handleUpload}>Save Profile</Button>
        
          </div>
        </Card>
        <Button
          size="large"
          type="primary"
          style={{
            width: "100%",
            marginTop: "10px",
            borderRadius: "0.5rem",
            fontSize: "16px",
            fontWeight: "500",
          }}
          onClick={() => {
            logout();
            setIsModalVisible(false);
          }}
        >
          Logout Wallet
        </Button>
      </Modal>
    </>
  );
}

export default Account;
