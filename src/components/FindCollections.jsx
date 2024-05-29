import { Select } from "antd";
import { useMainDapp } from 'providers/MainDapp/MainDapp'
import { getCollectionsByAddress} from 'helpers/collections';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect,
  useHistory,
} from "react-router-dom";

function FindCollections({selectStyle , setcollectionAddress}){
  const { Option } = Select;
  const { chainId } = useMainDapp();
  const NFTMCollections = getCollectionsByAddress(chainId);
  let history = useHistory();

   function SelectedCol(value){
    setcollectionAddress(value);
    history.push({ pathname: "/Collections/"  });
  }
  return (
    <>
        <Select
            showSearch
            style={selectStyle}
            placeholder="Find a Collection"
            optionFilterProp="children"
            onChange= {SelectedCol}
        >   
         <Option value="explore"> Not Selected</Option>  
        {NFTMCollections && 
            NFTMCollections.map((collection, index) => 
          

            <Option value={collection.addrs} key= {index}>{collection.name} </Option>

            )
            }   
        </Select>
            
    </>

  )

}


export default FindCollections;