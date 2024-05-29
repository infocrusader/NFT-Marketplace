import { useEffect } from "react";
import { useState } from "react";
import { useMainDapp } from "../../providers/MainDapp/MainDapp";
import { getEllipsisTxt } from "../../helpers/formatters";
import { Avatar  } from "antd";
import { useMoralis } from "react-moralis";


const styles = {
  address: {
    height: "36px",
    display: "flex",
    gap: "5px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "9px",
    alignItems: "center",
  },
};

function Profile(props) {
  const { user } = useMoralis();
  const { walletAddress } = useMainDapp();
  const [address, setAddress] = useState();
  const [UserPFPImg, setUserPFPImg] = useState();
  const userPFPs = user.get('avatar');


  useEffect(() => {
    setAddress(props?.address || walletAddress);
  
    if (userPFPs) {
      setUserPFPImg(props?.UserPFPImg || userPFPs.url()); 
    } else if (!userPFPs) {
    }
  }, [walletAddress, UserPFPImg, props]);

  if (!address) return null;
  
   function renderElemen() {

    if(!userPFPs){
      return <Avatar shape="circle" size={45} src="https://i.imgur.com/lIM36oz.jpg"/>;  
      }
    else  if (userPFPs) {
      if(props?.avatar === "outer"){
      return <Avatar shape="circle" size={45} src={UserPFPImg}/>; }
     else {

      return <Avatar shape="circle" src={UserPFPImg} size={54} />;
     }
    } 
   
  }
 
  if (props.avatar === "outer") return (   renderElemen() )

  return (
    <div style={{ ...styles.address, ...props.style }}>
        
     {props.avatar === "left" && renderElemen() }
      <p>{props.size ? getEllipsisTxt(address, props.size) : address}</p>
      
      {props.avatar === "right" && renderElemen()}
      
 

    </div>
    
  );
}

export default Profile;


