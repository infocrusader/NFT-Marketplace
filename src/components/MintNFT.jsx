import React, { useEffect, useState } from "react";
import { Card, Image, Tooltip, Modal, Input, Alert, Spin, Button, Select, Upload, notification,InputNumber } from "antd";
import { useMoralisFile, useWeb3ExecuteFunction, useMoralis } from 'react-moralis'
import { Moralis } from 'moralis'
import { useMainDapp } from "providers/MainDapp/MainDapp";
import TextArea from "antd/lib/input/TextArea";


const styles = {
    ItemCard: {
        flexWrap: "wrap",
        WebkitBoxPack: "start",
        
        marginLeft: "30%",
        marginTop: "6%",
        margin: "4% auto",
        maxWidth: "560px",
        gap: "10px"
    },
    TextStyle: {
        display: "flex",
        flexWrap: "wrap",
        WebkitBoxPack: "start",
        justifyContent: "flex-start",
        margin: "0 auto",
        marginTop: "2px",
        marginBottom: "2px", 
        fontWeight: "500",
        maxWidth: "1000px",
        gap: "10px"
    }
  };
 
function MintNFT() {
    const {walletAddress, marketAddress, contractABI , tokenAddress, tokenABI} = useMainDapp();
    const { Option } = Select;
    const {saveFile} = useMoralisFile();
    const { isAuthenticated } = useMoralis();
    const tokenABIJson = JSON.parse(tokenABI);
    const [file, setFile] = useState("");
    const [metadataFileURI, setMetadataFileURI] = useState("");
    const btoa = (text) => {
        return Buffer.from(text, 'binary').toString('base64');
    }; 
    const [metadata, setMetadata] = useState({
        name: "",
        description: "",
        image: "",
    });
    const [statusBox, setStatusBox] = useState("0");
    const [listingPrice, setListingPrice] = useState();
    const contractABIJson = JSON.parse(contractABI);
    const contractProcessor = useWeb3ExecuteFunction();
    const Item = Moralis.Object.extend("MintedItems");
    const ItemImage = Moralis.Object.extend("ItemImages");
    const [nftFileMetadataFilePath, setnftFileMetadataFilePath] = useState();
    const [nftFileMetadataFileHash, setnftFileMetadataFileHash] = useState();
    const [nftFilePath, setnftFilePath] = useState();
    const [nftFileHash, setnftFileHash] = useState();
    const [nftId, setnftId] = useState("");
    const [alertDat, setalertDat] = useState("");
    const [alertDat2, setalertDat2] = useState("");
    const [alertDat3, setalertDat3] = useState("");
    const [alertDat4, setalertDat4] = useState("");
    //const [value, setValue] = useState();

    function succMint() {
        let secondsToGo = 5;
       notification.success({
        message: "Success!",
        description: `Your new NFT is minted!`,
        placement: 'bottomRight',
        });
        setTimeout(() => {
     notification.destroy();
        }, secondsToGo * 1000);
    }

    function failMint() {
        let secondsToGo = 5;
         notification.error({
            message: "Error!",
            description: `There was a problem in minting NFT.`,
        placement: 'bottomRight',
        });
        setTimeout(() => {
      notification.destroy();
        }, secondsToGo * 1000);
    }
 
    function succList() {
        let secondsToGo = 5;
         notification.success({
          message: `Success`,
          description:
            'Your NFT was listed and is now on the marketplace.',
            placement: 'bottomRight',
        });
        setTimeout(() => {
          notification.destroy();
        }, secondsToGo * 1000);
      }

    function failList() {
        let secondsToGo = 5;
         notification.error({
          message: `Error!`,
          description:
            'There was a problem listing your NFT.',
            placement: 'bottomRight',
        });
        setTimeout(() => {
          notification.destroy();
        }, secondsToGo * 1000);
      }
    
   function addItemImage() {
        const itemImage = new ItemImage();
        itemImage.set("image", nftFilePath);
        itemImage.set("nftContract", tokenAddress);
        itemImage.set("tokenId", nftId);
        itemImage.set("collectionName",  "NFTteam Market Tokens")
        itemImage.save();
        }
   

        async function approveAll() {
     
          let web3 = await Moralis.Web3.enableWeb3();
          var contract = new web3.eth.Contract(tokenABIJson, tokenAddress);
          const approvedAddress =  await contract.methods.isApprovedForAll(walletAddress, marketAddress).call({from: walletAddress});
          console.log("approved true o false?", approvedAddress);
        
          const ops = {
            contractAddress: tokenAddress,
            functionName: "setApprovalForAll",
            abi: [{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"}],
            params: {
              operator: marketAddress,
              approved: true
            },
          };
        
          if(approvedAddress == false){
          
          
          await contractProcessor.fetch({
            params: ops,
            onSuccess: () => {
              console.log("Approval Received");  
            },
            onError: (error) => {
           
          
            },
          });
           }
           else {
            console.log("Approval Received");
        
           }
      
          
        }

    useEffect(() => {
        async function saveMetadataFile(){
            console.log('metadata before saving:', metadata);
            const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
            await metadataFile.saveIPFS();
            
            setnftFileMetadataFilePath(metadataFile.ipfs());
            setnftFileMetadataFileHash(metadataFile.hash());

            console.log('metadata file ipfs:',metadataFile.ipfs());
            setMetadataFileURI(metadataFile.ipfs());
        }
        if(metadata.image){
            console.log('metadata image is',metadata.image);
            saveMetadataFile();
        }
    }, [metadata.image]);

    
    useEffect(() => {
        async function saveItemToData() {
        const p = listingPrice * ("1e" + 18);
        let web3 = await Moralis.Web3.enableWeb3();
        const MarketplaceContract = new web3.eth.Contract(contractABIJson, marketAddress);
        const item = new Item();
           item.set('CollectionName', "NFTteam Market Tokens");
           item.set('name', metadata.name);
           item.set('description', metadata.description);
           item.set('nftFilePath', nftFilePath);
           item.set('nftFileHash', nftFileHash);
           item.set('metadataFilePath', nftFileMetadataFilePath);
           item.set('metadataFileHash', nftFileMetadataFileHash);
           item.set('tokenId', nftId);
           item.set('nftContract', tokenAddress);
           item.set('creator', walletAddress);
           item.set('minted', "minted");
           if (p){
           item.set('price', String(p));
           } else {item.set('price', "N/A");}
          
           await item.save();
           addItemImage();
      
           switch(statusBox) {
            case "0":
                return;
            case "1":
             await approveAll();
             await MarketplaceContract.methods.createMarketItem(tokenAddress, nftId, String(p)).send({from: walletAddress }).then((response) => {
             //   addItemImage();
                succList();
            })
            .catch((err) => {
                //console.log(err);
                failList();
            });
             break;
        }

        }
         
    if(nftId){
      //  console.log('i was called:',nftId);
        saveItemToData();
    }

    }, [nftId]);
      
    useEffect(() => {
        async function mint(tokenURI) {
            if(tokenURI === "" || tokenURI === undefined){
                console.log('tokenURI is not valid. Skipping');
                return;
            }
            console.log('Mint function tokenURI:', tokenURI);
            const p = listingPrice * ("1e" + 18);

            let web3 = await Moralis.Web3.enableWeb3();
            const contract = new web3.eth.Contract(tokenABIJson, tokenAddress);
            await contract.methods
            .mintToken(tokenURI)
            .send({from: walletAddress})
            .then((response) => {
               // console.log(response);
                const nftIdOBJ = response.events.Transfer.returnValues;      
                // const nftId = nftIdOBJ.tokenId;
               setnftId(nftIdOBJ.tokenId);
               //console.log("nft id= ", nftId);
                succMint();
                 
            })
            .catch((err) => {
                console.log(err);
                failMint();
            });
            //console.log(receipt);

        }

        if(metadataFileURI){
            console.log('metadataFileURI:',metadataFileURI);
            mint(metadataFileURI);
        }

    }, [metadataFileURI]);
    

    const handleMetadataChange = async (name,value) => {
      setMetadata((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    };

    const handleUpload = async () => {
      if (!isAuthenticated) { setalertDat4("you're not logged in"); }
       else if(validateForm()) { 
        setalertDat4("");
            await saveFileIPFS(file);
        }
    }
    
    const saveFileIPFS = async (f) => {
        if(f === "" || f === null || f === undefined){
            console.log("File is null or undefined. Skipping upload");
            return false;
        }
       const fileLower = f.name.toLowerCase();

       if(fileLower){
        const nameF = makeid(5);
        const fileIpfs = await saveFile(nameF, file, {saveIPFS: true})
        console.log('file ipfs:',fileIpfs._ipfs);

        setnftFilePath(fileIpfs.ipfs());
        setnftFileHash(fileIpfs.hash());
        await handleMetadataChange("image",fileIpfs._ipfs);
      } else {

        console.log("somethin went wrong");
      }

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
        var vs1 = true;
        var vs2 = true;
        var vs3 = true;
        var vs4 = true;
        var sizeOFfile = file.size / 1024 / 1024;
     
       if (sizeOFfile > 10) {  
         setalertDat4("Your file size is too big");
          vs4 = false; 
      
         }
       else if(file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/bmp" ){
            console.log("we passed here ");
         
        }
	   	 else {
            setalertDat4("Please Select A supported file type (png,jpg or bmb)");
            vs4 = false;
			
	  	}

		if (metadata.name === "" || metadata.name === ".jpg" || metadata.name === ".png" || metadata.name === ".bmp") {
			setalertDat("Please provide a valid NFT name.");
            vs1= false;
			
		}
		if (metadata.description === "") {
			setalertDat2("NFT description is empty. Please provide a valid description.");
            vs2=false;
		
		}
		if (file === "" || file === null || file === undefined) {
			setalertDat4("NFT image is empty. Please provide a valid image.");
            vs4=false;
			
		}
    if (listingPrice <= 0) {
			setalertDat3("negative number or zero.");
            vs3=false;
			
		} else if(listingPrice === "" || listingPrice === null || listingPrice > 0 ) {

            vs3=true;
        }
        if (vs1 === false || vs2 === false ||  vs4 === false || vs3 === false){
            return false;
            
        } else if(vs1 != false && vs2 != false && vs4 != false && vs3 === true) {
            return true;
        }
	
	}
    
    /**
     * Component to display thumbnail of image.
     */
     const ImageThumb = ({ image }) => {
      return <img src={URL.createObjectURL(image)}/>;
      
   };


    return (
     <div > 
            
      <div style={styles.ItemCard}>
          
     
      <h2>Create New Item</h2>
          <Card
            component="form"
            sx={{
                '& .MuiTextField-root': { ml: 0, mt:1, mb:1, width: '50ch' }
            }}
            noValidate
            autoComplete="off"
          >
            <div>
            <label style={styles.TextStyle}>Name</label>
                <Input
                required
                id="nftName"
                name="name"
                label="Name"
                placeholder="NFT name"
                onChange={(e) =>{ handleMetadataChange(e.target.name,e.target.value); setalertDat(""); }} />
             <div style={{ color:'red' }} dangerouslySetInnerHTML={{ __html: alertDat }}/> 
           </div>
           <div>
           <label style={styles.TextStyle} >Description</label>
                <TextArea
                required
                name="description"
                id="nftDescription"
                label="Description"
                placeholder="NFT description"
                onChange={(e) => { handleMetadataChange(e.target.name,e.target.value); setalertDat2(""); }}
                />
             <div style={{ color:'red' }} dangerouslySetInnerHTML={{ __html: alertDat2 }}/>    
            </div>
            <div>
                <label style={styles.TextStyle} > Status </label> 
                <Select defaultValue="0" style={{ width: 200 }}  onChange={(e) => setStatusBox(e)} >
                <Option value="0"> Not For Sale</Option>      
                <Option value="1"> Mint & Instant List</Option>        
                </Select>
            </div>
            { statusBox !=  "0" && <div><Input controls={{ upIcon: false, downIcon: false}} style={{marginTop: "9px" }}  type="number" placeholder="Enter Price In Matic" onChange={function (event) {
    //if (value >= 0.00000000001 || event.target.valueAsNumber >= 0.00000000001) {
     // setValue(event.target.value);
      setListingPrice(event.target.value);
   // }
   setalertDat3("");
    }} />  <span style={{ color:'red' }} dangerouslySetInnerHTML={{ __html: alertDat3 }}/> </div>  }
            
              
                <div id="upload-box" style={{marginTop:"8px", marginBottom:"12px", width:"50ch"}}>
                    <Input type="file" id="fileUpload" onChange={(e) => { setFile(e.target.files[0]); setalertDat4("");}} style = {{marginBottom:"12px"}}/>
                    {file && <ImageThumb image={file} />}
                </div>
                <div style={{ color:'red' }} dangerouslySetInnerHTML={{ __html: alertDat4 }}/>
                <Button type="primary"
					shape="round"
					size="large"
					style={{ width: "100%" }}

					variant="contained" id="mintNFT" onClick={handleUpload}>
					Mint
				</Button>
                <br/>
               
          
        </Card>
      </div>
      </div>
    );
  }
  export default MintNFT;